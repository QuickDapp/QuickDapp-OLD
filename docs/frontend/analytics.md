---
order: 92
---

# Analytics

Front-end analytics and browser session recording is done through [Datadog](https://datadoghq.eu/) if the required [environment variables](../environment-variables.md) are set:

* `NEXT_PUBLIC_DATADOG_APPLICATION_ID`
* `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`
* `NEXT_PUBLIC_DATADOG_SITE`
* `NEXT_PUBLIC_DATADOG_SERVICE`

_(See https://docs.datadoghq.com/real_user_monitoring/browser/ for information on these parameters)_

Note that all the above environment variables must be set for analytics to be enabled. Furthermore, the user must [allow cookies](./cookies.md) to be stored.


