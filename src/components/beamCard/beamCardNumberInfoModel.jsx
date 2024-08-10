import { CloseOutlined } from "@ant-design/icons";
import {
    Button,
    Col,
    Divider,
    Flex,
    message,
    Modal,
    Radio,
    Row,
    Table,
    Typography,
} from "antd";
import { useState, useEffect } from "react";

const BeamCardNumberInfoModel = ({isModalOpen, setIsModelOpen}) => {

    const handleCancel = () => {
        setIsModelOpen(false) ; 
    }

    const columns = [
        {
            title: "Short Name", 
            dataIndex: "short_name",
            width: 150, 
            render: (text, record) => {
                return(
                    <div style={{fontWeight: 600}}>{text}</div>
                )
            }
        }, 
        {
            title :"Full name", 
            dataIndex: "full_name"
        }
    ]

    const [beamInfoList, setBeamInfoList] = useState([]) ; 

    useEffect(() => {
        let temp = []; 

        temp.push({
            "short_name": "BN", 
            "full_name":"Beam Number"
        });
        
        temp.push({
            "short_name":"SBN", 
            "full_name": "Secondary Beam Number"
        })

        temp.push({
            "short_name":"PBN", 
            "full_name": "Purchased Beam Number"
        })

        temp.push({
            "short_name":"JBN", 
            "full_name": "Job Beam Number"
        })
        
        temp.push({
            "short_name":"IJBN", 
            "full_name": "Inhouse Job Beam Number"
        })
        
        temp.push({
            "short_name":"SPBN", 
            "full_name": "Secondary Purchased Beam Number"
        })

        temp.push({
            "short_name":"SJBN", 
            "full_name": "Secondary Job Beam Number"
        })

        

        setBeamInfoList(temp) ; 
    })
    
    return (
        <Modal
            closeIcon={<CloseOutlined className="text-white" />}
            title={
                <Typography.Text className="text-xl font-medium text-white">
                    Short Name Hint Info
                </Typography.Text>
            }
            open={isModalOpen}
            footer={null}
            onCancel={handleCancel}
            centered={true}
            className="view-in-house-quality-model"
            classNames={{
                header: "text-center",
            }}
            styles={{
                content: {
                    padding: 0,
                    width: "600px",
                    margin: "auto",
                },
                header: {
                    padding: "16px",
                    margin: 0,
                },
                body: {
                    padding: "10px 16px",
                },
            }}
        >
            <Table
                columns={columns}
                dataSource={beamInfoList}
                pagination = {false}
            />
        </Modal>
    )
}

export default BeamCardNumberInfoModel; 