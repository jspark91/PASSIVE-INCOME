using System.ComponentModel;
using System.IO;
using System.Windows;
using System.Windows.Interop;
using DesktopCalendar.Host.Interop;
using DesktopCalendar.Host.Services;
using Microsoft.Web.WebView2.Core;
using Forms = System.Windows.Forms;

namespace DesktopCalendar.Host;

public partial class MainWindow : Window
{
    private readonly string _appRoot;
    private Forms.NotifyIcon? _trayIcon;
    private Forms.ToolStripMenuItem? _startupMenuItem;
    private bool _exitRequested;

    public MainWindow()
    {
        InitializeComponent();
        _appRoot = Path.Combine(AppContext.BaseDirectory, "app");

        Loaded += OnLoaded;
        Closing += OnClosing;
    }

    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        InitializeTray();
        FitToVirtualDesktop();
        DesktopHost.SetToolWindow(GetWindowHandle());
        await LoadCalendarAsync();
        AttachToDesktop();
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
        await CalendarWebView.EnsureCoreWebView2Async(environment);

        CalendarWebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
            "desktop-calendar.local",
            _appRoot,
            CoreWebView2HostResourceAccessKind.Allow);

        CalendarWebView.Source = new Uri("https://desktop-calendar.local/index.html");
    }

    private void InitializeTray()
    {
        var menu = new Forms.ContextMenuStrip();

        menu.Items.Add("바탕화면에 고정", null, (_, _) => AttachToDesktop());
        menu.Items.Add("일반 창으로 보기", null, (_, _) => ShowAsNormalWindow());
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
            Show();
            Activate();
        };
    }

    private void AttachToDesktop()
    {
        var handle = GetWindowHandle();
        FitToVirtualDesktop();
        DesktopHost.SetToolWindow(handle);

        var desktopWindow = DesktopHost.FindDesktopWindow();
        if (desktopWindow != IntPtr.Zero)
        {
            DesktopHost.AttachToDesktop(handle, desktopWindow);
        }

        Show();
    }

    private void ShowAsNormalWindow()
    {
        var handle = GetWindowHandle();
        DesktopHost.DetachFromDesktop(handle);
        DesktopHost.SetAppWindow(handle);

        Width = 1280;
        Height = 820;
        Left = Math.Max(0, (SystemParameters.PrimaryScreenWidth - Width) / 2);
        Top = Math.Max(0, (SystemParameters.PrimaryScreenHeight - Height) / 2);

        Show();
        Activate();
    }

    private void FitToVirtualDesktop()
    {
        var bounds = Forms.SystemInformation.VirtualScreen;
        WindowState = WindowState.Normal;
        Left = bounds.Left;
        Top = bounds.Top;
        Width = bounds.Width;
        Height = bounds.Height;
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
        Hide();
    }

    private void ExitApplication()
    {
        _exitRequested = true;
        _trayIcon?.Dispose();
        Close();
        System.Windows.Application.Current.Shutdown();
    }

    protected override void OnSourceInitialized(EventArgs e)
    {
        base.OnSourceInitialized(e);
        DesktopHost.SetToolWindow(GetWindowHandle());
    }
}
