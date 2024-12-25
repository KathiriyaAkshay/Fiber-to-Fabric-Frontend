import { useContext, useState } from "react";
import { Table, Select, DatePicker, Flex, Spin, Typography } from "antd";
import { usePagination } from "../../hooks/usePagination";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
// import { ORDER_TYPE } from "../../constants/orderMaster";
import { downloadUserPdf, getPDFTitleContent } from "../../lib/pdf/userPdf";
import { useCurrentUser } from "../../api/hooks/auth";
import useDebounce from "../../hooks/useDebounce";
import { getCompanyMachineListRequest } from "../../api/requests/machine";

const MonthlyProductionReport = () => {
  // const navigate = useNavigate();
  // const queryClient = useQueryClient();
  const { companyId, company } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [fromDate, setFromDate] = useState(null);
  const [machine, setMachine] = useState(null);

  const debounceFromDate = useDebounce(fromDate, 500);
  const debounceMachine = useDebounce(machine, 500);
  console.log({ debounceFromDate, debounceMachine });

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

  const { data: productionList, isLoading } = useQuery({
    queryKey: [
      "production",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
      },
    ],
    queryFn: async () => {
      // const res = await getProductionListRequest({
      //   params: {
      //     company_id: companyId,
      //     page,
      //     pageSize,
      //   },
      // });
      // return res.data?.data;
      return { count: 0, rows: [] };
    },
    enabled: Boolean(companyId),
  });

  const downloadPdf = () => {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    let body = [];
    productionList?.rows?.forEach((item, index) => {
      const {
        taka_no,
        meter,
        weight,
        machine_no,
        average,
        status,
        beam_no,
        inhouse_quality,
        sale_challan,
      } = item;
      if (status.toLowerCase() !== "instock") {
        body.push([
          index + 1,
          taka_no || "-",
          meter,
          weight,
          machine_no,
          average,
          status,
          beam_no,
          `${inhouse_quality.quality_name} (${inhouse_quality.quality_weight}KG)`,
          sale_challan?.challan_no || "-",
          "**",
        ]);
      }
    });
    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Taka No",
          "Meter",
          "Weight",
          "Machine No",
          "Average",
          "Status",
          "Beam",
          "Quality",
          "Challan No",
          "Party",
        ],
      ],
      leftContent,
      rightContent,
      title: "Inhouse Production List",
    });
  };

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Quality",
      dataIndex: ["inhouse_quality"],
      key: "quality",
      render: (text, record) =>
        `${text.quality_name} (${text.quality_weight}KG) (${record?.machine_name})`,
    },
    {
      title: "Machine",
    },
    {
      title: "Day (Meter)",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Night (Meter)",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Total(Meter)",
      dataIndex: "meter",
      key: "meter",
    },
    // {
    //   title: "Action",
    //   render: (details) => {
    //     return (
    //       <Space>
    //         <ViewProductionDetailModal
    //           title="Production Details"
    //           details={details}
    //         />
    //         {details.status.toLowerCase() === "instock" && (
    //           <Button
    //             onClick={() => {
    //               navigateToUpdate(details.id);
    //             }}
    //           >
    //             <EditOutlined />
    //           </Button>
    //         )}

    //         {details.status.toLowerCase() === "instock" && !details.is_tp && (
    //           <DeleteProduction details={details} />
    //         )}

    //         <Button
    //           onClick={() => {
    //             setQrDetails([
    //               {
    //                 taka_no: details?.taka_no,
    //                 meter: details?.meter,
    //                 machine_no: details?.machine_no,
    //                 quality_name: `${details?.inhouse_quality?.quality_name}`,
    //               },
    //             ]);
    //             showQrModal();
    //           }}
    //         >
    //           <BarcodeOutlined />
    //         </Button>
    //       </Space>
    //     );
    //   },
    // },
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
        dataSource={productionList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{ textAlign: "left" }}
        summary={(tableData) => {
          console.log({ tableData });
          let day = 0;
          let night = 0;
          let total = 0;
          // tableData.forEach(({ meter, weight }) => {
          //   totalMeter += +meter;
          //   totalWeight += +weight;
          //   totalAvg += +Number(weight * 100) / Number(meter);
          // });

          return (
            <>
              {/* Page wise summary information  */}
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="left">
                  <b>Total</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{day.toFixed(2)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{night.toFixed(2)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b>{total.toFixed(2)}</b>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Monthly Production Report</h3>
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Date
            </Typography.Text>
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              className="min-w-40"
              format={"DD-MM-YYYY"}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Select
              allowClear
              placeholder="Select machine"
              value={machine}
              onChange={setMachine}
              loading={isLoadingMachineList}
              options={machineListRes?.rows?.map((machine) => ({
                label: machine?.machine_name,
                value: machine?.machine_name,
              }))}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
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
  );
};

export default MonthlyProductionReport;
