import { Button, Space, Spin, Table } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ViewMachineDetailModal from "../../components/machine/ViewMachineDetailModal";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import { getCompanyListRequest } from "../../api/requests/company";

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
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Adhaar No",
      dataIndex: "adhar_no",
      key: "adhar_no",
    },
    {
      title: "Contact No",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    // {
    //   title: "Address",
    //   dataIndex: "address",
    //   key: "address",
    // },
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
