import { Table } from "antd";
import { useQuery } from "@tanstack/react-query";
import { getUserActivityRequest } from "../../../api/requests/activity";
import dayjs from "dayjs";
import { ROLE_ID_USER_TYPE_MAP } from "../../../constants/userRole";
import { usePagination } from "../../../hooks/usePagination";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";

function UserActivity() {
  const { companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: userActivityListRes } = useQuery({
    queryKey: [
      "user_activity",
      "list",
      { company_id: companyId, pageSize: pageSize, page: page },
    ],
    queryFn: async () => {
      const res = await getUserActivityRequest({
        params: { company_id: companyId, pageSize: pageSize, page: page },
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
      <div className="flex items-center gap-5">
        <h3 className="m-0 text-primary">Userwise Activity</h3>
      </div>
      <Table
        dataSource={userActivityListRes?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: userActivityListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
      />
    </div>
  );
}

export default UserActivity;
