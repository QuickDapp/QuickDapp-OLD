import { CreateTokenDialog } from "@/frontend/components/CreateTokenDialog"
import { IfWalletConnected } from "@/frontend/components/IfWalletConnected"
import { NumTokens } from "@/frontend/components/NumTokens"
import { TokenList } from "@/frontend/components/TokenList"

const HomePage = async () => {  
  return (
    <div className="p-4">
      <IfWalletConnected>
        <div className="flex flex-row justify-start items-center">
          <NumTokens className="mr-4" />
          <CreateTokenDialog />
        </div>
        <div className="mt-4">
          <TokenList />
        </div>
      </IfWalletConnected>
    </div>
  )
}

export default HomePage
