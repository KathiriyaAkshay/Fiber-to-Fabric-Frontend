import { Button, Space, Spin, Table } from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getYarnStockCompanyListRequest } from "../../../api/requests/yarnStock";
import DeleteYarnStockCompany from "../../../components/yarnStock/yarnStockCompany/DeleteYarnStockCompany";
import { useCompanyId } from "../../../api/hooks/company";
// import { downloadUserPdf } from "../../../lib/pdf/userPdf";
// import dayjs from "dayjs";
// import { useCurrentUser } from "../../../api/hooks/auth";

function YarnStockCompanyList() {
  const navigate = useNavigate();
  const { companyId } = useCompanyId();
  // const { data: companyListRes } = useCompanyList();
  // const { data: user } = useCurrentUser();

  const { data: ysCompanyListRes, isLoading: isLoadingYSCompanyList } =
    useQuery({
      queryKey: ["yarn-stock", "company", "list", companyId],
      queryFn: async () => {
        const res = await getYarnStockCompanyListRequest({
          companyId,
          params: {},
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  function navigateToAdd() {
    navigate("/yarn-stock-company/company-list/add");
  }

  function navigateToUpdate(id) {
    navigate(`/yarn-stock-company/company-list/update/${id}`);
  }

  // function downloadPdf() {
  //   if (!user) return;
  //   const companyName = companyListRes?.rows?.[0]?.company_name;
  //   const {
  //     first_name = "YASH",
  //     last_name = "PATEL",
  //     address = "SURAT",
  //     mobile = "+918980626669",
  //     gst_no = "GST123456789000",
  //   } = user;
  //   const leftContent = `
  //   Name:- ${first_name} ${last_name}
  //   Address:- ${address}
  //   Created Date:- ${dayjs().format("DD-MM-YYYY")}
  //   `;

  //   const rightContent = `
  //   Company Name:- ${companyName}
  //   Company Contact:- ${mobile}
  //   GST No.:- ${gst_no}
  //   `;

  //   const body = ysCompanyListRes?.yarnComanyList?.rows?.map((user) => {
  //     const { id, first_name, last_name, adhar_no, mobile, email } = user;
  //     return [id, first_name, last_name, adhar_no, mobile, email];
  //   });

  //   downloadUserPdf({
  //     body,
  //     head: [
  //       ["ID", "First Name", "Last Name", "Adhaar No", "Contact No", "Email"],
  //     ],
  //     leftContent,
  //     rightContent,
  //     title: "Broker List",
  //   });
  // }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Company Name",
      dataIndex: "yarn_company_name",
      key: "yarn_company_name",
    },
    {
      title: "Yarn/Fiber Type",
      key: "yarn_type",
      render: (yscDetails) => {
        const { yarn_type = "", yarn_Sub_type = "" } = yscDetails;
        if (yarn_Sub_type) {
          return `${yarn_type} (${yarn_Sub_type})`;
        }
        return yarn_type;
      },
    },
    {
      title: "Denier / Count",
      key: "yarn_denier",
      render: (yscDetails) => {
        const {
          yarn_denier = 0,
          yarn_count = 0,
          yarn_color = "",
          luster_type = "",
        } = yscDetails;
        return `${Math.ceil(yarn_denier)}D / ${Math.ceil(
          yarn_count
        )}C (${yarn_color} - ${luster_type})`;
      },
    },
    {
      title: "Filament",
      dataIndex: "filament",
      key: "filament",
    },
    {
      title: "HSN No.",
      dataIndex: "hsn_no",
      key: "hsn_no",
    },
    {
      title: "Avg.Stock",
      dataIndex: "avg_daily_stock",
      key: "avg_daily_stock",
    },
    {
      title: "Action",
      render: (yscDetails) => {
        return (
          <Space>
            <Button
              onClick={() => {
                navigateToUpdate(yscDetails.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteYarnStockCompany details={yscDetails} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoadingYSCompanyList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={ysCompanyListRes?.yarnComanyList?.rows || []}
        columns={columns}
        rowKey={"id"}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h2 className="m-0">Yarn Companies List</h2>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        {/* <Button
          icon={<FilePdfOutlined />}
          type="primary"
          disabled={!ysCompanyListRes?.yarnComanyList?.rows?.length}
          onClick={downloadPdf}
        /> */}
      </div>
      {renderTable()}
    </div>
  );
}

export default YarnStockCompanyList;
