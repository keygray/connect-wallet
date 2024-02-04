'use client'
import { Button, Form, notification } from 'antd'
import React from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { logOut } from '@/store/features/authSlice'
import { createPsbt, openUrlNewTab } from '@/helpers'
import { BitcoinNetworkType } from 'sats-connect'
import { useLeather, useOKX, usePhantom, useUnisat, useXVerse } from '@/hooks'
import { Wallets } from '@/components/Wallets'
import { isString } from 'antd/es/button'
import BroadcastCard from '@/components/BroadcastCard'
import { WalletType } from '@/constants/wallet'
import { getUTXOs, pushPsbt } from '@/services/utxos/index'

interface IBroadCastPsbt {
  address: string
  value: number
}

export default function App() {
  const [api, contextHolder] = notification.useNotification()
  const [broadcastForm] = Form.useForm()

  /** Store */
  const dispath = useAppDispatch()
  const authStore = useAppSelector((state) => state.auth)
  const [txId, setTxId] = React.useState('')

  /** Event */
  const onError = (err: any) => {
    api['error']({
      message: 'Error',
      description: isString(err?.message) ? err?.message : 'Request cancel'
    })
  }

  const onPushPsbtSuccess = (txId: string) => {
    broadcastForm.resetFields()
    api['success']({
      message: 'Success',
      description: 'Push psbt successs'
    })
    setTxId(txId)
  }

  const handleLogOut = React.useCallback(() => {
    dispath(logOut())
  }, [dispath])

  /** Wallet Config */
  const XVerseWallet = useXVerse({
    onError
  })
  const LeatherWallet = useLeather({
    onError
  })
  const UnisatWallet = useUnisat({
    onError
  })
  const PhantomWallet = usePhantom({
    onError
  })
  const OkxWallet = useOKX({
    onError
  })

  const walletConfig = React.useMemo(
    () => ({
      XVERSE: {
        title: 'XVerse',
        onConnect: XVerseWallet.connect,
        isInstalled: XVerseWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.XVERSE),
        push: XVerseWallet.pushPsbt
      },
      LEATHER: {
        title: 'Leather',
        onConnect: LeatherWallet.connect,
        isInstalled: LeatherWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.LEATHER),
        push: LeatherWallet.pushPsbt
      },
      UNISAT: {
        title: 'Unisat',
        onConnect: UnisatWallet.connect,
        isInstalled: UnisatWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.UNISAT),
        push: UnisatWallet.pushPsbt
      },
      PHANTOM: {
        title: 'Phantom (BTC)',
        onConnect: PhantomWallet.connect,
        isInstalled: PhantomWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.PHANTOM),
        push: () => {}
      },
      OKX: {
        title: 'OKX',
        onConnect: OkxWallet.connect,
        isInstalled: OkxWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.OKX),
        push: OkxWallet.pushPsbt
      }
    }),
    [authStore]
  )

  const push = async (signedHex: string) => {
    const txId = await pushPsbt(BitcoinNetworkType.Testnet, signedHex)
    onPushPsbtSuccess(txId)
  }

  const broadCastPsbt = async ({ address, value }: IBroadCastPsbt) => {
    try {
      const utxos = await getUTXOs(BitcoinNetworkType.Testnet, authStore.paymentAddress)

      const psbtHex = await createPsbt({
        networkType: BitcoinNetworkType.Testnet,
        currentWallet: {
          publicKey: authStore.publicKey,
          address: authStore.paymentAddress
        },
        recipients: [
          {
            address,
            value
          }
        ],
        utxos
      })

      if (!authStore.walletType || !psbtHex) return

      const result = await walletConfig[authStore.walletType].push(psbtHex)
      if (!result) return

      if (typeof result === 'string') {
        push(result)
        return
      }

      if (authStore.walletType === WalletType.XVERSE) {
        result(
          push,
          utxos.map((_, index) => index)
        )
        return
      }
    } catch (err) {
      onError(err)
    }
  }

  if (!authStore.accessToken) {
    return (
      <>
        {contextHolder}
        <Wallets config={Object.values(walletConfig)} />
      </>
    )
  }

  return (
    <>
      {contextHolder}
      <div className="flex items-center justify-center flex-col gap-4 h-screen w-full">
        <div className="flex justify-center flex-col gap-4">
          {authStore.ordinalsAddress && (
            <div>
              <h1 className="text-lime-400">Ordinals</h1>
              <span>{authStore.ordinalsAddress}</span>
            </div>
          )}
          <div>
            <h1 className="text-lime-500">Payment</h1>
            <span>{authStore.paymentAddress}</span>
          </div>
        </div>

        <BroadcastCard
          onFinish={broadCastPsbt}
          onFailed={onError}
          txId={txId}
          form={broadcastForm}
        />

        <Button type="primary" className="bg-neutral-900" onClick={handleLogOut}>
          Disconnect
        </Button>
      </div>
    </>
  )
}
