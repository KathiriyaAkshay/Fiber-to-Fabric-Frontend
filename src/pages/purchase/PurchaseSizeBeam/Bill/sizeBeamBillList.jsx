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
            dataIndex: "bill_date"
        }, 
        {
            title: "Bill No", 
            dataIndex: "invoice_no"
        }, 
        {
            title: "Supplier Name", 
            dataIndex: "supplier_name"
        }, 
        {
            title: "Company Name", 
            dataIndex: "company_name"
        },
        {
            title: "Quality", 
            dataIndex: "quality_name"
        } 
    ]
    return(
        <div>

        </div>
    )
}

export default SizeBeamBillList ; 