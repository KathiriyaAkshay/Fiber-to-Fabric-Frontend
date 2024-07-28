import {
  Button,
  DatePicker,
  Flex,
  Input,
  Radio,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
// import useDebounce from "../../../hooks/useDebounce";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../../api/hooks/auth";
import dayjs from "dayjs";
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { ORDER_TYPE } from "../../../../constants/orderMaster";
import { getSaleChallanListRequest } from "../../../../api/requests/sale/challan/challan";
import { getPartyListRequest } from "../../../../api/requests/users";
import DeleteSaleChallan from "../../../../components/sale/challan/saleChallan/DeleteSaleChallan";
import ViewSaleChallan from "../../../../components/sale/challan/saleChallan/ViewSaleChallan";
// import DeleteJobTaka from "../../../components/job/jobTaka/DeleteJobTaka";

const SaleChallanList = () => {
  const { company, companyId } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const [state, setState] = useState("gray");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [type, setType] = useState();
  const [quality, setQuality] = useState();
  const [billStatus, setBillStatus] = useState();
  const [fromChallan, setFromChallan] = useState();
  const [toChallan, setToChallan] = useState();
  const [orderNo, setOrderNo] = useState();
  const [party, setParty] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedType = useDebounce(type, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedState = useDebounce(state, 500);
  const debouncedBillStatus = useDebounce(billStatus, 500);
  const debouncedFromChallan = useDebounce(fromChallan, 500);
  const debouncedToChallan = useDebounce(toChallan, 500);
  const debouncedOrderNo = useDebounce(orderNo, 500);
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

  const { data: saleChallanList, isLoading } = useQuery({
    queryKey: [
      "saleChallan",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        is_gray: debouncedState === "gray" ? true : false,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        from_challan_no: debouncedFromChallan,
        to_challan_no: debouncedToChallan,
        sale_challan_type: debouncedType,
        order_no: debouncedOrderNo,
        bill_status: debouncedBillStatus,
        party_id: debouncedParty,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
        // is_gray: debouncedState === "gray" ? true : false,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        from_challan: debouncedFromChallan,
        to_challan: debouncedToChallan,
        sale_challan_type: debouncedType,
        order_no: debouncedOrderNo,
        bill_status: debouncedBillStatus,
        party_id: debouncedParty,
      };

      if (debouncedFromDate) {
        params.from = dayjs(debouncedFromDate).format("YYYY-MM-DD");
      }
      if (debouncedToDate) {
        params.to = dayjs(debouncedToDate).format("YYYY-MM-DD");
      }
      const res = await getSaleChallanListRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/sales/challan/sale-challan/add");
  }

  function navigateToUpdate(id) {
    navigate(`/sales/challan/sale-challan/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = saleChallanList?.row?.map((user, index) => {
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
      title: "Challan Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Order No",
      dataIndex: ["gray_order", "order_no"],
      key: "order_no",
    },
    {
      title: "Challan/Bill",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Quality Name",
      render: (details) => {
        return `${details?.inhouse_quality?.quality_name} (${details?.inhouse_quality?.quality_weight}KG)`;
      },
    },

    {
      title: "Taka No",
      dataIndex: "taka_no",
      key: "taka_no",
    },
    {
      title: "Total Meter",
      dataIndex: ["gray_order", "total_meter"],
      key: "total_meter",
    },
    {
      title: "Challan Type",
      dataIndex: "sale_challan_types",
      key: "sale_challan_types",
      render: (text) =>
        text.map(({ sale_challan_type }) => sale_challan_type).join(", "),
    },
    {
      title: "Bill Status",
      dataIndex: "bill_status",
      key: "bill_status",
      render: (text) => {
        if (text.toLowerCase() === "pending") {
          return <Tag color="red">Pending</Tag>;
        } else {
          return <Tag color="green">Received</Tag>;
        }
      },
    },
    {
      title: "Payment Status",
      render: (details) => {
        return details.is_paid ? (
          <Tag color="green">Paid</Tag>
        ) : (
          <Tag color="red">Unpaid</Tag>
        );
      },
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            {/* <ViewPurchaseTakaDetailsModal
              title="Purchase Taka Details"
              details={details}
            /> */}
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteSaleChallan details={details} />
            <ViewSaleChallan details={details} companyId={companyId} />
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
        dataSource={saleChallanList?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: saleChallanList?.count || 0,
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
          <h3 className="m-0 text-primary">Sales Challan List </h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Radio.Group
              name="filter"
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              <Flex align="center" gap={10}>
                <Radio value={"cash"}> Cash</Radio>
                <Radio value={"gray"}> Grey </Radio>
              </Flex>
            </Radio.Group>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Type
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Type"
                value={type}
                options={ORDER_TYPE}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setType}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
            </Flex>
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
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!saleChallanList?.row?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
        <Flex align="center" gap={10}>
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

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Bill Status
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select"
              value={billStatus}
              options={[
                { label: "Pending", value: "pending" },
                { label: "Generated", value: "generated" },
              ]}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setBillStatus}
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
            <Input
              placeholder="Challan NO"
              value={fromChallan}
              onChange={(e) => setFromChallan(e.target.value)}
              style={{ width: "150px" }}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <Input
              placeholder="Challan NO"
              value={toChallan}
              onChange={(e) => setToChallan(e.target.value)}
              style={{ width: "150px" }}
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Order No
            </Typography.Text>
            <Input
              placeholder="Order No"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              style={{ width: "200px" }}
            />
          </Flex>
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default SaleChallanList;
