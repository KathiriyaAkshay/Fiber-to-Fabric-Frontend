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
  Tag,
} from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../../../hooks/usePagination";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import useDebounce from "../../../../hooks/useDebounce";
import { getReceiveReworkTakaListRequest } from "../../../../api/requests/job/challan/receiveReworkTaka";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import dayjs from "dayjs";
import DeleteReceiveReworkTaka from "../../../../components/job/challan/receiveReworkTaka/DeleteReceiveReworkTaka";
import moment from "moment/moment";
import { SALE_CHALLAN_INFO_TAG_COLOR } from "../../../../constants/tag";
import { getDisplayQualityName } from "../../../../constants/nameHandler";
import { JOB_QUALITY_TYPE, JOB_REWORK_SUPPLIER_TYPE } from "../../../../constants/supplier";

const ReceiveReworkTaka = () => {
  const navigate = useNavigate();
  const [quality, setQuality] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [status, setStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedStatus = useDebounce(status, 500);
  const debouncedSearch = useDebounce(search, 500);
  const debouncedSupplier = useDebounce(supplier, 500);

  const { companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  // Supplier dropdown related api ==================================================
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId, supplier_type: JOB_REWORK_SUPPLIER_TYPE }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId, supplier_type: JOB_REWORK_SUPPLIER_TYPE },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  // Dropdown quality list api =======================================================
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
          production_type: JOB_QUALITY_TYPE
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 99999,
            is_active: 1,
            production_type: JOB_QUALITY_TYPE
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { data: receiveReworkTakaList, isLoading } = useQuery({
    queryKey: [
      "receive",
      "rework",
      "taka",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        search: debouncedSearch,
        status: debouncedStatus,
        supplier_name: debouncedSupplier,
      },
    ],
    queryFn: async () => {
      const res = await getReceiveReworkTakaListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          from: debouncedFromDate,
          to: debouncedToDate,
          quality_id: debouncedQuality,
          search: debouncedSearch,
          status: debouncedStatus,
          supplier_name: debouncedSupplier,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/job/challan/receive-rework-taka/add");
  }

  function disabledFutureDate(current) {
    // Disable dates after today
    return current && current > moment().endOf("day");
  }

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
      sorter: {
        compare: (a, b) => {
          return a.id - b.id;
        },
      },
    },
    {
      title: "Date",
      width: 110,
      render: (text, record) => {
        return moment(record?.createdAt).format("DD-MM-YYYY");
      },
    },
    {
      title: "Re. Challan No",
      width: 100, 
      render: (text, record) => {
        return (
          <div style={{fontWeight: 600}}>
            {record?.job_rework_challan?.challan_no}
          </div>
        )
      },
    },
    {
      title: "Taka No",
      dataIndex: "taka_no",
      key: "taka_no",
      sorter: (a, b) => a.taka_no - b.taka_no,
      render: (text, record) => {
        if (record?.is_used_in_taka) {
          return (
            <div>
              <div>
                <Tag color={SALE_CHALLAN_INFO_TAG_COLOR}>Sold</Tag> 
                <span style={{fontWeight: 600}}>{text}</span>
              </div>
            </div>
          );
        } else {
          return <div style={{fontWeight: 600}}>{text}</div>;
        }
      },
    },
    {
      title: "Total Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Total Rec. Meter",
      dataIndex: "received_meter",
      key: "received_meter",
    },
    {
      title: "Total Rec. Weight",
      dataIndex: "received_weight",
    },
    {
      title: "Short(%)",
      dataIndex: "short",
      key: "short",
    },
    {
      title: "Wastage",
      dataIndex: "wastageInKg",
      render: (text, record) => {
        let total_received_weight = +record?.received_weight;
        let short_value = +record?.short;
        let wastage = (total_received_weight * short_value) / 100;
        return <div>{parseFloat(wastage).toFixed(2)}</div>;
      },
    },
    {
      title: "TP",
      dataIndex: "tp",
    },
    {
      title: "Piece",
      dataIndex: "pis",
    },
    {
      title: "Quality",
      dataIndex: ["inhouse_quality"],
      key: ["inhouse_quality"],
      render: (text, record) => {
        return(
          <div style={{fontSize: 13}}>
            {getDisplayQualityName(record?.inhouse_quality)}
          </div>
        )
      },
    },
    {
      title: "Supplier Name",
      dataIndex: "supplier",
      key: "supplier",
      render: (supplier) => {
        return(
          <div>
            <div style={{fontWeight: 600}}>
              {String(supplier?.supplier_name).toUpperCase()}
            </div>
            <div>
              {supplier?.supplier_company}
            </div>
          </div>
        )
      },
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewDetailModal
              title="Rework Taka Details"
              details={[
                {
                  title: "Quality Name",
                  value: getDisplayQualityName(details?.inhouse_quality),
                },
                { title: "Supplier Name", value: String(details?.supplier?.supplier_name).toUpperCase() },
                { title: "Supplier Company", value: details?.supplier?.supplier_company },
                {
                  title: "Received Date",
                  value: dayjs(details.createdAt).format("DD-MM-YYYY"),
                },
                { title: "Ch. No", value: details.job_rework_challan?.challan_no },
                { title: "Taka No", value: details.taka_no },
                { title: "Meter", value: details.meter },
                { title: "Received Meter", value: details.received_meter },
                  
                { title: "Received Weight", value: details.received_weight },
                { title: "Average", value: details.average },
              ]}
            />

            {!details?.is_used_in_taka && (
              <DeleteReceiveReworkTaka details={details} />
            )}
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
        dataSource={receiveReworkTakaList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: receiveReworkTakaList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell>Grand Total</Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell>
                {parseFloat(receiveReworkTakaList?.total_meter).toFixed(2) || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                {parseFloat(receiveReworkTakaList?.total_received_meter).toFixed(2) || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell>
                {parseFloat(receiveReworkTakaList?.total_received_weight).toFixed(2) || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
              <Table.Summary.Cell></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Receive Rework Taka List</h3>
            <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
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
                      label: getDisplayQualityName(item),
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
                  Status
                </Typography.Text>
                <Select
                  placeholder="Select status"
                  options={[
                    { label: "Stock", value: "stock" },
                    { label: "Other", value: "other" },
                  ]}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  value={status}
                  onChange={setStatus}
                  style={{
                    textTransform: "capitalize",
                  }}
                  className="min-w-40"
                  allowClear
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
                disabledDate={disabledFutureDate}
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
                disabledDate={disabledFutureDate}
              />
            </Flex>
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Search
              </Typography.Text>
              <Input
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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

export default ReceiveReworkTaka;
