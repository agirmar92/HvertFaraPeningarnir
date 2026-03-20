# HFP HTTPS Renewal

This system now expects certificates to be managed on the host and mounted into the running containers.

## Host layout

- `/srv/hfp-acme`
- `/srv/hfp-acme/challenge/.well-known/acme-challenge`
- `/srv/hfp-certs/live/hfp.kopavogur.is/fullchain.pem`
- `/srv/hfp-certs/live/hfp.kopavogur.is/privkey.pem`
- `/etc/cron.d/hfp-acme`
- `/opt/hfp/etc/hfp-runtime.conf`
- `/opt/hfp/bin/hfp-client-run.sh`
- `/opt/hfp/bin/hfp-api-run.sh`
- `/opt/hfp/bin/hfp-cert-deploy.sh`
- `/opt/hfp/config/client/hfp-httpd.conf`

## Container run commands

The host scripts under `ops/` are the source of truth for container recreation:

- [ops/hfp-client-run.sh](hfp-client-run.sh)
- [ops/hfp-api-run.sh](hfp-api-run.sh)
- [ops/hfp-cert-deploy.sh](hfp-cert-deploy.sh)
- [ops/hfp-runtime.conf.example](hfp-runtime.conf.example)

Container naming note:

- Use `hfpclient` and `hfpapi` as the stable role prefixes.
- A descriptive postfix is allowed.
- Keep the actual live names and image tags in `/opt/hfp/etc/hfp-runtime.conf`.
- If the live host is using a postfix, update the runtime config instead of editing the scripts.
- Do not assume the exact container names from one deployment are permanent.

The current production image tags are:

- `agirmar92/hfpclient:hide-millideildir-level`
- `agirmar92/hfpapi:2025-joint-revenue-new-filter-latest-years`

## Bootstrap

1. Copy the Apache config, host scripts, and runtime config to `/opt/hfp`.
2. Create `/srv/hfp-acme/challenge` and `/srv/hfp-certs/live/hfp.kopavogur.is`.
3. Recreate the client with `USE_LIVE_CERTS=0 /opt/hfp/bin/hfp-client-run.sh`.
4. Install `acme.sh` under `/root/.acme.sh`. On this Ubuntu 14.04 host, ACME API calls require `--insecure` because the system CA bundle is too old.
5. Issue the first certificate with:

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh \
  --issue --insecure --server letsencrypt \
  -d hfp.kopavogur.is -w /srv/hfp-acme/challenge
```

6. Install the certificate with:

```bash
/root/.acme.sh/acme.sh --home /root/.acme.sh \
  --install-cert --ecc -d hfp.kopavogur.is \
  --fullchain-file /srv/hfp-certs/live/hfp.kopavogur.is/fullchain.pem \
  --key-file /srv/hfp-certs/live/hfp.kopavogur.is/privkey.pem \
  --reloadcmd /opt/hfp/bin/hfp-cert-deploy.sh
```

7. Recreate the client with `/opt/hfp/bin/hfp-client-run.sh`.
8. Recreate the API with `/opt/hfp/bin/hfp-api-run.sh`.

## Renewal

Install `/etc/cron.d/hfp-acme`:

```cron
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
23 3 * * * root /root/.acme.sh/acme.sh --cron --home /root/.acme.sh --insecure >/var/log/acme.sh.log 2>&1
```

On renewal, `acme.sh` updates the mounted PEM files and runs `/opt/hfp/bin/hfp-cert-deploy.sh`, which restarts the API container first and then the client container after validating that each endpoint is serving the renewed certificate.

## When image tags change

If you build and deploy a new client or API image:

1. Update `/opt/hfp/etc/hfp-runtime.conf`.
2. Change `CLIENT_IMAGE` and/or `API_IMAGE` to the new tag.
3. Recreate the affected container with `/opt/hfp/bin/hfp-client-run.sh` or `/opt/hfp/bin/hfp-api-run.sh`.

Do not edit the host scripts just to change image tags. The runtime config is the place to do that.
