import { useContext, useState } from "react";
import {
  Table,
  Select,
  DatePicker,
  Button,
  Input,
  Flex,
  Typography,
  Spin,
  Space,
} from "antd";
import { EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../../../hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../../../api/hooks/auth";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import useDebounce from "../../../../hooks/useDebounce";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import dayjs from "dayjs";
import DeleteReworkChallan from "../../../../components/job/challan/reworkChallan/DeleteReworkChallan";
import { getPruchaseReturnListRequest } from "../../../../api/requests/purchase/purchaseReturn";
import ViewPurchaseReturnChallanInfo from "../../../../components/purchase/purchaseReturn/ViewPurchaseReturnChallan";
import { GlobalContext } from "../../../../contexts/GlobalContext";

const PurchaseReturnList = () => {
  const navigate = useNavigate();
  const [quality, setQuality] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [challanNo, setChallanNo] = useState("");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedChallanNo = useDebounce(challanNo, 500);
  const debouncedSupplier = useDebounce(supplier, 500);

  const { company, companyId } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

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

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 99999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { data: purchaseReturnList, isLoading } = useQuery({
    queryKey: [
      "purchase",
      "return",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        challan_no: debouncedChallanNo,
        supplier_name: debouncedSupplier,
      },
    ],
    queryFn: async () => {
      const res = await getPruchaseReturnListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          from: debouncedFromDate,
          to: debouncedToDate,
          quality_id: debouncedQuality,
          challan_no: debouncedChallanNo,

          supplier_name: debouncedSupplier,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToUpdate(id) {
    navigate(`/job/challan/rework-challan/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = purchaseReturnList?.rows?.map((user, index) => {
      const { challan_no } = user;
      return [index + 1, challan_no];
    });
    downloadUserPdf({
      body,
      head: [["ID", "Challan NO"]],
      leftContent,
      rightContent,
      title: "Job Taka List",
    });
  }

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Challan Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Quality",
      dataIndex: ["inhouse_quality"],
      key: ["inhouse_quality"],
      render: (quality) =>
        `${quality?.quality_name} (${quality?.quality_weight})`,
    },
    {
      title: "Order No",
      dataIndex: "order_no",
      key: "order_no",
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier",
      key: "supplier",
      render: (supplier) => `${supplier?.supplier_name}`,
    },
    {
      title: "To Company",
      render: (details) =>
        details?.purchase_taka_challan?.supplier?.supplier_company,
    },
    {
      title: "Return Meter",
      dataIndex: "return_meter",
      key: "return_meter",
    },
    {
      title: "Total Taka",
      render: (details) => details?.purchase_taka_challan?.total_taka,
    },
    {
      title: "Return Date",
      dataIndex: "return_date",
      key: "return_date",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewPurchaseReturnChallanInfo details={details} />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteReworkChallan details={details} />
          </Space>
        );
      },
    },
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
        dataSource={purchaseReturnList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: purchaseReturnList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Purchased Return</h3>
            {/* <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            /> */}
          </div>
          <Flex align="center" gap={10}>
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
                  allowClear
                />
              </Flex>
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  Quality
                </Typography.Text>
                <Select
                  allowClear
                  placeholder="Select Quality"
                  loading={dropDownQualityLoading}
                  value={quality}
                  options={
                    dropDownQualityListRes &&
                    dropDownQualityListRes?.rows?.map((item) => ({
                      value: item.id,
                      label: item.quality_name,
                    }))
                  }
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  onChange={setQuality}
                  style={{
                    textTransform: "capitalize",
                  }}
                  className="min-w-40"
                />
              </Flex>
              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  From
                </Typography.Text>
                <DatePicker
                  value={fromDate}
                  onChange={setFromDate}
                  className="min-w-40"
                  format={"DD-MM-YYYY"}
                />
              </Flex>

              <Flex align="center" gap={10}>
                <Typography.Text className="whitespace-nowrap">
                  To
                </Typography.Text>
                <DatePicker
                  value={toDate}
                  onChange={setToDate}
                  className="min-w-40"
                  format={"DD-MM-YYYY"}
                />
              </Flex>
            </Flex>
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!purchaseReturnList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Challan No
              </Typography.Text>
              <Input
                placeholder="Challan NO"
                value={challanNo}
                onChange={(e) => setChallanNo(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
          </Flex>
        </div>
        {renderTable()}
      </div>
    </>
  );
};

export default PurchaseReturnList;
