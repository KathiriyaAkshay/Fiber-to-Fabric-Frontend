import { useState } from "react";
import { Button, Flex, Space, Spin, Table, Tag } from "antd";
import {
  FileExcelFilled,
  FilePdfFilled,
  FileTextOutlined,
} from "@ant-design/icons";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { usePagination } from "../../../../hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { saleJobWorkChallanListRequest } from "../../../../api/requests/sale/challan/challan";
import JobWorkSaleChallanModel from "../../../../components/sale/challan/jobwork/JobSaleChallan";
import dayjs from "dayjs";
import PrintJobWorkChallan from "../../../../components/sale/challan/jobwork/printJobWorkChallan";
import * as XLSX from "xlsx";
import PartialPaymentInformation from "../../../../components/accounts/payment/partialPaymentInformation";


const JobWorkBillList = () => {
  const { companyId, financialYearEnd } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [jobWorkSaleChallanModel, setJobWorkSaleChallanModel] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });

  const handleCloseModal = () => {
    setJobWorkSaleChallanModel((prev) => ({
      ...prev,
      isModalOpen: false,
      mode: "",
    }));
  };

  const {
    data: saleJobWorkChallanListData,
    isLoading: isLoadingSaleJobWorkData,
  } = useQuery({
    queryKey: [
      "sale/challan/job-work/list",
      {
        company_id: companyId,
        page,
        pageSize,
        end: financialYearEnd,
        bill_status: "confirmed",
      },
    ],
    queryFn: async () => {
      const res = await saleJobWorkChallanListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          end: financialYearEnd,
          bill_status: "confirmed",
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
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (text) => moment(text).format("DD-MM-YYYY"),
    },
    {
      title: "Party Company name",
      dataIndex: ["supplier", "supplier_company"],
    },
    {
      title: "Challan No",
      render: (record) => {
        return `${record.challan_no}`;
      },
    },
    {
      title: "Yarn Company",
      dataIndex: ["yarn_stock_company", "yarn_company_name"],
    },
    {
      title: "Dennier",
      dataIndex: ["yarn_stock_company"],
      render: (text) =>
        `${text?.yarn_count}C/${text?.filament}F - ( ${text?.yarn_type}(${text?.yarn_Sub_type}) - ${text?.yarn_color} )`,
    },
    {
      title: "KG",
      dataIndex: "kg",
      key: "kg",
    },
    {
      title: "Rate",
      dataIndex: ["job_work_bill"],
      render: (text) => <>{text?.rate}</>,
    },
    {
      title: "Amount",
      dataIndex: ["job_work_bill", "amount"],
    },
    {
      title: "Due Date",
      render: (record) => {
        return dayjs(record?.job_work_bill?.due_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Due Days",
      render: (text, record) => {
        const currentDate = new Date();
        const targetDate = new Date(record?.job_work_bill?.due_date);

        if (currentDate < targetDate) {
          return <div>0</div>;
        } else {
          const differenceInMilliseconds = currentDate - targetDate;
          const millisecondsInADay = 24 * 60 * 60 * 1000;
          const daysDifference = Math.floor(
            differenceInMilliseconds / millisecondsInADay
          );
          return <div style={{
            color: daysDifference == 0?"#000":"red",
            fontWeight: 600
          }}>{`+${daysDifference}D`}</div>;
        }
      },
    },
    {
      title: "Bill Status",
      dataIndex: ["job_work_bill", "is_paid"],
      render: (text,record) => {
        return(
          <div>
            {record?.job_work_bill?.is_partial_payment?<>
              <PartialPaymentInformation
                bill_id={record?.job_work_bill?.id}
                bill_model={"job_work_bill"}
                paid_amount={record?.job_work_bill?.paid_amount}
              />
            </>:<>
              <Tag color = {record?.job_work_bill?.is_paid?"green":"red"}>
                {String(record?.job_work_bill?.is_paid?"Paid":"Un-paid").toUpperCase()}
              </Tag>
            </>}
          </div>
        )
      }
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <Space>
          <PrintJobWorkChallan details={record} />
          <Button
            onClick={() => {
              let MODE;
              if (record.job_work_bill.is_paid) {
                MODE = "VIEW";
              } else {
                MODE = "UPDATE";
              }
              setJobWorkSaleChallanModel((prev) => {
                return {
                  ...prev,
                  isModalOpen: true,
                  details: record,
                  mode: MODE,
                };
              });
            }}
          >
            <FileTextOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const DownloadOption = async (option) => {
    const tableTitle = [
      "No",
      "Bill Date",
      "Challan No",
      "Party Name",
      "Dennier",
      "HSN No",
      "Kg",
      "Rate",
      "Amount",
      "SGST",
      "CGST",
      "IGST",
      "Net Amount",
    ];

    let temp = [];
    let totalKG = 0;
    let totalAmount = 0;
    let totalNetAmount = 0;

    saleJobWorkChallanListData?.list?.map((element, index) => {
      totalKG = totalKG + Number(element?.kg);
      totalAmount = totalAmount + Number(element?.job_work_bill?.amount);
      totalNetAmount =
        totalNetAmount + Number(element?.job_work_bill?.net_amount);

      temp.push([
        index + 1,
        moment(element?.bill_date).format("DD-MM-YYYY"),
        element?.challan_no,
        element?.supplier?.supplier_company,
        `${element?.yarn_stock_company?.yarn_count}C/${element?.yarn_stock_company?.filament}F - ( ${element?.yarn_stock_company?.yarn_type}(${element?.yarn_stock_company?.yarn_Sub_type}) - ${element?.yarn_stock_company?.yarn_color} )`,
        element?.yarn_stock_company?.hsn_no,
        element?.kg,
        element?.job_work_bill?.rate,
        element?.job_work_bill?.amount,
        element?.job_work_bill?.SGST_amount,
        element?.job_work_bill?.CGST_amount,
        element?.job_work_bill?.IGST_amount,
        element?.job_work_bill?.net_amount,
      ]);

      let total = [
        "",
        "",
        "",
        "",
        "",
        "",
        totalKG,
        "",
        totalAmount,
        "",
        "",
        "",
        totalNetAmount,
      ];

      localStorage.setItem("print-title", "Job Work Bill List");
      localStorage.setItem("print-head", JSON.stringify(tableTitle));
      localStorage.setItem("print-array", JSON.stringify(temp));
      localStorage.setItem("total-count", "1");
      localStorage.setItem("total-data", JSON.stringify(total));

      if (option == "pdf") {
        window.open("/print");
      } else {
        let data = [tableTitle, ...temp, total];
        let worksheet = XLSX.utils.aoa_to_sheet(data);
        let workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Job work");

        // Export to Excel file
        const dateString = moment().format("YYYY-MMD-D_HH:mm:ss");
        const fileName = `job_work_${dateString}.xlsx`;
        XLSX.writeFile(workbook, fileName);
      }
    });
  };

  function renderTable() {
    if (isLoadingSaleJobWorkData) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14"></div>
        </Spin>
      );
    }

    return (
      <Table
        dataSource={saleJobWorkChallanListData?.list || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: saleJobWorkChallanListData?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          if (saleJobWorkChallanListData?.list?.length == 0) return;
          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  {saleJobWorkChallanListData?.total_kg || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell>
                  {saleJobWorkChallanListData?.total_amount || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }
  return (
    <>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Job Work Sale Bill List</h3>
          </div>
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Button
                type="primary"
                icon={<FilePdfFilled />}
                disabled={!saleJobWorkChallanListData?.list?.length}
                onClick={() => {
                  DownloadOption("pdf");
                }}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Button
                icon={<FileExcelFilled />}
                disabled={!saleJobWorkChallanListData?.list?.length}
                onClick={() => {
                  DownloadOption("excel");
                }}
              />
            </Flex>
          </Flex>
        </div>

        {renderTable()}
      </div>

      {jobWorkSaleChallanModel.isModalOpen && (
        <JobWorkSaleChallanModel
          details={jobWorkSaleChallanModel.details}
          isModelOpen={jobWorkSaleChallanModel.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={"UPDATE"}
        />
      )}
    </>
  );
};

export default JobWorkBillList;
