import { Button, DatePicker, Flex, Select, Table, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getGstr1ReportService } from "../../../api/requests/accounts/reports";
import moment from "moment";

const Gstr3 = () => {
  const { companyListRes } = useContext(GlobalContext);

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [company, setCompany] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }   

  // Sale summary related columns ==========================
  const saleSummaryColumns = [
    { title: "Sales Summary", dataIndex: "key", key: "key" },
    {
      title: "Accessible Amt",
      dataIndex: "accessible_amt",
      key: "accessible_amt",
    },
    {
      title: "CGST Amt",
      dataIndex: "cgst_amt",
      key: "cgst_amt",
    },
    {
      title: "SGST Amt",
      dataIndex: "sgst_amt",
      key: "sgst_amt",
    },
    {
      title: "IGST Amt",
      dataIndex: "igst_amt",
      key: "igst_amt",
    },
    {
      title: "Cess Amount",
      dataIndex: "cess_amt",
      key: "cess_amt",
    },
    { title: "Total Amt", dataIndex: "total_amt", key: "total_amt" },
    { title: "Round off", dataIndex: "round_off", key: "round_off" },
  ];

  // Sale Summary data =======================================
  const [saleSummaryData, setSaleSummaryData] = useState([]) ; 

  const {data: gstr1Data, isFetching: isLoadingGstr1} = useQuery({
    queryKey: ["gstr-1", "report", "data"], 
    queryFn: async () => {
      const res = await getGstr1ReportService({
        params: {
          company_id: company, 
          from: dayjs(fromDate).format("YYYY-MM-DD"),
          to: dayjs(toDate).format("YYYY-MM-DD"),
        }
      }); 
      setIsSubmitted(false); 
      return res?.data?.data ; 
    }, 
    enabled: isSubmitted
  }); 

  useEffect(() => {
    if (gstr1Data !== undefined){
      const groupedData = gstr1Data?.b2b_invoice?.reduce((acc, item) => {
        // Group by model (e.g. "yarn_sale_bills")
        if (!acc[item.model]) {
          acc[item.model] = {};
        }
      
        // Group by SGST inside each model group
        if (!acc[item.model][item.SGST_value]) {
          acc[item.model][item.SGST_value] = [];
        }
      
        // Group by CGST inside SGST group
        if (!acc[item.model][item.SGST_value][item.CGST_value]) {
          acc[item.model][item.SGST_value][item.CGST_value] = [];
        }
      
        // Add the item to the respective SGST and CGST group
        acc[item.model][item.SGST_value][item.CGST_value].push(item);
      
        return acc;
      }, {});

      let temp_data = [] ; 
      Object.entries(groupedData).forEach(([key, value]) => {
        let bill_name = undefined; 
        let bill_model = undefined ; 
        let total_bill_amount = 0 ;
        let total_sgst_amount = 0 ;
        let total_cgst_amount = 0 ;
        let total_igst_amount = 0 
        let total_net_amount = 0 ;
        let total_round_off_amount = 0 ;

        if (key == "yarn_sale_bills"){
          bill_model = "YARN SALE (GST) %"
        } else if (key == "sale_bills"){
          bill_model = "GREY SALE (GST) %"
        } else if (key == "job_grey_sale_bill"){
          bill_model = "JOB GREY SALE (GST) %"
        } else if (key == "beam_sale_bill"){
          bill_model = "BEAM SALE (GST) %"
        } else {
          bill_model = "JOB WORK SALE (GST) %"
        }; 

        Object.entries(value).forEach(([sgst, cgst_data]) => {
          
          Object.entries(cgst_data).forEach(([cgst, bills]) => {
            bill_name = `${bill_model} ( ${sgst} + ${cgst} )` ; 
            temp_data.push({
              key: `${bill_model} ( ${sgst} + ${cgst} )`
            })
            bills?.map((element) => {
              console.log(element);
            })
          });
        });
      }); 
      setSaleSummaryData(temp_data) ; 
    }

  }, [gstr1Data, isLoadingGstr1]) ; 

  const submitHandler = () => {
    if (company && companyListRes) {
      const companyData = companyListRes?.rows?.find(
        ({ id }) => id === company
      );
      console.log({ companyData });
      setSelectedCompany(companyData);
    }
    setIsSubmitted(true);
  };


  const saleReturnSummaryColumns = [
    { title: "Sales Return Summary", dataIndex: "key", key: "key" },
    {
      title: "Accessible Amt",
      dataIndex: "accessible_amt",
      key: "accessible_amt",
    },
    {
      title: "CGST Amt",
      dataIndex: "cgst_amt",
      key: "cgst_amt",
    },
    {
      title: "SGST Amt",
      dataIndex: "sgst_amt",
      key: "sgst_amt",
    },
    {
      title: "IGST Amt",
      dataIndex: "igst_amt",
      key: "igst_amt",
    },
    {
      title: "Cess Amount",
      dataIndex: "cess_amt",
      key: "cess_amt",
    },
    { title: "Total Amt", dataIndex: "total_amt", key: "total_amt" },
    { title: "Round off", dataIndex: "round_off", key: "round_off" },
  ];

  const purchaseSummaryColumns = [
    { title: "Purchase Summary", dataIndex: "key", key: "key" },
    {
      title: "Accessible Amt",
      dataIndex: "accessible_amt",
      key: "accessible_amt",
    },
    {
      title: "CGST Amt",
      dataIndex: "cgst_amt",
      key: "cgst_amt",
    },
    {
      title: "SGST Amt",
      dataIndex: "sgst_amt",
      key: "sgst_amt",
    },
    {
      title: "IGST Amt",
      dataIndex: "igst_amt",
      key: "igst_amt",
    },
    {
      title: "Cess Amount",
      dataIndex: "cess_amt",
      key: "cess_amt",
    },
    { title: "Total Amt", dataIndex: "total_amt", key: "total_amt" },
    { title: "Round off", dataIndex: "round_off", key: "round_off" },
  ];

  const totalTaxSummaryColumns = [
    { title: "Total Tax Summary", dataIndex: "key", key: "key" },
    {
      title: "Accessible Amt",
      dataIndex: "accessible_amt",
      key: "accessible_amt",
    },
    {
      title: "CGST Amt",
      dataIndex: "cgst_amt",
      key: "cgst_amt",
    },
    {
      title: "SGST Amt",
      dataIndex: "sgst_amt",
      key: "sgst_amt",
    },
    {
      title: "IGST Amt",
      dataIndex: "igst_amt",
      key: "igst_amt",
    },
    {
      title: "Cess Amount",
      dataIndex: "cess_amt",
      key: "cess_amt",
    },
    { title: "Total Amt", dataIndex: "total_amt", key: "total_amt" },
    { title: "Round off", dataIndex: "round_off", key: "round_off" },
  ];

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">GSTR-3B Report</h3>
        </div>
        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Company
              </Typography.Text>
              <Select
                placeholder="Select Company"
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                value={company}
                onChange={(value) => setCompany(value)}
                options={
                  companyListRes &&
                  companyListRes?.rows.map((company) => {
                    return {
                      label: company?.company_name,
                      value: company?.id,
                    };
                  })
                }
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                From
              </Typography.Text>
              <DatePicker
                value={fromDate}
                onChange={(selectedDate) => setFromDate(selectedDate)}
                disabledDate={disabledFutureDate}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                To
              </Typography.Text>
              <DatePicker
                value={toDate}
                onChange={(selectedDate) => setToDate(selectedDate)}
                disabledDate={disabledFutureDate}
              />
            </Flex>

            <Button type="primary" onClick={submitHandler}>
              SUBMIT
            </Button>
            <Button type="primary">EXPORT</Button>
          </Flex>
        </div>
      </div>
      <div className="container mx-auto  gstr-table">
        <div className="border p-4 rounded-lg shadow">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">
              {selectedCompany?.company_name || ""}
            </h2>
            <p className="text-gray-400 w-80 m-auto text-center text-sm">
              {selectedCompany?.address_line_1 || ""}
            </p>
            <p className="text-gray-400 w-85 m-auto text-center text-sm">
              {selectedCompany?.address_line_2 || ""}
            </p>
            {/* <p>GSTR-3</p> */}
            {/* {fromDate && toDate ? (
              <p>
                {fromDate && dayjs(fromDate).format("DD-MM-YYYY")} to{" "}
                {toDate && dayjs(toDate).format("DD-MM-YYYY")}
              </p>
            ) : null} */}
          </div>
          <div>
            <Flex gap={40}>
              <div className="text-sm">
                <span className="text-sm font-semibold">GSTIN/UIN:</span>{" "}
                {selectedCompany?.gst_no || ""}
              </div>
              <div className="text-sm">
                <span className="text-sm font-semibold">PAN NO:</span>{" "}
                {selectedCompany?.pancard_no || ""}
              </div>
            </Flex>
            {fromDate && toDate ? (
              <div>
                <span className="font-semibold">GSTR-3B Report From</span>{" "}
                {fromDate && dayjs(fromDate).format("DD-MM-YYYY")}{" "}
                <span className="font-semibold">to</span>{" "}
                {toDate && dayjs(toDate).format("DD-MM-YYYY")}
              </div>
            ) : null}
          </div>

          <hr className="border-dashed" />

          {/* sale summary */}
          <div className="my-4">
            <Table
              style={{ border: "1px solid #ccc" }}
              columns={saleSummaryColumns}
              dataSource={saleSummaryData}
              pagination={false}
              summary={(pageData) => {
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                          {"Total Sales ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong style={{ color: "green" }}>
                          {"Net Sales ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>

          {/* sale return summary */}
          <div className="mt-4 my-4">
            <Table
              style={{ border: "1px solid #ccc" }}
              columns={saleReturnSummaryColumns}
              dataSource={[]}
              pagination={false}
              summary={(pageData) => {
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                          {"Total Sales Return ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong style={{ color: "green" }}>
                          {"Net Sales Return ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>

          <hr className="border-dashed" />

          {/* Purchase summary */}
          <div className="mt-4 my-4">
            <Table
              style={{ border: "1px solid #ccc" }}
              columns={purchaseSummaryColumns}
              dataSource={[]}
              pagination={false}
              summary={(pageData) => {
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                          {"Total Purchase ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong style={{ color: "green" }}>
                          {"Net Purchase ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>

          <hr className="border-dashed" />

          {/* Total tax summary */}
          <div className="mt-4 my-4">
            <Table
              style={{ border: "1px solid #ccc" }}
              columns={totalTaxSummaryColumns}
              dataSource={[]}
              pagination={false}
              summary={(pageData) => {
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                          {"Tax Total ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>0</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>0</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>0</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>0</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>0</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                          {"Tax Credit ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>
                      <Table.Summary.Cell index={5}></Table.Summary.Cell>
                      <Table.Summary.Cell index={6}></Table.Summary.Cell>
                      <Table.Summary.Cell index={7}></Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gstr3;
