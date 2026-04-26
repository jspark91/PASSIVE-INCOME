# Gabia Domain Setup

Current purchased domain:

```text
ethnichouseseoul.com
```

## Current Server

This PC runs the Next.js server on:

```text
192.168.0.4:3000
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

Preferred setup:

```text
Rule name: ETHNIC HOUSE
Protocol: TCP
External port: 80
Internal IP: 192.168.0.4
Internal port: 3000
```

Then the public URL is:

```text
http://ethnichouseseoul.com
```

Alternative setup:

```text
Rule name: ETHNIC HOUSE
Protocol: TCP
External port: 3000
Internal IP: 192.168.0.4
Internal port: 3000
```

Then the public URL is:

```text
http://ethnichouseseoul.com:3000
```

## Start Server With Domain URL

If using external port `80`:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouseseoul.com"
```

If using external port `3000`:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethnichouseseoul.com:3000"
```

## Test

Use mobile data, not the same Wi-Fi:

```text
http://ethnichouseseoul.com
http://ethnichouseseoul.com/robots.txt
http://ethnichouseseoul.com/sitemap.xml
```

## Search Console

After the domain is reachable from outside the local network:

1. Add `http://ethnichouseseoul.com` to Google Search Console.
2. Submit:

```text
http://ethnichouseseoul.com/sitemap.xml
```

3. Use URL Inspection and request indexing for:

```text
http://ethnichouseseoul.com
```
