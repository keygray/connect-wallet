import axios, { AxiosError } from 'axios'
import { GetServerSidePropsContext } from 'next'
import Router from 'next/router'
import { store } from '../store'
import { setAuth } from '../store/features/authSlice'

const isServer = () => {
  return typeof window === 'undefined'
}

let accessToken = store.getState().auth.accessToken
let context = <GetServerSidePropsContext>{}
const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL!

export const setAccessToken = (_accessToken: string) => {
  accessToken = _accessToken
  store.dispatch(setAuth({ accessToken }))
}

export const getAccessToken = () => accessToken || store.getState().auth.accessToken

export const setContext = (_context: GetServerSidePropsContext) => {
  context = _context
}

export const http = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  if (isServer() && context?.req?.cookies) {
    config.headers.Cookie = `gid=${context.req.cookies.gid};`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    // check conditions to refresh token
    if (
      error.response?.status === 401 &&
      !error.response?.config?.url?.includes('auth/refresh') &&
      !error.response?.config?.url?.includes('signin')
    ) {
      return refreshToken(error)
    }
    return Promise.reject(error)
  }
)

let fetchingToken = false
let subscribers: ((token: string) => any)[] = []

const onAccessTokenFetched = (token: string) => {
  subscribers.forEach((callback) => callback(token))
  subscribers = []
}

const addSubscriber = (callback: (token: string) => any) => {
  subscribers.push(callback)
}

const refreshToken = async (oError: AxiosError) => {
  try {
    const { response } = oError

    // create new Promise to retry original request
    const retryOriginalRequest = new Promise((resolve) => {
      addSubscriber((token: string) => {
        response!.config.headers['Authorization'] = `Bearer ${token}`
        resolve(axios(response!.config))
      })
    })

    // check whether refreshing token or not
    if (!fetchingToken) {
      fetchingToken = true

      // refresh token
      const { data } = await http.post('/auth/refresh')
      // check if this is server or not. We don't wanna save response token on server.
      if (!isServer) {
        setAccessToken(data.accessToken)
      }
      // when new token arrives, retry old requests
      onAccessTokenFetched(data.accessToken)
    }
    return retryOriginalRequest
  } catch (error) {
    // on error go to login page
    if (!isServer() && !Router.asPath.includes('/login')) {
      Router.push('/login')
    }
    if (isServer()) {
      context.res.setHeader('location', '/login')
      context.res.statusCode = 302
      context.res.end()
    }
    return Promise.reject(oError)
  } finally {
    fetchingToken = false
  }
}
