---
order: 60
---

# Sending emails

Sending emails via [Mailgun](https://www.mailgun.com/) is supported out of the box.

The following [environment variables](../environment-variables.md) must be set for email sending to be enabled:

* `MAILGUN_API_KEY` - the Mailgun domain sending API key.
* `MAILGUN_API_ENDPOINT` - the Mailgun API endpoint (e.g `https://api.eu.mailgun.net/`).
* `MAILGUN_FROM_ADDRESS` - email address for the `from` field in an email - must end in `@<DOMAIN>` where `<DOMAIN>` is the domain for which Mailgun sending is configured.

If the mailer is enabled then the `mailer` property in the [bootstrapped object](./bootstrapped.md) will be set.