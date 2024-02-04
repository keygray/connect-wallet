import React from 'react'
import { Button } from 'antd'
import { WalletType, extensionWalletUrls } from '../constants/wallet'
import { useAppSelector } from '@/store/hooks'
import BroadCastCard from './BroadcastCard'

interface IWallet {
  title: string
  onConnect: () => void
  isInstalled: boolean
  openExtensionUrl: () => void
}
interface IProps {
  config: IWallet[]
}

export const Wallets = ({ config = [] }: IProps) => {
  return (
    <div className="flex items-center justify-center gap-4 h-screen w-full">
      <h1>Wallet Connect with Stacks</h1>
      <div className="flex flex-col gap-4">
        {config.map((i) => (
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
