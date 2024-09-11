import { useContext, useMemo, useState } from "react";
import {
  Button,
  Radio,
  Form,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Checkbox,
  Flex,
  message,
  Typography,
  Table,
  Space,
} from "antd";
const { RangePicker } = DatePicker;

import { Controller, useForm } from "react-hook-form";

import {
  ArrowLeftOutlined,
  EyeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import AddCreditNotes from "../../../components/accounts/notes/CreditNotes/AddCreditNotes";
import Invoice from "../../../components/accounts/notes/CreditNotes/Invoice";
import ActionView from "../../../components/accounts/notes/CreditNotes/ActionView";
import ActionFile from "../../../components/accounts/notes/CreditNotes/ActionFile";
import AddDebitNotes from "../../../components/accounts/notes/DebitNotes/AddDebitNotes";

const   DebitNotes = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
    },
    {
      title: "Credit No",
      dataIndex: "creditNo",
      key: "creditNo",
    },

    {
      title: "Quality/Denier",
      dataIndex: "quality_denier",
      key: "quality_denier",
    },
    {
      title: "Firm Name",
      dataIndex: "firm_name",
      key: "firm_name",
    },
    {
      title: "Party Name",
      dataIndex: "party_name",
      key: "party_name",
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Net Amount",
      dataIndex: "net_amount",
      key: "net_amount",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Invoice Date",
      dataIndex: "invoice_date",
      key: "invoice_date",
    },

    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ActionView />
            <ActionFile />
            <Invoice />
          </Space>
        );
      },
    },
  ];

  const data = [
    {
      no: 1,
      returnDate: "23-07-2024",
      creditNo: "CNS-10",
      "Challan/Bill": "1230023",
      quality_denier: "33P PALLU PATTERN (ABCDABCD) - (8KG)",
      firm_name: "SONU TEXTILES",
      party_name: "BABAJI SILK FABRIC / HM SILK FABRIC",
      meter: 300,
      amount: "60,000.00",
      net_amount: "56,700.00",
      type: "Sale return",
      invoice_date: "18-08-2024",
    },
    {
      No: 2,
      returnDate: "23-07-2024",
      creditNo: "CNS-10",
      "Challan/Bill": "1230023",
      quality_denier: "33P PALLU PATTERN (ABCDABCD) - (8KG)",
      firm_name: "SONU TEXTILES",
      party_name: "BABAJI SILK FABRIC / HM SILK FABRIC",
      meter: 300,
      amount: "60,000.00",
      net_amount: "56,700.00",
      type: "Sale return",
      invoice_date: "18-08-2024",
    },
  ];

  function renderTable() {
    // if (isLoading) {
    // return (
    //   <Spin tip="Loading" size="large">
    //     <div className="p-14" />
    //   </Spin>
    // );
    // }

    return (
      <Table
        dataSource={data || []}
        columns={columns}
        rowKey={"id"}
        // pagination={{
        //   total: purchaseReturnList?.rows?.count || 0,
        //   showSizeChanger: true,
        //   onShowSizeChange: onShowSizeChange,
        //   onChange: onPageChange,
        // }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>

              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                <b>4218</b>
              </Table.Summary.Cell>

              <Table.Summary.Cell index={1}>
                <b>244518</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1}>
                <b>11432</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>

              <Table.Summary.Cell index={0}></Table.Summary.Cell>

              <Table.Summary.Cell index={0}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  return (
    <Form
      // form={form}
      // layout="vertical"
      style={{ marginTop: "1rem" }}
      onFinish={() => {}}
    >
      <div className="flex flex-col gap-2 p-4 pt-2">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-5">
            {/* <Button onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </Button> */}
            <h3 className="m-0 text-primary">Debit Notes</h3>
            <Button
              onClick={() => {
                setIsAddModalOpen(true);
              }}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>

          <div style={{ marginLeft: "auto" }}>
            {/* <Controller
              control={control}
              name="production_filter"
              render={({ field }) => ( */}
            <Radio.Group
              // {...field}
              name="production_filter"
              onChange={(e) => {
                // field.onChange(e);
                // changeProductionFilter(e.target.value);
              }}
            >
              <Radio value={"current"}>Current</Radio>
              <Radio value={"previous"}>Previous</Radio>
            </Radio.Group>
            {/* )} */}
            {/* /> */}
          </div>
        </div>
        <Row style={{ gap: "25px", marginTop: "20px" }}>
            <Col span={12}>
            <div style={{ marginLeft: "auto" }}>
            {/* <Controller
              control={control}
              name="production_filter"
              render={({ field }) => ( */}
            <Radio.Group
              // {...field}
              name="production_filter"
              onChange={(e) => {
                // field.onChange(e);
                // changeProductionFilter(e.target.value);
              }}
            >
              <Radio value={"purchase_return"}>Purchase Return</Radio>
              <Radio value={"claim_note"}>Claim Note</Radio>
              <Radio value={"discount_note"}>Discount Note</Radio>
              <Radio value={"other"}>other</Radio>
              <Radio value={"all"}>all</Radio>
            </Radio.Group>
            {/* )} */}
            {/* /> */}
          </div>    
            </Col>
          <Col span={5}>
            <Form.Item
              label="Quantity"
              name={`quantity`}
              // validateStatus={errors.pis ? "error" : ""}
              // help={errors.pis && errors.pis.message}
              // required={true}
              wrapperCol={{ sm: 24 }}
              style={{
                marginBottom: "0px",
                border: "0px solid !important",
              }}
            >
              <Select
                // {...field}
                placeholder="Select Company"
                // loading={isLoadingMachineList}
                // options={machineListRes?.rows?.map((machine) => ({
                //   label: machine?.machine_name,
                //   value: machine?.machine_name,
                // }))}
                options={[
                  {
                    label: "Company 1",
                    value: "Company_1",
                  },
                ]}
                style={{
                  textTransform: "capitalize",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={(value) => {
                  // field.onChange(value);
                  // resetField("quality_id");
                }}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="From-To"
              name={`from-to`}
              // validateStatus={errors.pis ? "error" : ""}
              // help={errors.pis && errors.pis.message}
              // required={true}
              wrapperCol={{ sm: 24 }}
              style={{
                marginBottom: "0px",
                border: "0px solid !important",
              }}
            >
              <RangePicker />
            </Form.Item>
          </Col>
        </Row>
        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-4  ">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Sales Return No
              </Typography.Text>
              <Input
                placeholder="Challan NO"
                // value={challanNo}
                // onChange={(e) => setChallanNo(e.target.value)}
                style={{ width: "200px" }}
              />

              <Button>
                <SearchOutlined />
              </Button>
              <Button>
                <FileExcelOutlined />
              </Button>
              <Button>
                <FilePdfOutlined />
              </Button>
            </Flex>
          </Flex>
        </div>
        {renderTable()}
      </div>
      <AddDebitNotes
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
      />
    </Form>
  );
};

export default DebitNotes;
