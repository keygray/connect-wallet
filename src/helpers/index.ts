import { BitcoinNetworkType } from 'sats-connect'
import { UTXO } from '../services/utxos/type'
import * as btc from 'bitcoinjs-lib'
import { getUTXODetails } from '../services/utxos'

export const createPSBT = async (
  networkType: BitcoinNetworkType,
  paymentUnspentOutputs: UTXO[],
  recipient1: string,
  amount: number
) => {
  if (paymentUnspentOutputs.length === 0) {
    throw new Error('No UTXOs available for payment')
  }

  const network =
    networkType === BitcoinNetworkType.Testnet ? btc.networks.testnet : btc.networks.bitcoin

  // choose first unspent output
  const paymentOutput = paymentUnspentOutputs[0]

  const tx = new btc.Psbt({
    network
  })

  // set transfer amount and calculate change
  const fee = 300 // set the miner fee amount
  const recipientAmount = Math.min(paymentOutput.value, 3000) - fee
  const total = recipientAmount - amount

  if (total < 0) {
    throw new Error('Not enough coin')
  }

  const utxoDetails = await getUTXODetails(BitcoinNetworkType.Testnet, paymentOutput.txid)
  const output = utxoDetails.vout[0]

  // payment input
  tx.addInput({
    hash: paymentOutput?.txid,
    index: paymentOutput?.vout,
    witnessUtxo: {
      script: Buffer.from(output.scriptpubkey, 'hex'),
      value: paymentOutput.value
    }
  })

  tx.addOutput({
    address: recipient1,
    value: amount
  })

  return tx.toBase64()
}

export const bytesToBase64 = (bytes: any) => {
  const binString = String.fromCodePoint(...bytes)
  return btoa(binString)
}
