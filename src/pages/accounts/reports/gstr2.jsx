import {
  FilePdfOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Drawer,
  Flex,
  Input,
  Select,
  Table,
  Typography,
} from "antd";
import React from "react";
import "./_style.css";
import { gstr2_dialog_columns, gstr2_dialog_data } from "./utils";

const Gstr2 = () => {
  const [isParticularOpen,setIsParticularOpen]=React.useState("");
  const columns = [
    { title: "Sl No.", dataIndex: "slNo", key: "slNo" },
    {
      title: "Particulars",
      dataIndex: "particulars",
      key: "particulars",
      render: (text) => <a onClick={()=>setIsParticularOpen(text)}>{text}</a>,
    },
    { title: "Voucher Count", dataIndex: "voucherCount", key: "voucherCount" },
    {
      title: "Taxable Amount",
      dataIndex: "taxableAmount",
      key: "taxableAmount",
    },

    { title: "Tax Amount", dataIndex: "taxAmount", key: "taxAmount" },
  ];

  // Define the data for the table
  const data = [
    {
      key: "1",
      slNo: "1",
      particulars: "B2B Invoices - 4A,4B,4C,6B,6C",
      voucherCount: 46,
      taxableAmount: 872146,

      taxAmount: 61050,
    },
    {
      key: "2",
      slNo: "2",
      particulars: "Credit/Debit Notes(Registered)-9B",
      voucherCount: 29,
      taxableAmount: -708558,
      taxAmount: -39789,
    },
  ];
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">GSTR-2 Report</h3>
        </div>
        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Company
              </Typography.Text>
              <Select
                placeholder="Select Company"
                //   onChange={}
                //   options={["sonu textiles","sonu textiles(123)"]}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Date
              </Typography.Text>
              <DatePicker />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                To
              </Typography.Text>
              <DatePicker />
            </Flex>
            <Flex align="center" gap={10}>
              <Button icon={<SearchOutlined />} />
            </Flex>
            <Flex align="center" gap={10}>
              <Button>Submit</Button>
            </Flex>
            <Flex align="center" gap={10}>
              <Button>Confirm GST</Button>
            </Flex>
            <Flex align="center" gap={10}>
              <Button>Export</Button>
            </Flex>
          </Flex>
        </div>
      </div>
      <div className="container mx-auto  gstr-table">
        <div className="border p-4 rounded-lg shadow">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">SONU TEXTILES</h2>
            <p className="text-gray-400 w-56 m-auto text-center text-sm">
              PLOT NO. 78,, JAYVEER INDU. ESTATE,, GUJARAT HOUSING BOARD ROAD,
              PANDESARA,, SURAT, GUJARAT,394221 PANDESARA SURAT-394221
            </p>
            <p>GSTR-2</p>
            <p>01-04-2024 to 21-10-2024</p>
          </div>
          <Flex justify="space-between">
            <div>
              <span className="font-semibold">GSTIN/UIN:</span> 24ABHPP6021C1Z4
            </div>
            <div>01-10-2024 to 21-10-2024</div>
          </Flex>
          <hr />
          {/* header */}
          <Flex justify="space-between" className="font-semibold text-base">
            <div>Particulars</div>
            <div>Vouchers Count</div>
          </Flex>
          <hr className="border-x-gray-100" />
          {/* content */}
          <Flex justify="space-between" className="text-sm">
            <div>Total Vouchers</div>
            <div>73</div>
          </Flex>
          <Flex justify="space-between" className="text-sm">
            <div>Included in Return</div>
            <div>75</div>
          </Flex>

          <div className="my-4">
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <strong>Total</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <strong>163588</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>
                      <strong>254366</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={6}>
                      <strong>254366</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>
          <div className="mt-4 text-red-500 text-sm">
            <p>
              * Challan number found as bill status is pending to be received
              which are as follows:
            </p>
          </div>
          <div className="text-sm">
            <div>
              {" "}
              Grey purchase : 1009, 1000, 162002, 670076, 2422, 67, 10000, 12
            </div>
            <div>
              Yarn purchase : 56546, 121, 2134, 23432, 12321, 123214, 1233,
              101~1
            </div>
          </div>
        </div>
      </div>
      <Drawer
        title={isParticularOpen}
        onClose={() => setIsParticularOpen("")}
        open={isParticularOpen !== "" ? true : false}
        width={"1000"}
        className="gstr-table"
        extra={
          <Button icon={<PrinterOutlined/>}>
            Print
          </Button>
        }
      >
        <Table
              columns={gstr2_dialog_columns}
              dataSource={gstr2_dialog_data }
              pagination={false}
            />
      </Drawer>
      {/* {renderTable()} */}
    </div>
  );
};

export default Gstr2;
