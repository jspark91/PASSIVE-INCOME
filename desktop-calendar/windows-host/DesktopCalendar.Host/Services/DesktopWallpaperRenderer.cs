using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using Microsoft.Win32;
using Forms = System.Windows.Forms;

namespace DesktopCalendar.Host.Services;

internal static class DesktopWallpaperRenderer
{
    private const int SpiSetDesktopWallpaper = 0x0014;
    private const int SpiGetDesktopWallpaper = 0x0073;
    private const int SpifUpdateIniFile = 0x01;
    private const int SpifSendChange = 0x02;

    private static readonly string WallpaperDirectory = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "DesktopCalendar",
        "wallpaper");

    private static readonly string GeneratedWallpaperPath = Path.Combine(
        WallpaperDirectory,
        "desktop-calendar-wallpaper.bmp");

    internal static string Apply(CalendarWindowSettings settings, string eventsJson)
    {
        Directory.CreateDirectory(WallpaperDirectory);

        var currentWallpaper = GetCurrentWallpaperPath();
        if (!IsGeneratedWallpaper(currentWallpaper) && File.Exists(currentWallpaper))
        {
            settings.OriginalWallpaperPath = currentWallpaper;
            WindowSettingsStore.Save(settings);
        }

        var sourceWallpaper = settings.OriginalWallpaperPath;
        var bounds = Forms.Screen.PrimaryScreen?.Bounds ?? new Rectangle(0, 0, 1920, 1080);
        var events = ParseEvents(eventsJson);

        using var bitmap = new Bitmap(bounds.Width, bounds.Height, PixelFormat.Format24bppRgb);
        using var graphics = Graphics.FromImage(bitmap);
        graphics.SmoothingMode = SmoothingMode.AntiAlias;
        graphics.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

        DrawWallpaperBase(graphics, bitmap.Size, sourceWallpaper);
        DrawMonthCalendar(graphics, bitmap.Size, events);

        bitmap.Save(GeneratedWallpaperPath, ImageFormat.Bmp);
        SetWallpaper(GeneratedWallpaperPath);
        return GeneratedWallpaperPath;
    }

    internal static bool RestoreOriginal(CalendarWindowSettings settings)
    {
        var target = settings.OriginalWallpaperPath;
        if (string.IsNullOrWhiteSpace(target) || !File.Exists(target))
        {
            target = FindWallpaperHistoryFallback();
            if (string.IsNullOrWhiteSpace(target) || !File.Exists(target))
            {
                return false;
            }
        }

        SetWallpaper(target);
        settings.OriginalWallpaperPath = target;
        WindowSettingsStore.Save(settings);
        return true;
    }

    private static List<CalendarWallpaperEvent> ParseEvents(string eventsJson)
    {
        try
        {
            return JsonSerializer.Deserialize<List<CalendarWallpaperEvent>>(eventsJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            }) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static void DrawWallpaperBase(Graphics graphics, Size canvas, string? sourceWallpaper)
    {
        graphics.Clear(Color.Black);

        if (string.IsNullOrWhiteSpace(sourceWallpaper) || !File.Exists(sourceWallpaper))
        {
            using var brush = new LinearGradientBrush(
                new Rectangle(Point.Empty, canvas),
                Color.FromArgb(8, 18, 22),
                Color.FromArgb(20, 30, 35),
                LinearGradientMode.ForwardDiagonal);
            graphics.FillRectangle(brush, new Rectangle(Point.Empty, canvas));
            return;
        }

        try
        {
            using var image = Image.FromFile(sourceWallpaper!);
            var target = GetCoverRectangle(image.Size, canvas);
            graphics.DrawImage(image, target);
        }
        catch
        {
            graphics.Clear(Color.FromArgb(8, 18, 22));
        }
    }

    private static Rectangle GetCoverRectangle(Size source, Size target)
    {
        var scale = Math.Max(target.Width / (double)source.Width, target.Height / (double)source.Height);
        var width = (int)Math.Ceiling(source.Width * scale);
        var height = (int)Math.Ceiling(source.Height * scale);
        return new Rectangle((target.Width - width) / 2, (target.Height - height) / 2, width, height);
    }

    private static void DrawMonthCalendar(Graphics graphics, Size canvas, List<CalendarWallpaperEvent> events)
    {
        var today = DateTime.Today;
        var firstOfMonth = new DateTime(today.Year, today.Month, 1);
        var start = firstOfMonth.AddDays(-(int)firstOfMonth.DayOfWeek);
        var area = ResolveCalendarArea(canvas);
        var headerHeight = Math.Max(42, area.Height / 18);
        var weekdayHeight = Math.Max(34, area.Height / 24);
        var gridTop = area.Top + headerHeight + weekdayHeight;
        var cellWidth = area.Width / 7f;
        var cellHeight = (area.Bottom - gridTop) / 6f;

        using var framePen = new Pen(Color.FromArgb(165, 235, 232, 142), 3f)
        {
            DashStyle = DashStyle.Dot
        };
        graphics.DrawRectangle(framePen, area);

        using var headerBrush = new SolidBrush(Color.FromArgb(58, 11, 64, 76));
        graphics.FillRectangle(headerBrush, area.Left, area.Top, area.Width, headerHeight);

        using var titleFont = new Font("Malgun Gothic", Math.Max(17, canvas.Width / 95f), FontStyle.Bold, GraphicsUnit.Pixel);
        using var smallFont = new Font("Malgun Gothic", Math.Max(11, canvas.Width / 160f), FontStyle.Bold, GraphicsUnit.Pixel);
        using var dayFont = new Font("Malgun Gothic", Math.Max(15, canvas.Width / 125f), FontStyle.Bold, GraphicsUnit.Pixel);
        using var eventFont = new Font("Malgun Gothic", Math.Max(11, canvas.Width / 170f), FontStyle.Bold, GraphicsUnit.Pixel);
        using var titleBrush = new SolidBrush(Color.FromArgb(225, 236, 250, 248));
        using var mutedBrush = new SolidBrush(Color.FromArgb(178, 220, 235, 238));

        var title = $"{today:yyyy년 M월}";
        graphics.DrawString(title, titleFont, titleBrush, area.Left + 18, area.Top + 8);
        graphics.DrawString($"오늘 {today:yyyy-MM-dd dddd}", smallFont, mutedBrush, area.Left + 20 + Measure(graphics, title, titleFont), area.Top + 14);

        var weekdays = new[] { "일", "월", "화", "수", "목", "금", "토" };
        using var weekdayBrush = new SolidBrush(Color.FromArgb(54, 8, 54, 66));
        graphics.FillRectangle(weekdayBrush, area.Left, area.Top + headerHeight, area.Width, weekdayHeight);
        for (var i = 0; i < weekdays.Length; i++)
        {
            DrawCenteredString(graphics, weekdays[i], smallFont, mutedBrush, new RectangleF(area.Left + i * cellWidth, area.Top + headerHeight, cellWidth, weekdayHeight));
        }

        using var linePen = new Pen(Color.FromArgb(110, 3, 15, 19), 1f);
        using var monthCellBrush = new SolidBrush(Color.FromArgb(78, 7, 56, 68));
        using var outsideCellBrush = new SolidBrush(Color.FromArgb(70, 88, 52, 31));
        using var todayPen = new Pen(Color.FromArgb(230, 245, 238, 126), 3f);
        using var eventBrush = new SolidBrush(Color.FromArgb(168, 28, 92, 112));
        using var eventTextBrush = new SolidBrush(Color.FromArgb(235, 245, 252, 253));

        var eventsByDate = events
            .Where(item => DateTime.TryParse(item.Date, out _))
            .GroupBy(item => DateTime.Parse(item.Date).Date)
            .ToDictionary(group => group.Key, group => group.Take(3).ToList());

        for (var index = 0; index < 42; index++)
        {
            var date = start.AddDays(index);
            var column = index % 7;
            var row = index / 7;
            var cell = new RectangleF(area.Left + column * cellWidth, gridTop + row * cellHeight, cellWidth, cellHeight);
            graphics.FillRectangle(date.Month == today.Month ? monthCellBrush : outsideCellBrush, cell);
            graphics.DrawRectangle(linePen, cell.X, cell.Y, cell.Width, cell.Height);

            var dayText = date.Day.ToString();
            var dayBrush = date.Month == today.Month ? titleBrush : mutedBrush;
            graphics.DrawString(dayText, dayFont, dayBrush, cell.X + 12, cell.Y + 8);

            if (date.Date == today)
            {
                graphics.DrawRectangle(todayPen, cell.X + 2, cell.Y + 2, cell.Width - 4, cell.Height - 4);
                using var todayBrush = new SolidBrush(Color.FromArgb(70, 245, 238, 126));
                graphics.FillRectangle(todayBrush, cell.X + cell.Width - 56, cell.Y + 8, 42, 24);
                graphics.DrawString("오늘", smallFont, titleBrush, cell.X + cell.Width - 50, cell.Y + 12);
            }

            if (!eventsByDate.TryGetValue(date.Date, out var dayEvents))
            {
                continue;
            }

            var eventTop = cell.Y + Math.Max(34, cellHeight * 0.28f);
            foreach (var item in dayEvents)
            {
                var eventRect = new RectangleF(cell.X + 10, eventTop, cell.Width - 20, Math.Max(22, cellHeight * 0.14f));
                graphics.FillRoundedRectangle(eventBrush, eventRect, 7);
                var label = string.IsNullOrWhiteSpace(item.Time)
                    ? item.Title
                    : $"{item.Time} {item.Title}";
                graphics.DrawString(TrimText(graphics, label, eventFont, eventRect.Width - 10), eventFont, eventTextBrush, eventRect.X + 7, eventRect.Y + 4);
                eventTop += eventRect.Height + 5;
            }
        }
    }

    private static Rectangle ResolveCalendarArea(Size canvas)
    {
        var marginX = Math.Max(18, canvas.Width / 110);
        var top = Math.Max(8, canvas.Height / 160);
        var taskbarReserve = Math.Max(56, canvas.Height / 15);
        return new Rectangle(marginX, top, canvas.Width - marginX * 2, canvas.Height - top - taskbarReserve);
    }

    private static int Measure(Graphics graphics, string text, Font font)
    {
        return (int)Math.Ceiling(graphics.MeasureString(text, font).Width);
    }

    private static void DrawCenteredString(Graphics graphics, string text, Font font, Brush brush, RectangleF bounds)
    {
        using var format = new StringFormat
        {
            Alignment = StringAlignment.Center,
            LineAlignment = StringAlignment.Center
        };
        graphics.DrawString(text, font, brush, bounds, format);
    }

    private static string TrimText(Graphics graphics, string text, Font font, float maxWidth)
    {
        if (graphics.MeasureString(text, font).Width <= maxWidth)
        {
            return text;
        }

        const string ellipsis = "...";
        for (var length = Math.Max(0, text.Length - 1); length > 0; length--)
        {
            var candidate = text[..length] + ellipsis;
            if (graphics.MeasureString(candidate, font).Width <= maxWidth)
            {
                return candidate;
            }
        }

        return ellipsis;
    }

    private static bool IsGeneratedWallpaper(string? path)
    {
        return !string.IsNullOrWhiteSpace(path)
               && string.Equals(Path.GetFullPath(path), Path.GetFullPath(GeneratedWallpaperPath), StringComparison.OrdinalIgnoreCase);
    }

    private static string? FindWallpaperHistoryFallback()
    {
        using var key = Registry.CurrentUser.OpenSubKey(@"Software\Microsoft\Windows\CurrentVersion\Explorer\Wallpapers");
        if (key is null)
        {
            return null;
        }

        for (var index = 1; index <= 4; index++)
        {
            var candidate = key.GetValue($"BackgroundHistoryPath{index}") as string;
            if (!string.IsNullOrWhiteSpace(candidate)
                && File.Exists(candidate)
                && !IsGeneratedWallpaper(candidate))
            {
                return candidate;
            }
        }

        return null;
    }

    private static string GetCurrentWallpaperPath()
    {
        var builder = new StringBuilder(1024);
        return SystemParametersInfo(SpiGetDesktopWallpaper, builder.Capacity, builder, 0)
            ? builder.ToString()
            : string.Empty;
    }

    private static void SetWallpaper(string path)
    {
        SystemParametersInfo(SpiSetDesktopWallpaper, 0, path, SpifUpdateIniFile | SpifSendChange);
    }

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool SystemParametersInfo(int action, int param, string value, int flags);

    [DllImport("user32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool SystemParametersInfo(int action, int param, StringBuilder value, int flags);

    private sealed class CalendarWallpaperEvent
    {
        public string Date { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
    }
}

internal static class GraphicsExtensions
{
    internal static void FillRoundedRectangle(this Graphics graphics, Brush brush, RectangleF bounds, float radius)
    {
        using var path = new GraphicsPath();
        var diameter = radius * 2;
        path.AddArc(bounds.X, bounds.Y, diameter, diameter, 180, 90);
        path.AddArc(bounds.Right - diameter, bounds.Y, diameter, diameter, 270, 90);
        path.AddArc(bounds.Right - diameter, bounds.Bottom - diameter, diameter, diameter, 0, 90);
        path.AddArc(bounds.X, bounds.Bottom - diameter, diameter, diameter, 90, 90);
        path.CloseFigure();
        graphics.FillPath(brush, path);
    }
}
