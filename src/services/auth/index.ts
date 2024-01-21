import { http } from '@/http'
import { ISignIn } from './type'

const signIn = async (payload: ISignIn) => {
  const res = await http.post('/auth/signin', payload)
  return res
}

export const Auth = {
  signIn
}
