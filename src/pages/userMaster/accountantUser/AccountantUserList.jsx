import { Button, Space, Spin, Switch, Table, message } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAccountantUserListRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
// import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
// import { useCurrentUser } from "../../../api/hooks/auth";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";

const roleId = USER_ROLES.ACCOUNTANT_USER.role_id;

function AccountantUserList() {
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  // const { data: user } = useCurrentUser();

  const { data: userListRes, isLoading } = useQuery({
    queryKey: [
      "users",
      "accountant_user",
      "list",
      { company_id: companyId, page, pageSize },
    ],
    queryFn: async () => {
      const res = await getAccountantUserListRequest({
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
    navigate("/user-master/my-accountant/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/my-accountant/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = userListRes?.accountantUserList?.rows?.map((user) => {
      const { id, first_name, last_name, mobile, email, address } = user;
      return [id, first_name, last_name, mobile, email, address];
    });

    const tableTitle = [
      "ID",
      "First Name",
      "Last Name",
      "Contact No",
      "Email",
      "Address",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Supervisor List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     ["ID", "First Name", "Last Name", "Contact No", "Email", "Address"],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Accountant Users List",
    // });

    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Username",
      dataIndex: "username",
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
      title: "Mobile No.",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "address",
      render: (text) => `₹${text}`,
    },
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
          salary,
        } = userDetails;
        return (
          <Space>
            <ViewDetailModal
              title="Accountant User Details"
              details={[
                { title: "Name", value: `${first_name} ${last_name}` },
                { title: "Contact Number", value: mobile },
                { title: "Email", value: email },
                { title: "Username", value: username },
                { title: "GST No", value: gst_no },
                { title: "PAN No", value: pancard_no },
                { title: "Adhaar No", value: adhar_no },
                { title: "Address", value: address },
                { title: "Salary", value: `₹${salary}` },
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
        dataSource={userListRes?.accountantUserList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: userListRes?.accountantUserList?.count || 0,
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
          <h3 className="m-0 text-primary">Accountant Users List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!userListRes?.accountantUserList?.rows?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default AccountantUserList;
