# Gabia Domain Setup

Current purchased domain:

```text
ethnichouseseoul.com
```

## Current Server

This PC runs the Next.js server on:

```text
192.168.0.2:3000
```

Current public IP:

```text
211.177.105.220
```

## Gabia DNS Records

In Gabia DNS management, set:

```text
Type: A
Host: @
Value: 211.177.105.220
TTL: default
```

For `www`:

```text
Type: CNAME
Host: www
Value: ethnichouseseoul.com
TTL: default
```

If Gabia does not allow CNAME to root, use:

```text
Type: A
Host: www
Value: 211.177.105.220
TTL: default
```

## ipTIME Port Forwarding

For HTTPS, use Caddy as the reverse proxy and forward `80` and `443` to this PC:

```text
Rule name: ETHNIC HOUSE HTTP
Protocol: TCP
External port: 80
Internal IP: 192.168.0.2
Internal port: 80
```

```text
Rule name: ETHNIC HOUSE HTTPS
Protocol: TCP
External port: 443
Internal IP: 192.168.0.2
Internal port: 443
```

Because this is a home network, the internal IP can change after reconnecting Wi-Fi or rebooting the router.
If possible, reserve `192.168.0.2` for this PC in ipTIME DHCP/static lease settings.

Then the public URL is:

```text
https://ethnichouseseoul.com
```

## Start Server With Domain URL

For HTTPS:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\start-ethnic-house-https-server.cmd
```

## Test

Use mobile data, not the same Wi-Fi:

```text
https://ethnichouseseoul.com
https://ethnichouseseoul.com/robots.txt
https://ethnichouseseoul.com/sitemap.xml
```

## Search Console

After the domain is reachable from outside the local network:

1. Add `https://ethnichouseseoul.com` to Google Search Console.
2. Submit:

```text
https://ethnichouseseoul.com/sitemap.xml
```

3. Use URL Inspection and request indexing for:

```text
https://ethnichouseseoul.com
```
