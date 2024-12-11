import { EyeOutlined } from "@ant-design/icons";
import { Button, Descriptions, Modal, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { SALE_CHALLAN_INFO_TAG_COLOR } from "../../constants/tag";

const ViewProductionDetailModal = ({ title, details }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  // const handleOk = () => {
  //   setIsModalOpen(false);
  // };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const adjustHeight = {};
  // if (true) {
  adjustHeight.height = "calc(100vh - 150px)";
  adjustHeight.overflowY = "scroll";
  // }

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
    // {
    //   key: "1",
    //   date: "11-1-11",
    //   employee_name: "John",
    //   meter: "",
    //   taka_no: "",
    //   machine_no: "",
    //   beam_no: "",
    // },
  ];

  const items = [
    {
      key: "1",
      label: "Quality Name",
      children: `${details.inhouse_quality.quality_name} (${details.inhouse_quality.quality_weight}KG)`,
      span: 2,
    },
    {
      key: "2",
      label: "Order Type",
      children: (
        <div>
          <Tag color={SALE_CHALLAN_INFO_TAG_COLOR}>Sale</Tag>
        </div>
      ),
      span: 2,
    },
    {
      key: "3",
      label: "Date",
      children: dayjs(details.production_date).format("DD/MM/YYYY"),
      span: 2,
    },
    {
      key: "4",
      label: "Beam No",
      children: `${details?.beam_no || "-"}`,
      span: 2,
    },
    {
      key: "5",
      label: "Beam status",
      children: (() => {
        const text = details?.loaded_beam?.status || ""; // Handle undefined or null status
        const capitalizeFirstCharacter = (str) =>
          str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

        const getStatusTag = (status) => {
          switch (status) {
            case "running":
              return (
                <Tag color="magenta">{capitalizeFirstCharacter(status)}</Tag>
              );
            case "finished":
              return (
                <Tag color="green">{capitalizeFirstCharacter(status)}</Tag>
              );
            case "cut":
              return <Tag color="red">{capitalizeFirstCharacter(status)}</Tag>;
            case "pasarela":
              return (
                <Tag color="orange">{capitalizeFirstCharacter(status)}</Tag>
              );
            case "non-pasarela":
              return (
                <Tag color="volcano">{capitalizeFirstCharacter(status)}</Tag>
              );
            case "bhidan_of_beam":
              return <Tag color="blue">{capitalizeFirstCharacter(status)}</Tag>;
            case "sent":
              return (
                <Tag color="purple">{capitalizeFirstCharacter(status)}</Tag>
              );
            case "primary(advance)":
              return <Tag color="cyan">{capitalizeFirstCharacter(status)}</Tag>;
            default:
              return <Tag>{capitalizeFirstCharacter(status)}</Tag>;
          }
        };

        return getStatusTag(text);
      })(),
      span: 2,
    },
    // {
    //   key: "6",
    //   label: "P Taka",
    //   children: "-",
    //   span: 2,
    // },
    {
      key: "7",
      label: "Return Sale Challan No",
      children: "-",
      span: 2,
    },
    // {
    //   key: "8",
    //   label: "Prod Taka",
    //   children: "-",
    //   span: 2,
    // },
    {
      key: "9",
      label: "Taka No",
      children: details.taka_no,
      span: 2,
    },
    {
      key: "10",
      label: "Production Mtr",
      children: details.production_meter,
      span: 2,
    },
    {
      key: "11",
      label: "Meter",
      children: details.meter,
      span: 2,
    },
    {
      key: "12",
      label: "Pending Mtr",
      children: (
        <div style={{ fontWeight: 600, color: "red" }}>
          {details.pending_meter}
        </div>
      ),
      span: 2,
    },
    {
      key: "13",
      label: "Weight",
      children: details?.weight || "-",
      span: 2,
    },
    {
      key: "14",
      label: "Purchase Challan No.",
      children: "-",
      span: 2,
    },
    {
      key: "15",
      label: "Average",
      children: details.average,
      span: 2,
    },
    {
      key: "16",
      label: "Supplier Name",
      children: "-",
      span: 2,
    },
    {
      key: "17",
      label: "Old Meter",
      children: (
        <div style={{ fontWeight: 600, color: "red" }}>
          {details?.old_meter || "-"}
        </div>
      ),
      span: 2,
    },
    {
      key: "18",
      label: "Purchase Company Name",
      children: "-",
      span: 2,
    },
    {
      key: "19",
      label: "Old Weight",
      children: (
        <div style={{ fontWeight: 600, color: "red" }}>
          {details?.old_weight || "-"}
        </div>
      ),
      span: 2,
    },
    {
      key: "20",
      label: "Sale Challan Company Name",
      children: "-",
      span: 2,
    },
    {
      key: "21",
      label: "Old Average",
      children: (
        <div style={{ fontWeight: 600, color: "red" }}>
          {details?.old_average || "-"}
        </div>
      ),
      span: 2,
    },
    {
      key: "22",
      label: "Challan No",
      children: details?.sale_challan?.challan_no || "-",
      span: 2,
    },
    {
      key: "23",
      label: "Machine No",
      children: details.machine_no,
      span: 2,
    },
    {
      key: "24",
      label: "Machine Name",
      children: (
        <Tag color="#108ee9">
          <strong>
            {details?.machine_name ? `${details?.machine_name}` : "-"}
          </strong>
        </Tag>
      ),
      span: 2,
    },
    {
      key: "25",
      label: "Party",
      children: "-",
      span: 2,
    },
  ];

  return (
    <>
      <Button type="primary" onClick={showModal}>
        <EyeOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            {title}
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"70%"}
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
            ...adjustHeight,
          },
        }}
      >
        <Descriptions
          className="production-item-descriptions"
          bordered
          items={items}
          size="small"
        />

        <div
          className="text-center"
          style={{ fontWeight: 600, fontSize: "1.1rem", marginTop: "1.2rem" }}
        >
          Employee Avg. Report
        </div>

        <Table
          style={{ marginTop: "20px" }}
          columns={columnsModal}
          dataSource={data}
        />
      </Modal>
    </>
  );
};

export default ViewProductionDetailModal;
