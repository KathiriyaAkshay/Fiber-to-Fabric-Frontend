import { CreditCardOutlined, DollarCircleOutlined, FileDoneOutlined, FileOutlined, FundOutlined, MoneyCollectOutlined, OrderedListOutlined, PlusCircleOutlined, SettingFilled, ShoppingCartOutlined, StockOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { Button, Col, Row, Select } from 'antd'
import React from 'react'

const AccountReport = () => {
    return (
        <>
            <div className="flex flex-col gap-2 p-4">
                <div className="flex items-center gap-5">
                    <h3 className="m-0 text-primary">Accounts</h3>
                </div>
            </div>
            <div className="flex gap-2 p-4">
                <div className='w-1/2'>
                    <Select 
                     defaultValue="Sonu Textiles"
                     style={{
                       width: "30%",
                     }}
                     options={[
                       {
                         value: 'Sonu Textiles',
                         label: 'Sonu Textiles',
                       },
                       {
                         value: 'Sonu Textiles2',
                         label: 'Sonu Textiles2',
                       },
                     
                     ]}
                     />
                </div>
                <div className='w-1/2 flex align-items-center justify-evenly'>

                    <Button icon={<FileOutlined/>}>Ledger Report</Button>
                    <Button icon={<ShoppingCartOutlined/>}>Purchases</Button>
                    <Button icon={<FileOutlined/>}>Sales</Button>
                    <Button icon={<FundOutlined />}></Button>
                    <Button icon={<SettingFilled />}></Button>

                </div>
            </div>

            <div className='flex gap-2 p-4'>
                <div className="w-1/2">
                <h3 className="m-0 text-primary">Group & Ledgers</h3>
                     <Row className='w-100 mt-3'>
                        <Col span={16} className='font-semibold text-lg'>Current Assets</Col>
                        <Col span={7} className='text-right font-semibold text-lg'>123642.00</Col>
                     </Row>
                     <Row className='w-100 mt-3'>
                        <Col span={16} className='font-semibold text-lg'>Capital Account</Col>
                        <Col span={7} className='text-right font-semibold text-lg'>-12857655.50</Col>
                     </Row>
                     <Row className='w-100 mt-3'>
                        <Col span={16} className='font-semibold text-lg'>Long Term Liabilities</Col>
                        <Col span={7} className='text-right font-semibold text-lg'>13324.00</Col>
                     </Row>
                     <Row className='w-100 mt-3'>
                        <Col span={16} className='font-semibold text-lg'>Short Term Liabilities</Col>
                        <Col span={7} className='text-right font-semibold text-lg'>123642.00</Col>
                     </Row>
                     <Row className='w-100 mt-3'>
                        <Col span={16} className='font-semibold text-lg'>Purchase</Col>
                        <Col span={7} className='text-right font-semibold text-lg'>132423642.00</Col>
                     </Row>
                     <Row className='w-100 mt-3'>
                        <Col span={16} className='font-semibold text-lg'>Sale</Col>
                        <Col span={7} className='text-right font-semibold text-lg'>1192334.00</Col>
                     </Row>
                     <Row className='w-100 mt-3'>
                        <Col span={16} className='font-semibold text-lg'>Direct Expense</Col>
                        <Col span={7} className='text-right font-semibold text-lg'>11084.00</Col>
                     </Row>
                     <Row className='w-100 mt-3'>
                        <Col span={16} className='font-semibold text-lg'>Administrative Expenses</Col>
                        <Col span={7} className='text-right font-semibold text-lg'>1234.00</Col>
                     </Row>
                </div>
                <div className="w-1/2"> 
                <h3 className="m-0 text-primary">Quick Access</h3>
                <div className='w-100 mt-3 flex justify-evenly align-items-start flex-wrap'>
                     <Button className='w-48 m-1 mt-3' icon={<DollarCircleOutlined/>} type='primary'>Balance Sheet</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<FileOutlined/>}>Profit & Loss</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<FileOutlined/>}>Trial Balance</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<PlusCircleOutlined/>}>Enter Voucher</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<MoneyCollectOutlined/>}>Reconcilation</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<StockOutlined/>}>Stock Report</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<FileDoneOutlined/>}>Purchase Orders</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<CreditCardOutlined/>}>Credit Notes</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<CreditCardOutlined/>}>Debit Notes</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<UnorderedListOutlined/>}>GSTR 1</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<OrderedListOutlined/>}>GSTR 2</Button>
                    <Button className='w-48 m-1 mt-3' type='primary' icon={<UnorderedListOutlined/>}>GSTR 3B</Button>
                 </div>
                </div>
            </div>
        </>

    )
}

export default AccountReport