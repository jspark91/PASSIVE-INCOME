using System.Runtime.InteropServices;
using WpfPoint = System.Windows.Point;
using WpfRect = System.Windows.Rect;

namespace DesktopCalendar.Host.Services;

internal static class DesktopIconHitTester
{
    private const int LvmFirst = 0x1000;
    private const int LvmGetItemCount = LvmFirst + 4;
    private const int LvmGetItemRect = LvmFirst + 14;
    private const int LvirBounds = 0;
    private const int ProcessQueryInformation = 0x0400;
    private const int ProcessVmOperation = 0x0008;
    private const int ProcessVmRead = 0x0010;
    private const int ProcessVmWrite = 0x0020;
    private const int MemCommit = 0x1000;
    private const int MemReserve = 0x2000;
    private const int MemRelease = 0x8000;
    private const int PageReadWrite = 0x04;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMilliseconds(900);

    private static DateTime _cacheExpiresUtc = DateTime.MinValue;
    private static List<WpfRect> _cachedIconRects = [];

    internal static bool IsCursorOverDesktopIcon()
    {
        return GetCursorPos(out var point)
               && IsPointOverDesktopIcon(new WpfPoint(point.X, point.Y));
    }

    internal static bool IsPointOverDesktopIcon(WpfPoint screenPoint)
    {
        foreach (var rect in GetDesktopIconRects())
        {
            if (rect.Contains(screenPoint))
            {
                return true;
            }
        }

        return false;
    }

    internal static int GetDesktopIconRectCount()
    {
        return GetDesktopIconRects().Count;
    }

    internal static void ClearCache()
    {
        _cacheExpiresUtc = DateTime.MinValue;
        _cachedIconRects = [];
    }

    private static IReadOnlyList<WpfRect> GetDesktopIconRects()
    {
        if (DateTime.UtcNow < _cacheExpiresUtc)
        {
            return _cachedIconRects;
        }

        _cachedIconRects = QueryDesktopIconRects();
        _cacheExpiresUtc = DateTime.UtcNow.Add(CacheDuration);
        return _cachedIconRects;
    }

    private static List<WpfRect> QueryDesktopIconRects()
    {
        var listView = FindDesktopListView();
        if (listView == IntPtr.Zero)
        {
            return [];
        }

        _ = GetWindowThreadProcessId(listView, out var processId);
        if (processId == 0)
        {
            return [];
        }

        var process = OpenProcess(
            ProcessQueryInformation | ProcessVmOperation | ProcessVmRead | ProcessVmWrite,
            false,
            processId);

        if (process == IntPtr.Zero)
        {
            return [];
        }

        var rectSize = Marshal.SizeOf<NativeRect>();
        var remoteRect = IntPtr.Zero;

        try
        {
            remoteRect = VirtualAllocEx(
                process,
                IntPtr.Zero,
                (UIntPtr)rectSize,
                MemCommit | MemReserve,
                PageReadWrite);

            if (remoteRect == IntPtr.Zero)
            {
                return [];
            }

            var itemCount = SendMessage(listView, LvmGetItemCount, IntPtr.Zero, IntPtr.Zero).ToInt32();
            if (itemCount <= 0)
            {
                return [];
            }

            var result = new List<WpfRect>(itemCount);
            for (var index = 0; index < itemCount; index++)
            {
                var request = new NativeRect
                {
                    Left = LvirBounds
                };
                var requestBytes = StructureToBytes(request);

                if (!WriteProcessMemory(process, remoteRect, requestBytes, requestBytes.Length, out _))
                {
                    continue;
                }

                if (SendMessage(listView, LvmGetItemRect, new IntPtr(index), remoteRect) == IntPtr.Zero)
                {
                    continue;
                }

                var responseBytes = new byte[rectSize];
                if (!ReadProcessMemory(process, remoteRect, responseBytes, responseBytes.Length, out _))
                {
                    continue;
                }

                var rect = BytesToStructure<NativeRect>(responseBytes);
                var topLeft = new NativePoint { X = rect.Left, Y = rect.Top };
                var bottomRight = new NativePoint { X = rect.Right, Y = rect.Bottom };

                if (!ClientToScreen(listView, ref topLeft) || !ClientToScreen(listView, ref bottomRight))
                {
                    continue;
                }

                var left = Math.Min(topLeft.X, bottomRight.X) - 8;
                var top = Math.Min(topLeft.Y, bottomRight.Y) - 8;
                var right = Math.Max(topLeft.X, bottomRight.X) + 8;
                var bottom = Math.Max(topLeft.Y, bottomRight.Y) + 8;

                if (right > left && bottom > top)
                {
                    result.Add(new WpfRect(left, top, right - left, bottom - top));
                }
            }

            return result;
        }
        finally
        {
            if (remoteRect != IntPtr.Zero)
            {
                _ = VirtualFreeEx(process, remoteRect, UIntPtr.Zero, MemRelease);
            }

            _ = CloseHandle(process);
        }
    }

    private static IntPtr FindDesktopListView()
    {
        var shellView = FindDesktopShellView();
        if (shellView == IntPtr.Zero)
        {
            return IntPtr.Zero;
        }

        var listView = FindWindowEx(shellView, IntPtr.Zero, "SysListView32", null);
        if (listView != IntPtr.Zero)
        {
            return listView;
        }

        EnumChildWindows(shellView, (childHandle, _) =>
        {
            if (GetClassName(childHandle) != "SysListView32")
            {
                return true;
            }

            listView = childHandle;
            return false;
        }, IntPtr.Zero);

        return listView;
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

    private static string GetClassName(IntPtr windowHandle)
    {
        var buffer = new System.Text.StringBuilder(256);
        var length = GetClassName(windowHandle, buffer, buffer.Capacity);
        return length > 0
            ? buffer.ToString()
            : string.Empty;
    }

    private static byte[] StructureToBytes<T>(T value) where T : struct
    {
        var size = Marshal.SizeOf<T>();
        var bytes = new byte[size];
        var pointer = Marshal.AllocHGlobal(size);

        try
        {
            Marshal.StructureToPtr(value, pointer, false);
            Marshal.Copy(pointer, bytes, 0, size);
            return bytes;
        }
        finally
        {
            Marshal.FreeHGlobal(pointer);
        }
    }

    private static T BytesToStructure<T>(byte[] bytes) where T : struct
    {
        var size = Marshal.SizeOf<T>();
        var pointer = Marshal.AllocHGlobal(size);

        try
        {
            Marshal.Copy(bytes, 0, pointer, Math.Min(size, bytes.Length));
            return Marshal.PtrToStructure<T>(pointer);
        }
        finally
        {
            Marshal.FreeHGlobal(pointer);
        }
    }

    private delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

    private delegate bool EnumChildWindowsProc(IntPtr hWnd, IntPtr lParam);

    [StructLayout(LayoutKind.Sequential)]
    private struct NativePoint
    {
        internal int X;
        internal int Y;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct NativeRect
    {
        internal int Left;
        internal int Top;
        internal int Right;
        internal int Bottom;
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

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool EnumChildWindows(IntPtr hWndParent, EnumChildWindowsProc lpEnumFunc, IntPtr lParam);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern int GetClassName(IntPtr hWnd, System.Text.StringBuilder lpClassName, int nMaxCount);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool ClientToScreen(IntPtr hWnd, ref NativePoint lpPoint);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool GetCursorPos(out NativePoint lpPoint);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll", SetLastError = true)]
    private static extern IntPtr SendMessage(IntPtr hWnd, int msg, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr OpenProcess(int dwDesiredAccess, bool bInheritHandle, uint dwProcessId);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr VirtualAllocEx(
        IntPtr hProcess,
        IntPtr lpAddress,
        UIntPtr dwSize,
        int flAllocationType,
        int flProtect);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool VirtualFreeEx(
        IntPtr hProcess,
        IntPtr lpAddress,
        UIntPtr dwSize,
        int dwFreeType);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool WriteProcessMemory(
        IntPtr hProcess,
        IntPtr lpBaseAddress,
        byte[] lpBuffer,
        int nSize,
        out IntPtr lpNumberOfBytesWritten);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool ReadProcessMemory(
        IntPtr hProcess,
        IntPtr lpBaseAddress,
        [Out] byte[] lpBuffer,
        int nSize,
        out IntPtr lpNumberOfBytesRead);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr hObject);
}
