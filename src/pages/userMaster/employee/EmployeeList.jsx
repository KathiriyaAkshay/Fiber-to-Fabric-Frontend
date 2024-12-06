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
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getEmployeeListRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { SALARY_TYPE_LIST, USER_ROLES } from "../../../constants/userRole";
// import { useCurrentUser } from "../../../api/hooks/auth";
// import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import dayjs from "dayjs";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";
import { capitalizeFirstCharacter } from "../../../utils/mutationUtils";

const roleId = USER_ROLES.EMPLOYEE.role_id;

function EmployeeList() {
  const [search, setSearch] = useState();
  const [salaryType, setSalaryType] = useState();
  const [status, setStatus] = useState();
  const debouncedSearch = useDebounce(search, 500);
  const debouncedSalaryType = useDebounce(salaryType, 500);
  const debouncedStatus = useDebounce(status, 500);
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  // const { data: user } = useCurrentUser();

  const { data: userListRes, isLoading } = useQuery({
    queryKey: [
      "employee",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
        salary_type: debouncedSalaryType,
        status: debouncedStatus,
      },
    ],
    queryFn: async () => {
      const res = await getEmployeeListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          salary_type: debouncedSalaryType,
          status: debouncedStatus,
        },
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
    navigate("/user-master/my-employee/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/my-employee/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = userListRes?.empoloyeeList?.rows?.map((user) => {
      const { id, first_name, last_name, mobile, username } = user;
      return [id, first_name, last_name, mobile, username];
    });

    let tableTitle = [
      "ID",
      "First Name",
      "Last Name",
      "Contact No",
      "Username",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Employee List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [["ID", "First Name", "Last Name", "Contact No", "Username"]],
    //   leftContent,
    //   rightContent,
    //   title: "Employee List",
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
      key: "username",
    },
    {
      title: "Employee name",
      dataIndex: "first_name",
      key: "first_name",
      render: (text, record) =>
        `${record?.first_name} ${record?.last_name} | ( ${record?.username} )`,
    },
    {
      title: "Employee Type",
      dataIndex: ["employer", "employee_type", "employee_type"],
      key: "employee_type",
    },
    {
      title: "Salary Type",
      dataIndex: ["employer", "salary_type"],
      key: "salary_type",
      render: (text) => capitalizeFirstCharacter(text),
    },
    {
      title: "Contact No",
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Action",
      render: (userDetails) => {
        const {
          first_name,
          last_name,
          mobile,
          username,
          employer = {},
        } = userDetails;
        const {
          tds,
          employee_type: { employee_type = "" },
          salary,
          salary_type,
          joining_date,
          company: { company_name = "" },
        } = employer;
        return (
          <Space>
            <ViewDetailModal
              title="Employee Details"
              details={[
                { title: "Name", value: `${first_name} ${last_name}` },
                { title: "Contact Number", value: mobile },
                { title: "Username", value: username },
                { title: "TDS", value: tds },
                { title: "Salary", value: `₹${salary}` },
                {
                  title: "Employee Type",
                  value: employee_type,
                },
                { title: "Salary Type", value: salary_type },
                {
                  title: "Joining Date",
                  value: dayjs(joining_date).format("DD/MM/YYYY"),
                },
                { title: "Company", value: company_name },
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
        dataSource={userListRes?.empoloyeeList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: userListRes?.empoloyeeList?.count || 0,
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
          <h3 className="m-0 text-primary">Employee List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Salary Type
            </Typography.Text>
            <Select
              placeholder="Select Salary Type"
              loading={isLoading}
              options={SALARY_TYPE_LIST}
              value={salaryType}
              onChange={setSalaryType}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              allowClear={true}
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Status
            </Typography.Text>
            <Select
              placeholder="Select status"
              loading={isLoading}
              options={[
                { label: "Active", value: 1 },
                { label: "Inactive", value: 0 },
              ]}
              value={status}
              onChange={setStatus}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!userListRes?.empoloyeeList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default EmployeeList;
