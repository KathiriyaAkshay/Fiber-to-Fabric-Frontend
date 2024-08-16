import {
  Button,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Typography,
  message,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
// import { useCurrentUser } from "../../../api/hooks/auth";
// import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
// import dayjs from "dayjs";
// import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";
import {
  getTradingQualityListRequest,
  updateTradingQualityRequest,
} from "../../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../../api/requests/machine";

// const roleId = USER_ROLES.EMPLOYEE.role_id;

const TradingQualityList = () => {
  const [search, setSearch] = useState();
  const [machine, setMachine] = useState();
  // const [status, setStatus] = useState(1);
  const debouncedSearch = useDebounce(search, 500);
  const debouncedMachine = useDebounce(machine, 500);
  // const debouncedStatus = useDebounce(status, 500);
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  // const { data: user } = useCurrentUser();

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const { data: tradingQualityList, isLoading } = useQuery({
    queryKey: [
      "tradingQuality",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
        machine_name: debouncedMachine,
        // status: debouncedStatus,
      },
    ],
    queryFn: async () => {
      const res = await getTradingQualityListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          machine_name: debouncedMachine,
          // status: debouncedStatus,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const {
    mutateAsync: updateTradingQuality,
    isPending: updatingTradingQuality,
    variables,
  } = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateTradingQualityRequest({
        id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["trading", "Quantity", "update"],
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
    navigate("/quality-master/trading-quality/add");
  }

  function navigateToUpdate(id) {
    navigate(`/quality-master/trading-quality/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = tradingQualityList?.row?.map((user, index) => {
      const { quality_name, quality_group, production_type, is_active } = user;
      return [
        index + 1,
        quality_name,
        quality_group,
        production_type,
        is_active ? "Active" : "Inactive",
      ];
    });

    const tableTitle = [
      "ID",
      "Quality Name",
      "Quality Group",
      "Product Type",
      "Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Trading Quality List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [["ID", "Quality Name", "Quality Group", "Product Type", "Status"]],
    //   leftContent,
    //   rightContent,
    //   title: "Trading Quality List",
    // });

    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
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
      title: "Machine",
      dataIndex: "machine_name",
      key: "machine_name",
    },
    {
      title: "Production Type",
      dataIndex: "production_type",
      key: "production_type",
    },
    {
      title: "Status",
      render: (qualityDetails) => {
        const { is_active, id } = qualityDetails;
        return (
          <Switch
            loading={updatingTradingQuality && variables?.id === id}
            defaultChecked={is_active}
            onChange={(is_active) => {
              updateTradingQuality({
                id: id,
                data: { is_active: is_active },
              });
            }}
          />
        );
      },
      key: "status",
    },
    {
      title: "Action",
      render: (qualityDetails) => {
        return (
          <Space>
            {/* <ViewDetailModal
              title="Trading Quality Details"
              details={[
                { title: "Quality Name", value: quality_name },
                // { title: "Contact Number", value: mobile },
                // { title: "Username", value: username },
                // { title: "TDS", value: tds },
                // {
                //   title: "Employee Type",
                //   value: employee_type,
                // },
                // { title: "Salary Type", value: salary_type },
                // {
                //   title: "Joining Date",
                //   value: dayjs(joining_date).format("DD/MM/YYYY"),
                // },
                // { title: "Company", value: company_name },
              ]}
            /> */}
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
        dataSource={tradingQualityList?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: tradingQualityList?.row?.count || 0,
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
          <h3 className="m-0 text-primary">Trading Quality List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Machine
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Machine"
              loading={isLoadingMachineList}
              value={machine}
              options={machineListRes?.rows?.map((machine) => ({
                label: machine?.machine_name,
                value: machine?.machine_name,
              }))}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setMachine}
              style={{
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
            disabled={!tradingQualityList?.row?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default TradingQualityList;
