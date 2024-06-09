import { useState } from "react";
import {
    Button,
    Flex,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
    Select,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { usePagination } from "../../../../hooks/usePagination";
import dayjs from "dayjs";
import moment from "moment";
import SaleBillComp from "../../../../components/sale/bill/saleBillComp";

const SaleBillList = () => {

    const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
    const [modelLayout, setModelLayout] = useState(false) ; 

    const columns = [
        {
          title: "ID",
          dataIndex: "id",
          key: "id",
          render: (text, record, index) => page * pageSize + index + 1,
        },
        {
          title: "Date",
          dataIndex: "bill_date",
          key: "bill_date",
          render: (text) => moment(text).format("DD-MM-YYYY"),
        },
        {
          title: "Party Company name",
          dataIndex: ["supplier", "supplier_company"],
        },
        {
          title: "Challan No",
        },
        {
          title: "Yarn Company",
          dataIndex: ["yarn_stock_company", "yarn_company_name"],
        },
        {
          title: "Dennier",
          dataIndex: ["yarn_stock_company"],
        },
    
        {
          title: "KG",
        },
        {
          title: "Rate",
          dataIndex: ["yarn_sale_bill", "rate"],
        },
        {
          title: "Amount",
          dataIndex: ["yarn_sale_bill", "amount"],
        },
        {
          title: "Due Date",
        },
        {
          title: "Due Days",
          //   render: (record) => {
          //     return `${record.yarn_sale.kg}`;
          //   },
        },
        {
          title: "Bill Status",
          dataIndex: ["yarn_sale_bill", "is_paid"],
        },
        {
          title: "Actions",
          dataIndex: "actions",
          render: (text, record) => (
            <Space>
              {/* <Button
                onClick={() => {
                  navigation(`/sales/challan/yarn-sale/update/${record?.id}`);
                }}
              >
                <EditOutlined />
              </Button>
              <DeleteSaleYarnChallan details={record} /> */}
              {/* <YarnSaleChallanModel yarnSaleDetails={record} /> */}
              <Button
                onClick={() => {
                    // let MODE;
                    // if (record.yarn_sale_bill.is_paid) {
                    //     MODE = "VIEW";
                    // } else {
                    //     MODE = "UPDATE";
                    // }
                   
                }}
              >
                <FileTextOutlined />
              </Button>
            </Space>
          ),
        },
      ];

    function renderTable(){
        return(
            <Table
                dataSource={[{id: 1}]}
                columns={columns}
            />
        )
    }
    return (
        <>
            <div className="flex flex-col p-4">
                <div className="flex items-center justify-between gap-5 mx-3 mb-3">
                    <div className="flex items-center gap-2">
                        <h3 className="m-0 text-primary">Sale Bill List</h3>
                    </div>

                </div>

                {renderTable()}
            </div>

            <SaleBillComp/>
        
        </>
    )
}

export default SaleBillList; 