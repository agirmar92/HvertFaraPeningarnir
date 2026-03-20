# Agent Notes

Always use the added MCP servers first.

If the task touches production, deployment, Docker runtime, HTTPS, certificates, or the remote host `hfp.kopavogur.is`, read these first:

- [ops/PRODUCTION_SERVER.md](ops/PRODUCTION_SERVER.md)
- [ops/HTTPS_RENEWAL.md](ops/HTTPS_RENEWAL.md)

Important production facts:

- The production host is a legacy Ubuntu 14.04 box with old trust roots.
- The client and API containers terminate TLS themselves.
- TLS is host-managed and bind-mounted into the containers.
- The live container names and image tags should be managed via `/opt/hfp/etc/hfp-runtime.conf`.
- ACME renewals on the host currently require `acme.sh --insecure`.
- Automatic renewal is scheduled via `/etc/cron.d/hfp-acme`, not root crontab.
