import { clientConfig } from "@/config/client"
import packageJson from "../../../package.json"
import { datadogRum } from '@datadog/browser-rum'
import { CookieConsent, getUserCookieConsent } from "../contexts/cookieConsent"

export const initDataDogAnalytics = () => {
  const enabled = 
    clientConfig.DATADOG_APPLICATION_ID 
    && clientConfig.DATADOG_CLIENT_TOKEN
    && clientConfig.DATADOG_SITE
    && clientConfig.DATADOG_SERVICE

  if (enabled) {
    // ask user for cookie consent
    getUserCookieConsent((consent) => {
      if (consent === CookieConsent.Yes) {
        datadogRum.init({
          applicationId: clientConfig.DATADOG_APPLICATION_ID!,
          clientToken: clientConfig.DATADOG_CLIENT_TOKEN!,
          site: clientConfig.DATADOG_SITE!,
          service: clientConfig.DATADOG_SERVICE!,
          env: clientConfig.APP_MODE!,
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
