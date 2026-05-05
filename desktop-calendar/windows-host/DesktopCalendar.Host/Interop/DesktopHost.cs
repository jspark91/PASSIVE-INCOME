using System.Runtime.InteropServices;

namespace DesktopCalendar.Host.Interop;

internal static class DesktopHost
{
    private const int GwlExStyle = -20;
    private const int WsExToolWindow = 0x00000080;
    private const int WsExAppWindow = 0x00040000;
    private const uint WmSpawnWorker = 0x052C;
    private const uint SmtoNormal = 0x0000;

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

        return progman;
    }

    internal static void AttachToDesktop(IntPtr windowHandle, IntPtr desktopHandle)
    {
        SetParent(windowHandle, desktopHandle);
    }

    internal static void DetachFromDesktop(IntPtr windowHandle)
    {
        SetParent(windowHandle, IntPtr.Zero);
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
        var style = GetWindowLongPtr(windowHandle, GwlExStyle).ToInt64();
        style &= ~WsExToolWindow;
        style |= WsExAppWindow;
        SetWindowLongPtr(windowHandle, GwlExStyle, new IntPtr(style));
    }

    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

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

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);

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
