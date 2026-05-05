# AGENTS.md - Desktop Calendar

This folder is an isolated desktop calendar workspace inside the PASSIVE-INCOME repository.

Keep changes contained under `desktop-calendar/` unless the user explicitly asks to integrate it with the main ETHNIC HOUSE app.

Do not reuse ETHNIC HOUSE booking, tattoo inventory, admin, database, or deployment assumptions here. This app is a local-first personal calendar tool.

Before reporting completion, run the lightweight checks that apply to this folder:

- `node --check src/app.js`
- `dotnet build windows-host/DesktopCalendar.Host/DesktopCalendar.Host.csproj`
- PowerShell syntax parse for `scripts/start-desktop-calendar.ps1`
- PowerShell syntax parse for `scripts/start-desktop-calendar-host.ps1`
- PowerShell syntax parse for `scripts/build-desktop-calendar-installer.ps1`
- PowerShell syntax parse for `scripts/install-desktop-calendar.ps1`
- PowerShell syntax parse for `scripts/package-desktop-calendar-release.ps1`
- PowerShell syntax parse for `installer/Install-DesktopCalendar.ps1`
- PowerShell syntax parse for `installer/Uninstall-DesktopCalendar.ps1`
