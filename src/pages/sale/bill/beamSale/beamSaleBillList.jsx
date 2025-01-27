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
import { getBeamSaleChallanListRequest } from "../../../../api/requests/sale/challan/beamSale";
import PartialPaymentInformation from "../../../../components/accounts/payment/partialPaymentInformation";
import PrintBeamSaleChallan from "../../../../components/sale/challan/beamSale/printBeamSaleChallan";
import BeamSaleChallanModel from "../../../../components/sale/challan/beamSale/BeamSaleChallan";
import { PAID_TAG_TEXT, PAID_TAG_TEXT_COLOR } from "../../../../constants/bill.model";

const CONFIRMED_BILL_STATUS = "confirmed" ; 

const BeamSaleBillList = () => {
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
    
    // Supplier dropdown list ===============================
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
  
    // Vehicle dropdown list =====================================
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
    
    // Beam sale challan related bill inforamtion =============================
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
            bill_status: CONFIRMED_BILL_STATUS,
          },
        ],
        queryFn: async () => {
          const res = await getBeamSaleChallanListRequest({
            companyId,
            params: {
              company_id: companyId,
              page,
              pageSize,
              supplier_name: debounceParty,
              bill_status: CONFIRMED_BILL_STATUS,
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
        title: "Bill No", 
        render: (text, record) => {
          return(
            <div style={{
              fontWeight: 600
            }}>
              {record?.beam_sale_bill?.E_way_bill_no}
            </div>
          )
        }
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
        title: "Total Beam",
        render: (record) => {
          return `${record.beam_sale_details?.length}`;
        },
      },
      {
        title: "Total Meter",
        render: (text, record) => {
          let total_meter = 0 ; 
          record?.beam_sale_details?.map((element) => {
            const obj =
              element?.loaded_beam?.non_pasarela_beam_detail ||
              element?.loaded_beam?.recieve_size_beam_detail ||
              element?.loaded_beam?.job_beam_receive_detail;
            
            total_meter += +obj?.meter || +obj?.meters;  
          })
          
          return(
            <div>
              {total_meter}
            </div>
          )
        }
      },
      {
        title: "Rate", 
        render: (text, record) => {
          return(
            <div>
              {record?.beam_sale_bill?.rate}
            </div>
          )
        }
      }, 
      {
        title: "Amount (Exc GST)",
        dataIndex: ["yarn_sale_bill", "amount"],
        render: (text, record) => {
          return(
            <div>
              {record?.beam_sale_bill?.amount}
            </div>
          )
        }
      },
      {
        title: "Due Date",
        render: (record) => {
          return dayjs(record?.beam_sale_bill?.due_date).format("DD-MM-YYYY");
        },
      },
      {
        title: "Due Days",
        dataIndex: "due_date",
        render: (text, record) => {
          const currentDate = new Date();
          const targetDate = new Date(record?.beam_sale_bill?.due_date);
  
          if (currentDate < targetDate) {
            return <div>0</div>;
          } else {
            const differenceInMilliseconds = currentDate - targetDate;
            const millisecondsInADay = 24 * 60 * 60 * 1000;
            const daysDifference = Math.floor(
              differenceInMilliseconds / millisecondsInADay
            );
            return <div style={{
              color: daysDifference == 0?"#000":"red",
              fontWeight: 600
            }}>{`+${daysDifference}D`}</div>;
          }
        },
      },
      {
        title: "Bill Status",
        dataIndex: ["beam_sale_bill", "is_paid"],
        render: (text,record) => {
          return(
            <div>
              {record?.beam_sale_bill?.is_partial_payment?<>
                <PartialPaymentInformation
                  bill_id={record?.beam_sale_bill?.id}
                  bill_model={"beam_sale_bill"}
                  paid_amount={record?.beam_sale_bill?.paid_amount}
                />
              </>:<>
                <Tag color = {record?.beam_sale_bill?.is_paid?PAID_TAG_TEXT_COLOR:"red"}>
                  {String(record?.beam_sale_bill?.is_paid?PAID_TAG_TEXT:"Un-paid").toUpperCase()}
                </Tag>
              </>}
            </div>
          )
        }
      },
      {
        title: "Actions",
        dataIndex: "actions",
        render: (text, record) => (
          <Space>
            <PrintBeamSaleChallan details={record} />
            <Button
              onClick={() => {
                let MODE;
                if (record.beam_sale_bill.is_paid) {
                  MODE = "VIEW";
                } else if (record?.beam_sale_bill?.is_partial_payment){
                  MODE = "VIEW" ; 
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
        "Bill No",
        "Party Name",
        "Challan No",
        "Total Beam",
        "Total Meter",
        "Rate",
        "Amount (Exl GST)",
        "SGST",
        "CGST",
        "IGST",
        "Net Amount",
      ];
  
      let temp = [];
      let total_net_amount = 0 ;
  
      yarnSaleBillListData?.rows?.map((element, index) => {
        let total_meter = 0 ; 
        element?.beam_sale_details?.map((item) => {
          const obj =
            item?.loaded_beam?.non_pasarela_beam_detail ||
            item?.loaded_beam?.recieve_size_beam_detail ||
            item?.loaded_beam?.job_beam_receive_detail;
          
          total_meter += +obj?.meter || +obj?.meters;  
        })

        temp.push([
          index + 1,
          moment(element?.bill_date).format("DD-MM-YYYY"),
          element?.beam_sale_bill?.E_way_bill_no,
          element?.supplier?.supplier_company,
          element?.challan_no, 
          element?.beam_sale_details?.length, 
          total_meter, 
          element?.beam_sale_bill?.rate, 
          element?.beam_sale_bill?.amount, 
          element?.beam_sale_bill?.SGST_amount, 
          element?.beam_sale_bill?.CGST_amount, 
          element?.beam_sale_bill?.IGST_amount,
          element?.beam_sale_bill?.net_amount
        ]);
        total_net_amount += element?.beam_sale_bill?.net_amount ; 
      });
      
      let total = [
        "Total", 
        "", 
        "", 
        "", 
        "", 
        parseFloat(yarnSaleBillListData?.total_beams).toFixed(2), 
        parseFloat(yarnSaleBillListData?.total_meter).toFixed(2), 
        "",
        parseFloat(yarnSaleBillListData?.total_bill_amounts).toFixed(2), 
        "", 
        "", 
        "", 
        parseFloat(total_net_amount).toFixed(2)
      ] ; 

      localStorage.setItem("print-title", "Beam Sale Bill List");
      localStorage.setItem("print-head", JSON.stringify(tableTitle));
      localStorage.setItem("print-array", JSON.stringify(temp));
      localStorage.setItem("total-count", "1");
      localStorage.setItem("total-data", JSON.stringify(total));
  
      window.open("/print");
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
          dataSource={yarnSaleBillListData?.rows || []}
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
                  <Table.Summary.Cell></Table.Summary.Cell>
                  <Table.Summary.Cell>{parseFloat(yarnSaleBillListData?.total_beams).toFixed(2) || 0}</Table.Summary.Cell>
                  <Table.Summary.Cell>{parseFloat(yarnSaleBillListData?.total_meter).toFixed(2) || 0}</Table.Summary.Cell>
                  <Table.Summary.Cell>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                    {parseFloat(yarnSaleBillListData?.total_bill_amounts).toFixed(2) || 0}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell>
                  </Table.Summary.Cell>
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
              <h3 className="m-0 text-primary">Beam Sale Challan List</h3>
            </div>
  
            <Flex align="center" gap={10}>
              <Flex align="center" gap={10}>
                {/* <Typography.Text className="whitespace-nowrap">
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
                /> */}
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
            </Flex>
          </div>
  
          {renderTable()}
        </div>
        {yarnSaleChallanModel.isModalOpen && (
          <BeamSaleChallanModel
          beamDetails={yarnSaleChallanModel.details}
            isModelOpen={yarnSaleChallanModel.isModalOpen}
            handleCloseModal={handleCloseModal}
            MODE={yarnSaleChallanModel.mode}
          />
        )}
      </>
    );
  };
  
  export default BeamSaleBillList;