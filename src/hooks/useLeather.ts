import { ISignIn } from '@/services/auth/type'
import { WalletType, signMsg } from '@/constants/wallet'
import { useAuth } from './useAuth'
import React from 'react'

enum TypeAddress {
  Ordinals = 'p2tr',
  Payment = 'p2wpkh'
}

interface IAddress {
  address: string
  derivationPath: string
  publicKey: string
  symbol: 'BTC'
  type: TypeAddress
}

interface IParams {
  onError: (err: any) => void
}

export const useLeather = ({ onError }: IParams) => {
  const auth = useAuth()

  const isInstalled = React.useMemo(() => !!(window as any).btc, [])

  const signAppMsg = async (addresses: IAddress[]) => {
    const paymentAddr = addresses?.find((i) => i.type === TypeAddress.Payment)
    const ordinalsAddr = addresses?.find((i) => i.type === TypeAddress.Ordinals)

    if (!paymentAddr?.address) return

    try {
      const response = await (window as any).btc.request('signMessage', {
        message: signMsg,
        paymentType: TypeAddress.Payment
      })

      if (!response) return

      const req: ISignIn = {
        walletAddress: paymentAddr.address,
        publicKey: paymentAddr.publicKey,
        signature: response.result.signature,
        walletType: WalletType.LEATHER
      }

      // signin
      auth.signIn(req, {
        ordinalsAddress: ordinalsAddr?.address
      })
    } catch (err) {
      onError(err)
    }
  }

  const connect = async () => {
    try {
      const userAddresses = await (window as any).btc?.request('getAddresses')
      signAppMsg(userAddresses.result.addresses)
    } catch (err) {
      onError(err)
    }
  }

  return {
    connect,
    isInstalled
  }
}
