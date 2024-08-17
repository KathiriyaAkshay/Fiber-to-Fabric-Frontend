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
} from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
// import useDebounce from "../../../hooks/useDebounce";
// import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
// import { useCurrentUser } from "../../../api/hooks/auth";
import dayjs from "dayjs";
import useDebounce from "../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { getPurchaseTakaDetailListRequest } from "../../../api/requests/purchase/purchaseTaka";
import { disabledFutureDate } from "../../../utils/date";
import GridInformationModel from "../../../components/common/modal/gridInformationModel";

const PurchaseTakaList = () => {
  const { companyId, companyListRes } = useContext(GlobalContext);
  // const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  // const [state, setState] = useState("current");
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

  const { data: purchaseTakaList, isLoading } = useQuery({
    queryKey: [
      "purchaseTaka",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from: debouncedFromDate,
        to: debouncedToDate,
        quality_id: debouncedQuality,
        challan_no: debouncedChallanNo,
        supplier_id: debouncedSupplierCompany,
        toka_no: debouncedTakaNo,
        in_stock: debouncedType === "in_stock" ? true : false,
      },
    ],
    queryFn: async () => {
      const res = await getPurchaseTakaDetailListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          from: debouncedFromDate,
          to: debouncedToDate,
          quality_id: debouncedQuality,
          challan_no: debouncedChallanNo,
          toka_no: debouncedTakaNo,
          supplier_id: debouncedSupplierCompany,
          in_stock: debouncedType === "in_stock" ? true : false,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/purchase/purchased-taka/add");
  }

  // function navigateToUpdate(id) {
  //   navigate(`/job/job-taka/update/${id}`);
  // }

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = purchaseTakaList?.rows?.map((item, index) => {
      const {
        taka_no,
        meter,
        weight,
        purchase_taka_challan,
        is_returned,
        in_stock,
        createdAt,
      } = item;

      return [
        index + 1,
        purchase_taka_challan.challan_no,
        `${purchase_taka_challan?.inhouse_quality?.quality_name} (${purchase_taka_challan?.inhouse_quality?.quality_weight}KG)`,
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
    localStorage.setItem("print-title", "Purchase Production List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Purchase Challan No",
    //       "Quality",
    //       "Taka No.",
    //       "Meter",
    //       "weight",
    //       "Average",
    //       "Date",
    //       "Status",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Purchase Production List",
    // });
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
      title: "Quality Name",
      render: (details) => {
        return `${details?.purchase_taka_challan?.inhouse_quality?.quality_name} (${details?.purchase_taka_challan?.inhouse_quality?.quality_weight}KG)`;
      },
    },
    {
      title: "Purchase Challan No",
      render: (details) => {
        return details?.purchase_taka_challan?.challan_no;
      },
    },
    {
      title: "Taka No",
      dataIndex: "taka_no",
      key: "taka_no",
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
    },
    {
      title: "Sale Ch.No.",
      dataIndex: "total_taka",
      key: "total_taka",
    },
    {
      title: "Status",
      render: (details) => {
        return details.is_returned ? (
          <Tag color="red">Returned</Tag>
        ) : details.in_stock ? (
          <Tag color="green">In Stock</Tag>
        ) : (
          <Tag color="red">Sold</Tag>
        );
      },
    },
    {
      title: "Action",
      render: (details) => {
        const purchaseCompany = companyListRes.rows.find(
          ({ id }) => id === details.purchase_taka_challan.company_id
        );
        return (
          <Space>
            <GridInformationModel
              key={"purchased production details"}
              title="Purchased Production Details"
              details={[
                {
                  label: "Quality Name",
                  value: `${details?.purchase_taka_challan?.inhouse_quality?.quality_name} (${details?.purchase_taka_challan?.inhouse_quality?.quality_weight}KG)`,
                },
                {
                  label: "Date",
                  value: dayjs(details.createdAt).format("DD-MM-YYYY"),
                },
                { label: "Taka No", value: details?.taka_no },
                { label: "Meter", value: details?.meter },
                { label: "Weight", value: details?.weight },
                {
                  label: "Order Type",
                  value: details?.purchase_taka_challan?.gray_order?.order_type,
                },
                { label: "Average", value: details?.total_weight },
                {
                  label: "Purchase Challan No",
                  value: details?.purchase_taka_challan?.challan_no,
                },
                {
                  label: "Supplier Name",
                  value: details?.purchase_taka_challan.supplier?.supplier_name,
                },
                {
                  label: "Purchase Company Name",
                  value: purchaseCompany?.company_name,
                },
              ]}
            />
            {/* <Button
                onClick={() => {
                  navigateToUpdate(details.id);
                }}
              >
                <EditOutlined />
              </Button>
              <DeleteJobTaka details={details} /> */}
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
        dataSource={purchaseTakaList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: purchaseTakaList?.rows?.count || 0,
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
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{totalMeter}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{totalWeight}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>
                  Grand <br /> Total
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>
                    {purchaseTakaList?.total_meter}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>
                    {purchaseTakaList?.total_weight}
                  </Typography.Text>
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
    <div className="flex flex-col p-4">
      {/* <div className="flex items-center justify-end gap-5 mx-3 mb-3">
        <Radio.Group
          name="filter"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          <Flex align="center" gap={10}>
            <Radio value={"current"}> Current</Radio>
            <Radio value={"previous"}> Previous </Radio>
          </Flex>
        </Radio.Group>
      </div> */}

      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Purchase Production List</h3>
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
            disabled={!purchaseTakaList?.rows?.length}
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
  );
};

export default PurchaseTakaList;
