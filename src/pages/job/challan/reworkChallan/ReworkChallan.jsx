import { useContext, useState } from "react";
import {
  Table,
  Select,
  DatePicker,
  Button,
  Input,
  Flex,
  Typography,
  Tag,
  Spin,
  Space,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../../../hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getReworkChallanListRequest } from "../../../../api/requests/job/challan/reworkChallan";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import useDebounce from "../../../../hooks/useDebounce";
import dayjs from "dayjs";
import DeleteReworkChallan from "../../../../components/job/challan/reworkChallan/DeleteReworkChallan";
import ViewReworkChallanInfo from "../../../../components/job/challan/reworkChallan/ViewReworkChallan";
import ReworkChallanModal from "../../../../components/job/challan/reworkChallan/ReworkChallanModal";
import { disabledFutureDate } from "../../../../utils/date";

const ReworkChallan = () => {
  const navigate = useNavigate();
  const [quality, setQuality] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [machine, setMachine] = useState(null);
  const [challanNo, setChallanNo] = useState("");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedMachine = useDebounce(machine, 500);
  const debouncedChallanNo = useDebounce(challanNo, 500);
  const debouncedSupplier = useDebounce(supplier, 500);

  const { companyId } = useContext(GlobalContext);
  // const { data: user } = useCurrentUser();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

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

  // Supplier dropdown list
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

  // Machine dropdown list
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

  const { data: reworkChallanList, isLoading } = useQuery({
    queryKey: [
      "rework",
      "challan",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        challan_no: debouncedChallanNo,
        machine_name: debouncedMachine,
        supplier_name: debouncedSupplier,
      },
    ],
    queryFn: async () => {
      const res = await getReworkChallanListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          from: debouncedFromDate,
          to: debouncedToDate,
          quality_id: debouncedQuality,
          challan_no: debouncedChallanNo,
          machine_name: debouncedMachine,
          supplier_name: debouncedSupplier,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/job/challan/rework-challan/add");
  }

  function navigateToUpdate(id) {
    navigate(`/job/challan/rework-challan/update/${id}`);
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = reworkChallanList?.rows?.map((item, index) => {
      const { challan_no, createdAt } = item;
      return [
        index + 1,
        "***",
        "***",
        "***",
        challan_no,
        dayjs(createdAt).format("DD-MM-YYYY"),
        "***",
      ];
    });

    const tableTitle = [
      "ID",
      "GSTIN of job worker (JW)",
      "State",
      "Job Worker Type",
      "Challan No",
      "Challan Date",
      "Type of Goods",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Rework Challan List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [["ID", "Challan NO"]],
    //   leftContent,
    //   rightContent,
    //   title: "Job Taka List",
    // });

    window.open("/print");
  }

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Challan Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier",
      key: "supplier",
      render: (supplier) => `${supplier?.supplier_name}`,
    },
    {
      title: "Quality",
      dataIndex: ["inhouse_quality"],
      key: ["inhouse_quality"],
      render: (quality) =>
        `${quality?.quality_name} (${quality?.quality_weight})`,
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
      title: "Total Rec. Meter",
      dataIndex: "taka_receive_meter",
      key: "taka_receive_meter",
    },
    // {
    //   title: "Wastage in KG.",
    //   dataIndex: "wastageInKg",
    //   key: "wastageInKg",
    //   render: (text, record) => {
    //     let received_meter = Number(record?.taka_receive_meter) ;
    //     let total_meter = Number(record?.total_meter) ;

    //     let wastage_kg = 100 - ((Number(received_meter*100)) / total_meter) ;
    //     return(
    //       <div>
    //         {wastage_kg.toFixed(2)}
    //       </div>
    //     )
    //   }
    // },
    {
      title: "Short(%)",
      dataIndex: "shortPercentage",
      key: "shortPercentage",
      render: (text, record) => {
        let received_meter = Number(record?.taka_receive_meter);
        let total_meter = Number(record?.total_meter);
        let shoratge_precentage =
          ((total_meter - received_meter) * 100) / total_meter;
        return <div>{shoratge_precentage.toFixed(2)}%</div>;
      },
    },
    {
      title: "Bill Status",
      dataIndex: "bill_status",
      key: "bill_status",
      render: (billStatus) => (
        <Tag
          color={
            billStatus && billStatus.toString().toLowerCase() === "pending"
              ? "red"
              : "green"
          }
        >
          {billStatus?.toString()?.toLowerCase() === "pending"
            ? "Pending"
            : billStatus?.toString()?.toLowerCase() === "confirmed"
            ? "Confirmed"
            : "-"}
        </Tag>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "is_paid",
      key: "is_paid",
      render: (paymentStatus) => (
        <Tag color={!paymentStatus ? "red" : "green"}>
          {paymentStatus ? "Paid" : "Un-Paid"}
        </Tag>
      ),
    },
    {
      title: "Action",
      render: (details) => {
        let delete_visible = 0;

        details?.job_rework_challan_details?.map((element) => {
          if (element?.is_rework_received == true) {
            delete_visible = 1;
          }
        });

        return (
          <Space>
            <ViewReworkChallanInfo details={details} />

            {delete_visible == 0 && (
              <>
                <Button
                  onClick={() => {
                    navigateToUpdate(details.id);
                  }}
                >
                  <EditOutlined />
                </Button>

                <DeleteReworkChallan details={details} />
              </>
            )}

            <Button
              onClick={() => {
                let MODE;
                if (details.bill_status === "confirmed") {
                  MODE = "VIEW";
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
        dataSource={reworkChallanList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: reworkChallanList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          if (reworkChallanList?.rows?.length == 0) return;
          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell>
                  {reworkChallanList?.total_taka || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  {reworkChallanList?.total_meter || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
                <Table.Summary.Cell></Table.Summary.Cell>
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
            <h3 className="m-0 text-primary">Rework Challan List</h3>
            <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            />
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
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!reworkChallanList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                From
              </Typography.Text>
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                className="min-w-40"
                format={"DD-MM-YYYY"}
                disabledDate={disabledFutureDate}
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
                disabledDate={disabledFutureDate}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Challan No
              </Typography.Text>
              <Input
                placeholder="Challan NO"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
          </Flex>
        </div>
        {renderTable()}
      </div>

      {reworkChallanModal.isModalOpen && (
        <ReworkChallanModal
          details={{ ...reworkChallanModal.details }}
          isModelOpen={reworkChallanModal.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={reworkChallanModal.mode}
        />
      )}
    </>
  );
};

export default ReworkChallan;
