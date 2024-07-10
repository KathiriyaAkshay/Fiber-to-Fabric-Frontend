import { EyeOutlined } from "@ant-design/icons";
import { Button, Descriptions, Modal, Table } from "antd";
import { useState } from "react";

const ViewProductionDetailModal = ({ title, details }) => {
  console.log("ViewProductionDetailModal: ", details);
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

  const columnsModal = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Employee Name",
      dataIndex: "employee_name",
      key: "employee_name",
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Taka No",
      key: "taka_no",
      dataIndex: "taka_no",
    },
    {
      title: "Machine No",
      key: "machine_no",
      dataIndex: "machine_no",
    },
    {
      title: "Beam No",
      key: "beam_no",
      dataIndex: "beam_no",
    },
  ];
  const data = [
    {
      key: "1",
      date: "11-1-11",
      employee_name: "John",
      meter: "",
      taka_no: "",
      machine_no: "",
      beam_no: "",
    },
  ];

  const items = [
    {
      key: "1",
      label: "Quality Name",
      children: "33P PALLU PATERN (SDFSDFSDFSDFSDFSD) - (8KG)",
      span: 2,
    },
    {
      key: "2",
      label: "Order Type",
      children: "Sale",
      span: 2,
    },
    {
      key: "3",
      label: "Production Company Name",
      children: "SONU TEXTILES",
      span: 2,
    },
    {
      key: "4",
      label: "Beam status",
      children: "Finished",
      span: 2,
    },

    {
      key: "5",
      label: "Date",
      children: "2019-04-24 18:00:00",
      span: 2,
    },
    {
      key: "6",
      label: "P Taka",
      children: "--",
      span: 2,
    },
    {
      key: "7",
      label: "Return Sale Challan No",
      children: "--",
      span: 2,
    },
    {
      key: "8",
      label: "Prod Taka",
      children: "--",
      span: 2,
    },
    {
      key: "9",
      label: "Taka No",
      children: "9",
      span: 2,
    },
    {
      key: "10",
      label: "Prod Mtr",
      children: "23",
      span: 2,
    },
    {
      key: "11",
      label: "Meter",
      children: "1023",
      span: 2,
    },
    {
      key: "12",
      label: "Pend mtr",
      children: "--",
      span: 2,
    },
    {
      key: "13",
      label: "Weight",
      children: "840.09",
      span: 2,
    },
    {
      key: "14",
      label: "Purchase Challan No.",
      children: "--",
      span: 2,
    },
    {
      key: "15",
      label: "Average",
      children: "82.12",
      span: 2,
    },
    {
      key: "16",
      label: "Supplier Name",
      children: "--",
      span: 2,
    },
    {
      key: "17",
      label: "Old Meter",
      children: "1023",
      span: 2,
    },
    {
      key: "18",
      label: "Purchase Company Name",
      children: "--",
      span: 2,
    },
    {
      key: "19",
      label: "Old Weight",
      children: "840.09",
      span: 2,
    },
    {
      key: "20",
      label: "Sale Challan Company Name",
      children: "--",
      span: 2,
    },
    {
      key: "21",
      label: "Old Average",
      children: "82.12",
      span: 2,
    },
    {
      key: "22",
      label: "Challan No",
      children: "1023",
      span: 2,
    },
    {
      key: "23",
      label: "Machine No",
      children: "4",
      span: 2,
    },
    {
      key: "24",
      label: "Party",
      children: "--",
      span: 2,
    },
  ];

  return (
    <>
      <Button type="primary" onClick={showModal}>
        <EyeOutlined />
      </Button>
      <Modal
        title=""
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width="100%"
      >
        <Descriptions title={title} bordered items={items} size="small" />

        <div
          className="text-center"
          style={{ fontWeight: 600, fontSize: "1.1rem" }}
        >
          Employee Avg. Report
        </div>
        <Table columns={columnsModal} dataSource={data} />
      </Modal>
    </>
  );
};

export default ViewProductionDetailModal;
