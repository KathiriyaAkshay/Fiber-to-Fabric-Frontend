import { useContext, useState } from "react";
import {
  Button,
  Radio,
  Table,
  Input,
  Select,
  DatePicker,
  Flex,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  PrinterFilled,
} from "@ant-design/icons";
import { getProductionListRequest } from "../../api/requests/production/inhouseProduction";
import { usePagination } from "../../hooks/usePagination";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ORDER_TYPE } from "../../constants/orderMaster";
import ViewProductionDetailModal from "../../components/production/ViewProductionDetailModal";
import DeleteProduction from "../../components/production/DeleteProduction";
import ProductionQrModal from "../../components/production/ProductionQrModal";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";

const InhouseProduction = () => {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [state, setState] = useState("current");
  const [quality, setQuality] = useState(null);
  const [type, setType] = useState(null);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [radioSelection, setRadioSelection] = useState("sold");

  const [fromTakaNo, setFromTakaNo] = useState("");
  const [toTakaNo, setToTakaNo] = useState("");

  const [fromMachineNo, setFromMachineNo] = useState("");
  const [toMachineNo, setToMachineNo] = useState("");

  const [beamNo, setBeamNo] = useState("");
  const [challanNo, setChallanNo] = useState("");
  const [grade, setGrade] = useState(null);
  const [foldingUser, setFoldingUser] = useState(null);

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 99999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { data: productionList, isLoading } = useQuery({
    queryKey: [
      "production",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
      },
    ],
    queryFn: async () => {
      const res = await getProductionListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });
  console.log({ productionList });

  function navigateToAdd() {
    navigate("/production/add-new-production");
  }

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
    },
    {
      title: "Taka No.",
      dataIndex: "taka_no",
      key: "taka_no",
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
    },
    {
      title: "Machine No",
      dataIndex: "machine_no",
      key: "machine_no",
    },
    {
      title: "Average",
      dataIndex: "average",
      key: "average",
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Quality",
      dataIndex: "quality",
      key: "quality",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewProductionDetailModal
              title="Production Details"
              details={details}
            />
            <Button
              onClick={() => {
                // navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteProduction details={details} />
            <ProductionQrModal details={details} />
          </Space>
        );
      },
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
        dataSource={productionList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(tableData) => {
          console.log(tableData);

          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b>Total</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b></b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b>0</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b>0</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>

                <Table.Summary.Cell index={0}>
                  <b>0</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b>Grand Total</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b></b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b>0</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b>0</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>

                <Table.Summary.Cell index={0}>
                  <b>0</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }

  //   const [selectionType, setSelectionType] = useState("checkbox");
  //   const rowSelection = {
  //     onChange: (selectedRowKeys, selectedRows) => {
  //       console.log(
  //         `selectedRowKeys: ${selectedRowKeys}`,
  //         "selectedRows: ",
  //         selectedRows
  //       );
  //     },
  //     getCheckboxProps: (record) => ({
  //       disabled: record.name === "Disabled User",
  //       // Column configuration not to be checked
  //       name: record.name,
  //     }),
  //   };

  //show QR modal

  //show modal

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-end gap-5 mx-3 mb-3">
        <Radio.Group
          name="filter"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <Flex align="center" gap={10}>
            <Radio value={"current"}> Current</Radio>
            <Radio value={"previous"}> Previous </Radio>
          </Flex>
        </Radio.Group>
      </div>

      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">In House Production</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Type
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Type"
              value={type}
              onChange={setType}
              options={ORDER_TYPE}
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
              Quality
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Quality"
              loading={dropDownQualityLoading}
              value={quality}
              onChange={setQuality}
              options={
                dropDownQualityListRes &&
                dropDownQualityListRes?.rows?.map((item) => ({
                  value: item.id,
                  label: item.quality_name,
                }))
              }
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
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              className="min-w-40"
              format={"DD-MM-YYYY"}
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              className="min-w-40"
              format={"DD-MM-YYYY"}
            />
          </Flex>
        </Flex>
      </div>

      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <Flex
          align="center"
          gap={10}
          style={{ border: "1px solid gray", padding: "15px" }}
        >
          <Radio.Group
            value={radioSelection}
            onChange={(e) => setRadioSelection(e.target.value)}
          >
            <Radio value={"sold"}> Sold</Radio>
            <Radio value={"stock"}> Stock </Radio>
            <Radio value={"tp"}> TP </Radio>
            <Radio value={"re-work"}> Re-Work </Radio>
            <Radio value={"all"}> All </Radio>
          </Radio.Group>
        </Flex>

        <Flex
          align="center"
          gap={10}
          style={{ border: "1px solid gray", padding: "10px" }}
        >
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <Input
              placeholder="Taka No"
              value={fromTakaNo}
              onChange={setFromTakaNo}
              style={{ width: "150px" }}
            />
          </Flex>
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <Input
              placeholder="Taka No"
              value={toTakaNo}
              onChange={setToTakaNo}
              style={{ width: "150px" }}
            />
          </Flex>
        </Flex>

        <Flex
          align="center"
          gap={10}
          style={{ border: "1px solid gray", padding: "10px" }}
        >
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <Input
              placeholder="Machine No"
              value={fromMachineNo}
              onChange={setFromMachineNo}
              style={{ width: "150px" }}
            />
          </Flex>
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <Input
              placeholder="Machine No"
              value={toMachineNo}
              onChange={setToMachineNo}
              style={{ width: "150px" }}
            />
          </Flex>
        </Flex>

        <Flex
          align="center"
          gap={10}
          style={{ border: "1px solid gray", padding: "10px" }}
        >
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">
              Beam No
            </Typography.Text>
            <Input
              placeholder="Beam No"
              value={beamNo}
              onChange={setBeamNo}
              style={{ width: "150px" }}
            />
          </Flex>
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3">
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Challan No:
            </Typography.Text>
            <Input
              value={challanNo}
              onChange={setChallanNo}
              placeholder="Challan No"
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Grade:
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Grade"
              value={grade}
              onChange={(value) => setGrade(value)}
              options={[
                { value: "A", label: "A" },
                { value: "B", label: "B" },
                { value: "C", label: "C" },
                { value: "D", label: "D" },
              ]}
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
            <Select
              allowClear
              placeholder="Select Folding user"
              value={foldingUser}
              onChange={setFoldingUser}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            //   disabled={!jobTakaList?.rows?.length}
            //   onClick={downloadPdf}
            className="flex-none"
          />
          <Button
            icon={<PrinterFilled />}
            type="primary"
            //   disabled={!jobTakaList?.rows?.length}
            //   onClick={downloadPdf}
            className="flex-none"
          />
          <Button
            type="primary"
            //   disabled={!jobTakaList?.rows?.length}
            //   onClick={downloadPdf}
            className="flex-none"
          >
            Summary
          </Button>
        </Flex>
      </div>

      {renderTable()}
    </div>
  );
};

export default InhouseProduction;
