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
import {
  FileExcelFilled,
  FilePdfFilled,
  FileTextOutlined,
} from "@ant-design/icons";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { usePagination } from "../../../../hooks/usePagination";
import { saleYarnChallanListRequest } from "../../../../api/requests/sale/challan/challan";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import {
  getDropdownSupplierListRequest,
  getVehicleUserListRequest,
} from "../../../../api/requests/users";
import useDebounce from "../../../../hooks/useDebounce";
import YarnSaleChallanModel from "../../../../components/sale/challan/yarn/YarnSaleChallan";
import dayjs from "dayjs";
import PrintYarnSaleChallan from "../../../../components/sale/challan/yarn/printYarnSaleChallan";
import * as XLSX from "xlsx";

const YarnSalesBillList = () => {
  const { companyId, financialYearEnd } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [yarnSaleChallanModel, setYarnSaleChallanModel] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });

  const handleCloseModal = () => {
    setYarnSaleChallanModel((prev) => ({
      ...prev,
      isModalOpen: false,
      mode: "",
    }));
  };

  const [party, setParty] = useState(null);
  const debounceParty = useDebounce(party, 500);
  const [vehicle, setVehicle] = useState(null);
  const debouncedVehicle = useDebounce(vehicle, 500);
  const [billStatus, setBillStatus] = useState(null);
  const debounceBillStatus = useDebounce(billStatus, 500);

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

  const { data: vehicleListRes, isLoading: isLoadingVehicleList } = useQuery({
    queryKey: [
      "vehicle",
      "list",
      { company_id: companyId, page: 0, pageSize: 99999 },
    ],
    queryFn: async () => {
      const res = await getVehicleUserListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: yarnSaleBillListData, isLoading: isLoadingYarnSaleBill } =
    useQuery({
      queryKey: [
        "sale/challan/yarn-sale/list",
        {
          company_id: companyId,
          page,
          pageSize,
          supplier_name: debounceParty,
          end: financialYearEnd,
          vehicle_id: debouncedVehicle,
          bill_status: "confirmed",
          is_paid: debounceBillStatus,
        },
      ],
      queryFn: async () => {
        const res = await saleYarnChallanListRequest({
          companyId,
          params: {
            company_id: companyId,
            page,
            pageSize,
            supplier_name: debounceParty,
            end: financialYearEnd,
            vehicle_id: debouncedVehicle,
            bill_status: "confirmed",
            is_paid: debounceBillStatus,
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
      title: "Bill date",
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
      render: (record) => {
        return `${record.kg}`;
      },
    },
    {
      title: "Rate",
      dataIndex: ["yarn_sale_bill", "rate"],
    },
    {
      title: "Amount (Exc GST)",
      dataIndex: ["yarn_sale_bill", "amount"],
    },
    {
      title: "Due Date",
      render: (record) => {
        return dayjs(record?.yarn_sale_bill?.due_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Due Days",
      dataIndex: "due_date",
      render: (text, record) => {
        const currentDate = new Date();
        const targetDate = new Date(record?.yarn_sale_bill?.due_date);

        if (currentDate > targetDate) {
          return <div>0</div>;
        } else {
          const differenceInMilliseconds = currentDate - targetDate;
          const millisecondsInADay = 24 * 60 * 60 * 1000;
          const daysDifference = Math.floor(
            differenceInMilliseconds / millisecondsInADay
          );
          return <div>{daysDifference}</div>;
        }
      },
    },
    {
      title: "Bill Status",
      dataIndex: ["yarn_sale_bill", "is_paid"],
      render: (text) =>
        text ? <Tag color="green">Paid</Tag> : <Tag color="red">Un-Paid</Tag>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <Space>
          <PrintYarnSaleChallan details={record} />
          <Button
            onClick={() => {
              let MODE;
              if (record.yarn_sale_bill.is_paid) {
                MODE = "VIEW";
              } else {
                MODE = "UPDATE";
              }
              setYarnSaleChallanModel((prev) => {
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

    yarnSaleBillListData?.list?.map((element, index) => {
      totalKG = totalKG + Number(element?.kg);
      totalAmount = totalAmount + Number(element?.yarn_sale_bill?.amount);
      totalNetAmount =
        totalNetAmount + Number(element?.yarn_sale_bill?.net_amount);

      temp.push([
        index + 1,
        moment(element?.bill_date).format("DD-MM-YYYY"),
        element?.challan_no,
        element?.supplier?.supplier_company,
        `${element?.yarn_stock_company?.yarn_count}C/${element?.yarn_stock_company?.filament}F - ( ${element?.yarn_stock_company?.yarn_type}(${element?.yarn_stock_company?.yarn_Sub_type}) - ${element?.yarn_stock_company?.yarn_color} )`,
        element?.yarn_stock_company?.hsn_no,
        element?.kg,
        element?.yarn_sale_bill?.rate,
        element?.yarn_sale_bill?.amount,
        element?.yarn_sale_bill?.SGST_amount,
        element?.yarn_sale_bill?.CGST_amount,
        element?.yarn_sale_bill?.IGST_amount,
        element?.yarn_sale_bill?.net_amount,
      ]);
    });

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

    localStorage.setItem("print-title", "Yarn Sale Bill List");
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

      XLSX.utils.book_append_sheet(workbook, worksheet, "Yarn-Sales");

      // Export to Excel file
      const dateString = moment().format("YYYY-MMD-D_HH:mm:ss");
      const fileName = `yarn_sale_${dateString}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    }
  };

  function renderTable() {
    if (isLoadingYarnSaleBill) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14"></div>
        </Spin>
      );
    }

    return (
      <Table
        dataSource={yarnSaleBillListData?.list || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: yarnSaleBillListData?.list || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          if (yarnSaleBillListData?.list?.length == 0) return;
          return (
            <>
              <Table.Summary.Row className="font-semiboid">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  {yarnSaleBillListData?.total_bill_kgs}
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  {yarnSaleBillListData?.total_bill_amount}
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
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
            <h3 className="m-0 text-primary">Yarn Sale Bill List</h3>
          </div>

          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Bill status
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select bill status"
                value={billStatus}
                options={[
                  { label: "Paid", value: "1" },
                  { label: "Un-paid", value: "0" },
                ]}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setBillStatus}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
              <Typography.Text className="whitespace-nowrap">
                Party
              </Typography.Text>
              <Select
                placeholder="Select Party"
                value={party}
                loading={isLoadingDropdownSupplierList}
                options={dropdownSupplierListRes?.map((supervisor) => ({
                  label: supervisor?.supplier_name,
                  value: supervisor?.supplier_name,
                }))}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setParty}
                style={{
                  textTransform: "capitalize",
                }}
                allowClear
                className="min-w-40"
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Vehicle
              </Typography.Text>
              <Select
                placeholder="Select Vehicle"
                value={vehicle}
                loading={isLoadingVehicleList}
                options={vehicleListRes?.vehicleList?.rows?.map((vehicle) => ({
                  label:
                    vehicle.first_name +
                    " " +
                    vehicle.last_name +
                    " " +
                    `| ( ${vehicle?.username})`,
                  value: vehicle.id,
                }))}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setVehicle}
                style={{
                  textTransform: "capitalize",
                }}
                allowClear
                className="min-w-40"
              />
            </Flex>

            <Flex align="center" gap={10}>
              <Button
                type="primary"
                icon={<FilePdfFilled />}
                onClick={() => {
                  DownloadOption("pdf");
                }}
              />
            </Flex>

            <Flex align="center" gap={10}>
              <Button
                icon={<FileExcelFilled />}
                onClick={() => {
                  DownloadOption("excel");
                }}
              />
            </Flex>
          </Flex>
        </div>

        {renderTable()}
      </div>
      {yarnSaleChallanModel.isModalOpen && (
        <YarnSaleChallanModel
          details={yarnSaleChallanModel.details}
          isModelOpen={yarnSaleChallanModel.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={yarnSaleChallanModel.mode}
        />
      )}
    </>
  );
};

export default YarnSalesBillList;
