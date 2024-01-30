'use client'
import { Button, notification } from 'antd'
import React from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logOut } from '@/store/features/authSlice'
import { createPSBT } from '@/helpers'
import { BitcoinNetworkType } from 'sats-connect'
import { getUTXOs } from '@/services/utxos'
import PushPsbtCard from '@/components/PushPsbtCard'
import SignPsbtCard from '@/components/SignPsbtCard'
import Paragraph from 'antd/es/typography/Paragraph'
import { Wallets } from '../components/Wallets'
import { isString } from 'antd/es/button'

export default function App() {
  const [api, contextHolder] = notification.useNotification()

  /** Store */
  const dispath = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)
  const [psbt, setPsbt] = React.useState<string>()

  /** Event */
  const showError = (err: any) => {
    api['error']({
      message: 'Error',
      description: isString(err?.message) ? err?.message : 'Request cancel'
    })
  }

  const handleLogOut = React.useCallback(() => {
    dispath(logOut())
  }, [dispath])

  const handleCreatePsbt = async () => {
    try {
      const toAddress = 'tb1q7h6h4d8akfcm42zvs99f5nym650c8twjzrh5a2'
      const paymentUnspentOutputs = await getUTXOs(BitcoinNetworkType.Testnet, auth.paymentAddress)
      const psbtBase64 = await createPSBT(
        BitcoinNetworkType.Testnet,
        paymentUnspentOutputs,
        toAddress,
        auth.paymentAddress,
        302
      )

      setPsbt(psbtBase64)
    } catch (err) {
      showError(err)
    }
  }

  if (!auth.accessToken) {
    return (
      <>
        {contextHolder}
        <Wallets onError={showError} />
      </>
    )
  }

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-center flex-col gap-4 h-screen w-full">
        <div className="flex justify-center flex-col gap-4">
          {auth.ordinalsAddress && (
            <div>
              <h1 className="text-lime-400">Ordinals</h1>
              <span>{auth.ordinalsAddress}</span>
            </div>
          )}
          <div>
            <h1 className="text-lime-500">Payment</h1>
            <span>{auth.paymentAddress}</span>
          </div>
        </div>
        <Button style={{ marginTop: 10 }} onClick={handleCreatePsbt}>
          Create Psbt
        </Button>
        {psbt && (
          <Paragraph className="w-40" copyable ellipsis>
            {psbt}
          </Paragraph>
        )}

        <SignPsbtCard />
        <PushPsbtCard />
        <Button type="primary" className="bg-neutral-900" onClick={handleLogOut}>
          Disconnect
        </Button>
      </div>
    </>
  )
}
