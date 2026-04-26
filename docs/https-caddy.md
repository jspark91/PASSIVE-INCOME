# HTTPS With Caddy

This self-hosted setup uses Caddy as a reverse proxy:

```text
Internet
-> ipTIME router TCP 80/443
-> this PC 192.168.0.2 TCP 80/443
-> Caddy
-> Next.js 127.0.0.1:3000
```

Caddy automatically obtains and renews HTTPS certificates for:

```text
ethnichouseseoul.com
```

Add `www.ethnichouseseoul.com` to `Caddyfile` only after the `www` DNS record resolves.

## 1. DNS

Gabia DNS must contain:

```text
Type: A
Host: @
Value: 211.177.105.220
```

For `www`:

```text
Type: CNAME
Host: www
Value: ethnichouseseoul.com
```

If CNAME is unavailable:

```text
Type: A
Host: www
Value: 211.177.105.220
```

## 2. ipTIME Port Forwarding

Replace the previous `80 -> 3000` rule with:

```text
Rule: ETHNIC HOUSE HTTP
Protocol: TCP
External port: 80
Internal IP: 192.168.0.2
Internal port: 80
```

Add:

```text
Rule: ETHNIC HOUSE HTTPS
Protocol: TCP
External port: 443
Internal IP: 192.168.0.2
Internal port: 443
```

## 3. Windows Firewall

Open PowerShell as Administrator and run:

```powershell
New-NetFirewallRule -DisplayName "ETHNIC HOUSE Caddy HTTP HTTPS" -Direction Inbound -Protocol TCP -LocalPort 80,443 -Action Allow
```

## 4. Start

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\start-ethnic-house-https-server.cmd
```

This starts:

- Next.js on `127.0.0.1:3000`
- Caddy on `0.0.0.0:80` and `0.0.0.0:443`

## 5. Test

Use mobile data, not the same Wi-Fi:

```text
https://ethnichouseseoul.com
https://ethnichouseseoul.com/robots.txt
https://ethnichouseseoul.com/sitemap.xml
```

## 6. Stop

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\stop-ethnic-house-https-server.cmd
```
