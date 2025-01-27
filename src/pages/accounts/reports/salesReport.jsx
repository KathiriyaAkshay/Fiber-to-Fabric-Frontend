import { ProfileOutlined } from "@ant-design/icons";
import {
  Button,
  Collapse,
  DatePicker,
  Flex,
  Select,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { getAccountSalesReportService } from "../../../api/requests/accounts/reports";

const SalesReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  const { companyListRes } = useContext(GlobalContext);

  const selectedCompany = useMemo(() => {
    if (companyId) {
      return companyListRes?.rows?.find(({ id }) => id === companyId);
    }
  }, [companyId, companyListRes]);

  const { data: salesReportData, isLoading } = useQuery({
    queryKey: [
      "get",
      "sales-report",
      {
        company_id: companyId,
        fromDate: dayjs(fromDate).format("YYYY-MM-DD"),
        toDate: dayjs(toDate).format("YYYY-MM-DD"),
      },
    ],
    queryFn: async () => {
      const res = await getAccountSalesReportService({
        params: {
          company_id: companyId,
          fromDate: dayjs(fromDate).format("YYYY-MM-DD"),
          toDate: dayjs(toDate).format("YYYY-MM-DD"),
        },
      });
      return res?.data?.data;
    },
    enabled: !!companyId,
  });

  useEffect(() => {
    // Get current date
    const currentDate = dayjs();

    // Set April 1st of the current year
    const aprilFirst = dayjs().set("month", 3).set("date", 1); // April is month 3 (0-indexed)

    setFromDate(aprilFirst);
    setToDate(currentDate);
  }, []);

  const inHouseGreySaleItems = [
    {
      key: "1",
      label: (
        <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
          <ProfileOutlined /> &nbsp;&nbsp; Inhouse Grey Sales
        </tr>
      ),
      children: (
        <table
          style={{ fontSize: "12px", width: "100%", borderColor: "#f0f0f0" }}
          border={1}
          cellSpacing={0}
          cellPadding={6}
        >
          <tbody>
            {salesReportData && salesReportData?.inhouseSalesReport?.length
              ? salesReportData?.inhouseSalesReport?.map((item, index) => {
                  return (
                    <tr key={index + "_inhouse_sale_report"}>
                      <td>{item?.quality?.quality_name || ""}</td>
                      <td style={{ width: "20%" }}>
                        {item?.inhouse_meter || 0}
                      </td>
                      <td style={{ width: "20%" }}>
                        {item?.inhouse_weight || 0}
                      </td>
                      {/* <td style={{ width: "20%" }}>{item?.avg_rate || 0}</td> */}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      ),
    },
  ];

  const inhouseGreySaleReturn = useMemo(() => {
    if (salesReportData && salesReportData?.inhouseSalesReport?.length) {
      let totalMeter = 0;

      salesReportData?.inhouseSalesReport?.forEach((item) => {
        totalMeter += +item?.inhouse_return_meter || 0;
      });

      return {
        totalMeter: totalMeter,
      };
    }
  }, [salesReportData]);

  const inhouseGreyTotal = useMemo(() => {
    if (salesReportData && salesReportData?.inhouseSalesReport?.length) {
      let totalMeter = 0;

      salesReportData?.inhouseSalesReport?.forEach((item) => {
        totalMeter += +item?.inhouse_meter || 0;
      });

      totalMeter = totalMeter - inhouseGreySaleReturn?.totalMeter || 0;
      return {
        totalMeter: totalMeter,
      };
    }
  }, [inhouseGreySaleReturn?.totalMeter, salesReportData]);

  const purchaseGreySaleItems = [
    {
      key: "1",
      label: (
        <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
          <ProfileOutlined /> &nbsp;&nbsp; Purchase Grey Sales
        </tr>
      ),
      children: (
        <table
          style={{ fontSize: "12px", width: "100%", borderColor: "#f0f0f0" }}
          border={1}
          cellSpacing={0}
          cellPadding={6}
        >
          <tbody>
            {salesReportData && salesReportData?.purchaseSaleReport?.length
              ? salesReportData?.purchaseSaleReport.map((item, index) => {
                  return (
                    <tr key={index + "_purchase_sale_report"}>
                      <td>{item?.quality?.quality_name || ""}</td>
                      <td style={{ width: "20%" }}>
                        {item?.purchase_meter || 0}
                      </td>
                      <td style={{ width: "20%" }}>
                        {item?.purchase_weight || 0}
                      </td>
                      {/* <td style={{ width: "20%" }}>{item?.avg_rate || 0}</td> */}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      ),
    },
  ];

  const purchaseGreySaleReturn = useMemo(() => {
    if (salesReportData && salesReportData?.purchaseSaleReport?.length) {
      let totalMeter = 0;

      salesReportData?.purchaseSaleReport?.forEach((item) => {
        totalMeter += +item?.purchase_return_meter || 0;
      });

      return {
        totalMeter: totalMeter,
      };
    }
  }, [salesReportData]);

  const purchaseGreyTotal = useMemo(() => {
    if (salesReportData && salesReportData?.purchaseSaleReport?.length) {
      let totalMeter = 0;

      salesReportData?.purchaseSaleReport?.forEach((item) => {
        totalMeter += +item?.purchase_meter || 0;
      });

      totalMeter = totalMeter - purchaseGreySaleReturn?.totalMeter || 0;
      return {
        totalMeter: totalMeter,
      };
    }
  }, [purchaseGreySaleReturn?.totalMeter, salesReportData]);

  const jobPurchaseItems = [
    {
      key: "1",
      label: (
        <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
          <ProfileOutlined /> &nbsp;&nbsp; Job Grey Sales
        </tr>
      ),
      children: (
        <table
          style={{ fontSize: "12px", width: "100%", borderColor: "#f0f0f0" }}
          border={1}
          cellSpacing={0}
          cellPadding={6}
        >
          <tbody>
            {salesReportData && salesReportData?.jobSaleReport?.length
              ? salesReportData?.jobSaleReport?.map((item, index) => {
                  return (
                    <tr key={index + "_job_sale_report"}>
                      <td>{item?.quality?.quality_name || ""}</td>
                      <td style={{ width: "20%" }}>{item?.job_meter || 0}</td>
                      <td style={{ width: "20%" }}>{item?.job_weight || 0}</td>
                      {/* <td style={{ width: "20%" }}>{item?.avg_rate || 0}</td> */}
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      ),
    },
  ];

  const jobPurchaseSaleReturn = useMemo(() => {
    if (salesReportData && salesReportData?.jobSaleReport?.length) {
      let totalMeter = 0;

      salesReportData?.jobSaleReport?.forEach((item) => {
        totalMeter += +item?.job_return_meter || 0;
      });

      return {
        totalMeter: totalMeter,
      };
    }
  }, [salesReportData]);

  const jobPurchaseTotal = useMemo(() => {
    if (salesReportData && salesReportData?.jobSaleReport?.length) {
      let totalMeter = 0;

      salesReportData?.jobSaleReport?.forEach((item) => {
        totalMeter += +item?.job_meter || 0;
      });

      totalMeter = totalMeter - jobPurchaseSaleReturn?.totalMeter || 0;
      return {
        totalMeter: totalMeter,
      };
    }
  }, [jobPurchaseSaleReturn?.totalMeter, salesReportData]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">
            Sales Report ( {dayjs(fromDate).format("DD-MM-YYYY")} To{" "}
            {dayjs(toDate).format("DD-MM-YYYY")} )
          </h3>
        </div>
        <Flex align="center" justify="flex-end" gap={10}>
          <Flex align="center" gap={10}>
            {/* <Typography>Company</Typography> */}
            <Select
              className="width-100"
              placeholder="Select Company"
              style={{
                textTransform: "capitalize",
                minWidth: "160px",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              allowClear
              value={companyId}
              onChange={(selectedValue) => setCompanyId(selectedValue)}
              options={
                companyListRes &&
                companyListRes?.rows?.map((company) => {
                  return {
                    label: company?.company_name,
                    value: company?.id,
                  };
                })
              }
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography>From</Typography>
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              format="DD-MM-YYYY"
            />
            <Typography>To</Typography>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              format="DD-MM-YYYY"
            />
          </Flex>
          <Button
            type="primary"
            className="flex-none"
          >
            Export
          </Button>
          <Button type="primary">Summary</Button>
        </Flex>
      </div>

      {isLoading ? (
        <Flex justify="center">
          <Spin />
        </Flex>
      ) : !selectedCompany ? (
        <Flex justify="center">
          <Typography.Text
            style={{ color: "gray", fontSize: "14px", fontStyle: "italic" }}
          >
            Please select company...
          </Typography.Text>
        </Flex>
      ) : (
        <table
          style={{ fontSize: "12px" }}
          border={1}
          cellSpacing={0}
          cellPadding={6}
          className="custom-table"
        >
          <thead>
            {/* <!-- Table Header Row --> */}
            <tr>
              <th rowSpan={1}></th>
              <th colSpan={2}>{selectedCompany?.company_name}</th>
              {/* <th colSpan={3}>Company 2</th> */}
              {/* <th colSpan={3}>Total</th> */}
            </tr>

            {/* <!-- Sub-Header Row --> */}
            <tr>
              <th>Quality</th>
              <th style={{ width: "20%" }}>METER</th>
              <th style={{ width: "20%" }}>WEIGHT </th>
              {/* <th style={{ width: "20%" }}>AVG.RATE (Incl. Gst)</th> */}
            </tr>
          </thead>

          {/* Inhouse grey sale Report Start------------------------------------------------------- */}
          <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
            <td colSpan={10}>
              <Collapse items={inHouseGreySaleItems} />
            </td>
          </tr>

          <tr>
            <td>(-Sales Return)</td>
            <td>{inhouseGreySaleReturn?.totalMeter}</td>
            <td></td>
            {/* <td>{0}</td> */}
          </tr>

          <tr>
            <td>Total</td>
            <td>{inhouseGreyTotal?.totalMeter}</td>
            <td></td>
            {/* <td></td> */}
            {/* <td>{yarnReturnReportNetTotal?.totalMeter}</td> */}
            {/* <td>{yarnReturnReportNetTotal?.totalAmount}</td> */}
            {/* <td>{yarnReturnReportNetTotal?.totalAvgRate}</td> */}
          </tr>
          {/* Inhouse grey sale Report End------------------------------------------------------- */}

          {/* Purchase Grey Sale Report Start------------------------------------------------------- */}
          <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
            <td colSpan={10}>
              <Collapse items={purchaseGreySaleItems} />
            </td>
          </tr>

          <tr>
            <td>(-Sales Return)</td>
            <td>{purchaseGreySaleReturn?.totalMeter}</td>
            <td></td>
            {/* <td>0</td> */}
          </tr>

          <tr>
            <td>Total</td>
            <td>{purchaseGreyTotal?.totalMeter}</td>
            <td></td>
            {/* <td></td> */}
            {/* <td>{greyReturnReportNetTotal?.totalMeter}</td> */}
            {/* <td>{greyReturnReportNetTotal?.totalAmount}</td> */}
            {/* <td>{greyReturnReportNetTotal?.totalAvgRate}</td> */}
          </tr>
          {/* Purchase Grey Sale Report End------------------------------------------------------- */}

          {/* Job Grey Sale Report Start------------------------------------------------------- */}
          <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
            <td colSpan={10}>
              <Collapse items={jobPurchaseItems} />
            </td>
          </tr>

          <tr>
            <td>(-Sales Return)</td>
            <td>{jobPurchaseSaleReturn?.totalMeter}</td>
            <td></td>
            {/* <td>0</td> */}
          </tr>

          <tr>
            <td>Total</td>
            <td>{jobPurchaseTotal?.totalMeter}</td>
            <td></td>
            {/* <td></td> */}
            {/* <td>{jobReturnReportNetTotal?.totalMeter}</td> */}
            {/* <td>{jobReturnReportNetTotal?.totalAmount}</td> */}
            {/* <td>{jobReturnReportNetTotal?.totalAvgRate}</td> */}
          </tr>
          {/* Job Grey Sale Report End------------------------------------------------------- */}

          <tr style={{ backgroundColor: "#ebebeb" }}>
            <td>Net Total</td>
            <td>
              {inhouseGreyTotal?.totalMeter +
                purchaseGreyTotal?.totalMeter +
                jobPurchaseTotal?.totalMeter}
            </td>
            <td>{}</td>
            {/* <td></td> */}
          </tr>
        </table>
      )}
    </div>
  );
};

export default SalesReport;
