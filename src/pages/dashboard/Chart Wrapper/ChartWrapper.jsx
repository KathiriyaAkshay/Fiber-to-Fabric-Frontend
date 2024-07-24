import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd'
import React from 'react'
import { ResponsiveContainer } from 'recharts'

export const ChartWrapper = (props) => {
  console.log(props.children);
  return (
    <div className='chart-wrapper'>
      <Flex justify='space-between' align='center' className="mb-2">
        <div>heading</div>
        <div>
        <Button icon={<ArrowsAltOutlined/>}/>
        </div>
      </Flex>
      <div width="100%" height="100%">
      {props.children}  
      </div>
    </div>
  )
}
