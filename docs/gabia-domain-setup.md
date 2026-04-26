# Gabia Domain Setup

Current purchased domain:

```text
ethichouseseoul.com
```

Note the spelling: this is `ethichouse...`, not `ethnichouse...`.
If that missing `n` was accidental, also buy `ethnichouseseoul.com` and redirect it to this site.

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
Value: ethichouseseoul.com
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
http://ethichouseseoul.com
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
http://ethichouseseoul.com:3000
```

## Start Server With Domain URL

If using external port `80`:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethichouseseoul.com"
```

If using external port `3000`:

```powershell
cd C:\#TUNNEL\PASSIVE-INCOME
.\scripts\start-ethnic-house-server.cmd -SiteUrl "http://ethichouseseoul.com:3000"
```

## Test

Use mobile data, not the same Wi-Fi:

```text
http://ethichouseseoul.com
http://ethichouseseoul.com/robots.txt
http://ethichouseseoul.com/sitemap.xml
```

## Search Console

After the domain is reachable from outside the local network:

1. Add `http://ethichouseseoul.com` to Google Search Console.
2. Submit:

```text
http://ethichouseseoul.com/sitemap.xml
```

3. Use URL Inspection and request indexing for:

```text
http://ethichouseseoul.com
```
