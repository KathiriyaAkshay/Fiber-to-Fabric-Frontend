import {
  Button,
  Col,
  Divider,
  Flex,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
// import useDebounce from "../../../hooks/useDebounce";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../api/hooks/auth";
import { getJobTakaListRequest } from "../../../api/requests/job/jobTaka";
import DeleteJobTaka from "../../../components/job/jobTaka/DeleteJobTaka";

const JobTakaList = () => {
  const { company, companyId } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  // const [quality, setQuality] = useState();
  // const [party, setParty] = useState();
  // const [vehicle, setVehicle] = useState();
  // const debouncedQuality = useDebounce(quality, 500);
  // const debouncedParty = useDebounce(party, 500);
  // const debouncedVehicle = useDebounce(vehicle, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  // const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
  //   useQuery({
  //     queryKey: ["inhouse-quality", "list", { company_id: companyId }],
  //     queryFn: async () => {
  //       const res = await getInHouseQualityListRequest({
  //         params: {
  //           company_id: companyId,
  //         },
  //       });
  //       return res.data?.data;
  //     },
  //     enabled: Boolean(companyId),
  //   });

  // const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
  //   queryKey: ["party", "list", { company_id: companyId }],
  //   queryFn: async () => {
  //     const res = await getPartyListRequest({
  //       params: { company_id: companyId },
  //     });
  //     return res.data?.data;
  //   },
  //   enabled: Boolean(companyId),
  // });

  // const { data: vehicleListRes, isLoading: isLoadingVehicleList } = useQuery({
  //   queryKey: [
  //     "vehicle",
  //     "list",
  //     { company_id: companyId, page: 0, pageSize: 99999 },
  //   ],
  //   queryFn: async () => {
  //     const res = await getVehicleUserListRequest({
  //       params: { company_id: companyId, page: 0, pageSize: 99999 },
  //     });
  //     return res.data?.data;
  //   },
  //   enabled: Boolean(companyId),
  // });

  const { data: jobTakaList, isLoading } = useQuery({
    queryKey: [
      "jobTaka",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        // vehicle_id: debouncedVehicle,
        // quality_id: debouncedQuality,
        // party_id: debouncedParty,
      },
    ],
    queryFn: async () => {
      const res = await getJobTakaListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          // vehicle_id: debouncedVehicle,
          // quality_id: debouncedQuality,
          // party_id: debouncedParty,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/job/job-taka/add");
  }

  function navigateToUpdate(id) {
    navigate(`/job/job-taka/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = jobTakaList?.rows?.map((user, index) => {
      const { challan_no } = user;
      return [index + 1, challan_no];
    });
    downloadUserPdf({
      body,
      head: [["ID", "Challan NO"]],
      leftContent,
      rightContent,
      title: "Job Taka List",
    });
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Delivery Address",
      dataIndex: "delivery_address",
      key: "delivery_address",
    },
    {
      title: "GST In",
      dataIndex: "gst_in",
      key: "gst_in",
    },
    {
      title: "GST State",
      dataIndex: "gst_state",
      key: "gst_state",
    },
    {
      title: "Quality Name",
      render: (details) => {
        return `${details.inhouse_quality.quality_name}`;
      },
    },
    {
      title: "Total Meter",
      dataIndex: "total_meter",
      key: "total_meter",
    },
    {
      title: "Total Taka",
      dataIndex: "total_taka",
      key: "total_taka",
    },
    {
      title: "Total Weight",
      dataIndex: "total_weight",
      key: "total_weight",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewJobTakaDetailsModal
              title="Job Taka Details"
              details={details}
            />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteJobTaka details={details} />
          </Space>
        );
      },
    },
  ];

  function renderTable() {
    if (isLoading) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={jobTakaList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: jobTakaList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Job Taka</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          {/* <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Quality
            </Typography.Text>
            <Select
              placeholder="Select Quality"
              value={quality}
              loading={isLoadingInHouseQualityList}
              options={inHouseQualityList?.rows?.map(
                ({ id = 0, quality_name = "" }) => ({
                  label: quality_name,
                  value: id,
                })
              )}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setQuality}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex> */}
          {/* <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Party
            </Typography.Text>
            <Select
              placeholder="Select Party"
              value={party}
              loading={isLoadingPartyList}
              options={partyUserListRes?.partyList?.rows?.map((party) => ({
                label:
                  party.first_name +
                  " " +
                  party.last_name +
                  " " +
                  `| ( ${party?.username})`,
                value: party.id,
              }))}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setParty}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex> */}

          {/* <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Vehicle
            </Typography.Text>
            <Select
              placeholder="Select vehicle"
              loading={isLoadingVehicleList}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              value={vehicle}
              onChange={setVehicle}
              options={vehicleListRes?.vehicleList?.rows?.map((vehicle) => ({
                label:
                  vehicle.first_name +
                  " " +
                  vehicle.last_name +
                  " " +
                  `| ( ${vehicle?.username})`,
                value: vehicle.id,
              }))}
            />
          </Flex> */}

          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!jobTakaList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default JobTakaList;

const ViewJobTakaDetailsModal = ({ title = "-", details = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const jobTakaDetails = [
    { title: "Challan No", value: details.challan_no },
    { title: "Delivery Address", value: details.delivery_address },
    { title: "GST In", value: details.gst_in },
    { title: "GST State", value: details.gst_state },
    { title: "Total Meter", value: details.total_meter },
    { title: "Total Taka", value: details.total_taka },
    { title: "Total Weight", value: details.total_weight },
  ];

  console.log({ details });
  const { job_challan_details } = details;
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
        // className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
            width: "600px",
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
        <Flex className="flex-col gap-1">
          {jobTakaDetails?.map(({ title = "", value }) => {
            return (
              <Row gutter={12} className="flex-grow" key={title}>
                <Col span={10} className="font-medium">
                  {title}
                </Col>
                <Col span={14}>{value ?? "-"}</Col>
              </Row>
            );
          })}

          {job_challan_details.map((item, index) => {
            return (
              <>
                <Divider />
                <Row
                  gutter={12}
                  className="flex-grow"
                  key={index + "_job_challan_details"}
                >
                  <Col span={4} className="font-medium">
                    Taka No:
                  </Col>
                  <Col span={4}>{item.taka_no}</Col>
                  <Col span={3} className="font-medium">
                    Meter:
                  </Col>
                  <Col span={4}>{item.meter}</Col>
                  <Col span={3} className="font-medium">
                    Weight:
                  </Col>
                  <Col span={4}>{item.weight}</Col>
                </Row>
              </>
            );
          })}
        </Flex>
      </Modal>
    </>
  );
};
