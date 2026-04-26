# DuckDNS Setup

This project can use DuckDNS so the home server has a stable public URL even when the public IP changes.

## 1. Create A DuckDNS Name

1. Go to `https://www.duckdns.org/`.
2. Sign in.
3. Create a subdomain, for example:

```text
ethnichouse.duckdns.org
```

4. Copy the DuckDNS token from the DuckDNS page.

Do not commit the token to Git.

## 2. Install The Updater On This PC

Run from this project folder:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\install-duckdns-task.cmd -Domain "ethnichouse" -Token "YOUR_DUCKDNS_TOKEN"
```

This creates a local config file:

```text
C:\Users\<you>\.ethnic-house-duckdns.json
```

It also creates a Windows scheduled task:

```text
ETHNIC HOUSE DuckDNS Update
```

The task updates DuckDNS every 5 minutes and at Windows startup.

## 3. Router Port Forwarding

Preferred setup:

```text
External TCP 80 -> 192.168.0.4:3000
```

This lets visitors use:

```text
http://ethnichouse.duckdns.org
```

Alternative setup:

```text
External TCP 3000 -> 192.168.0.4:3000
```

Then visitors must use:

```text
http://ethnichouse.duckdns.org:3000
```

## 4. Windows Firewall

The local server listens on this PC's TCP port `3000`, so allow inbound TCP `3000`.

Open PowerShell as Administrator and run:

```powershell
New-NetFirewallRule -DisplayName "ETHNIC HOUSE Next Server 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

## 5. Start The Site With The DDNS URL

If the router forwards external port `80` to internal `3000`, start the server like this:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouse.duckdns.org"
```

If the router forwards external port `3000` to internal `3000`, use:

```powershell
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouse.duckdns.org:3000"
```

The `SiteUrl` value controls canonical URLs, OpenGraph URLs, `robots.txt`, and `sitemap.xml`.

## 6. Test

From a phone on mobile data, not Wi-Fi, open:

```text
http://ethnichouse.duckdns.org
```

Then confirm:

```text
http://ethnichouse.duckdns.org/robots.txt
http://ethnichouse.duckdns.org/sitemap.xml
```

## Notes

- The PC must stay powered on.
- The server process must keep running.
- The public URL is HTTP unless you add HTTPS through a reverse proxy, tunnel, or certificate setup.
- For Google Search Console, add the final public URL after it is reachable from outside the local network.
