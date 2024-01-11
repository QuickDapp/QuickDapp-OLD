import { CreateTokenDialog } from "@/frontend/components/dapp/CreateTokenDialog"
import { IfWalletConnected } from "@/frontend/components/IfWalletConnected"
import { NumTokens } from "@/frontend/components/dapp/NumTokens"
import { TokenList } from "@/frontend/components/dapp/TokenList"

const HomePage = async () => {  
  return (
    <div className="p-4">
      <p className="mb-6">This is the default QuickDapp dapp. It lets you create and transfer ERC-20 tokens.</p>
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
