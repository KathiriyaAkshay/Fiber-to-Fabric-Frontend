import {
  Button,
  DatePicker,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  Tooltip
} from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { getJobTakaDetailListRequest } from "../../../api/requests/job/jobTaka";
import dayjs from "dayjs";
import useDebounce from "../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import GridInformationModel from "../../../components/common/modal/gridInformationModel";
import { SALE_CHALLAN_INFO_TAG_COLOR } from "../../../constants/tag";
import { disabledFutureDate } from "../../../utils/date";
import { JOB_SUPPLIER_TYPE } from "../../../constants/supplier";
import { JOB_QUALITY_TYPE } from "../../../constants/supplier";
import { getDisplayQualityName } from "../../../constants/nameHandler";

const JobTakaList = () => {
  const { companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [type, setType] = useState();
  const [quality, setQuality] = useState();
  const [takaNo, setTakaNo] = useState("");
  const [challanNo, setChallanNo] = useState("");
  const [supplier, setSupplier] = useState();
  const [supplierCompany, setSupplierCompany] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedType = useDebounce(type, 500);
  const debouncedQuality = useDebounce(quality, 500);
  // const debouncedState = useDebounce(state, 500);
  const debouncedTakaNo = useDebounce(takaNo, 500);
  const debouncedChallanNo = useDebounce(challanNo, 500);
  const debouncedSupplier = useDebounce(supplier, 500);
  const debouncedSupplierCompany = useDebounce(supplierCompany, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  // Dropdown quality list api ==================================================
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
          production_type: JOB_QUALITY_TYPE
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 9999,
            is_active: 1,
            production_type: JOB_QUALITY_TYPE
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });
  
  // Dropdown supplier list api =======================================================
  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId, supplier_type: JOB_SUPPLIER_TYPE }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId, supplier_type: JOB_SUPPLIER_TYPE },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const dropDownSupplierCompanyOption = useMemo(() => {
    if (
      debouncedSupplier &&
      dropdownSupplierListRes &&
      dropdownSupplierListRes.length
    ) {
      const obj = dropdownSupplierListRes.filter((item) => {
        return item.supplier_name === debouncedSupplier;
      })[0];

      return obj?.supplier_company?.map((item) => {
        return { label: item.supplier_company, value: item.supplier_id };
      });
    } else {
      return [];
    }
  }, [debouncedSupplier, dropdownSupplierListRes]);

  const { data: jobTakaList, isLoading } = useQuery({
    queryKey: [
      "jobTaka",
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
        supplier_id: debouncedSupplierCompany,
        taka_no: debouncedTakaNo,
        in_stock: debouncedType === "in_stock" ? 1 : 0,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
        quality_id: debouncedQuality,
        challan_no: debouncedChallanNo,
        supplier_name: debouncedSupplier,
        supplier_id: debouncedSupplierCompany,
        taka_no: debouncedTakaNo,
        in_stock: debouncedType === "in_stock" ? 1 : 0,
      };
      if (debouncedFromDate) {
        params.from = dayjs(debouncedFromDate).format("YYYY-MM-DD");
      }
      if (debouncedToDate) {
        params.to = dayjs(debouncedToDate).format("YYYY-MM-DD");
      }
      const res = await getJobTakaDetailListRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/job/job-taka/add");
  }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = jobTakaList?.rows?.map((item, index) => {
      const {
        taka_no,
        meter,
        weight,
        job_taka_challan,
        is_returned,
        in_stock,
        createdAt,
      } = item;
      return [
        index + 1,
        job_taka_challan.challan_no,
        `${job_taka_challan?.inhouse_quality?.quality_name} (${job_taka_challan?.inhouse_quality?.quality_weight}KG)`,
        taka_no,
        meter,
        weight,
        "****", // average will be here.
        dayjs(createdAt).format("DD-MM-YYYY"),
        is_returned ? "Returned" : in_stock ? "In Stock" : "Sold",
      ];
    });

    const tableTitle = [
      "ID",
      "Purchase Challan No",
      "Quality",
      "Taka No.",
      "Meter",
      "weight",
      "Average",
      "Date",
      "Status",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Job Taka List");
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
      title: "Taka No",
      dataIndex: "taka_no",
      key: "taka_no",
      render: (text, record) => {
        return(
          <div>
            <Tag color="#108ee9">
              {text}
            </Tag>
          </div>
        )
      }
    },
    {
      title: "Quality Name",
      render: (details) => {
        return(
          <div style={{fontSize:13}}>
            {getDisplayQualityName(details.job_taka_challan.inhouse_quality)}
          </div>
        )
      },
    },
    {
      title: "Supplier", 
      render: (text, record) => {
        return(
          <div style={{fontSize: 13}}>
            {record?.job_taka_challan?.supplier?.supplier_name}
          </div>
        )
      }
    },
    {
      title: "Job Challan No",
      render: (details) => {
        return(
          <div style={{cursor: "pointer"}}>
            <Tooltip title = {`Gray order - ${details?.job_taka_challan?.gray_order?.order_no}`}>
              {details?.job_taka_challan?.challan_no} | <span style={{fontWeight: 600}}>{details?.job_taka_challan?.gray_order?.order_no}</span>
            </Tooltip>
          </div>
        )
      },
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
    },

    {
      title: "Average",
      dataIndex: "total_meter",
      key: "total_meter",
      render: (text, record) => {
        let weight = +record?.weight;
        let meter = +record?.meter;
        let average = (weight / meter) * 100;
        return <div>{parseFloat(average).toFixed(2)}</div>;
      },
    },
    {
      title: "Sale Ch.No.",
      dataIndex: "total_taka",
      render: (text, record) => {
        if (record?.sale_challan?.challan_no !== undefined) {
          return (
            <Tag color={SALE_CHALLAN_INFO_TAG_COLOR}>
              Sale Chal - {record?.sale_challan?.challan_no || "-"}
            </Tag>
          );
        }
        return <div>-</div>; // Render nothing if the value is undefined
      },
    },
    ,
    {
      title: "Status",
      render: (details) => {
        return details.sale_challan_id != null ? (
          <Tag color="red">Sold</Tag>
        ) : details.is_returned ? (
          <Tag color="red">Returned</Tag>
        ) : details.in_stock ? (
          <Tag color="green">In-Stock</Tag>
        ) : null;
      },
    },
    {
      title: "Action",
      render: (details) => {
        let weight = +details?.weight;
        let meter = +details?.meter;
        let average = (weight / meter) * 100;

        return (
          <Space>
            <GridInformationModel
              title="Job Production Details"
              details={[
                {
                  label: "Quality Name",
                  value: getDisplayQualityName(details.job_taka_challan.inhouse_quality),
                },
                {
                  label: "Date",
                  value: dayjs(details.createdAt).format("DD-MM-YYYY"),
                },
                { label: "Taka No", value: details.taka_no },
                { label: "Meter", value: details.meter },
                { label: "Weight", value: details.weight },
                {
                  label: "Order Type",
                  value: details.job_taka_challan.gray_order.order_type,
                },
                { label: "Average", value: average },
                {
                  label: "Job Challan No",
                  value: details.job_taka_challan.challan_no,
                },
                {
                  label: "Sale Challan No",
                  value: details?.sale_challan?.challan_no || "-",
                },
                {
                  label: "Supplier Name",
                  value: details.job_taka_challan.supplier.supplier_name,
                },
                {
                  label: "Purchase Company Name",
                  value: details.job_taka_challan.supplier.supplier_company,
                },
              ]}
            />
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
        dataSource={jobTakaList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: jobTakaList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(pageData) => {
          let totalMeter = 0;
          let totalWeight = 0;
          pageData.forEach(({ meter, weight }) => {
            totalMeter += +meter;
            totalWeight += +weight;
          });

          return (
            <>
              
              {/* Particular page total information  */}
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{parseFloat(totalMeter).toFixed(2)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{parseFloat(totalWeight).toFixed(2)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>

              {/* All data total information  */}
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>
                  Grand <br /> Total
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>
                    {parseFloat(jobTakaList?.total_meters).toFixed(2) || 0}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  {parseFloat(jobTakaList?.total_weight).toFixed(2) || 0}
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>
            </>
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
            <h3 className="m-0 text-primary">Job Production List</h3>
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
                  Type
                </Typography.Text>
                <Select
                  allowClear
                  placeholder="Select Type"
                  value={type}
                  options={[
                    { label: "In Stock", value: "in_stock" },
                    { label: "Sold", value: "sold" },
                  ]}
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
                      label: getDisplayQualityName(item.quality_name),
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
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!jobTakaList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
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
                allowClear
                className="min-w-40"
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Supplier Company
              </Typography.Text>
              <Select
                placeholder="Select Company"
                options={dropDownSupplierCompanyOption}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                value={supplierCompany}
                onChange={setSupplierCompany}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                allowClear
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Taka No
              </Typography.Text>
              <Input
                placeholder="Taka No"
                value={takaNo}
                onChange={(e) => setTakaNo(e.target.value)}
                style={{ width: "200px" }}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                J. Challan No
              </Typography.Text>
              <Input
                placeholder="J. Challan NO"
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

export default JobTakaList;
