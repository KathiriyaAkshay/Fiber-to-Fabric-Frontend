import {
  Button,
  DatePicker,
  Flex,
  Input,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../lib/pdf/userPdf";
// import dayjs from "dayjs";
// import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import useDebounce from "../../hooks/useDebounce";
import { getTradingQualityListRequest } from "../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import ViewDetailModal from "../../components/common/modal/ViewDetailModal";

const BeamCardList = () => {
  const navigate = useNavigate();
  const { company, companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const [search, setSearch] = useState({
    beamNo: "",
    machNo: "",
  });

  const [machine, setMachine] = useState();
  const [beamType, setBeamType] = useState("primary");
  console.log(beamType);
  const debouncedSearch = useDebounce(search, 500);
  const debouncedMachine = useDebounce(machine, 500);

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

  //   const {
  //     mutateAsync: updateTradingQuality,
  //     isPending: updatingTradingQuality,
  //     variables,
  //   } = useMutation({
  //     mutationFn: async ({ id, data }) => {
  //       const res = await updateTradingQualityRequest({
  //         id,
  //         data,
  //         params: { company_id: companyId },
  //       });
  //       return res.data;
  //     },
  //     mutationKey: ["trading", "Quantity", "update"],
  //     onSuccess: (res) => {
  //       const successMessage = res?.message;
  //       if (successMessage) {
  //         message.success(successMessage);
  //       }
  //     },
  //     onError: (error) => {
  //       const errorMessage = error?.response?.data?.message;
  //       if (errorMessage && typeof errorMessage === "string") {
  //         message.error(errorMessage);
  //       }
  //     },
  //   });

  function navigateToAdd() {
    navigate("/beam-card/add");
  }

  function navigateToUpdate(id) {
    navigate(`/beam-card/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

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

    downloadUserPdf({
      body,
      head: [["ID", "Quality Name", "Quality Group", "Product Type", "Status"]],
      leftContent,
      rightContent,
      title: "Trading Quality List",
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
      title: "Beam No",
      dataIndex: "beam_no",
      key: "beam_no",
    },
    {
      title: "Quality",
      dataIndex: "quality_name",
      key: "quality_name",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Taka",
      dataIndex: "taka",
      key: "taka",
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Pending Meter",
      dataIndex: "pending_meter",
      key: "pending_meter",
    },
    {
      title: "Shortage %",
      dataIndex: "shortage",
      key: "shortage",
    },
    {
      title: "pano",
      dataIndex: "pano",
      key: "pano",
    },
    {
      title: "Mach.No",
      dataIndex: "mach_no",
      key: "mach_no",
    },
    {
      title: "Day Duration",
      dataIndex: "day_duration",
      key: "day_duration",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    // {
    //   title: "Status",
    //   render: (qualityDetails) => {
    //     const { is_active, id } = qualityDetails;
    //     return (
    //       <Switch
    //         loading={updatingTradingQuality && variables?.id === id}
    //         defaultChecked={is_active}
    //         onChange={(is_active) => {
    //           updateTradingQuality({
    //             id: id,
    //             data: { is_active: is_active },
    //           });
    //         }}
    //       />
    //     );
    //   },
    //   key: "status",
    // },
    {
      title: "Action",
      render: (qualityDetails) => {
        return (
          <Space>
            <ViewDetailModal
              title="Beam Card Details"
              details={[
                { title: "Beam No", value: "No Value" },
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
          <h3 className="m-0 text-primary">Beam Card List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          <Radio.Group
            name="filter"
            value={beamType}
            onChange={(e) => setBeamType(e.target.value)}
          >
            <Flex align="center" gap={10}>
              <Radio value={"primary"}> Primary Beam</Radio>
              <Radio value={"secondary"}> Secondary Beam </Radio>
            </Flex>
          </Radio.Group>
          <Input
            placeholder="BN-155"
            value={search.beamNo}
            onChange={(e) =>
              setSearch((prev) => ({ ...prev, beamNo: e.target.value }))
            }
            style={{ width: "200px" }}
          />
          <Input
            placeholder="Mach No"
            value={search.machNo}
            onChange={(e) =>
              setSearch((prev) => ({ ...prev, machNo: e.target.value }))
            }
            style={{ width: "200px" }}
          />
          <Button type="primary" onClick={downloadPdf} className="flex-none">
            Load New Beam
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!tradingQualityList?.row?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
          <Button
            icon={<PrinterOutlined />}
            type="primary"
            disabled={!tradingQualityList?.row?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Beam Type
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Beam Type"
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

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Quality
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Quality"
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

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker
              //   value={machine}
              onChange={setMachine}
              className="min-w-40"
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              //   value={machine}
              onChange={setMachine}
              className="min-w-40"
            />
          </Flex>
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default BeamCardList;
