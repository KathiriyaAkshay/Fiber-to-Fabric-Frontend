import {
  Button,
  DatePicker,
  Flex,
  Input,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import moment from "moment";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useState, useEffect, useContext } from "react";
import useDebounce from "../../../../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { getReceiveSizeBeamBillListRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";

function SizeBeamBillList() {
  const { companyId, financialYearEnd } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const {
    data: receiveSizeBeamBill,
    isLoading: isLoadingReceiveSizeBeam,
  } = useQuery({
    queryKey: [
      "order-master/recive-size-beam/list",
      {
        company_id: companyId,
        page,
        pageSize,
        // search: debouncedSearch,
        // toDate: debouncedToDate,
        // fromDate: debouncedFromDate,
        end: financialYearEnd,
      },
    ],
    queryFn: async () => {
      const res = await getReceiveSizeBeamBillListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          //   search: debouncedSearch,
          //   toDate: debouncedToDate,
          //   fromDate: debouncedFromDate,
          end: financialYearEnd,
          // pending: true,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => ((page * pageSize) + index) + 1
    },
    {
      title: "Bill date",
      dataIndex: "bill_date", 
      render: (text, record) => {
        return(
          <div>{moment(text).format("DD-MM-YYYY")}</div>
        )
      }
    },
    {
      title: "Bill No",
      dataIndex: "challan_no"
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier_name", 
      render: (text, record) => {
        return(
          <div>
            {record?.supplier?.supplier_name || "-"}
          </div>
        )
      }
    },
    {
      title: "Company Name",
      dataIndex: "company_name", 
      render: (text, record) => {
        return(
          <div>
            {record?.supplier?.supplier_company || "-"}
          </div>
        )
      }
    },
    {
      title: "Quality",
      dataIndex: "quality_name", 
      render: (text, record) => {
        return(
          <div>
            {record?.inhouse_quality?.quality_name}
          </div>
        )
      }
    }, 
    {
      title: "Total Taka", 
      dataIndex: "total_taka"
    }, 
    {
      title: "Total Meter", 
      dataIndex: "total_meter"
    }, 
    {
      title: "Rate", 
      dataIndex: "rate"
    }, 
    {
      title : "Amount",
      dataIndex: "freight_amount"
    }, 
    {
      title: "Net Amount", 
      dataIndex: "net_amount"
    }, 
    {
      title: "Due Date", 
      dataIndex: "due_date", 
      render: (text, record) => {
        return(
          <div>{moment(text).format("DD-MM-YYYY")}</div>
        )
      }
    },
    {
      title: "Due Days", 
      dataIndex: "", 
      render: (text, record) => {
        let due_date = record?.due_date;
        due_date = new Date(due_date);

        let today = new Date();

        let timeDifference = due_date.getTime() - today.getTime();
        let daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

        if (daysDifference < 0) {
            daysDifference = 0;
        }

        return(
          <div>{daysDifference}</div>
        )
      }
    }, 
    {
      title: "Status",
      dataIndex: "status", 
      render: (text, record) => {
        return(
          text == "unpaid"?<Tag color="red">{text}</Tag>:<Tag color="green">{text}</Tag>
        )
      }
    }, 
    {
      title: "Action"
    }
  ]; 

  function renderTable() {
    if (isLoadingReceiveSizeBeam){
      return(
        <Spin tip = "Loading" size="large">
          <div className="p-14"></div>
        </Spin>
      )
    }

    return(
      <Table
        dataSource={receiveSizeBeamBill?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: receiveSizeBeamBill?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{
          overflow: "auto",
        }}
        summary={() => {
          return(
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell> 
            </Table.Summary.Row>
          )
        }}
      />
    )
  }
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Bills of size beam List </h3>
        </div>
      </div>

      {renderTable()}

    </div>
  )
}

export default SizeBeamBillList; 