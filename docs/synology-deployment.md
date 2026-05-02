# Synology NAS Deployment

This is the recommended 24/7 deployment target if the NAS supports Synology Container Manager.

Synology Container Manager supports Docker containers and Compose-style projects, so this repository includes:

```text
Dockerfile
docker-compose.yml
deploy/synology/docker-compose.yml
```

The runtime shape is:

```text
Internet
-> Router TCP 80/443
-> Synology NAS built-in reverse proxy / certificate
-> Next.js app container on NAS port 3000
```

Do not run a Caddy container on Synology for this deployment. DSM commonly owns `80/443` already, and a Caddy container that publishes those ports will fail with an error similar to:

```text
driver failed programming external connectivity
```

The only required container is `ethnic-house-app`.

After the first manual NAS deployment works, switch to the GitHub Actions SSH deploy flow in
[`docs/github-actions-nas-deploy.md`](github-actions-nas-deploy.md). If GitHub cannot reach
the NAS through SSH, use the scheduled Git pull flow in
[`docs/nas-auto-deploy.md`](nas-auto-deploy.md). Either option removes the need to upload a
zip file for every homepage or portfolio update.

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
3. If an older project already contains `ethnic-house-caddy`, stop and delete that project first.
4. Create a new project.
5. Project name:

```text
ethnic-house
```

6. Path:

```text
/volume1/docker/ethnic-house
```

7. Use the existing `docker-compose.yml`.
8. Build and start the project.

After the project starts, confirm this URL works from the local network:

```text
http://NAS_IP:3000/api/health
```

Example:

```text
http://192.168.0.10:3000/api/health
```

The project should show `ethnic-house-app` running. It should not show `ethnic-house-caddy`.

## 4. Synology Reverse Proxy

Use Synology's built-in reverse proxy instead of binding a Caddy container to `80/443`. On DSM:

1. Open `Control Panel`.
2. Open `Login Portal`.
3. Open `Advanced`.
4. Open `Reverse Proxy`.
5. Create a rule:

```text
Description: ethnic-house
Source protocol: HTTPS
Source hostname: ethnichouseseoul.com
Source port: 443
Destination protocol: HTTP
Destination hostname: 127.0.0.1
Destination port: 3000
```

Optional HTTP rule:

```text
Description: ethnic-house-http
Source protocol: HTTP
Source hostname: ethnichouseseoul.com
Source port: 80
Destination protocol: HTTP
Destination hostname: 127.0.0.1
Destination port: 3000
```

## 5. Router Port Forwarding

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

## 6. Certificate

In DSM:

1. Open `Control Panel`.
2. Open `Security`.
3. Open `Certificate`.
4. Add a Let's Encrypt certificate for:

```text
ethnichouseseoul.com
```

5. Assign that certificate to the reverse proxy service for `ethnichouseseoul.com`.

Let's Encrypt validation needs the domain DNS to point to the current public IP and router port `80` to reach the NAS.

## 7. DNS

Gabia root domain:

```text
Type: A
Host: @
Value: 211.177.105.220
```

If the public IP changes often, use DDNS or a Cloudflare Tunnel-style setup.

## 8. Test

From mobile data:

```text
https://ethnichouseseoul.com
https://ethnichouseseoul.com/robots.txt
https://ethnichouseseoul.com/sitemap.xml
```

## Notes

- This deployment intentionally does not start a Caddy container because Synology often reserves ports `80/443` for its built-in web service and reverse proxy.
- Keep only one device receiving router ports `80/443` at a time: Windows PC or NAS, not both.
- If NAS port `3000` is already used, change `deploy/synology/docker-compose.yml` from `3000:3000` to another host port such as `3001:3000`, then point the reverse proxy destination to that host port.
