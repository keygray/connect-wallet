'use client'
import { Button, notification } from 'antd'
import React from 'react'
import { useXVerse } from '@/hooks/useXVerse'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logOut } from '@/store/features/authSlice'
import { useLeather } from '@/hooks/useLeather'
import { useUnisat } from '@/hooks/useUnisat'
import { createPSBT } from '@/helpers'
import { BitcoinNetworkType } from 'sats-connect'
import { getUTXOs } from '../services/utxos'
import SignPsbtCard from '../components/SignPSBTCard'
import Paragraph from 'antd/es/typography/Paragraph'
import PushPsbtCard from '../components/PushPsbtCard'

export default function App() {
  const [api, contextHolder] = notification.useNotification()
  const showError = () => {
    api['error']({
      message: 'Error',
      description: 'Request cancel'
    })
  }

  /** Wallet */
  const XVerseWallet = useXVerse({
    onError: showError
  })
  const LeatherWallet = useLeather({
    onError: showError
  })
  const UnisatWallet = useUnisat({
    onError: showError
  })

  /** Store */
  const dispath = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  /** Event */
  const handleLogOut = React.useCallback(() => {
    dispath(logOut())
  }, [dispath])

  const wallets = React.useMemo(
    () => [
      {
        title: 'Connect XVerse',
        onClick: XVerseWallet.connect
      },
      {
        title: 'Connect Leather',
        onClick: LeatherWallet.connect
      },
      {
        title: 'Connect Unisat',
        onClick: UnisatWallet.connect
      }
    ],
    []
  )

  const [psbt, setPsbt] = React.useState<string>()

  const handleCreatePsbt = async () => {
    try {
      const toAddress = 'tb1q7h6h4d8akfcm42zvs99f5nym650c8twjzrh5a2'
      const paymentUnspentOutputs = await getUTXOs(BitcoinNetworkType.Testnet, auth.paymentAddress)
      const psbtBase64 = await createPSBT(
        BitcoinNetworkType.Testnet,
        paymentUnspentOutputs,
        toAddress,
        1000
      )

      setPsbt(psbtBase64)
    } catch {}
  }

  if (auth.accessToken) {
    return (
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
    )
  }

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-center gap-4 h-screen w-full">
        <h1>Wallet Connect with Stacks</h1>
        <div className="flex flex-col gap-4">
          {wallets.map((i) => (
            <Button key={i.title} type="primary" className="bg-neutral-900" onClick={i.onClick}>
              {i.title}
            </Button>
          ))}
        </div>
      </div>
    </>
  )
}
