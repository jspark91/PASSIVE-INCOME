using System.Runtime.InteropServices;

namespace DesktopCalendar.Host.Interop;

internal static class DesktopHost
{
    private static readonly IntPtr HwndBottom = new(1);
    private const int GwlStyle = -16;
    private const int GwlExStyle = -20;
    private const int GwlpHwndParent = -8;
    private const long WsPopup = unchecked((long)0x80000000);
    private const long WsChild = 0x40000000;
    private const long WsVisible = 0x10000000;
    private const long WsClipSiblings = 0x04000000;
    private const int WsExTransparent = 0x00000020;
    private const int WsExToolWindow = 0x00000080;
    private const int WsExAppWindow = 0x00040000;
    private const int WsExLayered = 0x00080000;
    private const int WsExNoActivate = 0x08000000;
    private const uint WmSpawnWorker = 0x052C;
    private const uint SmtoNormal = 0x0000;
    private const uint SwpNoSize = 0x0001;
    private const uint SwpNoMove = 0x0002;
    private const uint SwpNoZOrder = 0x0004;
    private const uint SwpNoActivate = 0x0010;
    private const uint SwpFrameChanged = 0x0020;

    internal static IntPtr FindDesktopWindow()
    {
        var progman = FindWindow("Progman", null);
        if (progman != IntPtr.Zero)
        {
            SendMessageTimeout(
                progman,
                WmSpawnWorker,
                UIntPtr.Zero,
                IntPtr.Zero,
                SmtoNormal,
                1000,
                out _);
            SendMessageTimeout(
                progman,
                WmSpawnWorker,
                new UIntPtr(0xD),
                IntPtr.Zero,
                SmtoNormal,
                1000,
                out _);
            SendMessageTimeout(
                progman,
                WmSpawnWorker,
                new UIntPtr(0xD),
                new IntPtr(1),
                SmtoNormal,
                1000,
                out _);
        }

        var workerW = IntPtr.Zero;

        EnumWindows((topHandle, _) =>
        {
            var shellView = FindWindowEx(topHandle, IntPtr.Zero, "SHELLDLL_DefView", null);
            if (shellView == IntPtr.Zero)
            {
                return true;
            }

            workerW = FindWindowEx(IntPtr.Zero, topHandle, "WorkerW", null);
            return workerW == IntPtr.Zero;
        }, IntPtr.Zero);

        if (workerW != IntPtr.Zero)
        {
            return workerW;
        }

        var progmanShellView = FindWindowEx(progman, IntPtr.Zero, "SHELLDLL_DefView", null);
        if (progmanShellView != IntPtr.Zero)
        {
            var progmanWorker = FindWindowEx(progman, progmanShellView, "WorkerW", null);
            if (progmanWorker != IntPtr.Zero)
            {
                SendToBottom(progmanWorker);
                return progmanWorker;
            }

            progmanWorker = FindWindowEx(progman, IntPtr.Zero, "WorkerW", null);
            if (progmanWorker != IntPtr.Zero)
            {
                SendToBottom(progmanWorker);
                return progmanWorker;
            }
        }

        var emptyWorkerW = IntPtr.Zero;
        EnumWindows((topHandle, _) =>
        {
            if (FindWindowEx(topHandle, IntPtr.Zero, "SHELLDLL_DefView", null) != IntPtr.Zero)
            {
                return true;
            }

            if (GetClassName(topHandle) == "WorkerW")
            {
                emptyWorkerW = topHandle;
                return false;
            }

            return true;
        }, IntPtr.Zero);

        if (emptyWorkerW != IntPtr.Zero)
        {
            return emptyWorkerW;
        }

        return progman;
    }

    internal static IntPtr GetDesktopShellViewHandle()
    {
        return FindDesktopShellView();
    }

    internal static void AttachToDesktop(IntPtr windowHandle, IntPtr desktopHandle)
    {
        var style = GetWindowLongPtr(windowHandle, GwlStyle).ToInt64();
        style |= WsChild | WsVisible | WsClipSiblings;
        style &= ~WsPopup;
        SetWindowLongPtr(windowHandle, GwlStyle, new IntPtr(style));
        SetParent(windowHandle, desktopHandle);
        SetWindowPos(
            windowHandle,
            HwndBottom,
            0,
            0,
            0,
            0,
            SwpNoMove | SwpNoSize | SwpNoActivate | SwpFrameChanged);
    }

    internal static void DetachFromDesktop(IntPtr windowHandle)
    {
        SetParent(windowHandle, IntPtr.Zero);
        SetWindowLongPtr(windowHandle, GwlpHwndParent, IntPtr.Zero);
        var style = GetWindowLongPtr(windowHandle, GwlStyle).ToInt64();
        style &= ~WsChild;
        style |= WsPopup | WsVisible;
        SetWindowLongPtr(windowHandle, GwlStyle, new IntPtr(style));
        SetWindowPos(
            windowHandle,
            IntPtr.Zero,
            0,
            0,
            0,
            0,
            SwpNoMove | SwpNoSize | SwpNoZOrder | SwpNoActivate | SwpFrameChanged);
    }

    internal static void SetWindowBounds(IntPtr windowHandle, double left, double top, double width, double height)
    {
        SetWindowBoundsCore(
            windowHandle,
            Convert.ToInt32(Math.Round(left)),
            Convert.ToInt32(Math.Round(top)),
            Convert.ToInt32(Math.Round(width)),
            Convert.ToInt32(Math.Round(height)));
    }

    internal static void SetChildWindowBounds(IntPtr windowHandle, IntPtr parentHandle, double left, double top, double width, double height)
    {
        var point = new Point
        {
            X = Convert.ToInt32(Math.Round(left)),
            Y = Convert.ToInt32(Math.Round(top))
        };

        if (parentHandle != IntPtr.Zero)
        {
            ScreenToClient(parentHandle, ref point);
        }

        SetWindowBoundsCore(
            windowHandle,
            point.X,
            point.Y,
            Convert.ToInt32(Math.Round(width)),
            Convert.ToInt32(Math.Round(height)));
    }

    private static void SetWindowBoundsCore(IntPtr windowHandle, int left, int top, int width, int height)
    {
        SetWindowPos(
            windowHandle,
            IntPtr.Zero,
            left,
            top,
            width,
            height,
            SwpNoZOrder | SwpNoActivate);
    }

    internal static void SetToolWindow(IntPtr windowHandle)
    {
        var style = GetWindowLongPtr(windowHandle, GwlExStyle).ToInt64();
        style |= WsExToolWindow;
        style &= ~WsExAppWindow;
        SetWindowLongPtr(windowHandle, GwlExStyle, new IntPtr(style));
    }

    internal static void SetAppWindow(IntPtr windowHandle)
    {
        SetWindowLongPtr(windowHandle, GwlpHwndParent, IntPtr.Zero);
        var style = GetWindowLongPtr(windowHandle, GwlExStyle).ToInt64();
        style &= ~WsExToolWindow;
        style |= WsExAppWindow;
        style &= ~WsExTransparent;
        style &= ~WsExNoActivate;
        SetWindowLongPtr(windowHandle, GwlExStyle, new IntPtr(style));
    }

    internal static void SetDesktopWidgetWindow(IntPtr windowHandle)
    {
        SetParent(windowHandle, IntPtr.Zero);

        var style = GetWindowLongPtr(windowHandle, GwlStyle).ToInt64();
        style &= ~WsChild;
        style |= WsPopup | WsVisible;
        SetWindowLongPtr(windowHandle, GwlStyle, new IntPtr(style));

        var exStyle = GetWindowLongPtr(windowHandle, GwlExStyle).ToInt64();
        exStyle |= WsExLayered | WsExToolWindow;
        exStyle &= ~WsExTransparent;
        exStyle &= ~WsExAppWindow;
        exStyle &= ~WsExNoActivate;
        SetWindowLongPtr(windowHandle, GwlExStyle, new IntPtr(exStyle));

        var shellView = FindDesktopShellView();
        if (shellView != IntPtr.Zero)
        {
            SetWindowLongPtr(windowHandle, GwlpHwndParent, shellView);
        }

        EnableWindow(windowHandle, true);
        SetWindowPos(
            windowHandle,
            HwndBottom,
            0,
            0,
            0,
            0,
            SwpNoMove | SwpNoSize | SwpNoActivate | SwpFrameChanged);
    }

    internal static void SetHitTestPassThrough(IntPtr windowHandle, bool enabled)
    {
        var style = GetWindowLongPtr(windowHandle, GwlExStyle).ToInt64();
        if (enabled)
        {
            style |= WsExTransparent | WsExLayered;
        }
        else
        {
            style &= ~WsExTransparent;
            style |= WsExLayered;
        }

        SetWindowLongPtr(windowHandle, GwlExStyle, new IntPtr(style));
        SetWindowPos(
            windowHandle,
            IntPtr.Zero,
            0,
            0,
            0,
            0,
            SwpNoMove | SwpNoSize | SwpNoZOrder | SwpNoActivate | SwpFrameChanged);
    }

    internal static void SetClickThrough(IntPtr windowHandle, bool enabled)
    {
        var style = GetWindowLongPtr(windowHandle, GwlExStyle).ToInt64();

        if (enabled)
        {
            style |= WsExTransparent | WsExLayered | WsExNoActivate;
            style |= WsExToolWindow;
            style &= ~WsExAppWindow;
        }
        else
        {
            style &= ~WsExTransparent;
            style &= ~WsExNoActivate;
            style &= ~WsExToolWindow;
            style |= WsExAppWindow;
        }

        SetWindowLongPtr(windowHandle, GwlExStyle, new IntPtr(style));
        EnableWindow(windowHandle, !enabled);
        SetWindowPos(
            windowHandle,
            IntPtr.Zero,
            0,
            0,
            0,
            0,
            SwpNoMove | SwpNoSize | SwpNoZOrder | SwpNoActivate | SwpFrameChanged);
    }

    internal static void SendToDesktopBottom(IntPtr windowHandle)
    {
        SetWindowPos(
            windowHandle,
            HwndBottom,
            0,
            0,
            0,
            0,
            SwpNoMove | SwpNoSize | SwpNoActivate);
    }

    private static void SendToBottom(IntPtr windowHandle)
    {
        SetWindowPos(
            windowHandle,
            HwndBottom,
            0,
            0,
            0,
            0,
            SwpNoMove | SwpNoSize | SwpNoActivate);
    }

    private static IntPtr FindDesktopShellView()
    {
        var progman = FindWindow("Progman", null);
        var shellView = progman == IntPtr.Zero
            ? IntPtr.Zero
            : FindWindowEx(progman, IntPtr.Zero, "SHELLDLL_DefView", null);

        if (shellView != IntPtr.Zero)
        {
            return shellView;
        }

        var found = IntPtr.Zero;
        EnumWindows((topHandle, _) =>
        {
            found = FindWindowEx(topHandle, IntPtr.Zero, "SHELLDLL_DefView", null);
            return found == IntPtr.Zero;
        }, IntPtr.Zero);

        return found;
    }

    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    private static string GetClassName(IntPtr windowHandle)
    {
        var buffer = new System.Text.StringBuilder(256);
        var length = GetClassName(windowHandle, buffer, buffer.Capacity);
        return length > 0
            ? buffer.ToString()
            : string.Empty;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Point
    {
        internal int X;
        internal int Y;
    }

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr FindWindow(string lpClassName, string? lpWindowName);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr FindWindowEx(
        IntPtr hwndParent,
        IntPtr hwndChildAfter,
        string? lpszClass,
        string? lpszWindow);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern int GetClassName(IntPtr hWnd, System.Text.StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool SetWindowPos(
        IntPtr hWnd,
        IntPtr hWndInsertAfter,
        int X,
        int Y,
        int cx,
        int cy,
        uint uFlags);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool EnableWindow(IntPtr hWnd, bool bEnable);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool ScreenToClient(IntPtr hWnd, ref Point lpPoint);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SendMessageTimeout(
        IntPtr hWnd,
        uint Msg,
        UIntPtr wParam,
        IntPtr lParam,
        uint fuFlags,
        uint uTimeout,
        out UIntPtr lpdwResult);

    private static IntPtr GetWindowLongPtr(IntPtr hWnd, int nIndex)
    {
        return IntPtr.Size == 8
            ? GetWindowLongPtr64(hWnd, nIndex)
            : new IntPtr(GetWindowLong32(hWnd, nIndex));
    }

    private static IntPtr SetWindowLongPtr(IntPtr hWnd, int nIndex, IntPtr dwNewLong)
    {
        return IntPtr.Size == 8
            ? SetWindowLongPtr64(hWnd, nIndex, dwNewLong)
            : new IntPtr(SetWindowLong32(hWnd, nIndex, dwNewLong.ToInt32()));
    }

    [DllImport("user32.dll", EntryPoint = "GetWindowLong", SetLastError = true)]
    private static extern int GetWindowLong32(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", EntryPoint = "GetWindowLongPtr", SetLastError = true)]
    private static extern IntPtr GetWindowLongPtr64(IntPtr hWnd, int nIndex);

    [DllImport("user32.dll", EntryPoint = "SetWindowLong", SetLastError = true)]
    private static extern int SetWindowLong32(IntPtr hWnd, int nIndex, int dwNewLong);

    [DllImport("user32.dll", EntryPoint = "SetWindowLongPtr", SetLastError = true)]
    private static extern IntPtr SetWindowLongPtr64(IntPtr hWnd, int nIndex, IntPtr dwNewLong);
}
