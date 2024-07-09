import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { FileTextOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { usePagination } from "../../../../hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import DeleteJobWorkChallan from "../../../../components/sale/challan/jobwork/deleteJobWorkChallan";
import { EditOutlined } from "@ant-design/icons";
import {
  getDropdownSupplierListRequest,
  getVehicleUserListRequest,
} from "../../../../api/requests/users";
import useDebounce from "../../../../hooks/useDebounce";
import { saleJobWorkChallanListRequest } from "../../../../api/requests/sale/challan/challan";
import JobWorkSaleChallanModel from "../../../../components/sale/challan/jobwork/JobSaleChallan";
import PrintJobWorkChallan from "../../../../components/sale/challan/jobwork/printJobWorkChallan";

function JobWorkChallanList() {
  const navigation = useNavigate();
  const { companyId, financialYearEnd } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [party, setParty] = useState(null);
  const debounceParty = useDebounce(party, 500);
  const [vehicle, setVehicle] = useState(null);
  const debouncedVehicle = useDebounce(vehicle, 500);
  const [billStatus, setBillStatus] = useState(null) ; 
  const debounceBillStatus = useDebounce(billStatus, 500) ; 
  const [billType, setBillType] = useState(null);
  const debounceBillType = useDebounce(billType, 500) ; 

  const [jobWorkSaleChallanModel, setJobWorkSaleChallanModel] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });

  const handleCloseModal = () => {
    setJobWorkSaleChallanModel((prev) => ({ ...prev, isModalOpen: false, mode: "" }));
  };

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

  const { data: saleYarnChallanData, isLoading: isLoadingSaleYarnChallan } =
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
          bill_status: debounceBillStatus, 
          is_gray: debounceBillType
        },
      ],
      queryFn: async () => {
        const res = await saleJobWorkChallanListRequest({
          companyId,
          params: {
            company_id: companyId,
            page,
            pageSize,
            supplier_name: debounceParty,
            end: financialYearEnd,
            vehicle_id: debouncedVehicle,
            bill_status: debounceBillStatus, 
            is_gray: debounceBillType
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
      dataIndex: "challan_no",
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
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "KG",
      dataIndex: "kg",
    },
    {
      title: "Bill Status",
      dataIndex: "bill_status",
      render: (text) =>
        String(text).toLowerCase() === "pending" ? (
          <Tag color="red">{String(text).toUpperCase()}</Tag>
        ) : (
          <Tag color="green">{String(text).toUpperCase()}</Tag>
        ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (text, record) => (
        <Space>
          <PrintJobWorkChallan details={record} />
          {record?.bill_status == "pending" && (
            <>
              <Button
                onClick={() => {
                  navigation(`/sales/challan/job-work/update/${record?.id}`);
                }}
              >
                <EditOutlined />
              </Button>

              <DeleteJobWorkChallan details={record} />
            </>
          )}
          <Button
            onClick={() => {
              let MODE;
              if (record.bill_status) {
                if (record.bill_status.toLowerCase() === "pending") {
                  MODE = "ADD";
                } else if (record.bill_status.toLowerCase() === "confirmed") {
                  MODE = "VIEW";
                }
              } else {
                MODE = "ADD";
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
    if (isLoadingSaleYarnChallan) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14"></div>
        </Spin>
      );
    }

    return (
      <Table
        dataSource={saleYarnChallanData?.list || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: saleYarnChallanData?.count || 0,
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
            <h3 className="m-0 text-primary">Job Work Sale Challan List</h3>
            <Button
              onClick={() => {
                navigation("/sales/challan/job-work/add");
              }}
              icon={<PlusCircleOutlined />}
              type="text"
            />
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
                  {label: "Pending", value: "pending"},
                  {label: "Confirmed", value: "confirmed"}
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
                Bill Type
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select bill status"
                value={billType}
                options={[
                  {label: "Gery", value: 1},
                  {label: "Cash", value: 0}
                ]}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setBillType}
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
                className="min-w-40"
              />
            </Flex>
          </Flex>
        </div>

        {renderTable()}
      </div>

      {jobWorkSaleChallanModel.isModalOpen && (
        <JobWorkSaleChallanModel
          details={jobWorkSaleChallanModel.details}
          isModelOpen={jobWorkSaleChallanModel.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={jobWorkSaleChallanModel.mode}
        />
      )}
    </>
  );
}

export default JobWorkChallanList;
