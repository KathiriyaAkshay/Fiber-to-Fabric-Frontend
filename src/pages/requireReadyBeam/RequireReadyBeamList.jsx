import {
  Button,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { EditOutlined /*PlusCircleOutlined*/ } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import useDebounce from "../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import dayjs from "dayjs";
import { getDisplayQualityName } from "../../constants/nameHandler";

const getDate = (value) => {
  return dayjs(value).format("DD-MM-YYYY");
};
const getTime = (value) => {
  return dayjs(value).format("HH:mm:ss A");
};

const RequireReadyBeamList = () => {
  const [search, setSearch] = useState();
  const [machine, setMachine] = useState();
  const debouncedSearch = useDebounce(search, 500);
  const debouncedMachine = useDebounce(machine, 500);
  const { /*company,*/ companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

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

  const { data: requireReadyBeamList, isLoading } = useQuery({
    queryKey: [
      "requireReadyBeam",
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
      const res = await getInHouseQualityListRequest({
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

  // function navigateToAdd() {
  //   navigate("/require-ready-beam/add");
  // }

  function navigateToUpdate(id) {
    navigate(`/require-ready-beam/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date",
      render: function (detail) {
        return getDate(detail.createdAt);
      },
    },
    {
      title: "Time",
      render: function (detail) {
        return getTime(detail.createdAt);
      },
    },
    {
      title: "Quality",
      render: function (detail) {
        return (
          <div>
            {getDisplayQualityName(detail)}
          </div>
        )
      },
    },
    {
      title: "Require everyday non pasarela beam",
      dataIndex: "require_non_pasarela_beam",
      key: "require_non_pasarela_beam",
    },
    {
      title: "Require everyday pasarela beam",
      dataIndex: "require_pasarela_beam",
      key: "require_pasarela_beam",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
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
        dataSource={requireReadyBeamList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: requireReadyBeamList?.rows?.count || 0,
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
          <h3 className="m-0 text-primary">Require Ready Beam List</h3>
          {/* <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          /> */}
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
          {/* <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!requireReadyBeamList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          /> */}
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default RequireReadyBeamList;
