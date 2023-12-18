---
order: 50
---

# Analytics

Front-end analytics and browser session recording is done through [Datadog](https://datadoghq.eu/). This allows you to see what users's see on the page as well as how they move around the page, visually. 

To enable these, you'll need to set the required [environment variables](../environment-variables.md):

* `NEXT_PUBLIC_DATADOG_APPLICATION_ID`
* `NEXT_PUBLIC_DATADOG_CLIENT_TOKEN`
* `NEXT_PUBLIC_DATADOG_SITE`
* `NEXT_PUBLIC_DATADOG_SERVICE`

_(See https://docs.datadoghq.com/real_user_monitoring/browser/ for information on these parameters)_

Note that **all** the above environment variables must be set for analytics to be enabled. Furthermore, the user must [give consent for cookies](./cookies.md) to be stored.


