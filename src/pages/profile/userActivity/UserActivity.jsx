import { DatePicker, Flex, Input, Select, Spin, Table, Typography } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getUserActivityRequest } from "../../../api/requests/activity";
import dayjs from "dayjs";
import { ROLE_ID_USER_TYPE_MAP } from "../../../constants/userRole";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";
import { USER_ACTIVITY_ACTION_TYPE_LIST } from "../../../constants/userActivity";

function UserActivity() {
  const { companyId } = useContext(GlobalContext);
  const [username, setUsername] = useState();
  const debouncedUsername = useDebounce(username, 500);
  const [toDate, setToDate] = useState();
  const debouncedToDate = useDebounce(
    toDate && dayjs(toDate).format("YYYY-MM-DD"),
    500
  );
  const [fromDate, setFromDate] = useState();
  const debouncedFromDate = useDebounce(
    fromDate && dayjs(fromDate).format("YYYY-MM-DD"),
    500
  );
  const [actionSearch, setActionSearch] = useState();
  const debouncedActionSearch = useDebounce(actionSearch, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: userActivityListRes, isLoading } = useQuery({
    queryKey: [
      "user_activity/list",
      {
        company_id: companyId,
        pageSize: pageSize,
        page: page,
        username: debouncedUsername,
        toDate: debouncedToDate,
        fromDate: debouncedFromDate,
        action: debouncedActionSearch,
      },
    ],
    queryFn: async () => {
      const res = await getUserActivityRequest({
        params: {
          company_id: companyId,
          pageSize: pageSize,
          page: page,
          username: debouncedUsername,
          toDate: debouncedToDate,
          fromDate: debouncedFromDate,
          action: debouncedActionSearch,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Date Time",
      key: "createdAt",
      render: ({ createdAt }) => {
        return dayjs(createdAt).format("DD-MM-YYYY hh:mm:ss A");
      },
    },
    {
      title: "User",
      render: ({ user = {} }) => {
        return `${user?.first_name} ${user?.last_name}`;
      },
      key: "user",
    },
    {
      title: "User Type",
      render: ({ user = {} }) => {
        return (
          <span className="capitalize">
            {ROLE_ID_USER_TYPE_MAP[user?.role_id] || "User"}
          </span>
        );
      },
      key: "role_id",
    },
    {
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
  ];

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Userwise Activity</h3>
        </div>
        <Flex align="center" gap={10} wrap="wrap">
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={fromDate}
              onChange={setFromDate}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={toDate}
              onChange={setToDate}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Action
            </Typography.Text>
            <Select
              placeholder="Action"
              options={USER_ACTIVITY_ACTION_TYPE_LIST}
              value={actionSearch}
              onChange={setActionSearch}
              className="min-w-40"
              allowClear={true}
            />
          </Flex>

          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "200px",
            }}
          />
        </Flex>
      </div>
      <Spin spinning={isLoading}>
        <Table
          dataSource={userActivityListRes?.rows || []}
          columns={columns}
          rowKey={"id"}
          pagination={{
            current: page + 1,
          pageSize: pageSize,
            total: userActivityListRes?.count || 0,
            showSizeChanger: true,
            onShowSizeChange: onShowSizeChange,
            onChange: onPageChange,
          }}
        />
      </Spin>
    </div>
  );
}

export default UserActivity;
