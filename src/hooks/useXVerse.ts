import {
  Address,
  AddressPurpose,
  BitcoinNetworkType,
  GetAddressOptions,
  SignMessageOptions,
  SignTransactionOptions,
  getAddress,
  signMessage,
  signTransaction
} from 'sats-connect'
import { ISignIn } from '@/services/auth/type'
import { WalletType, signMsg } from '@/constants/wallet'
import { useAuth } from './useAuth'
import React from 'react'
import { finalizePsbt } from '../helpers'
import { useAppSelector } from '../store/hooks'

interface IParams {
  onError: (err: any) => void
}

export const useXVerse = ({ onError }: IParams) => {
  const auth = useAuth()
  const authStore = useAppSelector((state) => state.auth)

  const isInstalled = React.useMemo(() => !!(window as any).XverseProviders, [])

  const signAppMsg = async (addresses: Address[]) => {
    const paymentAddr = addresses.find((i) => i.purpose === AddressPurpose.Payment)
    const ordinalsAddr = addresses.find((i) => i.purpose === AddressPurpose.Ordinals)

    if (!paymentAddr?.address) return

    const signMessageOptions: SignMessageOptions = {
      payload: {
        network: {
          type: BitcoinNetworkType.Testnet
        },
        address: paymentAddr.address,
        message: signMsg
      },
      onFinish: async (signature) => {
        const req: ISignIn = {
          walletAddress: paymentAddr.address,
          publicKey: paymentAddr.publicKey,
          signature,
          walletType: WalletType.XVERSE
        }

        // signin
        auth.signIn(req, {
          ordinalsAddress: ordinalsAddr?.address
        })
      },
      onCancel: () => onError('Request cancel')
    }

    await signMessage(signMessageOptions)
  }

  const connect = async () => {
    const getAddressOptions: GetAddressOptions = {
      payload: {
        purposes: [AddressPurpose.Ordinals, AddressPurpose.Payment],
        message: 'Address for receiving Ordinals and payments',
        network: {
          type: BitcoinNetworkType.Testnet
        }
      },
      onFinish: (response) => {
        const addresses = response.addresses
        signAppMsg(addresses)
      },
      onCancel: () => onError('Request cancel')
    }

    await getAddress(getAddressOptions)
  }

  function hexToBase64Node(hexString: any) {
    return Buffer.from(hexString, 'hex').toString('base64')
  }

  const pushPsbt =
    (hex: string) => async (cb: (finalTx: string) => void, signingIndexes: number[]) => {
      try {
        const signPsbtOptions: SignTransactionOptions = {
          payload: {
            network: {
              type: BitcoinNetworkType.Testnet
            },
            psbtBase64: hexToBase64Node(hex),
            broadcast: false,
            inputsToSign: [
              {
                address: authStore.paymentAddress,
                signingIndexes
              }
            ],
            message: ''
          },
          onFinish: (response) => {
            const finalTx = finalizePsbt({
              data: response.psbtBase64,
              type: 'base64',
              networkType: BitcoinNetworkType.Testnet
            })
            cb(finalTx)
          },
          onCancel: () => alert('Canceled')
        }

        await signTransaction(signPsbtOptions)
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
