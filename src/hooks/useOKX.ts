import { ISignIn } from '@/services/auth/type'
import { WalletType, signMsg } from '@/constants/wallet'
import { useAuth } from './useAuth'
import React from 'react'
import { finalizePsbt } from '../helpers'
import { BitcoinNetworkType } from 'sats-connect'

type BtcAccount = {
  address: string
  compressedPublicKey: string
  publicKey: string
}

interface ISignAppMsg {
  account: BtcAccount
  walletProvider: any
}

interface IParams {
  onError: (err: any) => void
}

export const useOKX = ({ onError }: IParams) => {
  const auth = useAuth()

  const isInstalled = React.useMemo(() => !!(window as any).okxwallet, [])

  const signAppMsg = async ({ account, walletProvider }: ISignAppMsg) => {
    if (!account?.address) return

    try {
      const signature = await walletProvider.bitcoin.signMessage(signMsg, 'ecdsa')

      if (!signature) return

      const req: ISignIn = {
        walletAddress: account.address,
        publicKey: account.publicKey,
        signature,
        walletType: WalletType.OKX
      }

      auth.signIn(req, {})
    } catch (err) {
      onError(err)
    }
  }

  const connect = async () => {
    const okxwallet = (window as any).okxwallet
    try {
      const account = await okxwallet.bitcoinTestnet.connect()
      signAppMsg({ account, walletProvider: okxwallet })
    } catch (err) {
      onError(err)
    }
  }

  const pushPsbt = async (hex: string) => {
    try {
      const okxwallet = (window as any).okxwallet
      const signedHex = await okxwallet.bitcoinTestnet.signPsbt(hex)

      const finalTx = finalizePsbt({
        data: signedHex,
        type: 'hex',
        networkType: BitcoinNetworkType.Testnet,
        isFinalized: true
      })

      return finalTx
    } catch (err) {
      console.log(err)
    }
  }

  return {
    connect,
    pushPsbt,
    isInstalled
  }
}
