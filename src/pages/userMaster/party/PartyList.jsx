import {
  Button,
  Flex,
  Input,
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
  getPartyListRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../api/hooks/auth";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useContext, useState } from "react";
import useDebounce from "../../../hooks/useDebounce";

const roleId = USER_ROLES.PARTY.role_id;

function PartyList() {
  const [search, setSearch] = useState("");
  const [dueDay, setDueDay] = useState(undefined);
  const [creditLimitFrom, setCreditLimitFrom] = useState(undefined);
  const [creditLimitTo, setCreditLimitTo] = useState(undefined);
  const [due_day_active, setDueDayActive] = useState();
  const debouncedSearch = useDebounce(search, 500);
  const debouncedDueDay = useDebounce(dueDay, 500);
  const debouncedCreditLimitTo = useDebounce(creditLimitTo, 500);
  const debouncedCreditLimitFrom = useDebounce(creditLimitFrom, 500);
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const { data: userListRes, isLoading } = useQuery({
    queryKey: [
      "party",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
        due_day_active,
        due_day: debouncedDueDay,
        creditLimitFrom: debouncedCreditLimitFrom,
        creditLimitTo: debouncedCreditLimitTo,
      },
    ],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          due_day_active,
          due_day: debouncedDueDay,
          creditLimitFrom: debouncedCreditLimitFrom,
          creditLimitTo: debouncedCreditLimitTo,
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
    navigate("/user-master/my-party/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/my-party/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = userListRes?.partyList?.rows?.map((user) => {
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
      title: "Party List",
    });
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
      title: "Party",
      dataIndex: "party",
      key: "last_name",
      render: (text, record) => `${record?.first_name} ${record?.last_name}`,
    },
    {
      title: "Ourdue day limit",
      dataIndex: ["party", "overdue_day_limit"],
      key: "overdue_day_limit",
    },
    {
      title: "Credit limit",
      dataIndex: ["party", "credit_limit"],
      key: "credit_limit",
      render: (text) => `₹${text}`,
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
    {
      title: "Overdue Days",
      dataIndex: ["party", "due_day_limit_active"],
      render: (text, record) => {
        let is_active = record?.party?.due_day_limit_active;
        let id = record?.id;
        return (
          <Switch
            loading={updatingUser && variables?.userId === id}
            defaultChecked={is_active}
            onChange={(is_active) => {
              updateUser({
                userId: id,
                data: { due_day_limit_active: is_active },
              });
            }}
          />
        );
      },
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
          party,
        } = userDetails;

        return (
          <Space>
            <ViewDetailModal
              title="Party Details"
              details={[
                { title: "Name", value: `${first_name} ${last_name}` },
                { title: "Contact Number", value: mobile },
                { title: "Email", value: email },
                { title: "Username", value: username },
                { title: "GST No", value: gst_no },
                { title: "PAN No", value: pancard_no },
                { title: "Adhaar No", value: adhar_no },
                { title: "Address", value: address },
                { title: "Checker name", value: party?.checker_name },
                { title: "Checker number", value: party?.checker_number },
                { title: "Overdue day limit", value: party?.overdue_day_limit },
                { title: "Credit limit", value: party?.credit_limit },
                { title: "Company name", value: party?.company_name },
                {
                  title: "Company GST number",
                  value: party?.company_gst_number,
                },
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
        dataSource={userListRes?.partyList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: userListRes?.partyList?.count || 0,
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
          <h3 className="m-0 text-primary">Party List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Due Day Active
            </Typography.Text>
            <Switch
              loading={isLoading}
              defaultChecked={due_day_active}
              onChange={(v) => {
                setDueDayActive(v);
              }}
            />
          </Flex>
          <Input
            placeholder="Due Day"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            type="number"
            step={1}
            min={0}
          />
          <Input
            placeholder="Credit Limit From"
            value={creditLimitFrom}
            onChange={(e) => setCreditLimitFrom(e.target.value)}
            type="number"
            step={1}
            min={0}
          />
          <Input
            placeholder="Credit Limit To"
            value={creditLimitTo}
            onChange={(e) => setCreditLimitTo(e.target.value)}
            type="number"
            step={1}
            min={0}
          />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!userListRes?.partyList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default PartyList;
