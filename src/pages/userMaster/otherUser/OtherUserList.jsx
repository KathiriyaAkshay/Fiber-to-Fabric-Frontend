import {
  Button,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Typography,
  message,
} from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
  getOtherUserListRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { ROLE_ID_USER_TYPE_MAP } from "../../../constants/userRole";
// import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
// import { useCurrentUser } from "../../../api/hooks/auth";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";
import { capitalizeFirstCharacter } from "../../../utils/mutationUtils";

// const roleId = USER_ROLES.SUPERVISOR.role_id;

const OtherUserList = () => {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(true);

  const debouncedSearch = useDebounce(search, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const {
    data: userListRes,
    isLoading,
    refetch: refetchUserList,
  } = useQuery({
    queryKey: [
      "other-user",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
        is_active: status,
      },
    ],
    queryFn: async () => {
      const res = await getOtherUserListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          is_active: status ? 1 : 0,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
    placeholderData: keepPreviousData,
  });

  const {
    mutateAsync: updateUser,
    isPending: updatingUser,
    variables,
  } = useMutation({
    mutationFn: async ({ roleId, userId, data }) => {
      const res = await updateUserRequest({
        roleId,
        userId,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["users", "update"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      refetchUserList();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  function navigateToAdd() {
    navigate("/user-master/other-user/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/other-user/update/${id}`);
  }

  // function downloadPdf() {
  //   // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

  //   const body = supervisorListRes?.supervisorList?.rows?.map((supervisor) => {
  //     const { id, first_name, last_name, adhar_no, mobile, email } = supervisor;
  //     return [id, first_name, last_name, adhar_no, mobile, email];
  //   });

  //   const tableTitle = [
  //     "ID",
  //     "First Name",
  //     "Last Name",
  //     "Adhaar No",
  //     "Contact No",
  //     "Email",
  //   ];

  //   // Set localstorage item information
  //   localStorage.setItem("print-array", JSON.stringify(body));
  //   localStorage.setItem("print-title", "Supervisor List");
  //   localStorage.setItem("print-head", JSON.stringify(tableTitle));
  //   localStorage.setItem("total-count", "0");

  //   // downloadUserPdf({
  //   //   body,
  //   //   head: [
  //   //     ["ID", "First Name", "Last Name", "Adhaar No", "Contact No", "Email"],
  //   //   ],
  //   //   leftContent,
  //   //   rightContent,
  //   //   title: "Supervisor List",
  //   // });

  //   window.open("/print");
  // }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Name",
      render: (text, record) => `${record?.first_name} ${record?.last_name}`,
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
    // {
    //   title: "Company Name",
    //   dataIndex: "adhar_no",
    //   key: "adhar_no",
    // },
    {
      title: "Role",
      dataIndex: "role_id",
      key: "role_id",
      render: (text) => capitalizeFirstCharacter(ROLE_ID_USER_TYPE_MAP[text]),
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
          address,
          role_id,
          username,
        } = userDetails;
        return (
          <Space>
            <ViewDetailModal
              title="User Details"
              details={[
                { title: "First Name", value: first_name },
                { title: "Last Name", value: last_name },
                {
                  title: "Role",
                  value: capitalizeFirstCharacter(
                    ROLE_ID_USER_TYPE_MAP[role_id]
                  ),
                },
                // { title: "Company Name", value: username },
                {
                  title: "Email",
                  value: email,
                },
                { title: "User Name", value: username },
                { title: "Mobile No", value: mobile },
                { title: "Address", value: address },
                { title: "Assign Taka Number", value: "-" },
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
        const { is_active, id, role_id } = userDetails;
        return (
          <Switch
            loading={updatingUser && variables?.userId === id}
            defaultChecked={is_active}
            onChange={(is_active) => {
              updateUser({
                roleId: role_id,
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
        dataSource={userListRes?.userList || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: userListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{
          overflow: "auto",
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">User List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" justify="flex-end" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Status
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select status"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              value={status}
              onChange={setStatus}
              options={[
                { value: true, label: "Active" },
                { value: false, label: "Deactive" },
              ]}
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {/* <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!supervisorListRes?.supervisorList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          /> */}
          </Flex>
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default OtherUserList;
