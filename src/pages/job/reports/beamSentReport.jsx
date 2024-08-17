import { Button, Flex, Select, Spin, Table, Typography } from "antd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useContext } from "react";
import { jobBeamSentReportRequest } from "../../../api/requests/job/reports/jobYarnStockReport";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import useDebounce from "../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { FilePdfOutlined } from "@ant-design/icons";

const BeamSentReport = () => {
  const { companyId } = useContext(GlobalContext);

  const [supplier, setSupplier] = useState();
  const debouncedSupplier = useDebounce(supplier, 500);

  const [quality, setQuality] = useState();
  const debounceQuality = useDebounce(quality, 500);

  // Fetch beam sent report
  const { data: beamSentReport, isLoading: isBeamSentReportLoading } = useQuery(
    {
      queryKey: [
        "beamSentReport/list",
        {
          company_id: companyId,
          supplier_name: debouncedSupplier,
          quality_id: debounceQuality,
        },
      ],
      queryFn: async () => {
        const res = await jobBeamSentReportRequest({
          params: {
            company_id: companyId,
            supplier_name: debouncedSupplier,
            quality_id: debounceQuality,
          },
        });
        return res?.data?.data;
      },
      enabled: Boolean(companyId),
    }
  );

  // Fetch supplier dropdown list
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

  // Fetch inhouse quality list dropdown list
  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: [
        "inhouse-quality",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 9999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  console.log(beamSentReport);

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = beamSentReport?.map((item, index) => {
      const { supplier_name, quality_name, sent_meter, received_meter } = item;

      let current_sent_meter = Number(sent_meter);
      let current_received_meter = Number(received_meter);
      let curr_pending_meter = current_sent_meter - current_received_meter;

      //   let current_sent_meter = Number(sent_meter);
      //   let current_received_meter = Number(received_meter);
      let shortage =
        (Number(current_received_meter) * 100) / current_sent_meter;
      shortage = 100 - shortage;

      return [
        index + 1,
        supplier_name,
        quality_name,
        sent_meter,
        received_meter,
        "***",
        curr_pending_meter,
        shortage.toFixed(2),
      ];
    });

    const tableTitle = [
      "ID",
      "Supplier Name",
      "Quality Name",
      "Total Meter Sent",
      "Total Received Mtr",
      "Prev Pending Mtr",
      "Cur Pending Mtr",
      "Shortage/In Process(%)",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Beam Sent Report");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier_name",
    },
    {
      title: "Quality Name",
      dataIndex: "quality_name",
    },
    {
      title: "Total Meter Sent",
      dataIndex: "sent_meter",
    },
    {
      title: "Total Received Meter",
      dataIndex: "received_meter",
    },
    {
      title: "Curr. Pending Mtr.",
      dataIndex: "-",
      render: (text, record) => {
        let current_sent_meter = Number(record?.sent_meter);
        let current_received_meter = Number(record?.received_meter);
        let pending_meter = current_sent_meter - current_received_meter;
        return <div style={{ color: "red" }}>{pending_meter}</div>;
      },
    },
    {
      title: "Shortage/In Process (%)",
      dataIndex: "-",
      render: (text, record) => {
        let current_sent_meter = Number(record?.sent_meter);
        let current_received_meter = Number(record?.received_meter);
        let shortage =
          (Number(current_received_meter) * 100) / current_sent_meter;
        shortage = 100 - shortage;
        return <div>{shortage.toFixed(2)}</div>;
      },
    },
  ];

  function renderTable() {
    if (isBeamSentReportLoading) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={beamSentReport || []}
        columns={columns}
        pagination={false}
        style={{ overflow: "auto" }}
        summary={() => {
          if (beamSentReport?.length == 0) return;
          let total_sent_meter = 0;
          let total_received_meter = 0;
          let total_pending_meter = 0;

          beamSentReport?.map((element) => {
            total_sent_meter = total_sent_meter + Number(element?.sent_meter);
            total_received_meter =
              total_received_meter + Number(element?.received_meter);
            total_pending_meter =
              total_pending_meter +
              (Number(element?.sent_meter) - Number(element?.received_meter));
          });

          let shortage = 0;
          shortage = (total_received_meter * 100) / total_sent_meter;
          shortage = 100 - shortage;

          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>{total_sent_meter}</Table.Summary.Cell>
                <Table.Summary.Cell>{total_received_meter}</Table.Summary.Cell>
                <Table.Summary.Cell>{total_pending_meter}</Table.Summary.Cell>
                <Table.Summary.Cell>{shortage.toFixed(2)}%</Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Beam Sent Report</h3>
        </div>

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
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Quality
            </Typography.Text>
            <Select
              placeholder="Select Quality Type"
              value={quality}
              loading={isLoadingInHouseQualityList}
              options={inHouseQualityList?.rows?.map(
                ({ id = 0, quality_name = "" }) => ({
                  label: quality_name,
                  value: id,
                })
              )}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setQuality}
              style={{
                textTransform: "capitalize",
              }}
              allowClear
              className="min-w-40"
            />
          </Flex>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!beamSentReport?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default BeamSentReport;
