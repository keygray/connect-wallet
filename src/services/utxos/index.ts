import { BitcoinNetworkType } from 'sats-connect'
import { UTXO } from './type'
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
