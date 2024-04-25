import {
  Button,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Typography,
  message,
  Col,
  Row,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  CloseOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MACHINE_LIST } from "../../../constants/userRole";
import { useCurrentUser } from "../../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";
import {
  getInHouseQualityListRequest,
  updateInHouseQualityRequest,
} from "../../../api/requests/qualityMaster";

// const roleId = USER_ROLES.EMPLOYEE.role_id;

const InHouseQualityList = () => {
  const [search, setSearch] = useState();
  const [machine, setMachine] = useState();
  const [status, setStatus] = useState(1);
  const debouncedSearch = useDebounce(search, 500);
  const debouncedMachine = useDebounce(machine, 500);
  const debouncedStatus = useDebounce(status, 500);
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const { data: inHouseQualityList, isLoading } = useQuery({
    queryKey: [
      "inHouseQuality",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
        machine_name: debouncedMachine,
        is_active: debouncedStatus,
      },
    ],
    queryFn: async () => {
      const res = await getInHouseQualityListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          machine_name: debouncedMachine,
          is_active: debouncedStatus,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const {
    mutateAsync: updateInHouseQuality,
    isPending: updatingInHouseQuality,
    variables,
  } = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateInHouseQualityRequest({
        id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["inhouse", "Quantity", "update"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  function navigateToAdd() {
    navigate("/quality-master/inhouse-quality/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/my-employee/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = inHouseQualityList?.rows?.map((user) => {
      const { id, first_name, last_name, mobile, username } = user;
      return [id, first_name, last_name, mobile, username];
    });

    downloadUserPdf({
      body,
      head: [["ID", "First Name", "Last Name", "Contact No", "Username"]],
      leftContent,
      rightContent,
      title: "Employee List",
    });
  }
  /**
   * Quality Name
   * Quality Group
   * From
   * To
   * Yarn Type
   * Production Type
   * Status
   * Show to Party
   * Action
   * */

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Quality Name",
      dataIndex: "quality_name",
      key: "quality_name",
    },
    {
      title: "Quality Group",
      dataIndex: "quality_group",
      key: "quality_group",
    },
    {
      title: "From",
      dataIndex: "weight_from",
      key: "weight_from",
    },
    {
      title: "To",
      dataIndex: "weight_to",
      key: "weight_to",
    },
    {
      title: "Yarn Type",
      dataIndex: "yarn_type",
      key: "yarn_type",
    },
    {
      title: "Production Type",
      // dataIndex: "mobile",
      render: (qualityDetails) => {
        const { inhouse_production_types } = qualityDetails;
        return inhouse_production_types
          ?.map((type) => type?.production_type)
          .join(", ");
      },
      key: "production_type",
    },
    {
      title: "Status",
      render: (qualityDetails) => {
        const { is_active, id } = qualityDetails;
        return (
          <Switch
            loading={updatingInHouseQuality && variables?.id === id}
            defaultChecked={is_active}
            onChange={(is_active) => {
              updateInHouseQuality({
                id: id,
                data: { is_active: is_active },
              });
            }}
          />
        );
      },
      key: "status",
    },
    // {
    //   title: "Show to party",
    //   dataIndex: "mobile",
    //   key: "mobile",
    // },
    {
      title: "Action",
      render: (qualityDetails) => {
        return (
          <Space>
            <ViewInHouseQualityDetailModal
              title="Quality Details"
              details={qualityDetails}
            />
            <Button
              onClick={() => {
                navigateToUpdate(qualityDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
          </Space>
        );
      },
      key: "action",
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
        dataSource={inHouseQualityList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: inHouseQualityList?.rows?.count || 0,
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
          <h3 className="m-0 text-primary">Quality List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Status
            </Typography.Text>
            <Select
              placeholder="Select status"
              loading={isLoading}
              options={[
                { label: "Active", value: 1 },
                { label: "Inactive", value: 0 },
              ]}
              value={status}
              onChange={setStatus}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Machine
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Machine"
              loading={isLoading}
              options={MACHINE_LIST}
              value={machine}
              onChange={setMachine}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!inHouseQualityList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default InHouseQualityList;

const ViewInHouseQualityDetailModal = ({ title = "-", details = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const warpingColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Denier/Count",
      dataIndex: "yarn_stock_company",
      key: "yarn_stock_company",
    },
    {
      title: "Luster",
      dataIndex: "yarn_stock_company",
      key: "yarn_stock_company",
    },
    {
      title: "Tar/Ends",
      dataIndex: "tars",
      key: "tars",
    },
    {
      title: "TPM",
      dataIndex: "tpm",
      key: "tpm",
    },
    {
      title: "Weight",
      dataIndex: "warping_weight",
      key: "warping_weight",
    },
  ];

  const weftColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Denier/Count",
      dataIndex: "yarn_stock_company",
      key: "yarn_stock_company",
    },
    {
      title: "Luster",
      dataIndex: "yarn_stock_company",
      key: "yarn_stock_company",
    },
    {
      title: "Pano",
      dataIndex: "pano",
      key: "pano",
    },
    {
      title: "Peak",
      dataIndex: "peak",
      key: "peak",
    },
    {
      title: "Read",
      dataIndex: "read",
      key: "read",
    },
    {
      title: "TPM",
      dataIndex: "tpm",
      key: "tpm",
    },
    {
      title: "Weight",
      dataIndex: "weft_weight",
      key: "weft_weight",
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
        className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
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
          },
        }}
      >
        <Flex className="flex-col gap-1">
          {/* {details?.map(({ title = "", value }) => {
            return (
              <Row gutter={12} className="flex-grow" key={title}>
                <Col span={10} className="font-medium">
                  {title}
                </Col>
                <Col span={14}>{value ?? "-"}</Col>
              </Row>
            );
          })} */}
          <Row gutter={12} className="flex-grow" key={title}>
            <Col span={2.5} className="font-medium">
              Quality Name:
            </Col>
            <Col span={4}>{details.quality_name}</Col>
            <Col span={2.5} className="font-medium">
              Quality Group:
            </Col>
            <Col span={4}>{details.quality_group}</Col>

            <Col span={2.5} className="font-medium">
              VAT HSN NO:
            </Col>
            <Col span={3}>-</Col>

            <Col span={2.5} className="font-medium">
              Weight of 100 Mtr:
            </Col>
            <Col span={3}>-</Col>
          </Row>
          <br />
          <Row gutter={12} className="flex-grow" key={title}>
            <Col span={2.5} className="font-medium">
              Production Rate:
            </Col>
            <Col span={2}>{details.production_rate}</Col>
            <Col span={2.5} className="font-medium">
              Yarn Type:
            </Col>
            <Col span={1}>{details.yarn_type}</Col>

            <Col span={2.5} className="font-medium">
              Beam Spreader ( Pasaria Rate ):
            </Col>
            <Col span={4}>-</Col>

            <Col span={2} className="font-medium">
              T.P.M.[s]:
            </Col>
            <Col span={2}>-</Col>

            <Col span={2} className="font-medium">
              T.P.M.[z]:
            </Col>
            <Col span={2}>-</Col>
          </Row>
          <br />
          <Row gutter={12} className="flex-grow" key={title}>
            <Col span={2.5} className="font-medium">
              Advance Order Days:
            </Col>
            <Col span={2}>-</Col>
            <Col span={2.5} className="font-medium">
              Per day production:
            </Col>
            <Col span={1}>-</Col>

            <Col span={2.5} className="font-medium">
              Beam Maker ( Warper Rate ):
            </Col>
            <Col span={3}>-</Col>

            <Col span={1.5} className="font-medium">
              W.P.M.:
            </Col>
            <Col span={2}>-</Col>

            <Col span={2} className="font-medium">
              Max Taka:
            </Col>
            <Col span={2}>-</Col>
          </Row>
        </Flex>
        <br />
        <br />
        <Flex className="flex-row justify-between gap-2">
          <Table
            dataSource={details?.inhouse_waraping_details || []}
            columns={warpingColumns}
            rowKey={"inhouse_waraping_details_id"}
            pagination={false}
            style={{ width: "100%" }}
          />

          <Table
            dataSource={details?.inhouse_weft_details || []}
            columns={weftColumns}
            rowKey={"inhouse_weft_details_id"}
            pagination={false}
            style={{ width: "100%" }}
          />
        </Flex>
      </Modal>
    </>
  );
};
