import {
  Button,
  DatePicker,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../../api/hooks/auth";
import dayjs from "dayjs";
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getSaleChallanReturnListRequest } from "../../../../api/requests/sale/challan/challan";
import { getPartyListRequest } from "../../../../api/requests/users";
import ViewSaleReturn from "../../../../components/sale/challan/saleReturn/ViewSaleReturn";
import SaleReturnBill from "../../../../components/sale/challan/saleReturn/SaleReturnBill";

const SaleReturnList = () => {
  const { company, companyId } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();

  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [quality, setQuality] = useState();
  const [saleReturnNo, setSaleReturnNo] = useState();
  const [party, setParty] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedSaleReturnNo = useDebounce(saleReturnNo, 500);
  const debouncedParty = useDebounce(party, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
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

  const { data: saleChallanReturnList, isLoading } = useQuery({
    queryKey: [
      "saleChallanReturn",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        party_id: debouncedParty,
        sale_return_no: debouncedSaleReturnNo,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        party_id: debouncedParty,
        sale_return_no: debouncedSaleReturnNo,
      };

      if (debouncedFromDate) {
        params.from = dayjs(debouncedFromDate).format("YYYY-MM-DD");
      }
      if (debouncedToDate) {
        params.to = dayjs(debouncedToDate).format("YYYY-MM-DD");
      }
      const res = await getSaleChallanReturnListRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = saleChallanReturnList?.rows?.map((user, index) => {
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Due Date",
      // dataIndex: "createdAt",
      // key: "createdAt",
      // render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Challan/Bill",
      dataIndex: ["sale_challan", "challan_no"],
      key: "challan_no",
    },
    {
      title: "Quality Name",
      render: (details) => {
        return `${details?.sale_challan?.inhouse_quality?.quality_name} (${details?.sale_challan?.inhouse_quality?.quality_weight}KG)`;
      },
    },
    {
      title: "Firm Name",
      dataIndex: ["party", "firm_name"],
      key: "firm_name",
    },
    {
      title: "Party Name",
      // dataIndex: ["party", "firm_name"],
      // key: "firm_name",
    },
    {
      title: "Total Sale",
      dataIndex: ["sale_challan", "total_sale"],
      key: "total_sale",
    },
    {
      title: "Return Meter",
      dataIndex: ["sale_challan", "return_meter"],
      key: "return_meter",
    },
    {
      title: "Total Taka",
      dataIndex: ["sale_challan", "total_taka"],
      key: "total_taka",
    },
    {
      title: "Return Date",
      dataIndex: "return_date",
      key: "return_date",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Action",
      render: (details) => {
        console.log(details);
        return (
          <Space>
            <ViewSaleReturn details={details} companyId={companyId} />
            <SaleReturnBill details={details} />
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
        dataSource={saleChallanReturnList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: saleChallanReturnList?.count || 0,
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
          <h3 className="m-0 text-primary">Sales Return </h3>
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Party
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Party"
                value={party}
                loading={isLoadingPartyList}
                options={partyUserListRes?.partyList?.rows?.map((party) => ({
                  label:
                    party.first_name +
                    " " +
                    party.last_name +
                    " " +
                    `| ( ${party?.username})`,
                  value: party.id,
                }))}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setParty}
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
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              className="min-w-40"
              format={"DD-MM-YYYY"}
            />
          </Flex>
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Sales Return No
            </Typography.Text>
            <Input
              value={saleReturnNo}
              onChange={(e) => setSaleReturnNo(e.target.value)}
              style={{ width: "200px" }}
            />
          </Flex>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!saleChallanReturnList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default SaleReturnList;
