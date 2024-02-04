import React from 'react'
import { Form, Input, Button, Card, InputNumber, FormInstance } from 'antd'
import { Typography } from 'antd'
const { Paragraph } = Typography

interface IBroadCastPsbt {
  address: string
  value: number
}

interface IProps {
  form: FormInstance<any>
  onFinish: (params: IBroadCastPsbt) => void
  onFailed: (err: any) => void
  txId: string
}

const BroadcastCard = ({ onFinish, onFailed, form, txId }: IProps) => {
  const onSubmit = (values: IBroadCastPsbt) => {
    onFinish && onFinish(values)
  }

  const onFinishFailed = (errorInfo: any) => {
    onFailed && onFailed(errorInfo)
  }

  const handleClickTxId = () => {
    window.open(`https://mempool.space/testnet/tx/${txId}`, '_blank')
  }

  return (
    <Card title="Send">
      <Form
        form={form}
        name="basic"
        onFinish={onSubmit}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: 'Please input payment address!' }]}
          className="mb-10"
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Amount"
          name="value"
          rules={[{ required: true, message: 'Please input amount!' }]}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>

        {txId && (
          <Paragraph onClick={handleClickTxId} copyable>
            {txId}
          </Paragraph>
        )}
        <Form.Item className="flex items-center justify-center">
          <Button type="dashed" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default BroadcastCard
