import React from 'react'
import { useLeather, useOKX, usePhantom, useUnisat, useXVerse } from '@/hooks'
import { Button } from 'antd'
import { NotificationInstance } from 'antd/es/notification/interface'
import { isString } from 'antd/es/button'
import { WalletType, extensionWalletUrls } from '../constants/wallet'

interface IProps {
  onError: (err: string) => void
}

export const Wallets = ({ onError }: IProps) => {
  /** Wallet Events */
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

  /** Events */
  const openUrlNewTab = (wallet: WalletType) => {
    const url = extensionWalletUrls[wallet]
    window.open(url, '_blank')
  }

  /** Config */
  const wallets = React.useMemo(
    () => [
      {
        title: 'XVerse',
        onConnect: XVerseWallet.connect,
        isInstalled: XVerseWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.XVERSE)
      },
      {
        title: 'Leather',
        onConnect: LeatherWallet.connect,
        isInstalled: LeatherWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.LEATHER)
      },
      {
        title: 'Unisat',
        onConnect: UnisatWallet.connect,
        isInstalled: UnisatWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.UNISAT)
      },
      {
        title: 'Phantom (BTC)',
        onConnect: PhantomWallet.connect,
        isInstalled: PhantomWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.PHANTOM)
      },
      {
        title: 'OKX',
        onConnect: OkxWallet.connect,
        isInstalled: OkxWallet.isInstalled,
        openExtensionUrl: () => openUrlNewTab(WalletType.OKX)
      }
    ],
    []
  )

  return (
    <div className="flex items-center justify-center gap-4 h-screen w-full">
      <h1>Wallet Connect with Stacks</h1>
      <div className="flex flex-col gap-4">
        {wallets.map((i) => (
          <Button
            key={i.title}
            type="primary"
            className="bg-neutral-900"
            onClick={i.isInstalled ? i.onConnect : i.openExtensionUrl}
          >
            {i.isInstalled ? 'Connect' : 'Install'} {i.title}
          </Button>
        ))}
      </div>
    </div>
  )
}
