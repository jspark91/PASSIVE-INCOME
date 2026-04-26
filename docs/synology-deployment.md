# Synology NAS Deployment

This is the recommended 24/7 deployment target if the NAS supports Synology Container Manager.

Synology Container Manager supports Docker containers and Compose-style projects, so this repository includes:

```text
Dockerfile
deploy/synology/docker-compose.yml
deploy/synology/Caddyfile
```

The runtime shape is:

```text
Internet
-> Router TCP 80/443
-> Synology NAS TCP 80/443
-> Caddy container
-> Next.js app container on port 3000
```

## Requirements

- Synology NAS with Container Manager available in Package Center.
- NAS has a fixed LAN IP, for example `192.168.0.x`.
- Router can forward external TCP `80` and `443` to the NAS.
- Gabia DNS points `ethnichouseseoul.com` to the public IP.

If the NAS model does not support Container Manager, use a small always-on mini PC, VPS, or keep the current Windows PC setup.

## 1. Copy The Project To NAS

Recommended path on the NAS:

```text
/volume1/docker/ethnic-house
```

Copy the repository contents there.

Options:

- Use DSM File Station upload.
- Use Git over SSH on the NAS.
- Zip this repository and extract it under `/volume1/docker/ethnic-house`.

## 2. Create Optional Environment File

Copy:

```text
deploy/synology/.env.example
```

to:

```text
deploy/synology/.env
```

Leave values blank unless needed.

## 3. Create Container Manager Project

In DSM:

1. Open `Container Manager`.
2. Go to `Project`.
3. Create a new project.
4. Project name:

```text
ethnic-house
```

5. Path:

```text
/volume1/docker/ethnic-house/deploy/synology
```

6. Use the existing `docker-compose.yml`.
7. Build and start the project.

## 4. Router Port Forwarding

Forward to the NAS IP, not the Windows PC.

```text
External TCP 80  -> NAS_IP:80
External TCP 443 -> NAS_IP:443
```

Example:

```text
External TCP 80  -> 192.168.0.10:80
External TCP 443 -> 192.168.0.10:443
```

Do not forward to `192.168.0.2` after moving to NAS unless that is the NAS IP.

## 5. DNS

Gabia root domain:

```text
Type: A
Host: @
Value: 211.177.105.220
```

If the public IP changes often, use DDNS or a Cloudflare Tunnel-style setup.

## 6. Test

From mobile data:

```text
https://ethnichouseseoul.com
https://ethnichouseseoul.com/robots.txt
https://ethnichouseseoul.com/sitemap.xml
```

## Notes

- Caddy automatically issues and renews the HTTPS certificate.
- If Synology DSM or Web Station already uses ports `80/443`, either free those ports or use Synology's built-in reverse proxy and certificate tools instead of the Caddy service.
- Keep only one device receiving router ports `80/443` at a time: Windows PC or NAS, not both.
