Desktop Calendar
================

Install
-------
1. Extract the full zip file.
2. Right-click Install-DesktopCalendar.ps1.
3. Select Run with PowerShell.

The installer copies the app to:
%LOCALAPPDATA%\Programs\DesktopCalendar

It also creates:
- Desktop Calendar desktop shortcut
- Windows startup entry

Uninstall
---------
Run Uninstall-DesktopCalendar.ps1 with PowerShell.

Notes
-----
This is an unsigned app package. Windows SmartScreen may show a warning until the app is code-signed.

Desktop Calendar uses Microsoft Edge WebView2 Runtime. Most Windows 10/11 PCs already have it installed. If the app opens blank, install WebView2 Runtime from Microsoft.
