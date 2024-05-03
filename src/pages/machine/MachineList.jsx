import { Button, Space, Spin, Switch, Table, message } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCompanyMachineListRequest,
  updateMachineRequest,
} from "../../api/requests/machine";
// import DeleteMachine from "../../components/machine/DeleteMachine";
import ViewDetailModal from "../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../hooks/usePagination";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useContext } from "react";

function MachineList() {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: [
      `machine/list/${companyId}`,
      { company_id: companyId, page, pageSize },
    ],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId, page, pageSize },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const {
    mutateAsync: updateMachine,
    isPending: updatingMachine,
    variables,
  } = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateMachineRequest({
        id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["machine", "update"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
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
            render: (text, record, index) => ((page*pageSize) + index) + 1,
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
            {/* <DeleteMachine details={machineDetails} /> */}
          </Space>
        );
      },
      key: "action",
    },
    {
      title: "Status",
      render: (data) => {
        const { is_active = false, id } = data;
        return (
          <Switch
            loading={updatingMachine && variables?.userId === id}
            defaultChecked={is_active}
            onChange={(is_active) => {
              updateMachine({
                id: id,
                data: { is_active: is_active },
              });
            }}
          />
        );
      },
      key: "status",
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
        pagination={{
          total: machineListRes?.machineList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center gap-5">
        <h3 className="m-0 text-primary">Machine List</h3>
        <Button onClick={navigateToAdd} icon={<PlusCircleOutlined />} />
      </div>
      {renderTable()}
    </div>
  );
}

export default MachineList;
