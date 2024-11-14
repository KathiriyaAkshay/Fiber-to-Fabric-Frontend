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
import { getAccountPurchaseReportService } from "../../../api/requests/accounts/reports";

const PurchaseReport = () => {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  const { companyListRes } = useContext(GlobalContext);

  const selectedCompany = useMemo(() => {
    if (companyId) {
      return companyListRes?.rows?.find(({ id }) => id === companyId);
    }
  }, [companyId, companyListRes]);

  const { data: purchaseReportData, isLoading } = useQuery({
    queryKey: [
      "get",
      "purchase-report",
      {
        company_id: companyId,
        from: dayjs(fromDate).format("YYYY-MM-DD"),
        to: dayjs(toDate).format("YYYY-MM-DD"),
      },
    ],
    queryFn: async () => {
      const res = await getAccountPurchaseReportService({
        params: {
          company_id: companyId,
          from: dayjs(fromDate).format("YYYY-MM-DD"),
          to: dayjs(toDate).format("YYYY-MM-DD"),
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

  // const onChange = (key) => {
  //   // console.log(key);
  // };

  const yarnPurchaseItems = [
    {
      key: "1",
      label: (
        <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
          <ProfileOutlined /> &nbsp;&nbsp; Yarn Purchase Report
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
            {purchaseReportData && purchaseReportData?.yarnReports?.length
              ? purchaseReportData?.yarnReports?.map((item, index) => {
                  return (
                    <tr key={index + "_yarn_purchase_report"}>
                      <td>Quality value</td>
                      <td style={{ width: "20%" }}>{item?.meters || 0}</td>
                      <td style={{ width: "20%" }}>{item?.amount || 0}</td>
                      <td style={{ width: "20%" }}>{item?.avg_rate || 0}</td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      ),
    },
  ];

  const yarnReturnReportNetTotal = useMemo(() => {
    if (purchaseReportData && purchaseReportData?.yarnReports?.length) {
      let totalMeter = 0;
      let totalAmount = 0;
      let totalAvgRate = 0;
      purchaseReportData?.yarnReports?.forEach((item) => {
        totalMeter += +item?.meters || 0;
        totalAmount += +item?.amount || 0;
        totalAvgRate += +item?.avg_rate || 0;
      });

      const yarnPurchaseReturnAvgRate =
        purchaseReportData?.yarnReturnReports?.amount /
          purchaseReportData?.yarnReturnReports?.meters || 0;

      return {
        totalMeter:
          totalMeter - (+purchaseReportData?.yarnReturnReports?.meters || 0),
        totalAmount:
          totalAmount - (+purchaseReportData?.yarnReturnReports?.amount || 0),
        totalAvgRate: totalAvgRate - +yarnPurchaseReturnAvgRate,
      };
    }
  }, [purchaseReportData]);

  const greyPurchaseItems = [
    {
      key: "1",
      label: (
        <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
          <ProfileOutlined /> &nbsp;&nbsp; Grey Purchase Report
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
            {purchaseReportData && purchaseReportData?.purchase_report?.length
              ? purchaseReportData?.purchase_report.map((item, index) => {
                  return (
                    <tr key={index + "_grey_purchase_report"}>
                      <td>{item?.quality_name || ""}</td>
                      <td style={{ width: "20%" }}>{item?.meters || 0}</td>
                      <td style={{ width: "20%" }}>{item?.amount || 0}</td>
                      <td style={{ width: "20%" }}>{item?.avg_rate || 0}</td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      ),
    },
  ];

  const greyReturnReportNetTotal = useMemo(() => {
    if (purchaseReportData && purchaseReportData?.purchase_report?.length) {
      let totalMeter = 0;
      let totalAmount = 0;
      let totalAvgRate = 0;
      purchaseReportData?.purchase_report?.forEach((item) => {
        totalMeter += +item?.meters || 0;
        totalAmount += +item?.amount || 0;
        totalAvgRate += +item?.avg_rate || 0;
      });

      return {
        totalMeter,
        totalAmount,
        totalAvgRate,
      };
    }
  }, [purchaseReportData]);

  const jobPurchaseItems = [
    {
      key: "1",
      label: (
        <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
          <ProfileOutlined /> &nbsp;&nbsp; Job Purchase Report
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
            {purchaseReportData && purchaseReportData?.job_report?.length
              ? purchaseReportData?.job_report?.map((item, index) => {
                  return (
                    <tr key={index + "_job_purchase_report"}>
                      <td>{item?.quality_name || ""}</td>
                      <td style={{ width: "20%" }}>{item?.meters || 0}</td>
                      <td style={{ width: "20%" }}>{item?.amount || 0}</td>
                      <td style={{ width: "20%" }}>{item?.avg_rate || 0}</td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      ),
    },
  ];

  const jobReturnReportNetTotal = useMemo(() => {
    if (purchaseReportData && purchaseReportData?.job_report?.length) {
      let totalMeter = 0;
      let totalAmount = 0;
      let totalAvgRate = 0;
      purchaseReportData?.job_report?.forEach((item) => {
        totalMeter += +item?.meters || 0;
        totalAmount += +item?.amount || 0;
        totalAvgRate += +item?.avg_rate || 0;
      });

      return {
        totalMeter,
        totalAmount,
        totalAvgRate,
      };
    }
  }, [purchaseReportData]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">
            Purchase Report ( {dayjs(fromDate).format("DD-MM-YYYY")} To{" "}
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
            // icon={<FilePdfOutlined />}
            type="primary"
            // disabled={!cashBookList?.rows?.length}
            // onClick={downloadPdf}
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
              <th colSpan={3}>{selectedCompany?.company_name}</th>
              {/* <th colSpan={3}>Company 2</th> */}
              {/* <th colSpan={3}>Total</th> */}
            </tr>

            {/* <!-- Sub-Header Row --> */}
            <tr>
              <th>Quality</th>
              <th style={{ width: "20%" }}>METER/KG</th>
              <th style={{ width: "20%" }}>AMOUNT </th>
              <th style={{ width: "20%" }}>AVG.RATE (Incl. Gst)</th>
            </tr>
          </thead>

          {/* Yarn Purchase Report Start------------------------------------------------------- */}
          <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
            <td colSpan={10}>
              <Collapse items={yarnPurchaseItems} />
            </td>
          </tr>

          <tr>
            <td>(-Yarn Purchase Return)</td>
            <td>{purchaseReportData?.yarnReturnReports?.meters || 0}</td>
            <td>{purchaseReportData?.yarnReturnReports?.amount || 0}</td>
            <td>
              {purchaseReportData?.yarnReturnReports?.amount /
                purchaseReportData?.yarnReturnReports?.meters || 0}
            </td>
          </tr>

          <tr>
            <td>Net Total</td>
            <td>{yarnReturnReportNetTotal?.totalMeter}</td>
            <td>{yarnReturnReportNetTotal?.totalAmount}</td>
            <td>{yarnReturnReportNetTotal?.totalAvgRate}</td>
          </tr>
          {/* Yarn Purchase Report End------------------------------------------------------- */}

          {/* Grey Purchase Report Start------------------------------------------------------- */}
          <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
            <td colSpan={10}>
              <Collapse items={greyPurchaseItems} />
            </td>
          </tr>

          {/* <tr>
            <td>(-Purchase Return)</td>
            <td>0</td>
            <td>0</td>
            <td>0</td>
             <td>0</td>
            <td>0</td>
            <td>0</td> 
             <td>0</td>
            <td>0</td>
            <td>0</td> 
          </tr> */}

          <tr>
            <td>Total</td>
            <td>{greyReturnReportNetTotal?.totalMeter}</td>
            <td>{greyReturnReportNetTotal?.totalAmount}</td>
            <td>{greyReturnReportNetTotal?.totalAvgRate}</td>
          </tr>
          {/* Grey Purchase Report End------------------------------------------------------- */}

          {/* Job  Purchase Report Start------------------------------------------------------- */}
          <tr style={{ cursor: "pointer", backgroundColor: "#f0f0f0" }}>
            <td colSpan={10}>
              <Collapse items={jobPurchaseItems} />
            </td>
          </tr>

          {/* <tr>
          <td>(-Purchase Return)</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
          <td>0</td>
        </tr> */}

          <tr>
            <td>Total</td>
            <td>{jobReturnReportNetTotal?.totalMeter}</td>
            <td>{jobReturnReportNetTotal?.totalAmount}</td>
            <td>{jobReturnReportNetTotal?.totalAvgRate}</td>
          </tr>
          {/* Job Purchase Report End------------------------------------------------------- */}

          <tr style={{ backgroundColor: "#ebebeb" }}>
            <td>Net Total</td>
            <td>
              {yarnReturnReportNetTotal?.totalMeter +
                greyReturnReportNetTotal?.totalMeter +
                jobReturnReportNetTotal?.totalMeter}
            </td>
            <td>
              {yarnReturnReportNetTotal?.totalAmount +
                greyReturnReportNetTotal?.totalAmount +
                jobReturnReportNetTotal?.totalAmount}
            </td>
            <td>
              {yarnReturnReportNetTotal?.totalAvgRate +
                greyReturnReportNetTotal?.totalAvgRate +
                jobReturnReportNetTotal?.totalAvgRate}
            </td>
          </tr>
        </table>
      )}
    </div>
  );
};

export default PurchaseReport;
