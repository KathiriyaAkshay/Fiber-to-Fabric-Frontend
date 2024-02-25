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
import { downloadUserPdf } from "../../../lib/pdf/userPdf";
import dayjs from "dayjs";
import { useCurrentUser } from "../../../api/hooks/auth";
import { useCompanyList } from "../../../api/hooks/company";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";

const roleId = USER_ROLES.ACCOUNTANT_USER.role_id;

function AccountantUserList() {
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();

  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: userListRes, isLoading } = useQuery({
    queryKey: ["users", "accountant_user", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getAccountantUserListRequest({
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
    navigate("/user-master/my-accountant/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/my-accountant/update/${id}`);
  }

  function downloadPdf() {
    if (!user) return;
    const companyName = companyListRes?.rows?.[0]?.company_name;
    const {
      first_name = "YASH",
      last_name = "PATEL",
      address = "SURAT",
      mobile = "+918980626669",
      gst_no = "GST123456789000",
    } = user;
    const leftContent = `
    Name:- ${first_name} ${last_name}
    Address:- ${address}
    Created Date:- ${dayjs().format("DD-MM-YYYY")}
    `;

    const rightContent = `
    Company Name:- ${companyName}
    Company Contact:- ${mobile}
    GST No.:- ${gst_no}
    `;

    const body = userListRes?.accountantUserList?.rows?.map((user) => {
      const { id, first_name, last_name, mobile, email, address } = user;
      return [id, first_name, last_name, mobile, email, address];
    });

    downloadUserPdf({
      body,
      head: [
        ["ID", "First Name", "Last Name", "Contact No", "Email", "Address"],
      ],
      leftContent,
      rightContent,
      title: "Accountant Users List",
    });
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
      title: "Address",
      dataIndex: "address",
      key: "address",
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
