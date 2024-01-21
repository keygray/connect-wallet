import { ISignIn } from '@/services/auth/type'
import { Auth } from '@/services/auth'
import { useAppDispatch } from '@/store/hooks'
import { setAuth } from '@/store/features/authSlice'
import { WalletType } from '@/constants/wallet'
import { notification } from 'antd'

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
  onError: () => void
}

export const useLeather = ({ onError }: IParams) => {
  const dispatch = useAppDispatch()

  const signAppMsg = async (addresses: IAddress[]) => {
    const paymentAddr = addresses?.find((i) => i.type === TypeAddress.Payment)
    const ordinalsAddr = addresses?.find((i) => i.type === TypeAddress.Ordinals)

    if (!paymentAddr?.address) return

    try {
      const response = await (window as any).btc.request('signMessage', {
        message: 'RuneAlpha',
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
      const res = await Auth.signIn(req)

      dispatch(
        setAuth({
          ordinalsAddress: ordinalsAddr?.address,
          paymentAddress: paymentAddr?.address,
          accessToken: res?.data?.accessToken
        })
      )
    } catch {
      onError()
    }
  }

  const connect = async () => {
    try {
      const userAddresses = await (window as any).btc?.request('getAddresses')
      signAppMsg(userAddresses.result.addresses)
    } catch {
      onError()
    }
  }

  return {
    connect
  }
}
