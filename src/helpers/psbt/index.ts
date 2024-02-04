import * as btc from 'bitcoinjs-lib'
import { IFeeEstimationParams, IGetInputPsbt, IGetWitnessUtxo } from './type'
import { UTXO } from '@/services/utxos/type'
import { BitcoinNetworkType } from 'sats-connect'
import { ICreatePsbt } from './type'
import { getRecommendFee, getUTXODetails } from '@/services/utxos'

export const estimateTxFee = ({
  numIns,
  numOuts,
  feeRatePerByte,
  useSegWit = false
}: IFeeEstimationParams) => {
  const txOverhead = 10 // Basic transaction overhead in bytes
  const inputSize = useSegWit ? 103 : 148 // Average size of a SegWit input is smaller
  const outputSize = 34 // Average size of an output

  // Calculate the estimated transaction size
  const estimatedTxSize = txOverhead + inputSize * numIns + outputSize * numOuts

  // Calculate the fee based on the estimated transaction size
  const fee = estimatedTxSize * feeRatePerByte
  return fee
}

export const calculateTotalUnspent = (utxos: UTXO[]) => {
  return utxos.reduce((total, utxo) => total + utxo.value, 0)
}

export const getWitnessUtxo = (vout: IGetWitnessUtxo) => {
  return {
    script: Buffer.from(vout.scriptpubkey, 'hex'),
    value: vout.value
  }
}

export const getInputPsbt = ({
  payment,
  utxoDetails,
  unspent,
  isSegwit = true,
  redeemType = 'noredeem'
}: IGetInputPsbt) => {
  // for non segwit inputs, you must pass the full transaction buffer

  const nonWitnessUtxo = utxoDetails.txid
  // for segwit inputs, you only need the output script and value as an object.
  const witnessUtxo = getWitnessUtxo(utxoDetails.vout[unspent.vout])
  const mixin = isSegwit ? { witnessUtxo } : { nonWitnessUtxo }
  const mixin2: any = {}
  switch (redeemType) {
    case 'p2sh':
      mixin2.redeemScript = payment.redeem.output
      break
    case 'p2wsh':
      mixin2.witnessScript = payment.redeem.output
      break
    case 'p2sh-p2wsh':
      mixin2.witnessScript = payment.redeem.redeem.output
      mixin2.redeemScript = payment.redeem.output
      break
  }

  return {
    hash: unspent.txid,
    index: unspent.vout,
    ...mixin,
    ...mixin2
  }
}

export const bytesToBase64 = (bytes: number[]) => {
  const binString = String.fromCodePoint(...bytes)
  return btoa(binString)
}

interface IFinalizePsbt {
  data: any
  type: 'hex' | 'base64' | 'buffer'
  networkType: BitcoinNetworkType
  isFinalized?: boolean
}

export const finalizePsbt = ({ data, type, networkType, isFinalized = false }: IFinalizePsbt) => {
  const network =
    networkType === BitcoinNetworkType.Testnet ? btc.networks.testnet : btc.networks.bitcoin
  // Parse the PSBT
  let psbt

  if (type === 'base64') {
    psbt = btc.Psbt.fromBase64(data, { network })
  } else if (type === 'buffer') {
    psbt = btc.Psbt.fromBuffer(data, { network })
  } else {
    psbt = btc.Psbt.fromHex(data, { network })
  }

  // Finalize all inputs (assuming they are all ready to be finalized)
  if (!isFinalized) psbt.finalizeAllInputs()
  // Extract the transaction
  const finalTx = psbt.extractTransaction().toHex()
  return finalTx
}

interface IGetAddressTypeResult {
  network: 'Mainnet' | 'Testnet'
  addressType: 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2wsh' | 'p2tr' | 'Unknown'
}

export const getAddressType = (address: string): IGetAddressTypeResult | undefined => {
  try {
    const decoded = btc.address.fromBase58Check(address)
    const network =
      decoded.version === btc.networks.bitcoin.pubKeyHash ||
      decoded.version === btc.networks.bitcoin.scriptHash
        ? 'Mainnet'
        : 'Testnet'
    const isP2PKH =
      decoded.version === btc.networks.bitcoin.pubKeyHash ||
      decoded.version === btc.networks.testnet.pubKeyHash

    const isP2SH =
      decoded.version === btc.networks.bitcoin.scriptHash ||
      decoded.version === btc.networks.testnet.scriptHash
    const addressType: any = isP2PKH ? 'p2pkh' : isP2SH ? 'p2sh' : 'Unknown'

    return { network, addressType }
  } catch (e) {
    try {
      const decoded = btc.address.fromBech32(address)
      const network = decoded.prefix === 'bc' ? 'Mainnet' : 'Testnet'
      const addressType: any =
        decoded.version === 0
          ? decoded.data.length === 20
            ? 'p2wpkh'
            : 'p2wsh'
          : decoded.version === 1
          ? 'p2tr'
          : 'Unknown'

      return { network, addressType }
    } catch (e) {
      console.log('[PSBT-error] getAddressType', e)
    }
  }
}

export const createPsbt = async ({
  utxos,
  networkType,
  currentWallet,
  recipients
}: ICreatePsbt) => {
  const numIns = utxos.length
  const numOPReturn = 1
  const numOuts = recipients.length + numOPReturn

  if (numIns === 0) {
    throw new Error('No UTXOs available for payment')
  }

  const totalUnspent = calculateTotalUnspent(utxos)
  const network =
    networkType === BitcoinNetworkType.Testnet ? btc.networks.testnet : btc.networks.bitcoin

  const { addressType } = getAddressType(currentWallet.address) || {}
  if (!addressType || addressType === 'Unknown') {
    return
  }

  let payment: any

  if (['p2sh', 'p2wsh'].includes(addressType)) {
    const redeem = btc.payments.p2wpkh({
      pubkey: Buffer.from(currentWallet.publicKey, 'hex'),
      network
    })
    payment = btc.payments[addressType]({
      redeem,
      network
    })
  } else {
    payment = btc.payments[addressType]({
      pubkey: Buffer.from(currentWallet.publicKey, 'hex'),
      network
    })
  }

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
    useSegWit: !['p2sh', 'p2pkh', 'p2tr'].includes(addressType)
  })

  const totalSendAmount = recipients.reduce((total, i) => total + i.value, 0)
  const change = totalUnspent - totalSendAmount - fee

  if (change < 0) {
    throw new Error('Not enough coin')
  }

  const callUtxo = utxos.map((i) => getUTXODetails(networkType, i.txid))
  const utxoDetails = await Promise.all(callUtxo)

  // Iterating over each UTXO
  utxos.forEach((utxo, index) => {
    // Get UTXO details
    const input = getInputPsbt({
      utxoDetails: utxoDetails[index],
      payment,
      unspent: utxo,
      redeemType: addressType
    })

    // Add each UTXO as an input to the transaction
    tx.addInput(input)
  })

  for (const output of recipients) {
    tx.addOutput({
      address: output.address,
      value: output.value
    })
  }

  const data = Buffer.from('RuneAlpha', 'utf8')
  const embed = btc.payments.embed({ data: [data] })

  tx.addOutput({
    script: embed.output!,
    value: 0
  })

  tx.addOutput({
    address: currentWallet.address,
    value: change
  })

  return tx.toHex()
}
