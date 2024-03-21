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
  getSupplierListRequest,
  updateUserRequest,
} from "../../../api/requests/users";
import { USER_ROLES } from "../../../constants/userRole";
import { useCurrentUser } from "../../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import useDebounce from "../../../hooks/useDebounce";

const { Text } = Typography;

const roleId = USER_ROLES.SUPPLIER.role_id;

function SupplierList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const { data: userListRes, isLoading } = useQuery({
    queryKey: [
      "supplier",
      "list",
      { company_id: companyId, page, pageSize, search: debouncedSearch },
    ],
    queryFn: async () => {
      const res = await getSupplierListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
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
    navigate("/user-master/my-supplier/add");
  }

  function navigateToUpdate(id) {
    navigate(`/user-master/my-supplier/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = userListRes?.supplierList?.rows?.map((user) => {
      const { id, supplier, address, gst_no, supplier_types } = user;
      const { supplier_name, supplier_company, hsn_code } = supplier;
      return [
        id,
        supplier_name,
        supplier_company,
        address,
        gst_no,
        hsn_code,
        supplier_types?.map((s) => s?.type)?.join(", "),
      ];
    });

    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Name",
          "Company Name",
          "Address",
          "GST No",
          "HSN Code",
          "Supplier Type",
        ],
      ],
      leftContent,
      rightContent,
      title: "Supplier List",
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
      title: "Name",
      dataIndex: ["supplier", "supplier_name"],
      key: "supplier_name",
    },
    {
      title: "Company Name",
      dataIndex: ["supplier", "supplier_company"],
      key: "supplier_company",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "GST No",
      dataIndex: "gst_no",
      key: "gst_no",
    },
    {
      title: "HSN Code",
      dataIndex: ["supplier", "hsn_code"],
      key: "hsn_code",
    },
    {
      title: "Supplier Type",
      render: (userDetails) => {
        const { supplier_types } = userDetails;
        return <Text>{supplier_types?.map((s) => s?.type)?.join(", ")}</Text>;
      },
      key: "supplier_type",
    },
    {
      title: "Action",
      render: (userDetails) => {
        const {
          address,
          gst_no,
          mobile,
          supplier_types = [],
          supplier,
        } = userDetails;
        const {
          broker = {},
          supplier_name,
          supplier_company,
          hsn_code,
        } = supplier;
        const { first_name, last_name } = broker;
        return (
          <Space>
            <ViewDetailModal
              title="Supplier Details"
              details={[
                { title: "Broker Name", value: `${first_name} ${last_name}` },
                { title: "Supplier Name", value: supplier_name },
                { title: "Supplier Address", value: address },
                { title: "Supplier GST No", value: gst_no },
                {
                  title: "Supplier Company Name",
                  value: supplier_company,
                },
                { title: "Supplier Mobile No", value: mobile },
                { title: "Supplier HSN Code", value: hsn_code },
                {
                  title: "Supplier Type",
                  value: supplier_types?.map((s) => s?.type)?.join(", "),
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
        dataSource={userListRes?.supplierList?.rows || []}
        columns={columns}
        rowKey={(s) => s?.id}
        style={{
          textTransform: "capitalize",
        }}
        pagination={{
          total: userListRes?.supplierList?.count || 0,
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
          <h3 className="m-0 text-primary">Supplier List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!userListRes?.supplierList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default SupplierList;
