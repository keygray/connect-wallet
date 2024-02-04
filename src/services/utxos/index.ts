import { BitcoinNetworkType } from 'sats-connect'
import { UTXO } from './type'
import { http } from '@/http'
import axios from 'axios'

export const getUTXOs = async (network: BitcoinNetworkType, address: string): Promise<UTXO[]> => {
  const networkSubpath = network === BitcoinNetworkType.Testnet ? '/testnet' : ''

  const url = `https://mempool.space${networkSubpath}/api/address/${address}/utxo`
  const response = await axios.get(url)

  return response.data
}

export const getUTXODetails = async (network: BitcoinNetworkType, txid: string): Promise<any> => {
  const networkSubpath = network === BitcoinNetworkType.Testnet ? '/testnet' : ''

  const url = `https://mempool.space${networkSubpath}/api/tx/${txid}`
  const response = await axios.get(url)

  return response.data
}

export const getRecommendFee = async (network: BitcoinNetworkType): Promise<any> => {
  const networkSubpath = network === BitcoinNetworkType.Testnet ? '/testnet' : ''
  const url = `https://mempool.space${networkSubpath}/api/v1/fees/recommended`
  const response = await axios.get(url)

  return response.data
}

export const pushPsbt = async (network: BitcoinNetworkType, data: string): Promise<any> => {
  const networkSubpath = network === BitcoinNetworkType.Testnet ? '/testnet' : ''
  const response = await http.post('/psbt/broadcast', { hex: data })

  return response.data
}
