import { Button, DatePicker, Flex, Select, Table, Typography } from "antd";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { getGstr1ReportService, getGstr2ReportService } from "../../../api/requests/accounts/reports";
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
    { title: "ID", 
      dataIndex: "index", 
      render: (text, record, index) => {
        return(
          <div>
            {index + 1}
          </div>
        )
      }
    },
    {
      title: "Sales Summary", 
      dataIndex: "title"
    },
    {
      title: "Accessible Amt",
      dataIndex: "accessible_amt",
      key: "accessible_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.bill_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "CGST Amt",
      dataIndex: "cgst_amt",
      key: "cgst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.cgst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "SGST Amt",
      dataIndex: "sgst_amt",
      key: "sgst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.sgst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "IGST Amt",
      dataIndex: "igst_amt",
      key: "igst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.igst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "Cess Amount",
      dataIndex: "cess_amt",
      key: "cess_amt",
      render: (text, record) => {
        return(
          <div>
            0
          </div>
        )
      }
    },
    { title: "Total Amt", 
      dataIndex: "total_amt", 
      key: "total_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.net_amount).toFixed(2)}
          </div>
        )
      } 
    },
    { 
      title: "Round off", 
      dataIndex: "round_off", 
      key: "round_off", 
      render: (text, record) => {
        return(
          <div>
            -
          </div>
        )
      } 
    },
  ];
 
  // Sale return summary related information columns ===================
  const saleReturnSummaryColumns = [
    { title: "ID", 
      dataIndex: "index", 
      render: (text, record, index) => {
        return(
          <div>
            {index + 1}
          </div>
        )
      }
    },
    {
      title: "Sales Return Summary", 
      dataIndex: "title"
    },
    {
      title: "Accessible Amt",
      dataIndex: "accessible_amt",
      key: "accessible_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.bill_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "CGST Amt",
      dataIndex: "cgst_amt",
      key: "cgst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.cgst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "SGST Amt",
      dataIndex: "sgst_amt",
      key: "sgst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.sgst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "IGST Amt",
      dataIndex: "igst_amt",
      key: "igst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.igst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "Cess Amount",
      dataIndex: "cess_amt",
      key: "cess_amt",
      render: (text, record) => {
        return(
          <div>
            0
          </div>
        )
      }
    },
    { title: "Total Amt", 
      dataIndex: "total_amt", 
      key: "total_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.net_amount).toFixed(2)}
          </div>
        )
      } 
    },
    { 
      title: "Round off", 
      dataIndex: "round_off", 
      key: "round_off", 
      render: (text, record) => {
        return(
          <div>
            -
          </div>
        )
      } 
    },
  ];

  // Sale Summary data =======================================
  const [saleSummaryData, setSaleSummaryData] = useState([]) ; 
  const [saleReturnSummaryData, setSaleReturnSummaryData] = useState([]) ; 

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

      // Generate sale summary related information ==========================
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
        let bill_model = undefined ; 
        let bill_name = undefined ; 
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
            let total_bill_amount = 0 ;
            let total_sgst_amount = 0 ;
            let total_cgst_amount = 0 ;
            let total_igst_amount = 0 
            let total_net_amount = 0 ;
            let total_round_off_amount = 0 ;

            bills?.map((element) => {
              total_bill_amount += +element?.amount || 0 ;
              total_sgst_amount += +element?.SGST_amount || 0 ;
              total_cgst_amount += +element?.CGST_amount || 0 ;
              total_igst_amount += +element?.IGST_amount || 0 ; 
              total_net_amount += +element?.net_amount || 0 ; 
            })

            temp_data.push({
              title: `${bill_model} ( ${sgst} + ${cgst} )`, 
              bill_amount: total_bill_amount, 
              sgst_amount: total_sgst_amount, 
              cgst_amount: total_cgst_amount, 
              igst_amount: total_igst_amount, 
              net_amount: total_net_amount, 
              bills: bills
            })
          });
        });
      }); 
      setSaleSummaryData(temp_data) ; 

      // Genertae sale return summary related information =====================
      const returnGroupedData = gstr1Data?.credit_debit_note?.reduce((acc, item) => {
        if (!acc[item.credit_note_type || item?.debit_note_type]) {
          acc[item.credit_note_type || item?.debit_note_type] = {};
        }
      
        // Group by SGST inside each model group
        if (!acc[item.credit_note_type || item?.debit_note_type][item.SGST_value]) {
          acc[item.credit_note_type || item?.debit_note_type][item.SGST_value] = [];
        }
      
        // Group by CGST inside SGST group
        if (!acc[item.credit_note_type || item?.debit_note_type][item.SGST_value][item.CGST_value]) {
          acc[item.credit_note_type || item?.debit_note_type][item.SGST_value][item.CGST_value] = [];
        }
      
        // Add the item to the respective SGST and CGST group
        acc[item.credit_note_type || item?.debit_note_type][item.SGST_value][item.CGST_value].push(item);
      
        return acc;
      }, {});

      let sale_return_temp_data = [] ; 
      Object.entries(returnGroupedData).forEach(([key, value]) => {
        let bill_name = undefined ;
        let bill_model = undefined ; 

        if (key == "yarn_sale_return"){
          bill_model = "YARN SALE (GST) %"
        } else if (key == "sale_return"){
          bill_model = "GREY SALE (GST) %"
        } else if (key == "beam_sale_return"){
          bill_model = "BEAM SALE (GST) %"
        } else if (key == "other"){
          bill_model = "OTHER NOTES (GST) %"
        } else {
          bill_model = "DISCOUNT NOTES (GST) %"
        }; 

        Object.entries(value).forEach(([sgst, cgst_data]) => {
          Object.entries(cgst_data).forEach(([cgst, bills]) => {
            bill_name = `${bill_model} ( ${sgst} + ${cgst} )` ; 
            let total_bill_amount = 0 ;
            let total_sgst_amount = 0 ;
            let total_cgst_amount = 0 ;
            let total_igst_amount = 0 
            let total_net_amount = 0 ;
            let total_round_off_amount = 0 ;

            bills?.map((element) => {
              if (element?.amount == null){
                let details = element?.credit_note_details || element?.debit_note_details ; 
                let totalAmount = 0 ; 
                details?.map((notes) => {
                  totalAmount += +notes?.amount || 0; 
                })
                total_bill_amount += +totalAmount ;
              } else {
                total_bill_amount += +element?.amount;
              }
              
              total_sgst_amount += +element?.SGST_amount || 0 ;
              total_cgst_amount += +element?.CGST_amount || 0 ;
              total_igst_amount += +element?.IGST_amount || 0 ; 
              total_net_amount += +element?.net_amount || 0 ; 
            })

            sale_return_temp_data.push({
              title: `${bill_model} ( ${sgst} + ${cgst} )`, 
              bill_amount: total_bill_amount, 
              sgst_amount: total_sgst_amount, 
              cgst_amount: total_cgst_amount, 
              igst_amount: total_igst_amount, 
              net_amount: total_net_amount, 
              bills: bills
            })
          });
        });
      }); 
      
      setSaleReturnSummaryData(sale_return_temp_data) ; 
    }

  }, [gstr1Data, isLoadingGstr1]) ; 

  // Purchase summary information related data ========================= 
  const [purchaseSummaryData, setPurchaseSummaryData] = useState([]) ; 
  const [purchaseReturnSummaryData, setPurchaseReturnSummaryData] = useState([]) ; 
  const {data: gstr2Data, isFetching: isLoadingGstr2} = useQuery({
    queryKey: ["gstr-2", "report", "data"], 
    queryFn: async () => {
      const res = await getGstr2ReportService({
        params: {
          company_id: company, 
          from: dayjs(fromDate).format("YYYY-MM-DD"),
          to: dayjs(toDate).format("YYYY-MM-DD"),
        }
      })
      return res?.data?.data ; 
    }, 
    enabled: isSubmitted
  })

  const purchaseSummaryColumns = [
    { title: "ID", 
      dataIndex: "index", 
      render: (text, record, index) => {
        return(
          <div>
            {index + 1}
          </div>
        )
      }
    },
    {
      title: "Sales Summary", 
      dataIndex: "title"
    },
    {
      title: "Accessible Amt",
      dataIndex: "accessible_amt",
      key: "accessible_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.bill_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "CGST Amt",
      dataIndex: "cgst_amt",
      key: "cgst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.cgst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "SGST Amt",
      dataIndex: "sgst_amt",
      key: "sgst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.sgst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "IGST Amt",
      dataIndex: "igst_amt",
      key: "igst_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.igst_amount).toFixed(2)}
          </div>
        )
      }
    },
    {
      title: "Cess Amount",
      dataIndex: "cess_amt",
      key: "cess_amt",
      render: (text, record) => {
        return(
          <div>
            0
          </div>
        )
      }
    },
    { title: "Total Amt", 
      dataIndex: "total_amt", 
      key: "total_amt",
      render: (text, record) => {
        return(
          <div>
            {parseFloat(record?.net_amount).toFixed(2)}
          </div>
        )
      } 
    },
    { 
      title: "Round off", 
      dataIndex: "round_off", 
      key: "round_off", 
      render: (text, record) => {
        return(
          <div>
            -
          </div>
        )
      } 
    },
  ];

  useEffect(() => {
    if (gstr2Data !== undefined && gstr2Data !== null){

      // Generate purchase summary related information 
      const groupedData = gstr2Data?.b2b_invoice?.reduce((acc, item) => {
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
        let bill_model = undefined ; 
        let bill_name = undefined ; 
        if (key == "job_taka_bills"){
          bill_model = "JOB PURCHASE (GST) %"
        } else if (key == "purchase_taka_bills"){
          bill_model = "GREY PURCHASE (GST) %"
        } else if (key == "yarn_bills"){
          bill_model = "YARN PURCHASE (GST) %"
        } else if (key == "receive_size_beam_bill"){
          bill_model = "BEAM_PURCHASE (GST) %"
        } else {
          bill_model = "JOB WORK SALE (GST) %"
        }; 

        Object.entries(value).forEach(([sgst, cgst_data]) => {
          Object.entries(cgst_data).forEach(([cgst, bills]) => {
            bill_name = `${bill_model} ( ${sgst} + ${cgst} )` ; 
            let total_bill_amount = 0 ;
            let total_sgst_amount = 0 ;
            let total_cgst_amount = 0 ;
            let total_igst_amount = 0 
            let total_net_amount = 0 ;
            let total_round_off_amount = 0 ;

            bills?.map((element) => {
              total_bill_amount += +element?.amount || 0 ;
              total_sgst_amount += +element?.SGST_amount || 0 ;
              total_cgst_amount += +element?.CGST_amount || 0 ;
              total_igst_amount += +element?.IGST_amount || 0 ; 
              total_net_amount += +element?.net_amount || 0 ; 
            })

            temp_data.push({
              title: `${bill_model} ( ${sgst} + ${cgst} )`, 
              bill_amount: total_bill_amount, 
              sgst_amount: total_sgst_amount, 
              cgst_amount: total_cgst_amount, 
              igst_amount: total_igst_amount, 
              net_amount: total_net_amount, 
              bills: bills
            })
          });
        });
      }); 

      setPurchaseSummaryData(temp_data) ; 

      // Purchase return summary related data information ============================================  
      const returnGroupedData = gstr2Data?.credit_debit_note?.reduce((acc, item) => {
        if (!acc[item.credit_note_type || item?.debit_note_type]) {
          acc[item.credit_note_type || item?.debit_note_type] = {};
        }
      
        // Group by SGST inside each model group
        if (!acc[item.credit_note_type || item?.debit_note_type][item.SGST_value]) {
          acc[item.credit_note_type || item?.debit_note_type][item.SGST_value] = [];
        }
      
        // Group by CGST inside SGST group
        if (!acc[item.credit_note_type || item?.debit_note_type][item.SGST_value][item.CGST_value]) {
          acc[item.credit_note_type || item?.debit_note_type][item.SGST_value][item.CGST_value] = [];
        }
      
        // Add the item to the respective SGST and CGST group
        acc[item.credit_note_type || item?.debit_note_type][item.SGST_value][item.CGST_value].push(item);
      
        return acc;
      }, {});

      let sale_return_temp_data = [] ; 
      Object.entries(returnGroupedData).forEach(([key, value]) => {
        let bill_name = undefined ;
        let bill_model = undefined ; 
  
        if (key == "purchase_return"){
          bill_model = "YARN PURCHASE RETURN (GST) %"
        } else if (key == "yarn_return"){
          bill_model = "YARN RETURN (GST) %"
        } else if (key == "beam_return"){
          bill_model = "BEAM RETURN (GST) %"
        } else if (key == "other"){
          bill_model = "OTHER NOTES (GST) %"
        } else {
          bill_model =  "OTEHR (GST) %"
        }

        Object.entries(value).forEach(([sgst, cgst_data]) => {
          Object.entries(cgst_data).forEach(([cgst, bills]) => {
            bill_name = `${bill_model} ( ${sgst} + ${cgst} )` ; 
            let total_bill_amount = 0 ;
            let total_sgst_amount = 0 ;
            let total_cgst_amount = 0 ;
            let total_igst_amount = 0 
            let total_net_amount = 0 ;
            let total_round_off_amount = 0 ;
  
            bills?.map((element) => {
              if (element?.amount == null){
                let details = element?.credit_note_details || element?.debit_note_details ; 
                let totalAmount = 0 ; 
                details?.map((notes) => {
                  totalAmount += +notes?.amount || 0; 
                })
                total_bill_amount += +totalAmount ;
              } else {
                total_bill_amount += +element?.amount;
              }
              
              total_sgst_amount += +element?.SGST_amount || 0 ;
              total_cgst_amount += +element?.CGST_amount || 0 ;
              total_igst_amount += +element?.IGST_amount || 0 ; 
              total_net_amount += +element?.net_amount || 0 ; 
            })
  
            sale_return_temp_data.push({
              title: `${bill_model} ( ${sgst} + ${cgst} )`, 
              bill_amount: total_bill_amount, 
              sgst_amount: total_sgst_amount, 
              cgst_amount: total_cgst_amount, 
              igst_amount: total_igst_amount, 
              net_amount: total_net_amount, 
              bills: bills
            })
          });
        });
  
      }); 
      setPurchaseReturnSummaryData(sale_return_temp_data)
    }
  }, [gstr2Data])
 
  const submitHandler = () => {
    if (company && companyListRes) {
      const companyData = companyListRes?.rows?.find(
        ({ id }) => id === company
      );
      setSelectedCompany(companyData);
    }
    setIsSubmitted(true);
  };

  // Total tax summary related information data =========================================
  const totalTaxSummaryColumns = [
    {
      title : "ID", 
      dataIndex: "id", 
      render: (text, record, index) => {
        return(
          <div>
            {index + 1}
          </div>
        )
      }
    }, 
    { 
      title: "Total Tax Summary", 
      dataIndex: "summary", 
      key: "summary" 
    },
    {
      title: "Accessible Amt",
      dataIndex: "total_amount",
      key: "accessible_amt",
    },
    {
      title: "CGST Amt",
      dataIndex: "total_cgst",
      key: "cgst_amt",
    },
    {
      title: "SGST Amt",
      dataIndex: "total_sgst",
      key: "sgst_amt",
    },
    {
      title: "IGST Amt",
      dataIndex: "total_igst",
      key: "igst_amt",
    },
    {
      title: "Cess Amount",
      dataIndex: "cess_amt",
      key: "cess_amt",
      render: (text, record) => {
        return(
          <div>0</div>
        )
      }
    },
    {
      title: "Total GST Amount", 
      dataIndex: "total_gst_amount", 
      render: (text, record) => {
        let cgst_amount = record?.total_cgst; 
        let sgst_amount = record?.total_sgst ; 
        let igst_amount = record?.total_igst ; 
        let total_amount = +cgst_amount + +sgst_amount + +igst_amount ; 

        return(
          parseFloat(total_amount).toFixed(2)
        )
      }
    }, 
    { 
      title: "Total Amt", 
      dataIndex: "total_net_amount", 
      key: "total_net_amount" 
    }
  ];
  const [totalTaxSummaryData, setTotalTaxSumaryData] = useState([]) ; 

  useEffect(() => {

    let temp_total_tax_data = [] ; 

    // Total Purchase count 
    let total_amount = 0 ;
    let total_sgst = 0 ; 
    let total_cgst = 0 ; 
    let total_igst = 0 ; 
    let total_net_amount = 0; 
    let total_round_off_net_amount = 0 ;

    purchaseSummaryData?.map((element) => {
      total_amount += +element?.bill_amount ; 
      total_sgst += +element?.sgst_amount ; 
      total_cgst += +element?.cgst_amount ; 
      total_igst += +element?.igst_amount ; 
      total_net_amount += +element?.net_amount ; 
    })

    total_amount = parseFloat(total_amount).toFixed(2) ; 
    total_sgst = parseFloat(total_sgst).toFixed(2) ; 
    total_cgst = parseFloat(total_cgst).toFixed(2) ; 
    total_igst = parseFloat(total_igst).toFixed(2);  
    total_net_amount = parseFloat(total_net_amount).toFixed(2) ; 

    temp_total_tax_data.push({
      summary: "GST Purchase", 
      total_amount, 
      total_cgst, 
      total_sgst, 
      total_igst, 
      total_net_amount
    })

    total_amount = 0 ;
    total_cgst = 0 ; 
    total_sgst = 0 ; 
    total_igst = 0 ; 
    total_net_amount = 0 ;

    purchaseReturnSummaryData?.map((element) => {
      total_amount += +element?.bill_amount ; 
      total_sgst += +element?.sgst_amount ; 
      total_cgst += +element?.cgst_amount ; 
      total_igst += +element?.igst_amount ; 
      total_net_amount += +element?.net_amount ; 
    })

    total_amount = parseFloat(total_amount).toFixed(2) ; 
    total_sgst = parseFloat(total_sgst).toFixed(2) ; 
    total_cgst = parseFloat(total_cgst).toFixed(2) ; 
    total_igst = parseFloat(total_igst).toFixed(2);  
    total_net_amount = parseFloat(total_net_amount).toFixed(2) ; 

    temp_total_tax_data.push({
      summary: "Purchase Return",
      total_amount, 
      total_cgst, 
      total_sgst, 
      total_igst, 
      total_net_amount
    })

    total_amount = 0 ;
    total_cgst = 0 ; 
    total_sgst = 0 ; 
    total_igst = 0 ; 
    total_net_amount = 0 ;

    // Total Inwards Suppliers related information 
    let total_purchase = temp_total_tax_data.find((item) => item?.summary == "GST Purchase") ; 
    let total_purchase_return = temp_total_tax_data.find((item) => item?.summary == "Purchase Return") ; 

    let inwards_total_amount = +total_purchase?.total_amount - +total_purchase_return?.total_amount ; 
    let inwards_total_sgst = +total_purchase?.total_sgst - +total_purchase_return?.total_sgst ; 
    let inwards_total_cgst = +total_purchase?.total_cgst - +total_purchase_return?.total_cgst ; 
    let inwards_total_igst = +total_purchase?.total_igst - +total_purchase_return?.total_igst ; 
    let inwards_total_net_amount = +total_purchase?.total_net_amount - +total_purchase_return?.total_net_amount ; 

    temp_total_tax_data.push({
      summary: "Total Inward Supplies [A]", 
      total_amount: parseFloat(inwards_total_amount).toFixed(2),
      total_sgst: parseFloat(inwards_total_sgst).toFixed(2), 
      total_cgst: parseFloat(inwards_total_cgst).toFixed(2), 
      total_igst: parseFloat(inwards_total_igst).toFixed(2), 
      total_net_amount: parseFloat(inwards_total_net_amount).toFixed(2)
    })

    temp_total_tax_data.push({
      summary: "GST Sales (+)", 
      total_amount: 0 ,
      total_sgst: 0, 
      total_cgst: 0, 
      total_igst: 0, 
      total_net_amount: 0
    })

    // Sale return amount related calculations
    saleReturnSummaryData?.map((element) => {
      total_amount += +element?.bill_amount ; 
      total_sgst += +element?.sgst_amount ; 
      total_cgst += +element?.cgst_amount ; 
      total_igst += +element?.igst_amount ; 
      total_net_amount += +element?.net_amount ; 
    })

    total_amount = parseFloat(total_amount).toFixed(2) ; 
    total_sgst = parseFloat(total_sgst).toFixed(2) ; 
    total_cgst = parseFloat(total_cgst).toFixed(2) ; 
    total_igst = parseFloat(total_igst).toFixed(2);  
    total_net_amount = parseFloat(total_net_amount).toFixed(2) ; 

    temp_total_tax_data.push({
      summary: "Sale Return", 
      total_amount: total_amount ,
      total_sgst: total_sgst, 
      total_cgst: total_cgst, 
      total_igst: total_igst, 
      total_net_amount: total_net_amount
    })

    // Total outwards suppliers related information 
    temp_total_tax_data.push({
      summary: "Total Outwards Suppliers [B]", 
      total_amount: 0 - total_amount ,
      total_sgst: 0 - total_sgst, 
      total_cgst: 0 - total_cgst, 
      total_igst: 0 - total_igst, 
      total_net_amount: 0 - total_net_amount
    })

    setTotalTaxSumaryData(temp_total_tax_data) ;

  }, [saleSummaryData, saleReturnSummaryData, purchaseSummaryData, purchaseReturnSummaryData])

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

          {/* ========== Sale Summary information =============  */}
          <div className="my-4">
            <div className="gstr3b-report-title">
              ========= SALE SUMMARY =========
            </div>
            <Table
              style={{ border: "1px solid #ccc" }}
              columns={saleSummaryColumns}
              dataSource={saleSummaryData}
              pagination={false}
              summary={(pageData) => {

                let total_amount = 0 ;
                let total_sgst = 0 ; 
                let total_cgst = 0 ; 
                let total_igst = 0 ; 
                let total_net_amount = 0; 
                let total_round_off_net_amount = 0 ;

                saleSummaryData?.map((element) => {
                  total_amount += +element?.bill_amount ; 
                  total_sgst += +element?.sgst_amount ; 
                  total_cgst += +element?.cgst_amount ; 
                  total_igst += +element?.igst_amount ; 
                  total_net_amount += +element?.net_amount ; 
                })

                total_round_off_net_amount = Math.round(total_net_amount) ; 

                return (
                  <Table.Summary fixed>

                    {/* ===== Particula total amount =====  */}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong></strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>{parseFloat(total_amount).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{parseFloat(total_cgst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>{parseFloat(total_sgst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>{parseFloat(total_igst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>{parseFloat(total_net_amount).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                    </Table.Summary.Row>

                    {/* ===== Total sale round off related information  ====== */}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
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
                        <strong>{parseFloat(total_round_off_net_amount).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      
                      <Table.Summary.Cell index={7}>
                        <strong style={{ color: "green" }}>
                          {"Round Off ->"}
                        </strong>
                      </Table.Summary.Cell>
                      
                      <Table.Summary.Cell>
                        {parseFloat(+total_round_off_net_amount - +total_net_amount).toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    
                    {/* ==== Total amount information ====  */}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                        {"Total Sales ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {parseFloat(total_round_off_net_amount).toFixed(2)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>

                      <Table.Summary.Cell index={5}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>

          {/* =========== Sale Return information ============ */}
          <div className="mt-4 my-4">
            <div className="gstr3b-report-title">
               ========= SALE RETURN SUMMARY ========== 
            </div>
            <Table
                style={{ border: "1px solid #ccc" }}
                columns={saleReturnSummaryColumns}
                dataSource={saleReturnSummaryData}
                pagination={false}
                summary={(pageData) => {

                  let total_amount = 0 ;
                  let total_sgst = 0 ; 
                  let total_cgst = 0 ; 
                  let total_igst = 0 ; 
                  let total_net_amount = 0; 
                  let total_round_off_net_amount = 0 ;

                  saleReturnSummaryData?.map((element) => {
                    total_amount += +element?.bill_amount ; 
                    total_sgst += +element?.sgst_amount ; 
                    total_cgst += +element?.cgst_amount ; 
                    total_igst += +element?.igst_amount ; 
                    total_net_amount += +element?.net_amount ; 
                  })

                  total_round_off_net_amount = Math.round(total_net_amount) ; 

                  return (
                    <Table.Summary fixed>

                      {/* ===== Particula total amount =====  */}
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong>Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong></strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <strong>{parseFloat(total_amount).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <strong>{parseFloat(total_cgst).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          <strong>{parseFloat(total_sgst).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>
                          <strong>{parseFloat(total_igst).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>
                          <strong>{0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={7}>
                          <strong>{parseFloat(total_net_amount).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                      </Table.Summary.Row>

                      {/* ===== Total sale round off related information  ====== */}
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong style={{ color: "green" }}>
                          </strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
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
                          <strong>{parseFloat(total_round_off_net_amount).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        
                        <Table.Summary.Cell index={7}>
                          <strong style={{ color: "green" }}>
                            {"Round Off ->"}
                          </strong>
                        </Table.Summary.Cell>
                        
                        <Table.Summary.Cell>
                          {parseFloat(+total_round_off_net_amount - +total_net_amount).toFixed(2)}
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      
                      {/* ==== Total amount information ====  */}
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong style={{ color: "green" }}>
                          {"Total Sales ->"}
                          </strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          {parseFloat(total_round_off_net_amount).toFixed(2)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                        <Table.Summary.Cell index={3}></Table.Summary.Cell>
                        <Table.Summary.Cell index={4}></Table.Summary.Cell>

                        <Table.Summary.Cell index={5}>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={7}>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
          </div>

          <hr className="border-dashed" />

          {/* ================= Purchase summary information ================  */}
          <div className="mt-4 my-4">
            <div className="gstr3b-report-title">
              ============== PURCHASE SUMMARY ====================
            </div>
            <Table
              style={{ border: "1px solid #ccc" }}
              columns={purchaseSummaryColumns}
              dataSource={purchaseSummaryData}
              pagination={false}
              summary={(pageData) => {

                let total_amount = 0 ;
                let total_sgst = 0 ; 
                let total_cgst = 0 ; 
                let total_igst = 0 ; 
                let total_net_amount = 0; 
                let total_round_off_net_amount = 0 ;

                purchaseSummaryData?.map((element) => {
                  total_amount += +element?.bill_amount ; 
                  total_sgst += +element?.sgst_amount ; 
                  total_cgst += +element?.cgst_amount ; 
                  total_igst += +element?.igst_amount ; 
                  total_net_amount += +element?.net_amount ; 
                })

                total_round_off_net_amount = Math.round(total_net_amount) ; 

                return (
                  <Table.Summary fixed>

                    {/* ===== Particula total amount =====  */}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong></strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>{parseFloat(total_amount).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{parseFloat(total_cgst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>{parseFloat(total_sgst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>{parseFloat(total_igst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>{parseFloat(total_net_amount).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell></Table.Summary.Cell>
                    </Table.Summary.Row>

                    {/* ===== Total sale round off related information  ====== */}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
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
                        <strong>{parseFloat(total_round_off_net_amount).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      
                      <Table.Summary.Cell index={7}>
                        <strong style={{ color: "green" }}>
                          {"Round Off ->"}
                        </strong>
                      </Table.Summary.Cell>
                      
                      <Table.Summary.Cell>
                        {parseFloat(+total_round_off_net_amount - +total_net_amount).toFixed(2)}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    
                    {/* ==== Total amount information ====  */}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                        {"Total Sales ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {parseFloat(total_round_off_net_amount).toFixed(2)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>

                      <Table.Summary.Cell index={5}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>

          <hr className="border-dashed" />

          <div className="mt-4 my-4">
            <div className="gstr3b-report-title">
               ========= PURCHASE RETURN SUMMARY ========== 
            </div>
            <Table
                style={{ border: "1px solid #ccc" }}
                columns={saleReturnSummaryColumns}
                dataSource={purchaseReturnSummaryData}
                pagination={false}
                summary={(pageData) => {

                  let total_amount = 0 ;
                  let total_sgst = 0 ; 
                  let total_cgst = 0 ; 
                  let total_igst = 0 ; 
                  let total_net_amount = 0; 
                  let total_round_off_net_amount = 0 ;

                  purchaseReturnSummaryData?.map((element) => {
                    total_amount += +element?.bill_amount ; 
                    total_sgst += +element?.sgst_amount ; 
                    total_cgst += +element?.cgst_amount ; 
                    total_igst += +element?.igst_amount ; 
                    total_net_amount += +element?.net_amount ; 
                  })

                  total_round_off_net_amount = Math.round(total_net_amount) ; 

                  return (
                    <Table.Summary fixed>

                      {/* ===== Particula total amount =====  */}
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong>Total</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <strong></strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}>
                          <strong>{parseFloat(total_amount).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={3}>
                          <strong>{parseFloat(total_cgst).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={4}>
                          <strong>{parseFloat(total_sgst).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={5}>
                          <strong>{parseFloat(total_igst).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>
                          <strong>{0}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={7}>
                          <strong>{parseFloat(total_net_amount).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell></Table.Summary.Cell>
                      </Table.Summary.Row>

                      {/* ===== Total sale round off related information  ====== */}
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong style={{ color: "green" }}>
                          </strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
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
                          <strong>{parseFloat(total_round_off_net_amount).toFixed(2)}</strong>
                        </Table.Summary.Cell>
                        
                        <Table.Summary.Cell index={7}>
                          <strong style={{ color: "green" }}>
                            {"Round Off ->"}
                          </strong>
                        </Table.Summary.Cell>
                        
                        <Table.Summary.Cell>
                          {parseFloat(+total_round_off_net_amount - +total_net_amount).toFixed(2)}
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                      
                      {/* ==== Total amount information ====  */}
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0}>
                          <strong style={{ color: "green" }}>
                          {"Total Sales ->"}
                          </strong>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          {parseFloat(total_round_off_net_amount).toFixed(2)}
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={2}></Table.Summary.Cell>
                        <Table.Summary.Cell index={3}></Table.Summary.Cell>
                        <Table.Summary.Cell index={4}></Table.Summary.Cell>

                        <Table.Summary.Cell index={5}>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={6}>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={7}>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
          </div>

          {/* ========= Total tax summary information =======  */}
          <div className="mt-4 my-4">
            <div className="gstr3b-report-title">
              ==============TOTAL TAX SUMMARY ====================
            </div>
            <Table
              style={{ border: "1px solid #ccc" }}
              columns={totalTaxSummaryColumns}
              dataSource={totalTaxSummaryData}
              pagination={false}
              summary={(pageData) => {

                let total_amount = 0 ;
                let total_sgst = 0 ; 
                let total_cgst = 0 ; 
                let total_igst = 0 ; 
                let total_net_amount = 0; 
                let total_round_off_net_amount = 0 ;
                let total_gst_amount = 0 ; 

                let total_inward_suppliers = totalTaxSummaryData.find((item) => item?.summary ==  "Total Inward Supplies [A]") ; 
                let total_outward_suppliers = totalTaxSummaryData.find((item) => item?.summary == "Total Outwards Suppliers [B]") ; 

                total_amount = +total_inward_suppliers?.total_amount - +total_outward_suppliers?.total_amount ; 
                total_sgst = +total_inward_suppliers?.total_sgst - +total_outward_suppliers?.total_sgst ;
                total_cgst =  +total_inward_suppliers?.total_cgst - +total_outward_suppliers?.total_cgst ; 
                total_igst =  +total_inward_suppliers?.total_igst - +total_outward_suppliers?.total_igst ; 

                total_gst_amount += +total_inward_suppliers?.total_sgst - +total_outward_suppliers?.total_sgst ;
                total_gst_amount += +total_inward_suppliers?.total_cgst - +total_outward_suppliers?.total_cgst ; 
                total_gst_amount += +total_inward_suppliers?.total_igst - +total_outward_suppliers?.total_igst ; 

                total_net_amount =  +total_inward_suppliers?.total_net_amount - +total_outward_suppliers?.total_net_amount ; 

                return (
                  <Table.Summary fixed>

                    {/* ===== Particula total amount =====  */}
                    <Table.Summary.Row className="tax-total-amount-row">
                      <Table.Summary.Cell index={0}>
                        <strong>
                          {`Total => (A - B)`}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        <strong></strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}>
                        <strong>{parseFloat(total_amount).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3}>
                        <strong>{parseFloat(total_cgst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={4}>
                        <strong>{parseFloat(total_sgst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={5}>
                        <strong>{parseFloat(total_igst).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                        <strong>{0}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                        <strong>{parseFloat(total_gst_amount).toFixed(2)}</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        {total_net_amount}
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                    
                    {/* ==== Total amount information ====  */}
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0}>
                        <strong style={{ color: "green" }}>
                        {"Tax Credit ->"}
                        </strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1}>
                        {parseFloat(total_gst_amount).toFixed(2)}
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={2}></Table.Summary.Cell>
                      <Table.Summary.Cell index={3}></Table.Summary.Cell>
                      <Table.Summary.Cell index={4}></Table.Summary.Cell>

                      <Table.Summary.Cell index={5}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={6}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={7}>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </div>

          {/* === No tax related bill information ===  */}
          <div className="mt-4 text-red-500 text-sm" style={{
              fontWeight: 600
            }}>
            <p>
              Zero tax rate invoice : {gstr1Data?.skip_b2b_bills?.map((element) => element?.invoice_no || element?.bill_no).join(",")} {gstr1Data?.skip_b2b_bills?.length == 0?"Not Found any Invoice":""}
            </p>
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
                <b>Grey purchase</b> : {gstr2Data && gstr2Data?.purchase_challans?.map((element) => element?.challan_no || element?.bill_no).join(", ")}
              </div>
              <div>
                <b>Yarn purchase</b> : {gstr2Data && gstr2Data?.yarn_challans?.map((element) => element?.challan_no).join(", ")}
              </div>
            </div>
                
        </div>
      </div>
    </div>
  );
};

export default Gstr3;
