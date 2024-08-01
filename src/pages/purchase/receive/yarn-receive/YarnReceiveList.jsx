import {
  Button,
  DatePicker,
  Flex,
  Input,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Select
} from "antd";
import { EditOutlined, PlusCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import { getYarnReceiveListRequest } from "../../../../api/requests/purchase/yarnReceive";
import DeleteYarnReceiveButton from "../../../../components/purchase/receive/yarnReceive/DeleteYarnReceiveButton";
import YarnReceiveChallanModal from "../../../../components/purchase/receive/yarnReceive/YarnReceiveChallanModal";
import MultipleChallanCreateButton from "../../../../components/purchase/receive/yarnReceive/createMultipleChallan";
import moment from "moment";
import YarnReturnModel from "../../../../components/purchase/receive/yarnReceive/yarnReturnModel";
import { getDropdownSupplierListRequest } from "../../../../api/requests/users";
import { useMemo } from "react";
import { currentMonthStartDateEndDate } from "../../../../utils/date";

function YarnReceiveList() {

  const [startDate, endDate] = currentMonthStartDateEndDate() ; 

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [toDate, setToDate] = useState(dayjs(endDate));
  const debouncedToDate = useDebounce(
    toDate && dayjs(toDate).format("YYYY-MM-DD"),
    500
  );
  const [fromDate, setFromDate] = useState(dayjs(startDate));
  const debouncedFromDate = useDebounce(
    fromDate && dayjs(fromDate).format("YYYY-MM-DD"),
    500
  );
  const [billStatus, setBillStatus] = useState("0");
  const debouceBillStatus = useDebounce(billStatus, 500);
  const [supplier_name, set_supplier_name] = useState() ; 
  const debounceSupplierName = useDebounce(supplier_name, 500) ;  
  const [supplier_id, set_supplier_id] = useState() ; 
  const debouceSupplierId = useDebounce(supplier_id, 500) ; 

  const { companyId, financialYearEnd } = useContext(GlobalContext);
  const navigate = useNavigate();
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

  const dropDownSupplierCompanyOption = useMemo(() => {
    if (
      supplier_name &&
      dropdownSupplierListRes &&
      dropdownSupplierListRes.length
    ) {
      const obj = dropdownSupplierListRes.filter((item) => {
        return item.supplier_name === supplier_name;
      })[0];

      return obj?.supplier_company?.map((item) => {
        return { label: item.supplier_company, value: item.supplier_id };
      });
    } else {
      return [];
    }
  }, [supplier_name, dropdownSupplierListRes]);


  const { data: yarnReceiveListRes, isLoading: isLoadingYarnReceiveList } =
    useQuery({
      queryKey: [
        "yarn-stock/yarn-receive-challan/list",
        {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          toDate: debouncedToDate,
          fromDate: debouncedFromDate,
          end: financialYearEnd,
          is_bill_created: debouceBillStatus,
          supplier_name: debounceSupplierName, 
          supplier_id: debouceSupplierId
        },
      ],
      queryFn: async () => {
        const res = await getYarnReceiveListRequest({
          companyId,
          params: {
            company_id: companyId,
            page,
            pageSize,
            search: debouncedSearch,
            toDate: debouncedToDate,
            fromDate: debouncedFromDate,
            end: financialYearEnd,
            is_bill_created: debouceBillStatus, 
            supplier_name: debounceSupplierName, 
            supplier_id: debouceSupplierId
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  function navigateToAdd() {
    navigate("/purchase/receive/yarn-receive/add");
  }

  function navigateToUpdate(id) {
    navigate(`/purchase/receive/yarn-receive/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => ((page * pageSize) + index) + 1
    },
    {
      title: "Order No",
      dataIndex: "order_no",
      key: "order_no",
      render: (text, record) => (
        <div>
          {record?.yarn_order?.id || "-"}
        </div>
      )
    },
    {
      title: "Challan Date",
      key: "challan_date",
      render: ({ challan_date }) => {
        return dayjs(challan_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      key: "supplier",
      render: (text, record) => (
        <div>-</div>
      )
    },
    {
      title: "Supplier Company",
      dataIndex: "supplier_company",
      key: "supplier_company",
      render: (text, record) => (
        <div>-</div>
      )
    },
    {
      title: "Company",
      dataIndex: ["yarn_stock_company", "yarn_company_name"],
      key: "yarn_stock_company.yarn_company_name",
    },
    {
      title: "Denier",
      key: "denier",
      render: ({ yarn_stock_company = {} }) => {
        const {
          yarn_count = 0,
          filament = 0,
          yarn_type = "",
          yarn_Sub_type = "",
          luster_type = "",
          yarn_color = "",
        } = yarn_stock_company;
        return `${yarn_count}C/${filament}F (${yarn_type}(${yarn_Sub_type}) - ${luster_type} - ${yarn_color})`;
      },
    },
    {
      title: "Quantity KG",
      dataIndex: "receive_quantity",
      key: "receive_quantity",
    },
    {
      title: "Cartoon",
      dataIndex: "receive_cartoon_pallet",
      key: "receive_cartoon_pallet",
    },
    {
      title: "Bill Status /Rate(Excl. Gst)",
      dataIndex: "is_bill_created",
      key: "is_bill_created",
      render: (text, record) => (
        text != true ? <Tag color="red">Pending</Tag> :
        <div>
          <Tag color="green">Received</Tag><span style={{fontSize: "13px"}}>{`${record?.yarn_order?.rate} Rs`}</span>
        </div>
      )
    },
    {
      title: "Action",
      render: (yarnReceiveDetails) => {
        return (
          <Space>

            {!yarnReceiveDetails?.is_bill_created ? <>
              <Button
                onClick={() => {
                  navigateToUpdate(yarnReceiveDetails.id);
                }}
              >
                <EditOutlined />
              </Button>

              <DeleteYarnReceiveButton details={yarnReceiveDetails} />
              
              <MultipleChallanCreateButton details={yarnReceiveDetails} />
              
              <YarnReceiveChallanModal details={[yarnReceiveDetails]} />

            </> : <>
              {!yarnReceiveDetails?.has_yarn_sale_return && (
                <YarnReturnModel
                  details={yarnReceiveDetails}
                />
              )}
            </>}

          </Space>
        );
      },
      key: "action",
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selecteChallanId, setSelectecdChallanId] = useState(null)

  const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {

    let lastElement = newSelectedRows[newSelectedRows?.length - 1];
    let lastElement_yarn_stock_company_id = lastElement?.yarn_stock_company_id;

    if (selecteChallanId == null) {
      setSelectecdChallanId(lastElement_yarn_stock_company_id);
      setSelectedRowKeys(newSelectedRowKeys);

    } else if (selecteChallanId == lastElement_yarn_stock_company_id) {
      setSelectedRowKeys(newSelectedRowKeys);

    } else {
      setSelectecdChallanId(lastElement_yarn_stock_company_id);
      setSelectedRowKeys([lastElement?.id])
    }
    setSelectedRows(newSelectedRows)

  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE
    ],
  };

  function renderTable() {
    if (isLoadingYarnReceiveList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        rowSelection={billStatus == "1"?null:rowSelection}
        dataSource={yarnReceiveListRes?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: yarnReceiveListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{
          overflow: "auto",
        }}
        summary={() => {
          if (!yarnReceiveListRes?.row?.length) return ; 
          const {
            sumOfReciveQuantity, 
            sumOfCartoonPallet
          } = yarnReceiveListRes ; 

          return(
            <>
              <Table.Summary.Row cla  ssName="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                {billStatus == "0" && <Table.Summary.Cell/> }
                <Table.Summary.Cell/>
                <Table.Summary.Cell/>
                <Table.Summary.Cell/>
                <Table.Summary.Cell/>
                <Table.Summary.Cell/>
                <Table.Summary.Cell/>
                <Table.Summary.Cell/>
                <Table.Summary.Cell>{sumOfReciveQuantity}</Table.Summary.Cell>
                <Table.Summary.Cell>{sumOfCartoonPallet}</Table.Summary.Cell>
                <Table.Summary.Cell/>
                <Table.Summary.Cell/>

              </Table.Summary.Row>
            </>
          )
        }}
      />
    );
  }

  const disableFutureDates = (current) => {
    return current && current > moment().endOf('day');
  };

  return (
    <div className="flex flex-col p-4">
      
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Yarn Receive Challan List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="flex-end" justify="right" gap={10} wrap="wrap">

          <Flex align="center" gap={20}>
            {selectedRows?.length > 0 && (
              <YarnReceiveChallanModal details={selectedRows} />
            )}
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Bill status
            </Typography.Text>
            <Select
              placeholder="Bill status"
              value={billStatus}
              onChange={setBillStatus}
              options={[
                { label: "Pending", value: "0" },
                { label: "Received", value: "1" }
              ]}
              style={{
                width: "100%",
              }}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={fromDate}
              onChange={setFromDate}
              disabledDate={disableFutureDates}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={toDate}
              onChange={setToDate}
              disabledDate={disableFutureDates}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">Supplier Name</Typography.Text>
            <Select
              loading={isLoadingDropdownSupplierList}
              placeholder="Select Supplier"
              options={dropdownSupplierListRes?.map((supervisor) => ({
                label: supervisor?.supplier_name,
                value: supervisor?.supplier_name,
              }))}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              value={supplier_name}
              onChange={set_supplier_name}
              allowClear
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">Supplier Company</Typography.Text>
            <Select
              loading={isLoadingDropdownSupplierList}
              placeholder="Select Supplier Company"
              options={dropDownSupplierCompanyOption}
              style={{
                textTransform: "capitalize",
              }}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              allowClear
              value={supplier_id}
              onChange={set_supplier_id}
            />
          </Flex>

          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "200px",
            }}
          />
          

        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default YarnReceiveList;
