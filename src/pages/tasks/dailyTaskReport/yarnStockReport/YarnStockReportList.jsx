import { Button, Space, Spin, Table, Tag, Popconfirm, message, Flex, Input } from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCurrentUser } from "../../../../api/hooks/auth";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import { getYarnStockReportListRequest } from "../../../../api/requests/reports/yarnStockReport";
import DeleteYarnStockReportButton from "../../../../components/tasks/yarnStockReport/DeleteYarnStockReportButton";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import { APIHandler } from "../../../../api/requests/commonHandler";
import moment from "moment";
import useDebounce from "../../../../hooks/useDebounce";

function YarnStockReportList() {
  const navigate = useNavigate();

  const { company, companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const { data: reportListRes, isLoading: isLoadingReportList, refetch } = useQuery({
    queryKey: [
      "yarn-stock",
      "yarn-report",
      "list",
      { company_id: companyId, page, pageSize, search: debouncedSearch },
    ],
    queryFn: async () => {
      const res = await getYarnStockReportListRequest({
        companyId,
        params: { company_id: companyId, page, pageSize, search: debouncedSearch },
      });
      return res.data?.data?.yarnStockReportList;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/tasks/daily-task-report/yarn-stock-report/add");
  }

  // function navigateToUpdate(id) {
  //   navigate(`/tasks/daily-task-report/yarn-stock-report/update/${id}`);
  // }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = reportListRes?.rows?.map((report) => {
      const {
        id,
        report_date,
        yarn_stock_company,
        cartoon,
        current_stock,
        require_stock,
      } = report;
      const {
        yarn_company_name = "",
        yarn_denier = 0,
        filament = 0,
        luster_type = "",
        yarn_color = "",
        yarn_Sub_type = "",
        avg_daily_stock = 0,
      } = yarn_stock_company;
      return [
        id,
        dayjs(report_date).format("DD-MM-YYYY"),
        dayjs(report_date).format("hh:mm:ss A"),
        yarn_company_name,
        `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`,
        avg_daily_stock,
        cartoon,
        current_stock,
        require_stock,
      ];
    });

    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Date",
          "Time",
          "Company Name",
          "Denier/Count",
          "Avg Stock(Kg)",
          "Cartoon",
          "Current Stock(Kg)",
          "Require kg",
        ],
      ],
      leftContent,
      rightContent,
      title: "Yarn Stock Report List",
    });
  }

  const [isYarnStatusUpdating, setIsYarnStatusUpdating] = useState(false) ; 
  async function UpdateYarnStatus(id){
    setIsYarnStatusUpdating(true); 
    let response = await APIHandler("PATCH", {"yarn_company_id": id, "is_confirm": true}, `/yarn-stock/yarn-report/update?company_id=${companyId}`) ; 
    setIsYarnStatusUpdating(false) ; 
    
    if (response == false){
      message.warning("Network request failed") ; 
    } else if (response?.success){
      message.success("Stock confirmed successfully") ; 
      refetch();
    } else{
      message.warning(response?.message) ; 
    }
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => ((page*pageSize) + index ) + 1
    },
    {
      title: "Date",
      key: "report_date",
      render: ({ report_date }) => {
        return dayjs(report_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Time",
      key: "report_time",
      render: ({ report_date }) => {
        return dayjs(report_date).format("hh:mm:ss A");
      },
    },
    {
      title: "Company Name",
      render: ({ yarn_stock_company }) => {
        const { yarn_company_name } = yarn_stock_company;
        return yarn_company_name;
      },
      key: "yarn_company_name",
    },
    {
      title: "Denier/Count",
      render: ({ yarn_stock_company }) => {
        const {
          yarn_denier = 0,
          filament = 0,
          luster_type = "",
          yarn_color = "",
          yarn_Sub_type = "",
        } = yarn_stock_company;
        return `${yarn_denier}D/${filament}F (${yarn_Sub_type} ${luster_type} - ${yarn_color})`;
      },
      key: "yarn_denier",
    },
    {
      title: "Avg Stock(Kg)",
      render: ({ yarn_stock_company }) => {
        const { avg_daily_stock } = yarn_stock_company;
        return avg_daily_stock;
      },
      key: "avg_daily_stock",
    },
    {
      title: "Cartoon",
      dataIndex: "cartoon",
      key: "cartoon",
    },
    {
      title: "Current Stock(Kg)",
      dataIndex: "current_stock",
      key: "current_stock",
    },
    {
      title: "Conformation",
      dataIndex: "is_confirm", 
      key: "conformation", 
      render: (text, record) => (
        text == false?<>
          <Popconfirm
            title = "Stock Conformation"
            description = "Are you sure you want to confirm this Stock ?"
            onConfirm={() => {UpdateYarnStatus(record?.yarn_stock_company?.id)}}
            okButtonProps={{
              loading: isYarnStatusUpdating
            }}
          > 
            <div>
              <Tag color="red">Pending</Tag>
            </div>
          </Popconfirm>
        </>:
          <div>
            <Tag color="green">Confirmed</Tag>
            <div style={{marginTop: "0.3rem"}}>
              {moment(record?.updatedAt).format("DD/MM/YYYY HH:MM:SS")}
            </div>
          </div>
      )
    }, 
    {
      title: "Require kg",
      dataIndex: "require_stock",
      key: "require_stock",
      render: (text, record) => (
        <div className="red-option-text">{text}</div>
        
      )
    },
    {
      title: "Action",
      render: (reportDetails) => {
        return (
          <Space>
            <DeleteYarnStockReportButton details={reportDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoadingReportList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={reportListRes?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: reportListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <GoBackButton/>
          <h3 className="m-0 text-primary">Yarn Stock Company Report</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) =>{setSearch(e.target.value)} }
          />
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!reportListRes?.rows?.length}
            onClick={downloadPdf}
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default YarnStockReportList;
