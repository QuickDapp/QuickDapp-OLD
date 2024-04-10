import { clientConfig } from "@/config/client"
import packageJson from "../../../package.json"
import { datadogRum } from '@datadog/browser-rum'
import { CookieConsent, getUserCookieConsent } from "../contexts/cookieConsent"

export const initDataDogAnalytics = () => {
  const enabled = 
    clientConfig.NEXT_PUBLIC_DATADOG_APPLICATION_ID 
    && clientConfig.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
    && clientConfig.NEXT_PUBLIC_DATADOG_SITE
    && clientConfig.NEXT_PUBLIC_DATADOG_SERVICE

  if (enabled) {
    // ask user for cookie consent
    getUserCookieConsent((consent) => {
      if (consent === CookieConsent.Yes) {
        datadogRum.init({
          applicationId: clientConfig.NEXT_PUBLIC_DATADOG_APPLICATION_ID!,
          clientToken: clientConfig.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
          site: clientConfig.NEXT_PUBLIC_DATADOG_SITE!,
          service: clientConfig.NEXT_PUBLIC_DATADOG_SERVICE!,
          env: clientConfig.NEXT_PUBLIC_APP_MODE!,
          version: packageJson.version,
          sessionSampleRate: 100,
          sessionReplaySampleRate: 100,
          trackUserInteractions: true,
          trackResources: true,
          trackLongTasks: true,
          defaultPrivacyLevel: 'mask-user-input',
        })    

        console.log('Datadog initialized')
      }
    })
  }
}
