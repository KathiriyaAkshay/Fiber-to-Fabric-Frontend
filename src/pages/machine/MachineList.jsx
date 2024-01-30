import { Button, Space, Spin, Table } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ViewMachineDetailModal from "../../components/machine/ViewMachineDetailModal";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import { getCompanyListRequest } from "../../api/requests/company";
import DeleteMachine from "../../components/machine/DeleteMachine";

function MachineList() {
  const navigate = useNavigate();

  const { data: companyListRes } = useQuery({
    queryKey: ["company", "list"],
    queryFn: async () => {
      const res = await getCompanyListRequest({});
      return res.data?.data;
    },
  });

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "List", companyId],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({ companyId, config: {} });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/machine/add");
  }

  function navigateToUpdate(id) {
    navigate(`/machine/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Machine Name",
      dataIndex: "machine_name",
      key: "machine_name",
    },
    {
      title: "No of Machine",
      dataIndex: "no_of_machines",
      key: "no_of_machines",
    },
    {
      title: "No of Employee",
      dataIndex: "no_of_employees",
      key: "no_of_employees",
    },
    {
      title: "Machine Type",
      dataIndex: "machine_type",
      key: "machine_type",
    },
    {
      title: "Action",
      render: (machineDetails) => {
        return (
          <Space>
            <ViewMachineDetailModal details={machineDetails} />
            <Button
              onClick={() => {
                navigateToUpdate(machineDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteMachine details={machineDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoadingMachineList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={machineListRes?.machineList?.rows || []}
        columns={columns}
        rowKey={"id"}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <h2 className="m-0">Machine List</h2>
        <Button onClick={navigateToAdd}>
          <PlusCircleOutlined />
        </Button>
      </div>
      {renderTable()}
    </div>
  );
}

export default MachineList;
