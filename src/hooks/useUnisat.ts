import { WalletType, signMsg } from '@/constants/wallet'
import { useAuth } from './useAuth'
import { ISignIn } from '@/services/auth/type'
import React from 'react'
import { finalizePsbt } from '../helpers'
import { BitcoinNetworkType } from 'sats-connect'

interface IParams {
  onError: (err: any) => void
}

export const useUnisat = ({ onError }: IParams) => {
  const auth = useAuth()

  const isInstalled = React.useMemo(() => !!(window as any).unisat, [])

  const connect = async () => {
    try {
      const unisat = (window as any).unisat

      const signature = await unisat.signMessage(signMsg)
      const [walletAddress, publicKey] = await Promise.all([
        unisat.getAccounts(),
        unisat.getPublicKey()
      ])

      const req: ISignIn = {
        walletAddress: walletAddress[0],
        publicKey,
        signature,
        walletType: WalletType.UNISAT
      }

      auth.signIn(req, {})
    } catch (err) {
      onError(err)
    }
  }

  const pushPsbt = async (hex: string) => {
    try {
      const signedHex = await (window as any).unisat.signPsbt(hex)

      const finalTx = finalizePsbt({
        data: signedHex,
        type: 'hex',
        networkType: BitcoinNetworkType.Testnet,
        isFinalized: true
      })

      return finalTx
    } catch (err) {
      onError(err)
    }
  }

  return {
    connect,
    pushPsbt,
    isInstalled
  }
}
