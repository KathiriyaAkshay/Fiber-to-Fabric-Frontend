import { useState } from "react";
import { Button, Col, Flex, Modal, Row, Typography, Card } from "antd";
import { BarChartOutlined, BarcodeOutlined, CloseOutlined } from "@ant-design/icons";

const BeamCardInformationModel = ({data}) => {
    const [isModalOpen, setIsModalOpen] = useState(false) ; 
    return(
        <>
            <Button type="primary" onClick={() => {setIsModalOpen(true)}}>
                <BarChartOutlined />
            </Button>

            <Modal
                closeIcon = {<CloseOutlined className="text-white" />}
                open = {isModalOpen}
                title={
                    <Typography.Text className="text-xl font-medium text-white">
                      Beam card information
                    </Typography.Text>
                }
                centered={true}
                classNames={{
                    header: "text-center",
                }}
                footer = {null}
                width={"25%"}
                onCancel={() => {setIsModalOpen(false)}}
                styles={{
                    content: {
                        padding: 0,
                    },
                    header: {
                        padding: "16px",
                        margin: 0,
                    },
                    body: {
                        padding: "10px 16px",
                }}}
            >   
                {data?.recieve_size_beam_details?.map((element, index) => {
                    return(
                        <Flex key={index} style={{ marginBottom: '20px' }}>
                            <div >
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${element?.beam_no}&size=100x100`} 
                                    alt={`QR code for ${element?.beam_no}`}
                                    style={{ width: '100%', height: 112, width: 112 }}
                                />
                            </div>
                            <div style={{marginLeft: 20}}>
                                <p><strong>{element?.beam_no}</strong></p>
                                <p>Taka: <strong>{element?.taka}</strong></p>
                                <p>Meter: <strong>{element?.meters}</strong></p>
                            </div>
                        </Flex>
                    )
                })}
            </Modal>
        </>
    )
} 

export default BeamCardInformationModel ; 