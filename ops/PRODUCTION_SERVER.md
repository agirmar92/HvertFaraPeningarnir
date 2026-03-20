# Production Server Context

This document is for future agents and maintainers who need fast context on the live HFP environment.

## Server identity

- Host: `hfp.kopavogur.is`
- SSH user: `esja`
- OS: Ubuntu 14.04.4 LTS
- Kernel observed during TLS cutover: `3.19.0-49-generic`
- Docker observed during TLS cutover: `1.10.3`

## Live architecture

The production host runs three essential Docker containers directly on the host network ports:

- Client container
  - Role name prefix: `hfpclient`
  - Current live name: `hfpclient`
  - Name observed before simplification during the 2026 TLS cutover: `hfpclient_hide-millideildir-level`
  - Image: `agirmar92/hfpclient:hide-millideildir-level`
  - Ports: `80 -> 80`, `443 -> 443`
- API container
  - Role name prefix: `hfpapi`
  - Current live name: `hfpapi`
  - Name observed before simplification during the 2026 TLS cutover: `hfpapi-new-filtering`
  - Image: `agirmar92/hfpapi:2025-joint-revenue-new-filter-latest-years`
  - Ports: `4000 -> 4000`
- Elasticsearch container
  - Name: `hfp-database`
  - Image: `elasticsearch`
  - Ports: `9200 -> 9200`, `9300 -> 9300`

Important characteristics:

- There is no external reverse proxy in front of the client or API containers.
- The client container terminates TLS itself on `443`.
- The API container terminates TLS itself on `4000`.
- Before the TLS automation cutover, both app containers used certs baked into the image.
- Before the cutover, the app containers had no bind mounts and no restart policy.

Naming convention:

- Treat `hfpclient` and `hfpapi` as the stable role prefixes.
- A descriptive postfix is acceptable and expected for some deployments.
- Do not assume the exact cutover-time names are permanent.
- Before touching runtime state, inspect the live names with `docker ps`.

## Current TLS model

TLS is now host-managed and bind-mounted into both app containers.

Host paths:

- `/srv/hfp-certs/live/hfp.kopavogur.is/fullchain.pem`
- `/srv/hfp-certs/live/hfp.kopavogur.is/privkey.pem`

Mount targets:

- Client Apache
  - `/usr/local/apache2/conf/server.crt`
  - `/usr/local/apache2/conf/server.key`
- API Node process
  - `/root/server.crt`
  - `/root/server.key`

Source-of-truth host scripts:

- [hfp-client-run.sh](hfp-client-run.sh)
- [hfp-api-run.sh](hfp-api-run.sh)
- [hfp-cert-deploy.sh](hfp-cert-deploy.sh)
- [hfp-runtime.conf.example](hfp-runtime.conf.example)
- [HTTPS_RENEWAL.md](HTTPS_RENEWAL.md)

Script naming note:

- The host scripts source `/opt/hfp/etc/hfp-runtime.conf` when it exists.
- Keep the live container names and image tags in that runtime config.
- Prefer updating the runtime config over editing the scripts ad hoc.

## ACME and renewal

The host uses `acme.sh`, installed under:

- `/root/.acme.sh`

Renewal scheduling:

- `/etc/cron.d/hfp-acme`

Current cron entry:

```cron
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
23 3 * * * root /root/.acme.sh/acme.sh --cron --home /root/.acme.sh --insecure >/var/log/acme.sh.log 2>&1
```

Important logging detail:

- `acme.sh.log` is overwritten on each run because the cron entry uses `>` rather than `>>`.
- This avoids the log-growth problem that previously filled disks on this server.

## Legacy pitfalls

These are the practical traps discovered during the TLS migration.

### 1. The OS trust store is too old for normal ACME API calls

Ubuntu 14.04 could not validate modern certificate chains from:

- `https://get.acme.sh`
- Let’s Encrypt ACME API endpoints

Because of that:

- `acme.sh` had to be uploaded and installed from a local archive instead of fetched directly on the server
- ACME commands require `--insecure` on this host

Do not remove `--insecure` from the renewal job unless the host CA store is updated or the OS is replaced.

### 2. `crontab` is not usable on this host

Attempts to install a root crontab failed because the host did not have a working crontab spool path.

Use:

- `/etc/cron.d/hfp-acme`

Do not rely on:

- `sudo crontab -e`
- `sudo crontab -l`

unless you first verify the spool problem has been fixed.

### 3. ACME HTTP-01 needed explicit Apache mapping

A simple rewrite exception was not enough.

What works:

- an Apache `Alias` for `/.well-known/acme-challenge/`
- a matching `<Directory>` block
- a no-op rewrite rule to bypass the HTTP-to-HTTPS redirect for that path

This behavior is implemented in [client/hfp-httpd.conf](../client/hfp-httpd.conf).

### 4. `acme.sh -w` writes into a nested path

With:

```bash
-w /srv/hfp-acme/challenge
```

`acme.sh` writes challenge files under:

```text
/srv/hfp-acme/challenge/.well-known/acme-challenge/
```

The client container therefore mounts `/srv/hfp-acme` and serves the nested challenge directory through Apache. Do not remount only the leaf directory unless you also change the ACME invocation.

### 5. Docker emits a harmless config warning for `esja`

Some `docker` commands print:

```text
WARNING: Error loading config file:/home/esja/.docker/config.json - stat /home/esja/.docker/config.json: permission denied
```

This did not block container management during the TLS migration. Treat it as noise unless you are specifically fixing Docker CLI config for `esja`.

### 6. Direct port ownership means restarts are service-affecting

Because there is no front proxy:

- restarting the client affects `80` and `443`
- restarting the API affects `4000`

The deploy hook intentionally restarts the API first, validates it, then restarts the client and validates it.

## Operational checks

Useful commands for future work:

```bash
ssh esja@hfp.kopavogur.is
docker ps
sudo cat /etc/cron.d/hfp-acme
sudo service cron status
sudo /root/.acme.sh/acme.sh --home /root/.acme.sh --cron --insecure
sudo /opt/hfp/bin/hfp-cert-deploy.sh
```

When image tags change:

- update `/opt/hfp/etc/hfp-runtime.conf`
- change `CLIENT_IMAGE` and/or `API_IMAGE`
- rerun `/opt/hfp/bin/hfp-client-run.sh` or `/opt/hfp/bin/hfp-api-run.sh`

Note:

- `https://127.0.0.1:4000/` may return `404` at the API root, and that is acceptable for the deploy hook. The requirement is a valid TLS handshake and an HTTP response, not necessarily a `2xx`.

Public certificate checks:

```bash
printf '' | openssl s_client -connect hfp.kopavogur.is:443 -servername hfp.kopavogur.is 2>/dev/null | openssl x509 -noout -subject -issuer -dates -fingerprint -sha256
printf '' | openssl s_client -connect hfp.kopavogur.is:4000 -servername hfp.kopavogur.is 2>/dev/null | openssl x509 -noout -subject -issuer -dates -fingerprint -sha256
```

## Rollback breadcrumbs

During the TLS automation cutover, a backup snapshot was stored on the host at:

- `/home/esja/hfp-backups/20260320-212647-tls-cutover`

If you need to understand the pre-cutover container state, start there.
