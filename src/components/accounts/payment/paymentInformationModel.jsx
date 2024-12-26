import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Descriptions, Flex, Modal, Row, Table, Tag, Tooltip } from "antd";
import moment from "moment";
import React, {useState, useEffect} from "react";

const columnsPayment = [
    {
        title: "No", 
        dataIndex: "no"
    }
]

const PaymentInformationModel = ({details}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const showModal = () => {
        setIsModalOpen(true);
    };
  
    const handleOk = () => {
        setIsModalOpen(false);
    };
  
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    
    return(
        <Modal
            open = {isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            width={"85%"}
            centered
            footer = {null}
        >
            <Table
                columns={columnsPayment}
                dataSource={[]}
                loading = {true}
                pagination = {false }
            />
        </Modal>
    )
}