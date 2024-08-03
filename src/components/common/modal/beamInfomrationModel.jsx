import React, { useEffect, useState } from "react";
import { Button, Flex, Modal, Typography, Input, Table, Form } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import moment from "moment/moment";

const BeamInformationModel = ({ details, setBeamModel }) => {

    console.log(details);

    const [beamDetails, setBeamDetails] = useState([]) ; 
    const [isModalOpen, setIsModalOpen] = useState(true); 

    const columns = [
        {
            title: 'No.',
            dataIndex: 'number',
            key: 'number',
            render: (text, record, index) => index + 1
        },
        {
            title: 'Beam No',
            dataIndex: 'beam_no',
            key: 'beamNo',
        },
        {
            title: 'Supplier Beam No',
            dataIndex: 'supplier_beam_no',
            key: 'supplierBeamNo',
        },
        {
            title: 'TAAR/ENDS',
            dataIndex: 'tars',
            key: 'taarEnds',
            render: (text, record) => (
                record?.tars == undefined ?record?.ends_or_tars:record?.tars
            )
        },
        {
            title: 'Pano',
            dataIndex: 'pano',
            key: 'pano',
        },
        {
            title: 'Taka',
            dataIndex: 'taka',
            key: 'taka',
        },
        {
            title: 'Meter',
            dataIndex: 'meter',
            key: 'meter',
        },
    ];
    return (

        <Modal
            closeIcon={<CloseOutlined className="text-white" />}
            open={isModalOpen}
            title={
                <Typography.Text className="text-xl font-medium text-white">
                    Beam Information
                </Typography.Text>
            }
            centered={true}
            classNames={{
                header: "text-center",
            }}
            footer={null}
            width={"80%"}
            onCancel={() => { setBeamModel(false) }}
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
                    maxHeight: "80vh",
                    overflowY: "auto", 
                    marginBottom: 20

                },
                footer: {
                    paddingBottom: 10,
                    paddingRight: 10,
                    backgroundColor: "#efefef",
                    marginBottom: 60
                }
            }}
        >
            <>
                <div style={{ display: 'flex', marginBottom: '20px', justifyContent: 'space-between', gap: 16, marginTop: 10 }}>
                    <Form layout="inline" style={{ marginBottom: '20px' }}>
                        <Form.Item label="Challan No">
                            <Input readOnly placeholder="Challan No" value={details?.challan_no} />
                        </Form.Item>
                        <Form.Item label="Challan Date">
                            <Input readOnly placeholder="Challan Date" value={moment(details?.createdAt).format("DD-MM-YYYY")} />
                        </Form.Item>
                        <Form.Item label="Supplier Name">
                            <Input readOnly placeholder="Supplier Name" value={details?.supplier?.supplier?.supplier_name} />
                        </Form.Item>
                        
                        <Flex style={{marginTop: 10}}>
                            <Form.Item label="Supplier Company Name">
                                <Input readOnly placeholder="Supplier Company Name" value={details?.supplier?.supplier?.supplier_company} />
                            </Form.Item>
                            <Form.Item label="Quality Name">
                                <Input readOnly placeholder="Quality Name" value={details?.inhouse_quality?.quality_name} />
                            </Form.Item>
                            {/* <Form.Item label="Beam No">
                                <Input placeholder="Beam No" />
                            </Form.Item> */}
                        </Flex>
                    </Form>

                </div>
                <Table
                    columns={columns}
                    dataSource={details?.job_beam_receive_details}
                    pagination={false}
                    footer={() => {
                        let total_meter = 0 ;
                        details?.job_beam_receive_details?.map((element) => {
                            total_meter = total_meter + Number(element?.meter) ; 
                        })
                        return(
                            <div style={{ display: 'flex', justifyContent: 'flex-end', fontWeight: 'bold' }}>
                                Total Meter : {total_meter}
                            </div>
                        )
                    }}
                />
            </>
        </Modal>
    )
}

export default BeamInformationModel; 