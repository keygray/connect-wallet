import { WalletType, signMsg } from '@/constants/wallet'
import { ISignIn } from '@/services/auth/type'
import { useAuth } from './useAuth'
import { bytesToBase64 } from '../helpers'
import React from 'react'

type BtcAccount = {
  address: string
  addressType: 'p2tr' | 'p2wpkh' | 'p2sh' | 'p2pkh'
  publicKey: string
  purpose: 'payment' | 'ordinals'
}

interface ISignAppMsg {
  accounts: BtcAccount[]
  phantomProvider: any
}

interface IParams {
  onError: (err: any) => void
}

export const usePhantom = ({ onError }: IParams) => {
  const auth = useAuth()

  const isInstalled = React.useMemo(() => {
    const anyWindow: any = window
    const provider = anyWindow.phantom?.bitcoin

    return provider?.isPhantom
  }, [])

  const signAppMsg = async ({ accounts, phantomProvider }: ISignAppMsg) => {
    const paymentAddr = accounts?.find((i) => i.purpose === 'payment')
    const ordinalsAddr = accounts?.find((i) => i.purpose === 'ordinals')

    if (!paymentAddr?.address) return

    try {
      const message = new TextEncoder().encode(signMsg)
      const address = paymentAddr.address
      const { signature } = await phantomProvider.signMessage(address, message)
      if (!signature) return

      const req: ISignIn = {
        walletAddress: paymentAddr.address,
        publicKey: paymentAddr.publicKey,
        signature: bytesToBase64(signature),
        walletType: WalletType.PHANTOM
      }

      auth.signIn(req, { ordinalsAddress: ordinalsAddr?.address })
    } catch (err) {
      onError(err)
    }
  }

  const getProvider = () => {
    if (!('phantom' in window)) return
    const anyWindow: any = window
    const provider = anyWindow.phantom?.bitcoin

    if (provider && provider.isPhantom) {
      return provider
    }
  }

  const connect = async () => {
    const phantomProvider = getProvider() // see "Detecting the Provider"

    try {
      if (!phantomProvider) {
        throw new Error('Not exist Phantom Provider')
      }
      const accounts: BtcAccount[] = await phantomProvider.requestAccounts()
      signAppMsg({ phantomProvider, accounts })
    } catch (err) {
      onError(err)
    }
  }

  return {
    connect,
    isInstalled
  }
}
