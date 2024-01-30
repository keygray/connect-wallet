import { BitcoinNetworkType } from 'sats-connect'
import { UTXO } from '../services/utxos/type'
import * as btc from 'bitcoinjs-lib'
import { getRecommendFee, getUTXODetails } from '../services/utxos'

type IFeeEstimationParams = {
  numIns: number
  numOuts: number
  feeRatePerByte: number
  useSegWit?: boolean
}

const calculateTotalUnspent = (utxos: UTXO[]) => {
  return utxos.reduce((total, utxo) => total + utxo.value, 0)
}

const estimateTxFee = ({
  numIns,
  numOuts,
  feeRatePerByte,
  useSegWit = false
}: IFeeEstimationParams): number => {
  const txOverhead = 10 // Basic transaction overhead in bytes
  const inputSize = useSegWit ? 103 : 148 // Average size of a SegWit input is smaller
  const outputSize = 34 // Average size of an output

  // Calculate the estimated transaction size
  const estimatedTxSize = txOverhead + inputSize * numIns + outputSize * numOuts

  // Calculate the fee based on the estimated transaction size
  const fee = estimatedTxSize * feeRatePerByte
  return fee
}

export const createPSBT = async (
  networkType: BitcoinNetworkType,
  paymentUnspentOutputs: UTXO[],
  recipient1: string,
  paymentAddress: string,
  amount: number
) => {
  const numIns = paymentUnspentOutputs.length
  const numOuts = 2
  if (numIns === 0) {
    throw new Error('No UTXOs available for payment')
  }

  const totalUnspent = calculateTotalUnspent(paymentUnspentOutputs)
  const network =
    networkType === BitcoinNetworkType.Testnet ? btc.networks.testnet : btc.networks.bitcoin

  // choose first unspent output

  const tx = new btc.Psbt({
    network
  })

  const { fastestFee } = await getRecommendFee(networkType)
  // set transfer amount and calculate change
  const fee = estimateTxFee({
    numIns,
    numOuts,
    feeRatePerByte: fastestFee,
    useSegWit: true
  })

  const change = totalUnspent - amount - fee

  if (change < 0) {
    throw new Error('Not enough coin')
  }

  // Iterating over each UTXO
  for (const utxo of paymentUnspentOutputs) {
    // Get UTXO details
    const utxoDetails = await getUTXODetails(networkType, utxo.txid)
    const output = utxoDetails.vout[utxo.vout]

    // Add each UTXO as an input to the transaction
    tx.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: Buffer.from(output.scriptpubkey, 'hex'),
        value: output.value
      }
    })
  }

  tx.addOutput({
    address: recipient1,
    value: amount
  })

  const data = Buffer.from('RuneAlpha', 'utf8')
  const embed = btc.payments.embed({ data: [data] })

  tx.addOutput({
    script: embed.output!,
    value: 0
  })

  tx.addOutput({
    address: paymentAddress,
    value: change
  })

  return tx.toHex()
}

export const bytesToBase64 = (bytes: any) => {
  const binString = String.fromCodePoint(...bytes)
  return btoa(binString)
}
