import { Button, Space, Spin, Table } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import DeleteMachine from "../../components/machine/DeleteMachine";
import { useCompanyList } from "../../api/hooks/company";
import ViewDetailModal from "../../components/common/modal/ViewDetailModal";

function MachineList() {
  const navigate = useNavigate();

  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", companyId],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
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
        const { machine_name, no_of_machines, no_of_employees, machine_type } =
          machineDetails;
        return (
          <Space>
            <ViewDetailModal
              title="Machine Details"
              details={[
                { title: "Machine Name", value: machine_name },
                { title: "Machine No", value: no_of_machines },
                { title: "No of Employee", value: no_of_employees },
                { title: "Machine Type", value: machine_type },
              ]}
            />
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
        <h3 className="m-0 text-primary">Machine List</h3>
        <Button onClick={navigateToAdd}>
          <PlusCircleOutlined />
        </Button>
      </div>
      {renderTable()}
    </div>
  );
}

export default MachineList;
