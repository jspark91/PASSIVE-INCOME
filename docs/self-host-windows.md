# Self Hosting On This Windows PC

This project can run from this computer without Vercel.

Current purchased Gabia domain:

```text
ethnichouseseoul.com
```

## Start The Server

Run from PowerShell:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\start-ethnic-house-server.cmd
```

The script:

- copies the app to `C:\Users\<you>\passive-income-run`
- installs dependencies
- builds the Next.js production app
- starts `next start` on `0.0.0.0:3000`
- sets `NEXT_PUBLIC_SITE_URL` to the local LAN URL unless you provide one

After start, same-network devices can use:

```text
http://<this-pc-lan-ip>:3000
```

On the current Wi-Fi network this may look like:

```text
http://192.168.0.2:3000
```

The current public IP check returned:

```text
211.177.105.220
```

That public IP will not work until the router forwards an external port to this PC.

## Stop The Server

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\stop-ethnic-house-server.cmd
```

## Windows Firewall

Allow inbound TCP port `3000`:

```powershell
New-NetFirewallRule -DisplayName "ETHNIC HOUSE Next Server 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

If PowerShell says access is denied, open PowerShell as Administrator and run it again.

The current Windows session could not create this firewall rule because it was not elevated.

## Public Internet Access

For people outside your Wi-Fi to access the site, configure the router:

```text
External TCP 3000 -> this PC 192.168.0.2:3000
```

Then use a public domain or dynamic DNS and set:

```powershell
.\scripts\start-ethnic-house-server.cmd -SiteUrl "https://your-domain.com"
```

For DuckDNS, see `docs/ddns-duckdns.md`.

Preferred DDNS router setup:

```text
External TCP 80 -> this PC 192.168.0.2:3000
```

Then start the server with:

```powershell
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouse.duckdns.org"
```

If the router only forwards external port `3000`, use:

```powershell
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouse.duckdns.org:3000"
```

Without a domain, you may be able to test with:

```text
http://211.177.105.220:3000
```

This only works after router port forwarding and firewall access are configured.

For Google indexing, the final public URL must serve:

- `/`
- `/robots.txt`
- `/sitemap.xml`

For the current Gabia domain setup, see `docs/gabia-domain-setup.md`.

## Important

This PC must stay powered on, connected to the internet, and the server process must keep running.
The current observed internal IP is `192.168.0.2`; reserve it in ipTIME if possible so port forwarding does not break after reboot.
