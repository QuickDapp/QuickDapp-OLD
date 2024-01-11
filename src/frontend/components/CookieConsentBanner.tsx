"use client"

import { FC } from "react"
import { CookieConsent, useCookieConsentContext } from "../contexts"
import { Button } from "./Button"

export const CookieConsentBanner: FC<{}> = ({}) => {
  const cookieConsent = useCookieConsentContext()

  return (
    <div className="fixed bottom-0 left-0 right-0">
      {cookieConsent.showConsentDialog ? (
        <div className="bg-slate-500 text-white flex flex-row p-4 justify-center items-center">
          <div>We use cookies to enhance the obtain analytics and enbance your user experience. Are you ok with this?</div>
          <Button className="ml-4" size='xs' onClick={() => cookieConsent.setConsentAnswer(CookieConsent.Yes)}>Yes</Button>
          <Button className="ml-2" size='xs' onClick={() => cookieConsent.setConsentAnswer(CookieConsent.No)}>No</Button>
        </div>
      ) : null}
    </div>
  )
}



