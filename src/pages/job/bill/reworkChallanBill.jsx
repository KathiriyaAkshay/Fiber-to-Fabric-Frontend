import { useContext, useState } from "react";
import {
  Table,
  Select,
  DatePicker,
  Input,
  Flex,
  Typography,
  Spin,
  Space,
  Tag,
  Button,
} from "antd";
import { usePagination } from "../../../hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import useDebounce from "../../../hooks/useDebounce";
import dayjs from "dayjs";
import { getCompanyMachineListRequest } from "../../../api/requests/machine";
import { getReworkChallanListRequest } from "../../../api/requests/job/challan/reworkChallan";
// import ViewJobTakaInfo from "../../../components/job/jobTaka/viewJobTakaInfo";
import { EditOutlined, FileTextOutlined } from "@ant-design/icons";
import ReworkChallanModal from "../../../components/job/challan/reworkChallan/ReworkChallanModal";
import ViewReworkChallanInfo from "../../../components/job/challan/reworkChallan/ViewReworkChallan";
import PartialPaymentInformation from "../../../components/accounts/payment/partialPaymentInformation";
import { JOB_REWORK_BILL_MODEL } from "../../../constants/bill.model";
import { PAID_TAG_TEXT, PAID_TAG_TEXT_COLOR } from "../../../constants/bill.model";

const ReworkChallanBill = () => {
  const [quality, setQuality] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [machine, setMachine] = useState(null);
  const [billNo, setBillNo] = useState("");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [payment, setPayment] = useState("un-paid");

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedMachine = useDebounce(machine, 500);
  const debouncedBillNo = useDebounce(billNo, 500);
  const debouncedSupplier = useDebounce(supplier, 500);
  const debouncedPayment = useDebounce(payment, 500);

  const { companyId } = useContext(GlobalContext);

  const [reworkChallanModal, setReworkChallanModal] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });
  const handleCloseModal = () => {
    setReworkChallanModal((prev) => ({
      ...prev,
      isModalOpen: false,
      mode: "",
    }));
  };

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

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

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          machine_name: machine,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        if (machine) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              machine_name: machine,
              page: 0,
              pageSize: 99999,
              is_active: 1,
            },
          });
          return res.data?.data;
        } else {
          return { row: [] };
        }
      },
      enabled: Boolean(companyId),
    });

  const { data: reworkChallanBillData, isLoading } = useQuery({
    queryKey: [
      "rework",
      "challan",
      "bill",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        bill_no: debouncedBillNo,
        machine_name: debouncedMachine,
        supplier_name: debouncedSupplier,
        is_paid: debouncedPayment,
      },
    ],
    queryFn: async () => {
      const res = await getReworkChallanListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          bill_status: "confirmed",
          from: debouncedFromDate,
          to: debouncedToDate,
          quality_id: debouncedQuality,
          bill_no: debouncedBillNo,
          machine_name: debouncedMachine,
          supplier_name: debouncedSupplier,
          is_paid: debouncedPayment,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
      sorter: {
        compare: (a, b) => {
          return a.id - b.id;
        },
      },
    },
    {
      title: "Bill Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Bill No",
      dataIndex: ["job_rework_bill", "invoice_no"],
      key: "bill_no",
      sorter: (a, b) => a.bill_no - b.bill_no,
    },
    {
      title: "To Company",
      dataIndex: ["supplier", "supplier_company"],
      key: "to_company",
    },
    {
      title: "Quality",
      dataIndex: ["inhouse_quality"],
      key: ["inhouse_quality"],
      render: (quality) =>
        `${quality.quality_name} (${quality.quality_weight})`,
    },
    {
      title: "Total Taka",
      dataIndex: "total_taka",
      key: "total_taka",
    },
    {
      title: "Total Meter",
      dataIndex: "total_meter",
      key: "total_meter",
    },
    {
      title: "Rate",
      dataIndex: ["job_rework_bill", "rate"],
      key: "rate",
    },
    {
      title: "Amount",
      dataIndex: ["job_rework_bill", "amount"],
      key: "amount",
    },
    {
      title: "Net Amount",
      dataIndex: ["job_rework_bill", "net_amount"],
      key: "net_amount",
    },
    {
      title: "Due Date",
      dataIndex: ["job_rework_bill", "due_date"],
      key: "due_date",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Due Days",
      dataIndex: "due_days",
      key: "due_days",
      render: (text, record) => {
        let due_date = record?.job_rework_bill?.due_date;
        due_date = new Date(due_date);
      
        let today = new Date();
    
        // Correct the time difference calculation
        let timeDifference = today.getTime() - due_date.getTime();
        
        // Convert time difference to days
        let daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));
      
        // If the due date is in the future, set the days difference to 0
        if (daysDifference < 0) {
          daysDifference = 0;
        }

        if (record?.job_rework_bill?.is_paid){
          return(
            <div>0</div>
          )
        } else {
          return <div style={{
            color: daysDifference == 0?"#000":"red",
            fontWeight: 600
          }}>
            +{daysDifference}D
          </div>;
        }

      }
    },
    {
      title: "Status",
      render: (text, record) => {
        return(
          <div>
            {record?.job_rework_bill?.is_partial_payment?<>
              <PartialPaymentInformation
                bill_id={record?.job_rework_bill?.id}
                bill_model={JOB_REWORK_BILL_MODEL}
                paid_amount={record?.job_rework_bill?.paid_amount}
              />
            </>:<>
              <Tag color = {record?.job_rework_bill?.is_paid?PAID_TAG_TEXT_COLOR:"red"}>
                {String(record?.job_rework_bill?.is_paid?PAID_TAG_TEXT:"Un-Paid").toUpperCase()}
              </Tag>
            </>}
          </div>
        )
      },
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewReworkChallanInfo details={details} />
            
            { details?.job_rework_bill?.is_partial_payment == false && 
              details?.job_rework_bill?.is_paid == false && (
              <Button
                onClick={() => {
                  setReworkChallanModal((prev) => {
                    return {
                      ...prev,
                      isModalOpen: true,
                      details: details,
                      mode: "UPDATE",
                    };
                  });
                }}
              >
                <EditOutlined />
              </Button>
              )} 

            <Button
              onClick={() => {
                let MODE;
                if (details.job_rework_bill?.is_paid) {
                  MODE = "VIEW";
                } else if (details?.job_rework_bill?.is_partial_payment){
                  MODE = "VIEW" ; 
                } else {
                  MODE = "ADD";
                }
                setReworkChallanModal((prev) => {
                  return {
                    ...prev,
                    isModalOpen: true,
                    details: details,
                    mode: MODE,
                  };
                });
              }}
            >
              <FileTextOutlined />
            </Button>
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
        dataSource={reworkChallanBillData?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: reworkChallanBillData?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell>Grand Total</Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell>
                {reworkChallanBillData?.total_taka}
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                {reworkChallanBillData?.total_meter}
              </Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell>
                {reworkChallanBillData?.total_amounts}
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                {reworkChallanBillData?.total_net_amounts}
              </Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
            </Table.Summary.Row>
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
            <h3 className="m-0 text-primary">Rework challan bills</h3>
            {/* <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            /> */}
          </div>
          <Flex align="center" gap={10}>
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
                  allowClear
                />
              </Flex>

              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  Machine
                </Typography.Text>
                <Select
                  placeholder="Select Machine"
                  loading={isLoadingMachineList}
                  options={machineListRes?.rows?.map((machine) => ({
                    label: machine?.machine_name,
                    value: machine?.machine_name,
                  }))}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  value={machine}
                  onChange={setMachine}
                  style={{
                    textTransform: "capitalize",
                  }}
                  className="min-w-40"
                  allowClear
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
                  onChange={setQuality}
                  style={{
                    textTransform: "capitalize",
                  }}
                  className="min-w-40"
                />
              </Flex>
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                From
              </Typography.Text>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                className="min-w-40"
                format={"DD-MM-YYYY"}
              />
            </Flex>

            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                To
              </Typography.Text>
              <DatePicker
                value={toDate}
                onChange={setToDate}
                className="min-w-40"
                format={"DD-MM-YYYY"}
              />
            </Flex>
            {/* <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!receiveReworkTakaList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            /> */}
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Payment
              </Typography.Text>
              <Select
                placeholder="Select Machine"
                options={[
                  { label: "Un-Paid", value: 0 },
                  { label: "Paid", value: 1 },
                ]}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                value={payment}
                onChange={setPayment}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                allowClear
              />
            </Flex>

            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Bill No
              </Typography.Text>
              <Input
                placeholder="Search"
                value={billNo}
                onChange={(e) => setBillNo(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
          </Flex>
        </div>
        {renderTable()}
      </div>

      {reworkChallanModal.isModalOpen && (
        <ReworkChallanModal
          details={{ ...reworkChallanModal.details, sent_meter: 6 }}
          isModelOpen={reworkChallanModal.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={reworkChallanModal.mode}
        />
      )}
    </>
  );
};

export default ReworkChallanBill;
