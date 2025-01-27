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
import { getDisplayQualityName } from "../../../../constants/nameHandler";
import { JOB_SUPPLIER_TYPE } from "../../../../constants/supplier";

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
    queryKey: ["dropdown/supplier/list", { company_id: companyId, supplier_type: JOB_SUPPLIER_TYPE }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId, supplier_type: JOB_SUPPLIER_TYPE },
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
      render: (details) => {
        return(
          <div style={{
            fontSize: 13
          }}>
            {getDisplayQualityName(details?.inhouse_quality)}
          </div>
        )
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
      render: (text, record) => "-",
    },
    {
      title: "Yarn Process",
      dataIndex: "production_type",
      key: "production_type",
      render: (text, record) => "-",
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
          current: page + 1,
          pageSize: pageSize,
          total: jobYarnStockReportList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(pageData) => {
          console.log({ pageData });
          let totalGreyStockMeter = 0;
          let totalBeamStock = 0;
          let totalYarnStock = 0;

          pageData.forEach(
            ({ gray_stock_meter, yarn_stock_total_kg, beam_stock }) => {
              totalGreyStockMeter += gray_stock_meter;
              totalBeamStock += beam_stock;
              totalYarnStock += yarn_stock_total_kg;
            }
          );

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>Grand Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}></Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <b>{parseFloat(jobYarnStockReportList?.total_stock_meter).toFixed(2) || 0}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <b>{parseFloat(jobYarnStockReportList?.total_yarn_stock_kgs).toFixed(2) || 0}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>
                <b>{parseFloat(jobYarnStockReportList?.total_beam_stocks).toFixed(2) || 0}</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6}></Table.Summary.Cell>
              <Table.Summary.Cell index={6}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
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
