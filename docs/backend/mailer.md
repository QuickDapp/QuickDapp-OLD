---
order: 60
---

# Mailer

Sending emails via [Sendgrid](https://sendgrid.com/) is supported out of the box. The mailer code is in `src/backend/mailer/index.ts`.

The following [environment variables](../environment-variables.md) must be set for email sending to be enabled:

* `MAILER_API_KEY` - the SendGrid API key.
* `MAILER_FROM_ADDRESS` - email address for the `from` field in an email - must match what is configured as allowed in the SendGrid account.

If the mailer is enabled then the `mailer` property in the [bootstrapped object](./bootstrapped.md) will be set.