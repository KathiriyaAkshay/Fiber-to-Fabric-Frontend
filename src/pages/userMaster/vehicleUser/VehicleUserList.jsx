import { Button, Space, Spin, Switch, Table, message } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getVehicleUserListRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { getCompanyListRequest } from "../../../api/requests/company";
import { USER_ROLES } from "../../../constants/userRole";
import ViewVehicleUserDetailModal from "../../../components/userMaster/vehicle-user/ViewVehicleUserDetailModal";

const roleId = USER_ROLES.VEHICLE_USER.role_id;

function VehicleUserList() {
  const navigate = useNavigate();

  const { data: companyListRes } = useQuery({
    queryKey: ["company", "list"],
    queryFn: async () => {
      const res = await getCompanyListRequest({});
      return res.data?.data;
    },
  });

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: userListRes, isLoading } = useQuery({
    queryKey: ["vehicle-user", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getVehicleUserListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const {
    mutateAsync: updateUser,
    isPending: updatingUser,
    variables,
  } = useMutation({
    mutationFn: async ({ userId, data }) => {
      const res = await updateUserRequest({
        roleId,
        userId,
        data,
      });
      return res.data;
    },
    mutationKey: ["users", "update", roleId],
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
    navigate("/user-master/vehicle/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/vehicle/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      render: (userDetails) => {
        const { first_name, last_name } = userDetails;
        return first_name + " " + last_name;
      },
      key: "name",
    },
    {
      title: "Contact No",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Vehicle No",
      dataIndex: ["vehicle", "vehicleNo"],
      key: "vehicleNo",
    },
    {
      title: "Vehicle Name",
      dataIndex: ["vehicle", "vehicleName"],
      key: "vehicleName",
    },
    {
      title: "Rate",
      dataIndex: ["vehicle", "pricePerRate"],
      key: "pricePerRate",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Action",
      render: (userDetails) => {
        return (
          <Space>
            <ViewVehicleUserDetailModal userDetails={userDetails} />
            <Button
              onClick={() => {
                navigateToUpdate(userDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
          </Space>
        );
      },
      key: "action",
    },
    {
      title: "Status",
      render: (userDetails) => {
        const { is_active, id } = userDetails;
        return (
          <Switch
            loading={updatingUser && variables?.userId === id}
            defaultChecked={is_active}
            onChange={(is_active) => {
              updateUser({
                userId: id,
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
    if (isLoading) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={userListRes?.vehicleList?.rows || []}
        columns={columns}
        rowKey={"id"}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <h2 className="m-0">Vehicle User List</h2>
        <Button onClick={navigateToAdd}>
          <PlusCircleOutlined />
        </Button>
      </div>
      {renderTable()}
    </div>
  );
}

export default VehicleUserList;
