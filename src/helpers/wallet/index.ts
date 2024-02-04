import { WalletType, extensionWalletUrls } from '@/constants/wallet'

/** Events */
export const openUrlNewTab = (wallet: WalletType) => {
  const url = extensionWalletUrls[wallet]
  window.open(url, '_blank')
}
