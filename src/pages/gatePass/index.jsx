import { Button, Flex, Space, Spin, Table, Switch, message } from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../lib/pdf/userPdf";
// import dayjs from "dayjs";
import ViewDetailModal from "../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../hooks/usePagination";
import { useContext } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
// import useDebounce from "../../hooks/useDebounce";
import dayjs from "dayjs";
import {
  getGatePassListRequest,
  updateGatePassRequest,
} from "../../api/requests/gatePass";
import DeleteGatePass from "../../components/auth/gatePass/DeleteGatePass";

const GatePassList = () => {
  // const [search, setSearch] = useState();
  // const [machine, setMachine] = useState();
  // const [status, setStatus] = useState(1);
  // const debouncedSearch = useDebounce(search, 500);
  // const debouncedMachine = useDebounce(machine, 500);
  // const debouncedStatus = useDebounce(status, 500);
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const { data: gatePassList, isLoading } = useQuery({
    queryKey: [
      "gate",
      "pass",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        // search: debouncedSearch,
        // machine_name: debouncedMachine,
        // status: debouncedStatus,
      },
    ],
    queryFn: async () => {
      const res = await getGatePassListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          // search: debouncedSearch,
          // machine_name: debouncedMachine,
          // status: debouncedStatus,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const {
    mutateAsync: updateGatePass,
    isPending: updatingGatePass,
    variables,
  } = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateGatePassRequest({
        id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["gate", "pass", "update"],
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

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = gatePassList?.rows?.map((gatePass, index) => {
      const {
        person_name,
        company_name,
        gate_pass_date,
        status,
        is_returnable,
        address,
      } = gatePass;
      return [
        index + 1,
        person_name,
        company_name,
        dayjs(gate_pass_date).format("DD-MM-YYYY"),
        address,
        status,
        is_returnable ? "Yes" : "No",
      ];
    });

    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Person Name",
          "Company Group",
          "Gate Pass Date",
          "Address",
          "Status",
          "Is Returnable",
        ],
      ],
      leftContent,
      rightContent,
      title: "Gate Pass List",
    });
  }

  function navigateToAdd() {
    navigate("/gate-pass/add");
  }

  // function navigateToUpdate(id) {
  //   navigate(`/gate-pass/update/${id}`);
  // }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Person Name",
      dataIndex: "person_name",
      key: "person_name",
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
    },
    {
      title: "Gate Pass Date",
      render: (details) => {
        return dayjs(details.gate_pass_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Is Returnable",
      render: (details) => {
        return details.is_returnable ? "Yes" : "No";
      },
    },
    {
      title: "Status",
      render: (details) => {
        console.log({ details });
        const { status, id } = details;
        return (
          <Switch
            loading={updatingGatePass && variables?.id === id}
            defaultChecked={status === "pending" ? false : true}
            onChange={(status) => {
              updateGatePass({
                id: id,
                data: { status: !status ? "pending" : "received" },
              });
            }}
          />
        );
      },
      key: "status",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewDetailModal
              title="Gate Pass Details"
              details={[
                { title: "Person Name", value: details.person_name },
                { title: "Company Name", value: details.company_name },
                {
                  title: "Gate Pass Date",
                  value: dayjs(details.gate_pass_date).format("DD-MM-YYYY"),
                },
                { title: "Status", value: details.status },
                {
                  title: "Is Returnable",
                  value: details.is_returnable ? "Yes" : "No",
                },
                { title: "Address", value: details.address },
              ]}
            />
            {/* <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button> */}
            <DeleteGatePass details={details} />
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
        dataSource={gatePassList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: gatePassList?.rows?.count || 0,
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
          <h3 className="m-0 text-primary">Gate Pass List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          {/* <Flex align="center" gap={10}>
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
          </Flex> */}
          {/* <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          /> */}
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!gatePassList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default GatePassList;
