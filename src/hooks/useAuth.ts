import { Auth } from '@/services/auth'
import { setAuth } from '@/store/features/authSlice'
import { ISignIn } from '@/services/auth/type'
import { useAppDispatch } from '@/store/hooks'

interface IOptions {
  ordinalsAddress?: string
}

export const useAuth = () => {
  const dispatch = useAppDispatch()

  const signIn = async (req: ISignIn, { ordinalsAddress = '' }: IOptions) => {
    // signin
    const res = await Auth.signIn(req)

    dispatch(
      setAuth({
        ordinalsAddress,
        paymentAddress: req.walletAddress,
        accessToken: res?.data?.accessToken
      })
    )
  }

  return {
    signIn
  }
}
