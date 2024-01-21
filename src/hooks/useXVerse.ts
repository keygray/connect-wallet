import {
  Address,
  AddressPurpose,
  BitcoinNetworkType,
  GetAddressOptions,
  SignMessageOptions,
  getAddress,
  signMessage
} from 'sats-connect'
import { ISignIn } from '@/services/auth/type'
import { Auth } from '@/services/auth'
import { useAppDispatch } from '@/store/hooks'
import { setAuth } from '@/store/features/authSlice'
import { WalletType } from '@/constants/wallet'

interface IParams {
  onError: () => void
}

export const useXVerse = ({ onError }: IParams) => {
  const dispatch = useAppDispatch()

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
        message: 'RuneAlpha'
      },
      onFinish: async (signature) => {
        const req: ISignIn = {
          walletAddress: paymentAddr.address,
          publicKey: paymentAddr.publicKey,
          signature,
          walletType: WalletType.XVERSE
        }
        // signin
        const res = await Auth.signIn(req)

        dispatch(
          setAuth({
            ordinalsAddress: ordinalsAddr?.address,
            paymentAddress: paymentAddr?.address,
            accessToken: res?.data?.accessToken
          })
        )
      },
      onCancel: () => onError()
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
      onCancel: () => onError()
    }

    await getAddress(getAddressOptions)
  }

  return {
    connect
  }
}
