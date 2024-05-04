import { Button, Flex, Select, Spin, Table, Typography } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import { getJobYarnStockReportListRequest } from "../../../../api/requests/job/reports/jobYarnStockReport";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import dayjs from "dayjs";

const JobYarnStockReportList = () => {
  const [supplier, setSupplier] = useState();
  const debouncedSupplier = useDebounce(supplier, 500);
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const { data: jobYarnStockReportList, isLoading } = useQuery({
    queryKey: [
      "jobYarnStockReportList",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        supplier_name: debouncedSupplier,
      },
    ],
    queryFn: async () => {
      const res = await getJobYarnStockReportListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          supplier_name: debouncedSupplier,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/job/report/job-yarn-stock-report/add");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Last Updated",
      render: (detail) => {
        return dayjs(detail.updatedAt).format("DD-MM-YYYY");
      },
    },
    {
      title: "Quality Name",
      render: (detail) => {
        return `${detail.inhouse_quality.quality_name} - (${detail.inhouse_quality.quality_weight}KG)`;
      },
    },
    {
      title: "Grey Stock(Meter)",
      dataIndex: "gray_stock_meter",
      key: "gray_stock_meter",
    },
    {
      title: "Yarn Stock(kg)",
      dataIndex: "yarn_stock_total_kg",
      key: "yarn_stock_total_kg",
    },
    {
      title: "Beam Stock",
      dataIndex: "beam_stock",
      key: "beam_stock",
    },
    {
      title: "Mtr in Process",
      dataIndex: "production_type",
      key: "production_type",
    },
    {
      title: "Yarn Process",
      dataIndex: "production_type",
      key: "production_type",
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
        dataSource={jobYarnStockReportList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: jobYarnStockReportList?.rows?.count || 0,
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
          <h3 className="m-0 text-primary">Job Grey-Yarn Report</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Supplier
            </Typography.Text>
            <Select
              placeholder="Select supplier"
              loading={isLoadingDropdownSupplierList}
              options={dropdownSupplierListRes?.map((supervisor) => ({
                label: supervisor?.supplier_name,
                value: supervisor?.supplier_name,
              }))}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              value={supplier}
              onChange={setSupplier}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default JobYarnStockReportList;
