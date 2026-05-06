using System.IO;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;

namespace DesktopCalendar.Host.Services;

internal static class WindowSettingsStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private static string SettingsPath => Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "DesktopCalendar",
        "settings.json");

    internal static CalendarWindowSettings Load()
    {
        try
        {
            if (!File.Exists(SettingsPath))
            {
                return new CalendarWindowSettings();
            }

            var json = File.ReadAllText(SettingsPath);
            return JsonSerializer.Deserialize<CalendarWindowSettings>(json, JsonOptions)
                   ?? new CalendarWindowSettings();
        }
        catch
        {
            return new CalendarWindowSettings();
        }
    }

    internal static void Save(CalendarWindowSettings settings)
    {
        var directory = Path.GetDirectoryName(SettingsPath);
        if (!string.IsNullOrWhiteSpace(directory))
        {
            Directory.CreateDirectory(directory);
        }

        var json = JsonSerializer.Serialize(settings, JsonOptions);

        for (var attempt = 0; attempt < 5; attempt++)
        {
            try
            {
                File.WriteAllText(SettingsPath, json);
                return;
            }
            catch (IOException) when (attempt < 4)
            {
                Thread.Sleep(80);
            }
            catch (UnauthorizedAccessException) when (attempt < 4)
            {
                Thread.Sleep(80);
            }
            catch (IOException)
            {
                return;
            }
            catch (UnauthorizedAccessException)
            {
                return;
            }
        }
    }
}
