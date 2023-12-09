"use client"

import React, { FC, PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from 'react'

export enum CookieConsent {
  Yes = 'Yes', 
  No = 'No',
}

export type CookieConsentCallback = (consent: CookieConsent) => void

// this variable allows us to capture consent requests before the provider below has been activated
let getUserCookieConsentRequests: CookieConsentCallback[] = []

// this variable allows us to capture consent requests after the provider below has been activated
let eventListenerReady = false

export interface CookieConsentContextValue {
  askedForConsent: boolean
  showConsentDialog: boolean
  consent?: CookieConsent
  setConsentAnswer: (consent: CookieConsent) => void
  askUserForConsentUnlessAlreadyAnswered: () => void
}

export const CookieConsentContext = createContext({} as CookieConsentContextValue)

export const CookieConsentProvider: FC<PropsWithChildren> = ({ children }) => {
  const [askedForConsent, setAskedForConsent] = useState<boolean>(true)
  const [consent, setConsent] = useState<CookieConsent | undefined>()
  const [showConsentDialog, setShowConsentDialog] = useState<boolean>(false)

  const setConsentAnswer = useCallback((consent: CookieConsent) => {
    window.localStorage.setItem('cookieConsent', consent)
    setConsent(consent)
    setAskedForConsent(true)
    setShowConsentDialog(false)
  }, [])

  // show consent dialog
  const askUserForConsentUnlessAlreadyAnswered = useCallback(() => {
    if (!askedForConsent && !showConsentDialog) {
      console.log('Cookie consent not yet obtained, showing consent dialog...')
      setShowConsentDialog(true)
    }
  }, [askedForConsent, showConsentDialog])

  const handleConsentRequests = useCallback(() => {
    if (consent && getUserCookieConsentRequests.length > 0) {
      console.log('Invoking cookie consent callbacks...')
      const tmp = getUserCookieConsentRequests
      getUserCookieConsentRequests = []
      tmp.forEach(cb => cb(consent as CookieConsent))
    }
  }, [consent])

  // load initial data (we do this in an effect so that we avoid server/client hydration mismatches)
  useEffect(() => {
    const c = window.localStorage.getItem('cookieConsent') as CookieConsent
    setConsent(c)
    setAskedForConsent(!!c)
    setShowConsentDialog(!c && getUserCookieConsentRequests.length > 0)
  }, [])

  // handle consent requests when consent changes
  useEffect(() => {
    handleConsentRequests()
  }, [handleConsentRequests])

  // listen for window messages to trigger consent dialog
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data.type === 'cookieConsent') {
        handleConsentRequests()
        askUserForConsentUnlessAlreadyAnswered()
      }
    }

    window.addEventListener('message', onMessage)
    eventListenerReady = true

    return () => {
      window.removeEventListener('message', onMessage)
      eventListenerReady = false
    }
  }, [handleConsentRequests, askUserForConsentUnlessAlreadyAnswered])

  return (
    <CookieConsentContext.Provider
      value={{
        askedForConsent,
        showConsentDialog,
        consent,
        setConsentAnswer,
        askUserForConsentUnlessAlreadyAnswered,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export const CookieConsentConsumer = CookieConsentContext.Consumer

export const useCookieConsentContext = () => {
  return useContext(CookieConsentContext)
}

export const getUserCookieConsent = (cb: CookieConsentCallback) => {
  getUserCookieConsentRequests.push(cb)

  if (eventListenerReady) {
    window.postMessage({ type: 'cookieConsent' }, '*')
  }
}

