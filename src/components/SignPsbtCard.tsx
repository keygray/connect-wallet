import { Button, Card, Input } from 'antd'
import React from 'react'
import Paragraph from 'antd/es/typography/Paragraph'

const SignPsbtCard = () => {
  const [psbtHex, setPsbtHex] = React.useState('')
  const [psbtResult, setPsbtResult] = React.useState('')
  return (
    <Card size="small" title="Sign Psbt" style={{ width: 300, margin: 10 }}>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>PsbtHex:</div>
        <Input
          defaultValue={psbtHex}
          onChange={(e) => {
            setPsbtHex(e.target.value)
          }}
        ></Input>
      </div>
      <div style={{ textAlign: 'left', marginTop: 10 }}>
        <div style={{ fontWeight: 'bold' }}>Result:</div>
        {psbtResult && (
          <Paragraph className="w-40" copyable ellipsis>
            {psbtResult}
          </Paragraph>
        )}
      </div>
      <Button
        style={{ marginTop: 10 }}
        onClick={async () => {
          try {
            const psbtResult = await (window as any).unisat.signPsbt(psbtHex)

            setPsbtResult(psbtResult)
          } catch (e) {
            setPsbtResult((e as any).message)
          }
        }}
      >
        Sign Psbt
      </Button>
    </Card>
  )
}

export default SignPsbtCard
