import { ISignIn } from '@/services/auth/type'
import { Auth } from '@/services/auth'
import { useAppDispatch } from '@/store/hooks'
import { setAuth } from '@/store/features/authSlice'
import { WalletType } from '@/constants/wallet'

interface IParams {
  onError: () => void
}

export const useUnisat = ({ onError }: IParams) => {
  const dispatch = useAppDispatch()

  const connect = async () => {
    try {
      const unisat = (window as any).unisat

      const signature = await unisat.signMessage('RuneAlpha')
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
      // signin
      const res = await Auth.signIn(req)

      dispatch(
        setAuth({
          ordinalsAddress: '',
          paymentAddress: walletAddress[0],
          accessToken: res?.data?.accessToken
        })
      )
    } catch {
      onError()
    }
  }

  return {
    connect
  }
}
