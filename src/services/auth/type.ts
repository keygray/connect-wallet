import { WalletType } from '@/constants/wallet'

export interface ISignIn {
  walletAddress: string
  publicKey: string
  signature: string
  walletType: WalletType
}
