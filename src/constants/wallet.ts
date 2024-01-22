export enum WalletType {
  LEATHER = 'LEATHER',
  UNISAT = 'UNISAT',
  XVERSE = 'XVERSE',
  PHANTOM = 'PHANTOM',
  OKX = 'OKX'
}

export const extensionWalletUrls: Record<WalletType, string> = {
  LEATHER: 'https://chromewebstore.google.com/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj',
  XVERSE: 'https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg',
  UNISAT: 'https://chromewebstore.google.com/detail/unisat-wallet/ppbibelpcjmhbdihakflkdcoccbgbkpo',
  PHANTOM: 'https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa',
  OKX: 'https://chromewebstore.google.com/detail/v%C3%AD-okx-web3/mcohilncbfahbmgdjkbpemcciiolgcge'
}

export const signMsg = 'RuneAlpha'
