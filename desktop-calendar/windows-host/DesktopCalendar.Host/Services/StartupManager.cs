using Microsoft.Win32;
using System.IO;

namespace DesktopCalendar.Host.Services;

internal static class StartupManager
{
    private const string RunKeyPath = @"Software\Microsoft\Windows\CurrentVersion\Run";
    private const string ValueName = "DesktopCalendar";

    internal static bool IsEnabled()
    {
        using var key = Registry.CurrentUser.OpenSubKey(RunKeyPath, writable: false);
        return key?.GetValue(ValueName) is string value
               && value.Contains(GetExecutablePath(), StringComparison.OrdinalIgnoreCase);
    }

    internal static void Enable()
    {
        using var key = Registry.CurrentUser.CreateSubKey(RunKeyPath);
        key?.SetValue(ValueName, $"\"{GetExecutablePath()}\"");
    }

    internal static void Disable()
    {
        using var key = Registry.CurrentUser.OpenSubKey(RunKeyPath, writable: true);
        key?.DeleteValue(ValueName, throwOnMissingValue: false);
    }

    private static string GetExecutablePath()
    {
        return Environment.ProcessPath ?? Path.Combine(AppContext.BaseDirectory, "DesktopCalendar.exe");
    }
}
