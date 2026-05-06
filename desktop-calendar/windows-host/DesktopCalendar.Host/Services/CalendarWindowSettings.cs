namespace DesktopCalendar.Host.Services;

internal enum CalendarWindowSizeMode
{
    Auto,
    Compact,
    Normal,
    Large,
    FullDesktop,
    Custom
}

internal sealed class CalendarWindowSettings
{
    public CalendarWindowSizeMode SizeMode { get; set; } = CalendarWindowSizeMode.Auto;
    public double CustomWidth { get; set; } = 1280;
    public double CustomHeight { get; set; } = 760;
    public bool HasCustomPosition { get; set; }
    public double CustomLeft { get; set; }
    public double CustomTop { get; set; }
    public string? OriginalWallpaperPath { get; set; }
}
