import { useState } from "react";
import { Button, Space, Spin, Table, Tag } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { usePagination } from "../../../../hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import {
  //   getSaleJobWorkBillListRequest,
  saleJobWorkChallanListRequest,
} from "../../../../api/requests/sale/challan/challan";
import JobWorkSaleChallanModel from "../../../../components/sale/challan/jobwork/JobSaleChallan";
import dayjs from "dayjs";
import PrintJobWorkChallan from "../../../../components/sale/challan/jobwork/printJobWorkChallan";

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
      "sale/challan/yarn-sale/list",
      {
        company_id: companyId,
        page,
        pageSize,
        end: financialYearEnd,
        bill_status: "confirmed"
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
          bill_status: "confirmed"
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
      render: (text) => (
        <>
          {text?.rate}
        </>
      ),
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
        const date1 = new Date(record?.createdAt) ; 
        const date2 = new Date(record?.job_work_bill?.due_date) ;
        const difference = date2 - date1 ;  
        return(
          <div>
            {difference}
          </div>
        )
      }
    },
    {
      title: "Bill Status",
      dataIndex: ["job_work_bill", "is_paid"],
      render: (text) =>
        text ? <Tag color="green">Paid</Tag> : <Tag color="red">Un-Paid</Tag>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <Space>
          <PrintJobWorkChallan details={record} />
          {/* <Button
            onClick={() => {
              navigation(`/sales/challan/job-work/update/${record?.id}`);
            }}
          >
            <EditOutlined />
          </Button>
          <DeleteJobWorkChallan details={record} /> */}
          {/* <JobWorkSaleChallanModel jobSaleDetails={record} /> */}
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
