import { BitcoinNetworkType } from 'sats-connect'
import { UTXO } from '@/services/utxos/type'

export interface IFeeEstimationParams {
  numIns: number
  numOuts: number
  feeRatePerByte: number
  useSegWit?: boolean
}

export interface IGetWitnessUtxo {
  scriptpubkey: string
  scriptpubkey_asm: string
  scriptpubkey_type: string
  scriptpubkey_address: string
  value: number
}

export interface IGetInputPsbt {
  payment: any
  utxoDetails: any
  unspent: UTXO
  isSegwit?: boolean
  redeemType?: any
}

interface IWallet {
  address: string
  publicKey: string
}

interface IRecipient {
  address: string
  value: number
}

export interface ICreatePsbt {
  networkType: BitcoinNetworkType
  currentWallet: IWallet
  recipients: IRecipient[]
  utxos: UTXO[]
}
