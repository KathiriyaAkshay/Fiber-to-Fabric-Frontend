import { Button, Space, Spin, Switch, Table, message } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getBrokerListRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../api/hooks/auth";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";

const roleId = USER_ROLES.BROKER.role_id;

function BrokerList() {
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const { data: userListRes, isLoading } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId, page, pageSize }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id: companyId, page, pageSize },
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
        params: { company_id: companyId },
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
    navigate("/user-master/my-broker/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/my-broker/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = userListRes?.brokerList?.rows?.map((user) => {
      const { id, first_name, last_name, adhar_no, mobile, email } = user;
      return [id, first_name, last_name, adhar_no, mobile, email];
    });

    downloadUserPdf({
      body,
      head: [
        ["ID", "First Name", "Last Name", "Adhaar No", "Contact No", "Email"],
      ],
      leftContent,
      rightContent,
      title: "Broker List",
    });
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
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
    // {
    //   title: "Email",
    //   dataIndex: "email",
    //   key: "email",
    // },
    // {
    //   title: "Address",
    //   dataIndex: "address",
    //   key: "address",
    // },
    {
      title: "Action",
      render: (userDetails) => {
        const {
          first_name,
          last_name,
          mobile,
          email,
          username,
          gst_no,
          pancard_no,
          adhar_no,
          address,
        } = userDetails;

        return (
          <Space>
            <ViewDetailModal
              title="Broker Details"
              details={[
                { title: "Name", value: `${first_name} ${last_name}` },
                { title: "Contact Number", value: mobile },
                { title: "Email", value: email },
                { title: "Username", value: username },
                { title: "GST No", value: gst_no },
                { title: "PAN No", value: pancard_no },
                { title: "Adhaar No", value: adhar_no },
                { title: "Address", value: address },
              ]}
            />
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
        dataSource={userListRes?.brokerList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: userListRes?.brokerList?.count || 0,
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
          <h3 className="m-0 text-primary">Broker List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!userListRes?.brokerList?.rows?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default BrokerList;
