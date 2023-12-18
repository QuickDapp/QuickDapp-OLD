---
order: 80
---

# Cookie consent

Cookie law compliance is made easy through the use of a ready-made cookie consent architecture. 

A user may choose to allow or disallow cookies. Their response is cached in `window.localStorage` so that they do not get asked again. Note that this also means that once a user has allowed or disallowed cookies they cannot change their response later on unless you modify the cookie consent logic or clear the `window.localStorage` data.

## Consent banner

There is a [built-in consent banner](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/components/Footer.tsx) which gets shown to user's when they first visit the site. This appears as an overlay at the footer of the page and is triggered automatically if the user has not yet set their response.

![](/static/cookie-banner.png)

## CookieConsentContext

The [`CookieConsentContext`](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/contexts/cookieConsent.tsx) object is responsible for keeping track of the user's cookie consent response. It loads/saves a user's response from/to `window.localStorage`. It also provides methods for triggering the built-in consent popup.


## getUserCookieConsent()

The [`getUserCookieConsent()`](https://github.com/QuickDapp/QuickDapp/tree/master/src/frontend/contexts/cookieConsent.tsx) method provides a way for you to run any custom code _after_ a user's cookie consent response has been recorded, e.g:

```ts
getUserCookieConsent((consent: CookieConsent) => {
  switch (consent) {
    case CookieConsent.Yes: {
      // they are ok with cookies, so run our custom code
      break
    }
    case CookieConsent.No: {
      // they are NOT ok with cookies, so do nothing
      break
    }
  }
})
```

This method can be called from anywhere within the frontend app, as many times as you like.

If the user has already recorded their cookie response (e.g in a previous browser session) then the callbacks will get executed immediately. Otherwise the callbacks will only get executed once the user records a response in the cookie consent banner.

The [analytics](./analytics.md) feature requires cookies and so it relies on this method to activate itself.