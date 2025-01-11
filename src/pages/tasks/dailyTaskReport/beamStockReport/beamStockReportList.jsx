import { Button, Flex, Input, Spin, Table, Typography, message } from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  getDailyBeamStockRequest,
} from "../../../../api/requests/task";
import { usePagination } from "../../../../hooks/usePagination";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext, useEffect, useState } from "react";
import { updateCompanyRequest } from "../../../../api/requests/company";
import { useMutation } from "@tanstack/react-query";
import { getDisplayQualityName } from "../../../../constants/nameHandler";

function BeamStockReportList() {
  const navigate = useNavigate();
  const { page, pageSize } = usePagination();
  const { company, companyId /*financialYearEnd*/ } = useContext(GlobalContext);
  const [bhidan, setBhidan] = useState("");

  useEffect(() => {
    setBhidan(company?.bhidan_of_month);
  }, [company]);

  const { data: beamStockReport, isLoading: isBeamStockReportLoading } =
    useQuery({
      queryKey: ["daily-task", "beam-stock", "list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getDailyBeamStockRequest({
          companyId,
          params: {
            company_id: companyId,
          },
        });
        return res?.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { mutateAsync: updateBhidanOfMonth, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateCompanyRequest({
        companyId,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["update", "company", companyId],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success("Bhidan of Month successfully update");
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  function navigateToAdd() {
    navigate("/tasks/daily-task-report/beam-stock-report/add");
  }

  const updateBhidanOfMonthHandler = async () => {
    await updateBhidanOfMonth({
      bhidan_of_month: bhidan,
    });
  };

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = beamStockReport?.map((item, index) => {
      const {
        quality_name,
        quality_weight,
        require_non_pasarela_beam,
        non_pasarela_beam_count,
        non_pasarela_short_beam_count,
        require_pasarela_beam,
        today_pasarela_beam,
      } = item;

      let today_beam = Number(today_pasarela_beam);
      let required_beam = Number(require_pasarela_beam);
      let short_beam = today_beam - required_beam;

      return [
        index + 1,
        `${quality_name} (${quality_weight}KG)`,
        require_non_pasarela_beam,
        non_pasarela_beam_count,
        non_pasarela_short_beam_count,
        require_pasarela_beam,
        today_pasarela_beam,
        short_beam,
      ];
    });

    const tableTitle = [
      "ID",
      "Quality",
      "Req. eve. non pasarela beam",
      "T.N. pasarela beam",
      "T.N. pasarela short beam",
      "Req. Eve. pasarela beam",
      "Today's pasarela beam",
      "Today's pasarela short beam",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Beam Stock Report List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Quality Name",
      dataIndex: "quality_name",
      render: (text, record) => {
        return (
          <div>
            {record?.quality_name}-({record?.quality_weight}KG)
          </div>
        );
      },
    },
    {
      title: "Req. eve. non pasarela beam",
      dataIndex: "require_non_pasarela_beam",
    },
    {
      title: "T.N. pasarela beam",
      dataIndex: "non_pasarela_beam_count",
    },
    {
      title: "T.N. pasarela short beam",
      dataIndex: "non_pasarela_short_beam_count",
      key: "non_pasarela_short_beam_count",
    },
    {
      title: "Req. Eve. pasarela beam",
      dataIndex: "require_pasarela_beam",
    },
    {
      title: "Today's pasarela beam",
      dataIndex: "today_pasarela_beam",
    },
    {
      title: "Today's pasarela short beam",
      render: (text, record) => {
        let today_beam = Number(record?.today_pasarela_beam);
        let required_beam = Number(record?.require_pasarela_beam);
        let short_beam = today_beam - required_beam;
        return <div style={{ color: "red" }}>{short_beam}</div>;
      },
    },
    {
      title: "Bhidan of month",
      dataIndex: "beam_count_below_bhidan",
    },
    {
      title: "N.pasarela secondary beam",
      dataIndex: "non_pasarela_beam_count_secondary"
    },
  ];

  function renderTable() {
    if (isBeamStockReportLoading) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={beamStockReport}
        columns={columns}
        rowKey={"id"}
        pagination={false}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Beam Stock Report</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Bhidan of month
            </Typography.Text>
            <Input
              value={bhidan}
              onChange={(e) => {
                setBhidan(e.target.value);
              }}
              placeholder="Bhidan of month"
              style={{ width: "200px" }}
            />
          </Flex>
          <Button
            type="primary"
            onClick={updateBhidanOfMonthHandler}
            loading={isPending}
          >
            Save Bhidan Of Month
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            onClick={downloadPdf}
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default BeamStockReportList;
