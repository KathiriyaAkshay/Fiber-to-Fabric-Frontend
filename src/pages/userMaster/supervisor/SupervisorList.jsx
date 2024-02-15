import { Button, Space, Spin, Switch, Table, message } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getSupervisorListRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import ViewSupervisorDetailModal from "../../../components/userMaster/supervisor/ViewSupervisorDetailModal";
import { USER_ROLES } from "../../../constants/userRole";
import { downloadUserPdf } from "../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../api/hooks/auth";
import dayjs from "dayjs";
import { useCompanyList } from "../../../api/hooks/company";

const roleId = USER_ROLES.SUPERVISOR.role_id;

function SupervisorList() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: supervisorListRes, isLoading } = useQuery({
    queryKey: ["supervisor", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getSupervisorListRequest({
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
    navigate("/user-master/my-supervisor/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/my-supervisor/update/${id}`);
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

    const body = supervisorListRes?.supervisorList?.rows?.map((supervisor) => {
      const { id, first_name, last_name, adhar_no, mobile, email } = supervisor;
      return [id, first_name, last_name, adhar_no, mobile, email];
    });

    downloadUserPdf({
      body,
      head: [
        ["ID", "First Name", "Last Name", "Adhaar No", "Contact No", "Email"],
      ],
      leftContent,
      rightContent,
      title: "Supervisor List",
    });
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
      render: (userDetails) => {
        return (
          <Space>
            <ViewSupervisorDetailModal userDetails={userDetails} />
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
        dataSource={supervisorListRes?.supervisorList?.rows || []}
        columns={columns}
        rowKey={"id"}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0">Supervisor List</h2>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!supervisorListRes?.supervisorList?.rows?.length}
          onClick={downloadPdf}
        />
      </div>
      {renderTable()}
    </div>
  );
}

export default SupervisorList;
