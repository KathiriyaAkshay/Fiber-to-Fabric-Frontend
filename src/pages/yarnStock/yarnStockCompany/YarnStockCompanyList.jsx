import { Button, Space, Spin, Switch, Table, message } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getYarnStockCompanyListRequest,
  updateYarnStockCompanyRequest,
} from "../../../api/requests/yarnStock";
import DeleteYarnStockCompany from "../../../components/yarnStock/yarnStockCompany/DeleteYarnStockCompany";
import { usePagination } from "../../../hooks/usePagination";
import { useContext } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import moment from 'moment';

function YarnStockCompanyList() {
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { companyId } = useContext(GlobalContext);

  const { data: ysCompanyListRes, isLoading: isLoadingYSCompanyList } =
    useQuery({
      queryKey: [
        "yarn-stock",
        "company",
        "list",
        { company_id: companyId, page, pageSize },
      ],
      queryFn: async () => {
        const res = await getYarnStockCompanyListRequest({
          companyId,
          params: { company_id: companyId, page, pageSize },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const {
    mutateAsync: updateYSCompany,
    isPending: updatingYSCompany,
    variables,
  } = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await updateYarnStockCompanyRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["yarn-stock", "company", "update"],
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
    navigate("/yarn-stock-company/company-list/add");
  }

  function navigateToUpdate(id) {
    navigate(`/yarn-stock-company/company-list/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
            render: (text, record, index) => ((page*pageSize) + index) + 1,
    },
    {
      title: "Company Name",
      dataIndex: "yarn_company_name",
      key: "yarn_company_name",
    },
    {
      title: "Stock date",
      dataIndex: "stock_date",
      key: "yarn_company_name",
      render: (text, record) => (
        moment(text).format("DD-MM-YYYY HH:MM:SS") 
      )
    },
    {
      title: "Yarn/Fiber Type",
      key: "yarn_type",
      render: (yscDetails) => {
        const { yarn_type = "", yarn_Sub_type = "" } = yscDetails;
        if (yarn_Sub_type) {
          return `${yarn_type} (${yarn_Sub_type})`;
        }
        return yarn_type;
      },
    },
    {
      title: "Denier / Count",
      key: "yarn_denier",
      render: (yscDetails) => {
        const {
          yarn_denier = 0,
          yarn_count = 0,
          yarn_color = "",
          luster_type = "",
        } = yscDetails;
        return `${Math.ceil(yarn_denier)}D / ${Math.ceil(
          yarn_count
        )}C (${yarn_color} - ${luster_type})`;
      },
    },
    {
      title: "Filament",
      dataIndex: "filament",
      key: "filament",
    },
    {
      title: "HSN No.",
      dataIndex: "hsn_no",
      key: "hsn_no",
    },
    {
      title: "Avg.Stock",
      dataIndex: "avg_daily_stock",
      key: "avg_daily_stock",
    },
    {
      title: "Action",
      render: (yscDetails) => {
        return (
          <Space>
            <Button
              onClick={() => {
                navigateToUpdate(yscDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteYarnStockCompany details={yscDetails} />
          </Space>
        );
      },
      key: "action",
    },

    {
      title: "Status",
      render: (yscDetails) => {
        const { is_active, id } = yscDetails;
        return (
          <Switch
            loading={updatingYSCompany && variables?.id === id}
            defaultChecked={is_active}
            onChange={(is_active) => {
              updateYSCompany({
                id: id,
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
    if (isLoadingYSCompanyList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={ysCompanyListRes?.yarnComanyList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: ysCompanyListRes?.yarnComanyList?.count || 0,
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
          <h3 className="m-0 text-primary">Yarn Companies List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        {/* <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!ysCompanyListRes?.yarnComanyList?.rows?.length}
          onClick={downloadPdf}
        /> */}
      </div>
      {renderTable()}
    </div>
  );
}

export default YarnStockCompanyList;
