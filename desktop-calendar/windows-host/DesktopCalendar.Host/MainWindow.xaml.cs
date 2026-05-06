using System.ComponentModel;
using System.IO;
using System.Text.Json;
using System.Windows;
using System.Windows.Interop;
using DesktopCalendar.Host.Interop;
using DesktopCalendar.Host.Services;
using Microsoft.Win32;
using Microsoft.Web.WebView2.Core;
using Forms = System.Windows.Forms;

namespace DesktopCalendar.Host;

public partial class MainWindow : Window
{
    private const double MinWindowWidth = 760;
    private const double MinWindowHeight = 460;
    private const int WmNcHitTest = 0x0084;
    private const int WmDisplayChange = 0x007E;
    private const int WmSettingChange = 0x001A;
    private const int WmDpiChanged = 0x02E0;
    private const int HtTransparent = -1;
    private const int HtClient = 1;
    private const int HtLeft = 10;
    private const int HtRight = 11;
    private const int HtTop = 12;
    private const int HtTopLeft = 13;
    private const int HtTopRight = 14;
    private const int HtBottom = 15;
    private const int HtBottomLeft = 16;
    private const int HtBottomRight = 17;
    private const double ResizeBorderThickness = 8;

    private readonly string _appRoot;
    private readonly CalendarWindowSettings _settings;
    private readonly System.Windows.Threading.DispatcherTimer _persistWindowTimer;
    private readonly System.Windows.Threading.DispatcherTimer _desktopIconPassThroughTimer;
    private readonly System.Windows.Threading.DispatcherTimer _desktopAttachmentTimer;
    private Forms.NotifyIcon? _trayIcon;
    private Forms.ToolStripMenuItem? _startupMenuItem;
    private Forms.ToolStripMenuItem? _backgroundModeMenuItem;
    private Forms.ToolStripMenuItem? _editModeMenuItem;
    private Forms.ToolStripMenuItem? _interactionLockMenuItem;
    private readonly Dictionary<CalendarWindowSizeMode, Forms.ToolStripMenuItem> _sizeMenuItems = new();
    private IntPtr _desktopParentHandle;
    private bool _isApplyingBounds;
    private bool _exitRequested;
    private bool _isClickThrough;
    private bool _isDesktopOverlay;
    private bool _isIconPassThrough;
    private IntPtr _desktopShellHandle;
    private string _latestEventsJson = "[]";

    public MainWindow()
    {
        InitializeComponent();
        _appRoot = Path.Combine(AppContext.BaseDirectory, "app");
        _settings = WindowSettingsStore.Load();
        _persistWindowTimer = new System.Windows.Threading.DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(350)
        };
        _persistWindowTimer.Tick += (_, _) => PersistCurrentWindowBounds();
        _desktopIconPassThroughTimer = new System.Windows.Threading.DispatcherTimer
        {
            Interval = TimeSpan.FromMilliseconds(120)
        };
        _desktopIconPassThroughTimer.Tick += (_, _) => SyncDesktopIconPassThrough();
        _desktopAttachmentTimer = new System.Windows.Threading.DispatcherTimer
        {
            Interval = TimeSpan.FromSeconds(2)
        };
        _desktopAttachmentTimer.Tick += (_, _) => RefreshDesktopAttachmentIfNeeded("timer");

        Loaded += OnLoaded;
        Closing += OnClosing;
        SizeChanged += OnWindowBoundsChanged;
        LocationChanged += OnWindowBoundsChanged;
        SystemEvents.DisplaySettingsChanged += OnDisplaySettingsChanged;
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        InitializeTray();
        await LoadCalendarAsync();
        ShowAsDesktopOverlay();
    }

    private async Task LoadCalendarAsync()
    {
        if (!Directory.Exists(_appRoot))
        {
            Forms.MessageBox.Show(
                $"Cannot find calendar app assets at {_appRoot}",
                "Desktop Calendar",
                Forms.MessageBoxButtons.OK,
                Forms.MessageBoxIcon.Error);
            return;
        }

        var userDataFolder = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "DesktopCalendar",
            "WebView2");

        Directory.CreateDirectory(userDataFolder);

        var environment = await CoreWebView2Environment.CreateAsync(userDataFolder: userDataFolder);
        CalendarWebView.DefaultBackgroundColor = System.Drawing.Color.Transparent;
        await CalendarWebView.EnsureCoreWebView2Async(environment);
        CalendarWebView.DefaultBackgroundColor = System.Drawing.Color.Transparent;
        CalendarWebView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;
        CalendarWebView.CoreWebView2.NavigationCompleted += (_, _) =>
        {
            PostWindowSettings();
            PostInteractionMode();
        };

        CalendarWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "desktop-calendar.local",
            _appRoot,
            CoreWebView2HostResourceAccessKind.Allow);

        CalendarWebView.Source = new Uri("https://desktop-calendar.local/index.html");
    }

    private void InitializeTray()
    {
        var menu = new Forms.ContextMenuStrip();

        _backgroundModeMenuItem = new Forms.ToolStripMenuItem("배경 모드 - 바탕화면 아이콘 먼저 클릭")
        {
            CheckOnClick = false
        };
        _backgroundModeMenuItem.Click += (_, _) => ShowAsDesktopOverlay();
        menu.Items.Add(_backgroundModeMenuItem);

        _editModeMenuItem = new Forms.ToolStripMenuItem("편집 모드 - 캘린더 클릭")
        {
            CheckOnClick = false
        };
        _editModeMenuItem.Click += (_, _) => ShowAsNormalWindow();
        menu.Items.Add(_editModeMenuItem);

        _interactionLockMenuItem = new Forms.ToolStripMenuItem("편집 잠금 - 바탕화면 클릭 우선")
        {
            CheckOnClick = false
        };
        _interactionLockMenuItem.Click += (_, _) => SetInteractionLocked(!_settings.InteractionLocked);
        menu.Items.Add(_interactionLockMenuItem);

        menu.Items.Add("Wallpaper image mode (fallback)", null, (_, _) => ShowAsDesktopBackground());
        menu.Items.Add("배경화면 달력 새로고침", null, (_, _) => ApplyDesktopWallpaper());
        menu.Items.Add("원래 배경화면 복원", null, (_, _) =>
        {
            DesktopWallpaperRenderer.RestoreOriginal(_settings);
        });

        var sizeMenu = new Forms.ToolStripMenuItem("크기");
        AddSizeMenuItem(sizeMenu, CalendarWindowSizeMode.Auto, "자동(해상도 기준)");
        AddSizeMenuItem(sizeMenu, CalendarWindowSizeMode.Compact, "작게");
        AddSizeMenuItem(sizeMenu, CalendarWindowSizeMode.Normal, "보통");
        AddSizeMenuItem(sizeMenu, CalendarWindowSizeMode.Large, "크게");
        AddSizeMenuItem(sizeMenu, CalendarWindowSizeMode.FullDesktop, "전체 바탕화면");
        AddSizeMenuItem(sizeMenu, CalendarWindowSizeMode.Custom, "직접 설정");
        menu.Items.Add(sizeMenu);

        menu.Items.Add("숨기기", null, (_, _) => Hide());
        menu.Items.Add("보이기", null, (_, _) =>
        {
            Show();
            Activate();
        });

        menu.Items.Add(new Forms.ToolStripSeparator());

        _startupMenuItem = new Forms.ToolStripMenuItem("Windows 시작 시 실행")
        {
            CheckOnClick = true,
            Checked = StartupManager.IsEnabled()
        };
        _startupMenuItem.CheckedChanged += (_, _) =>
        {
            if (_startupMenuItem.Checked)
            {
                StartupManager.Enable();
            }
            else
            {
                StartupManager.Disable();
            }
        };
        menu.Items.Add(_startupMenuItem);

        menu.Items.Add(new Forms.ToolStripSeparator());
        menu.Items.Add("종료", null, (_, _) => ExitApplication());

        _trayIcon = new Forms.NotifyIcon
        {
            Icon = System.Drawing.SystemIcons.Application,
            Text = "Desktop Calendar",
            ContextMenuStrip = menu,
            Visible = true
        };
        _trayIcon.DoubleClick += (_, _) =>
        {
            ShowAsNormalWindow();
        };
    }

    private void AddSizeMenuItem(Forms.ToolStripMenuItem parent, CalendarWindowSizeMode mode, string label)
    {
        var item = new Forms.ToolStripMenuItem(label)
        {
            CheckOnClick = false,
            Checked = _settings.SizeMode == mode
        };
        item.Click += (_, _) => SetSizeMode(mode);
        parent.DropDownItems.Add(item);
        _sizeMenuItems[mode] = item;
    }

    private void SetSizeMode(CalendarWindowSizeMode mode)
    {
        _settings.SizeMode = mode;
        WindowSettingsStore.Save(_settings);
        SyncSizeMenuItems();
        ApplyDesktopBounds();
        Show();
        PostWindowSettings();
    }

    private void SetCustomSize(double width, double height)
    {
        var workingArea = GetWorkingArea();
        _settings.SizeMode = CalendarWindowSizeMode.Custom;
        _settings.CustomWidth = Clamp(width, MinWindowWidth, ResolveMaxWidth(workingArea.Width));
        _settings.CustomHeight = Clamp(height, MinWindowHeight, ResolveMaxHeight(workingArea.Height));
        WindowSettingsStore.Save(_settings);
        SyncSizeMenuItems();
        ApplyDesktopBounds();
        Show();
        PostWindowSettings();
    }

    private void SetWindowPosition(double left, double top)
    {
        if (_settings.InteractionLocked)
        {
            return;
        }

        var workingArea = GetWorkingArea();
        _settings.HasCustomPosition = true;
        _settings.CustomLeft = Clamp(left, workingArea.Left, Math.Max(workingArea.Left, workingArea.Right - Width));
        _settings.CustomTop = Clamp(top, workingArea.Top, Math.Max(workingArea.Top, workingArea.Bottom - Height));
        WindowSettingsStore.Save(_settings);
        ApplyDesktopBounds();
        Show();
        PostWindowSettings();
    }

    private void MoveWindowBy(double dx, double dy, bool persist)
    {
        if (_settings.InteractionLocked)
        {
            return;
        }

        var workingArea = GetWorkingArea();
        var left = Clamp(Left + dx, workingArea.Left, Math.Max(workingArea.Left, workingArea.Right - Width));
        var top = Clamp(Top + dy, workingArea.Top, Math.Max(workingArea.Top, workingArea.Bottom - Height));
        SetWindowBounds(new Rect(left, top, Width, Height));

        _settings.HasCustomPosition = true;
        _settings.CustomLeft = left;
        _settings.CustomTop = top;

        if (persist)
        {
            WindowSettingsStore.Save(_settings);
            PostWindowSettings();
        }
    }

    private void ResizeWindowBy(string edge, double dx, double dy, bool persist)
    {
        if (_settings.InteractionLocked)
        {
            return;
        }

        var workingArea = GetWorkingArea();
        var left = Left;
        var top = Top;
        var width = Width;
        var height = Height;
        var edgeName = edge.ToLowerInvariant();

        if (edgeName.Contains('e'))
        {
            width += dx;
        }

        if (edgeName.Contains('s'))
        {
            height += dy;
        }

        if (edgeName.Contains('w'))
        {
            left += dx;
            width -= dx;
        }

        if (edgeName.Contains('n'))
        {
            top += dy;
            height -= dy;
        }

        var maxWidth = Math.Min(ResolveMaxWidth(workingArea.Width), workingArea.Width);
        var maxHeight = Math.Min(ResolveMaxHeight(workingArea.Height), workingArea.Height);

        if (width < MinWindowWidth)
        {
            if (edgeName.Contains('w'))
            {
                left -= MinWindowWidth - width;
            }

            width = MinWindowWidth;
        }
        else if (width > maxWidth)
        {
            if (edgeName.Contains('w'))
            {
                left -= maxWidth - width;
            }

            width = maxWidth;
        }

        if (height < MinWindowHeight)
        {
            if (edgeName.Contains('n'))
            {
                top -= MinWindowHeight - height;
            }

            height = MinWindowHeight;
        }
        else if (height > maxHeight)
        {
            if (edgeName.Contains('n'))
            {
                top -= maxHeight - height;
            }

            height = maxHeight;
        }

        left = Clamp(left, workingArea.Left, Math.Max(workingArea.Left, workingArea.Right - width));
        top = Clamp(top, workingArea.Top, Math.Max(workingArea.Top, workingArea.Bottom - height));

        SetWindowBounds(new Rect(left, top, width, height));
        _settings.SizeMode = CalendarWindowSizeMode.Custom;
        _settings.CustomWidth = width;
        _settings.CustomHeight = height;
        _settings.HasCustomPosition = true;
        _settings.CustomLeft = left;
        _settings.CustomTop = top;

        if (persist)
        {
            WindowSettingsStore.Save(_settings);
            SyncSizeMenuItems();
            PostWindowSettings();
        }
    }

    private void OnWindowBoundsChanged(object? sender, EventArgs e)
    {
        if (_isApplyingBounds || _desktopParentHandle != IntPtr.Zero || WindowState != WindowState.Normal)
        {
            return;
        }

        _persistWindowTimer.Stop();
        _persistWindowTimer.Start();
    }

    private void PersistCurrentWindowBounds()
    {
        _persistWindowTimer.Stop();
        SaveCurrentWindowBounds();
        PostWindowSettings();
    }

    private void SaveCurrentWindowBounds()
    {
        if (_desktopParentHandle != IntPtr.Zero || WindowState != WindowState.Normal)
        {
            return;
        }

        _settings.SizeMode = CalendarWindowSizeMode.Custom;
        _settings.CustomWidth = Math.Max(MinWindowWidth, Width);
        _settings.CustomHeight = Math.Max(MinWindowHeight, Height);
        _settings.HasCustomPosition = true;
        _settings.CustomLeft = Left;
        _settings.CustomTop = Top;
        WindowSettingsStore.Save(_settings);
        SyncSizeMenuItems();
    }

    private void CenterWindow()
    {
        _settings.HasCustomPosition = false;
        WindowSettingsStore.Save(_settings);
        ApplyDesktopBounds();
        Show();
        PostWindowSettings();
    }

    private void SyncSizeMenuItems()
    {
        foreach (var (mode, item) in _sizeMenuItems)
        {
            item.Checked = mode == _settings.SizeMode;
        }
    }

    private void ShowAsDesktopBackground()
    {
        _desktopIconPassThroughTimer.Stop();
        _desktopAttachmentTimer.Stop();
        DesktopHost.SetHitTestPassThrough(GetWindowHandle(), enabled: false);
        _isDesktopOverlay = false;
        _isIconPassThrough = false;
        _desktopShellHandle = IntPtr.Zero;
        _desktopParentHandle = IntPtr.Zero;
        _isClickThrough = true;
        ShowInTaskbar = false;
        SetCalendarInteraction(enabled: false);
        ApplyDesktopWallpaper();
        Hide();

        SyncInteractionMenuItems();
        PostInteractionMode();
    }

    private void ShowAsDesktopOverlay()
    {
        var handle = GetWindowHandle();
        _desktopIconPassThroughTimer.Stop();
        DesktopHost.DetachFromDesktop(handle);
        DesktopHost.SetHitTestPassThrough(handle, enabled: false);
        DesktopHost.SetDesktopWidgetWindow(handle);
        _desktopShellHandle = DesktopHost.GetDesktopShellViewHandle();

        _desktopParentHandle = IntPtr.Zero;
        _isClickThrough = false;
        _isDesktopOverlay = true;
        _isIconPassThrough = false;
        ShowInTaskbar = false;

        try
        {
            DesktopWallpaperRenderer.RestoreOriginal(_settings);
        }
        catch (Exception ex)
        {
            LogDiagnostic($"wallpaper restore failed: {ex.GetType().Name}: {ex.Message}");
        }

        ApplyDesktopBounds();
        Show();
        ApplyInteractionLock();
        _desktopIconPassThroughTimer.Start();
        _desktopAttachmentTimer.Start();
        LogDiagnostic($"overlay started; iconRects={GetDesktopIconRectCountForDiagnostics()}");
        SyncDesktopIconPassThrough();
        SyncInteractionMenuItems();
        PostInteractionMode();
    }

    private void ShowAsNormalWindow()
    {
        var handle = GetWindowHandle();
        _desktopIconPassThroughTimer.Stop();
        _desktopAttachmentTimer.Stop();
        DesktopHost.DetachFromDesktop(handle);
        DesktopHost.SetHitTestPassThrough(handle, enabled: false);
        _desktopParentHandle = IntPtr.Zero;
        _isDesktopOverlay = false;
        _isIconPassThrough = false;
        Show();
        SetCalendarInteraction(enabled: true);
        DesktopHost.SetClickThrough(handle, enabled: false);
        DesktopHost.SetAppWindow(handle);
        _isClickThrough = false;
        ShowInTaskbar = true;
        _desktopShellHandle = IntPtr.Zero;

        ApplyDesktopBounds();

        Show();
        Activate();
        SyncInteractionMenuItems();
        PostInteractionMode();
    }

    private void SyncDesktopIconPassThrough()
    {
        if (!_isDesktopOverlay || !IsVisible)
        {
            return;
        }

        if (_settings.InteractionLocked)
        {
            if (!_isIconPassThrough)
            {
                _isIconPassThrough = true;
                DesktopHost.SetHitTestPassThrough(GetWindowHandle(), enabled: true);
                LogDiagnostic("iconPassThrough=True (interaction locked)");
            }

            return;
        }

        bool shouldPassThrough;
        try
        {
            shouldPassThrough = DesktopIconHitTester.IsCursorOverDesktopIcon();
        }
        catch (Exception ex)
        {
            LogDiagnostic($"icon hit test failed: {ex.GetType().Name}: {ex.Message}");
            return;
        }
        if (shouldPassThrough == _isIconPassThrough)
        {
            return;
        }

        _isIconPassThrough = shouldPassThrough;
        DesktopHost.SetHitTestPassThrough(GetWindowHandle(), shouldPassThrough);
        LogDiagnostic($"iconPassThrough={shouldPassThrough}");
    }

    private static int GetDesktopIconRectCountForDiagnostics()
    {
        try
        {
            return DesktopIconHitTester.GetDesktopIconRectCount();
        }
        catch (Exception ex)
        {
            LogDiagnostic($"icon rect count failed: {ex.GetType().Name}: {ex.Message}");
            return -1;
        }
    }

    private void RefreshDesktopAttachmentIfNeeded(string reason)
    {
        if (!_isDesktopOverlay || !IsVisible)
        {
            return;
        }

        var currentShell = DesktopHost.GetDesktopShellViewHandle();
        if (currentShell == IntPtr.Zero || currentShell == _desktopShellHandle)
        {
            return;
        }

        RefreshDesktopAttachment(reason);
    }

    private void RefreshDesktopAttachment(string reason)
    {
        if (!_isDesktopOverlay)
        {
            return;
        }

        var handle = GetWindowHandle();
        DesktopHost.SetHitTestPassThrough(handle, enabled: false);
        DesktopHost.SetDesktopWidgetWindow(handle);
        _desktopShellHandle = DesktopHost.GetDesktopShellViewHandle();
        _isIconPassThrough = false;
        DesktopIconHitTester.ClearCache();
        ApplyDesktopBounds();
        ApplyInteractionLock();
        PostWindowSettings();
        LogDiagnostic($"desktop attachment refreshed: {reason}; shell=0x{_desktopShellHandle.ToInt64():X}; iconRects={GetDesktopIconRectCountForDiagnostics()}");
    }

    private void OnDisplaySettingsChanged(object? sender, EventArgs e)
    {
        Dispatcher.InvokeAsync(() =>
        {
            DesktopIconHitTester.ClearCache();
            ApplyDesktopBounds();
            RefreshDesktopAttachment("display settings changed");
        });
    }

    private static void LogDiagnostic(string message)
    {
        try
        {
            var directory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "DesktopCalendar");
            Directory.CreateDirectory(directory);
            File.AppendAllText(
                Path.Combine(directory, "diagnostics.log"),
                $"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {message}{Environment.NewLine}");
        }
        catch
        {
            // Diagnostics should never interfere with the desktop layer.
        }
    }

    private void ApplyDesktopWallpaper()
    {
        try
        {
            DesktopWallpaperRenderer.Apply(_settings, _latestEventsJson);
        }
        catch (Exception ex)
        {
            _trayIcon?.ShowBalloonTip(
                3000,
                "Desktop Calendar",
                $"배경화면 달력 생성 실패: {ex.Message}",
                Forms.ToolTipIcon.Warning);
        }
    }

    private void SetCalendarInteraction(bool enabled)
    {
        CalendarWebView.IsHitTestVisible = enabled;
        CalendarWebView.Focusable = enabled;
    }

    private void SetInteractionLocked(bool locked)
    {
        _settings.InteractionLocked = locked;
        WindowSettingsStore.Save(_settings);
        ApplyInteractionLock();
        SyncInteractionMenuItems();
        PostWindowSettings();
    }

    private void ApplyInteractionLock()
    {
        var handle = GetWindowHandle();
        var passThrough = _isDesktopOverlay && _settings.InteractionLocked;

        SetCalendarInteraction(!passThrough);
        DesktopHost.SetHitTestPassThrough(handle, passThrough);
        _isIconPassThrough = passThrough;

        if (!passThrough && _isDesktopOverlay)
        {
            SyncDesktopIconPassThrough();
        }
    }

    private void SyncInteractionMenuItems()
    {
        if (_backgroundModeMenuItem is not null)
        {
            _backgroundModeMenuItem.Checked = _isDesktopOverlay;
        }

        if (_editModeMenuItem is not null)
        {
            _editModeMenuItem.Checked = !_isClickThrough && !_isDesktopOverlay;
        }

        if (_interactionLockMenuItem is not null)
        {
            _interactionLockMenuItem.Checked = _settings.InteractionLocked;
            _interactionLockMenuItem.Text = _settings.InteractionLocked
                ? "편집 잠금 해제 - 캘린더 클릭"
                : "편집 잠금 - 바탕화면 클릭 우선";
        }
    }

    private void ApplyDesktopBounds()
    {
        SetWindowBounds(ResolveWindowBounds());
    }

    private void SetWindowBounds(Rect bounds)
    {
        _isApplyingBounds = true;
        try
        {
            WindowState = WindowState.Normal;
            Left = bounds.Left;
            Top = bounds.Top;
            Width = bounds.Width;
            Height = bounds.Height;

            var handle = GetWindowHandle();
            if (_desktopParentHandle != IntPtr.Zero)
            {
                DesktopHost.SetChildWindowBounds(handle, _desktopParentHandle, bounds.Left, bounds.Top, bounds.Width, bounds.Height);
                DesktopHost.SendToDesktopBottom(handle);
                return;
            }

            return;
        }
        finally
        {
            _isApplyingBounds = false;
        }
    }

    private Rect ResolveWindowBounds()
    {
        var workingArea = GetWorkingArea();

        if (_settings.SizeMode == CalendarWindowSizeMode.FullDesktop)
        {
            return new Rect(workingArea.Left, workingArea.Top, workingArea.Width, workingArea.Height);
        }

        var scale = _settings.SizeMode switch
        {
            CalendarWindowSizeMode.Compact => 0.58,
            CalendarWindowSizeMode.Normal => 0.72,
            CalendarWindowSizeMode.Large => 0.86,
            _ => ResolveAutoScale(workingArea.Width)
        };

        var width = _settings.SizeMode == CalendarWindowSizeMode.Custom
            ? Clamp(_settings.CustomWidth, MinWindowWidth, ResolveMaxWidth(workingArea.Width))
            : Clamp(workingArea.Width * scale, MinWindowWidth, ResolveMaxWidth(workingArea.Width));
        var height = _settings.SizeMode == CalendarWindowSizeMode.Custom
            ? Clamp(_settings.CustomHeight, MinWindowHeight, ResolveMaxHeight(workingArea.Height))
            : Clamp(workingArea.Height * scale, MinWindowHeight, ResolveMaxHeight(workingArea.Height));

        if (width > workingArea.Width)
        {
            width = workingArea.Width;
        }

        if (height > workingArea.Height)
        {
            height = workingArea.Height;
        }

        var left = _settings.HasCustomPosition
            ? Clamp(_settings.CustomLeft, workingArea.Left, Math.Max(workingArea.Left, workingArea.Right - width))
            : workingArea.Left + Math.Max(0, (workingArea.Width - width) / 2);
        var top = _settings.HasCustomPosition
            ? Clamp(_settings.CustomTop, workingArea.Top, Math.Max(workingArea.Top, workingArea.Bottom - height))
            : workingArea.Top + Math.Max(0, (workingArea.Height - height) / 2);

        return new Rect(left, top, width, height);
    }

    private static double ResolveAutoScale(double screenWidth)
    {
        return screenWidth switch
        {
            <= 1366 => 0.90,
            <= 1600 => 0.82,
            <= 1920 => 0.72,
            <= 2560 => 0.64,
            _ => 0.54
        };
    }

    private static double ResolveMaxWidth(double screenWidth)
    {
        return screenWidth switch
        {
            <= 1366 => 1240,
            <= 1920 => 1380,
            <= 2560 => 1580,
            _ => 1760
        };
    }

    private static double ResolveMaxHeight(double screenHeight)
    {
        return screenHeight switch
        {
            <= 768 => 700,
            <= 1080 => 820,
            <= 1440 => 940,
            _ => 1040
        };
    }

    private static double Clamp(double value, double minimum, double maximum)
    {
        return Math.Min(Math.Max(value, minimum), maximum);
    }

    private static Rect GetWorkingArea()
    {
        return SystemParameters.WorkArea;
    }

    private void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        try
        {
            using var document = JsonDocument.Parse(e.WebMessageAsJson);
            var root = document.RootElement;

            if (!root.TryGetProperty("type", out var typeElement))
            {
                return;
            }

            var type = typeElement.GetString();
            if (type == "calendar:eventsChanged")
            {
                _latestEventsJson = root.TryGetProperty("events", out var eventsElement)
                    ? eventsElement.GetRawText()
                    : "[]";

                if (_isClickThrough)
                {
                    ApplyDesktopWallpaper();
                }

                return;
            }

            if (type == "window:getSettings")
            {
                PostWindowSettings();
                return;
            }

            if (type == "window:moveBy")
            {
                if (_settings.InteractionLocked)
                {
                    return;
                }

                var dx = root.TryGetProperty("dx", out var dxElement)
                    ? dxElement.GetDouble()
                    : 0;
                var dy = root.TryGetProperty("dy", out var dyElement)
                    ? dyElement.GetDouble()
                    : 0;
                MoveWindowBy(dx, dy, persist: false);
                return;
            }

            if (type == "window:resizeBy")
            {
                if (_settings.InteractionLocked)
                {
                    return;
                }

                var edge = root.TryGetProperty("edge", out var edgeElement)
                    ? edgeElement.GetString()
                    : null;
                var dx = root.TryGetProperty("dx", out var dxElement)
                    ? dxElement.GetDouble()
                    : 0;
                var dy = root.TryGetProperty("dy", out var dyElement)
                    ? dyElement.GetDouble()
                    : 0;
                ResizeWindowBy(edge ?? string.Empty, dx, dy, persist: false);
                return;
            }

            if (type == "window:resizeEnd")
            {
                SaveCurrentWindowBounds();
                PostWindowSettings();
                return;
            }

            if (type == "window:minimize")
            {
                WindowState = WindowState.Minimized;
                return;
            }

            if (type == "window:maximize")
            {
                if (_settings.InteractionLocked)
                {
                    return;
                }

                ToggleMaximize();
                return;
            }

            if (type == "window:close")
            {
                ExitApplication();
                return;
            }

            if (type == "window:moveEnd")
            {
                WindowSettingsStore.Save(_settings);
                PostWindowSettings();
                return;
            }

            if (type == "window:center")
            {
                if (_settings.InteractionLocked)
                {
                    return;
                }

                CenterWindow();
                return;
            }

            if (type == "window:setInteractionLocked")
            {
                var locked = root.TryGetProperty("locked", out var lockedElement)
                             && lockedElement.GetBoolean();
                SetInteractionLocked(locked);
                return;
            }

            if (type != "window:setSize")
            {
                return;
            }

            if (_settings.InteractionLocked)
            {
                return;
            }

            var modeName = root.TryGetProperty("mode", out var modeElement)
                ? modeElement.GetString()
                : null;

            if (!Enum.TryParse<CalendarWindowSizeMode>(modeName, ignoreCase: true, out var mode))
            {
                return;
            }

            if (mode == CalendarWindowSizeMode.Custom)
            {
                var width = root.TryGetProperty("width", out var widthElement)
                    ? widthElement.GetDouble()
                    : Width;
                var height = root.TryGetProperty("height", out var heightElement)
                    ? heightElement.GetDouble()
                    : Height;
                SetCustomSize(width, height);
            }
            else
            {
                SetSizeMode(mode);
            }

            if (mode != CalendarWindowSizeMode.FullDesktop
                && root.TryGetProperty("left", out var leftElement)
                && root.TryGetProperty("top", out var topElement))
            {
                SetWindowPosition(leftElement.GetDouble(), topElement.GetDouble());
            }
        }
        catch (JsonException)
        {
            PostWindowSettings();
        }
    }

    private void ToggleMaximize()
    {
        if (_settings.SizeMode == CalendarWindowSizeMode.FullDesktop)
        {
            _settings.SizeMode = CalendarWindowSizeMode.Custom;
            _settings.HasCustomPosition = false;
        }
        else
        {
            _settings.SizeMode = CalendarWindowSizeMode.FullDesktop;
            _settings.HasCustomPosition = false;
        }

        WindowSettingsStore.Save(_settings);
        SyncSizeMenuItems();
        ApplyDesktopBounds();
        Show();
        PostWindowSettings();
    }

    private void PostWindowSettings()
    {
        if (CalendarWebView.CoreWebView2 is null)
        {
            return;
        }

        var workingArea = GetWorkingArea();
        var payload = new
        {
            type = "window:settings",
            mode = _settings.SizeMode.ToString(),
            left = Math.Round(Left),
            top = Math.Round(Top),
            width = Math.Round(_settings.SizeMode == CalendarWindowSizeMode.Custom ? _settings.CustomWidth : Width),
            height = Math.Round(_settings.SizeMode == CalendarWindowSizeMode.Custom ? _settings.CustomHeight : Height),
            minLeft = workingArea.Left,
            maxLeft = Math.Round(Math.Max(workingArea.Left, workingArea.Right - Width)),
            minTop = workingArea.Top,
            maxTop = Math.Round(Math.Max(workingArea.Top, workingArea.Bottom - Height)),
            minWidth = MinWindowWidth,
            maxWidth = Math.Round(Math.Min(ResolveMaxWidth(workingArea.Width), workingArea.Width)),
            minHeight = MinWindowHeight,
            maxHeight = Math.Round(Math.Min(ResolveMaxHeight(workingArea.Height), workingArea.Height)),
            screenWidth = workingArea.Width,
            screenHeight = workingArea.Height,
            locked = _settings.InteractionLocked
        };

        CalendarWebView.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(payload));
    }

    private void PostInteractionMode()
    {
        if (CalendarWebView.CoreWebView2 is null)
        {
            return;
        }

        var payload = new
        {
            type = "window:interactionMode",
            mode = _isClickThrough ? "wallpaper" : _isDesktopOverlay ? "overlay" : "window",
            background = _isClickThrough,
            desktopOverlay = _isDesktopOverlay
        };

        CalendarWebView.CoreWebView2.PostWebMessageAsJson(JsonSerializer.Serialize(payload));
    }

    private IntPtr GetWindowHandle()
    {
        return new WindowInteropHelper(this).Handle;
    }

    private void OnClosing(object? sender, CancelEventArgs e)
    {
        if (_exitRequested)
        {
            return;
        }

        e.Cancel = true;
        _desktopIconPassThroughTimer.Stop();
        _desktopAttachmentTimer.Stop();
        DesktopHost.SetHitTestPassThrough(GetWindowHandle(), enabled: false);
        _isIconPassThrough = false;
        Hide();
    }

    private void ExitApplication()
    {
        _exitRequested = true;
        _desktopIconPassThroughTimer.Stop();
        _desktopAttachmentTimer.Stop();
        SystemEvents.DisplaySettingsChanged -= OnDisplaySettingsChanged;
        DesktopHost.SetHitTestPassThrough(GetWindowHandle(), enabled: false);
        _trayIcon?.Dispose();
        Close();
        System.Windows.Application.Current.Shutdown();
    }

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        if (PresentationSource.FromVisual(this) is HwndSource source)
        {
            source.AddHook(WndProc);
        }

        DesktopHost.SetAppWindow(GetWindowHandle());
    }

    private IntPtr WndProc(IntPtr hwnd, int msg, IntPtr wParam, IntPtr lParam, ref bool handled)
    {
        if (msg == WmNcHitTest && _isClickThrough)
        {
            handled = true;
            return new IntPtr(HtTransparent);
        }

        if (msg == WmNcHitTest && _isDesktopOverlay)
        {
            if (_settings.InteractionLocked)
            {
                handled = true;
                return new IntPtr(HtTransparent);
            }

            var screenPoint = new System.Windows.Point(GetSignedLowWord(lParam), GetSignedHighWord(lParam));
            if (DesktopIconHitTester.IsPointOverDesktopIcon(screenPoint))
            {
                handled = true;
                return new IntPtr(HtTransparent);
            }
        }

        if ((msg == WmDisplayChange || msg == WmSettingChange || msg == WmDpiChanged) && _isDesktopOverlay)
        {
            Dispatcher.InvokeAsync(() =>
            {
                DesktopIconHitTester.ClearCache();
                ApplyDesktopBounds();
                RefreshDesktopAttachment($"window message 0x{msg:X}");
            });
            return IntPtr.Zero;
        }

        if (msg != WmNcHitTest || WindowState != WindowState.Normal)
        {
            return IntPtr.Zero;
        }

        if (_settings.InteractionLocked)
        {
            return IntPtr.Zero;
        }

        var hit = ResolveResizeHitTest(lParam);
        if (hit == HtClient)
        {
            return IntPtr.Zero;
        }

        handled = true;
        return new IntPtr(hit);
    }

    private int ResolveResizeHitTest(IntPtr lParam)
    {
        var point = new System.Windows.Point(GetSignedLowWord(lParam), GetSignedHighWord(lParam));
        if (PresentationSource.FromVisual(this)?.CompositionTarget is { } target)
        {
            point = target.TransformFromDevice.Transform(point);
        }

        var left = Left;
        var top = Top;
        var right = left + ActualWidth;
        var bottom = top + ActualHeight;

        var onLeft = point.X >= left && point.X < left + ResizeBorderThickness;
        var onRight = point.X <= right && point.X > right - ResizeBorderThickness;
        var onTop = point.Y >= top && point.Y < top + ResizeBorderThickness;
        var onBottom = point.Y <= bottom && point.Y > bottom - ResizeBorderThickness;

        return (onLeft, onRight, onTop, onBottom) switch
        {
            (true, _, true, _) => HtTopLeft,
            (_, true, true, _) => HtTopRight,
            (true, _, _, true) => HtBottomLeft,
            (_, true, _, true) => HtBottomRight,
            (true, _, _, _) => HtLeft,
            (_, true, _, _) => HtRight,
            (_, _, true, _) => HtTop,
            (_, _, _, true) => HtBottom,
            _ => HtClient
        };
    }

    private static int GetSignedLowWord(IntPtr value)
    {
        return unchecked((short)((long)value & 0xffff));
    }

    private static int GetSignedHighWord(IntPtr value)
    {
        return unchecked((short)(((long)value >> 16) & 0xffff));
    }
}
