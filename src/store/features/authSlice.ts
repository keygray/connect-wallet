import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  ordinalsAddress: '',
  paymentAddress: '',
  accessToken: ''
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      return action.payload
    },
    logOut: () => {
      return initialState
    }
  }
})

export const { setAuth, logOut } = authSlice.actions
export default authSlice.reducer
