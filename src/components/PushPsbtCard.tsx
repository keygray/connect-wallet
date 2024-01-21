import { Button, Card, Input } from 'antd'
import React from 'react'

const PushPsbtCard = () => {
  const [rawtx, setRawtx] = React.useState('')
  const [txid, setTxid] = React.useState('')

  return (
    <Card size="small" title="Push Transaction Hex" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>rawtx:</div>
        <Input
          defaultValue={rawtx}
          onChange={(e) => {
            setRawtx(e.target.value)
          }}
        ></Input>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>txid:</div>
        <div style={{ wordWrap: 'break-word' }}>{txid}</div>
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const txid = await (window as any).unisat.pushTx(rawtx)
            setTxid(txid)
          } catch (e) {
            setTxid((e as any).message)
          }
        }}
      >
        PushTx
      </Button>
    </Card>
  )
}

export default PushPsbtCard
