import { createSlice } from '@reduxjs/toolkit'
import { WalletType } from '../../constants/wallet'

interface IInit {
  ordinalsAddress: string
  paymentAddress: string
  publicKey: string
  accessToken: string
  walletType?: WalletType
}

const initialState: IInit = {
  ordinalsAddress: '',
  paymentAddress: '',
  publicKey: '',
  accessToken: ''
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      return { ...state, ...action.payload }
    },
    logOut: () => {
      return initialState
    }
  }
})

export const { setAuth, logOut } = authSlice.actions
export default authSlice.reducer
