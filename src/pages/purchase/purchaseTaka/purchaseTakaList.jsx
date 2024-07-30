import {
  Button,
  Col,
  DatePicker,
  Flex,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  CloseOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
// import useDebounce from "../../../hooks/useDebounce";
import { downloadUserPdf, getPDFTitleContent } from "../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../api/hooks/auth";
import dayjs from "dayjs";
import useDebounce from "../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { getPurchaseTakaDetailListRequest } from "../../../api/requests/purchase/purchaseTaka";
// import DeleteJobTaka from "../../../components/job/jobTaka/DeleteJobTaka";

const PurchaseTakaList = () => {
  const { company, companyId } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const [state, setState] = useState("current");
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
  const debouncedState = useDebounce(state, 500);
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
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = purchaseTakaList?.rows?.map((user, index) => {
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
      title: "Quality Name",
      render: (details) => {
        return `${details?.inhouse_quality?.quality_name} (${details?.inhouse_quality?.quality_weight}KG)`;
      },
    },
    {
      title: "Purchase Challan No",
      render: (details) => {
        return details.challan_no;
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
        return details.in_stock ? (
          <span style={{ color: "green" }}>In Stock</span>
        ) : (
          <span style={{ color: "red" }}>Sold</span>
        );
      },
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewPurchaseTakaDetailsModal
              title="Purchase Taka Details"
              details={details}
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
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-end gap-5 mx-3 mb-3">
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
      </div>

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

const ViewPurchaseTakaDetailsModal = ({ title = "-", details = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const jobTakaDetails = [
    {
      title: "Quality Name",
      value: details?.inhouse_quality?.quality_name,
    },
    // { title: "Company Name", value: details.delivery_address },
    { title: "Date", value: dayjs(details.createdAt).format("DD-MM-YYYY") },
    { title: "Taka No", value: details.taka_no },
    { title: "Meter", value: details.meter },
    { title: "Weight", value: details.weight },

    { title: "Return Sale Challan No", value: details.total_weight },
    { title: "Sale Challan No", value: details?.total_weight },
    {
      title: "Order Type",
      value: details?.gray_order?.order_type,
    },
    { title: "Average", value: details.total_weight },
    { title: "Purchase Challan No", value: details.total_weight },
    { title: "Supplier Name", value: details.total_weight },
    { title: "Purchase Company Name", value: details.total_weight },
  ];

  return (
    <>
      <Button type="primary" onClick={showModal}>
        <EyeOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            {title}
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        // className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
            width: "600px",
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
          },
        }}
      >
        <Flex className="flex-col gap-1">
          {jobTakaDetails?.map(({ title = "", value }) => {
            return (
              <Row gutter={12} className="flex-grow" key={title}>
                <Col span={10} className="font-medium">
                  {title}
                </Col>
                <Col span={14}>{value ?? "-"}</Col>
              </Row>
            );
          })}

          {/* {job_challan_details.map((item, index) => {
              return (
                <>
                  <Divider />
                  <Row
                    gutter={12}
                    className="flex-grow"
                    key={index + "_job_challan_details"}
                  >
                    <Col span={4} className="font-medium">
                      Taka No:
                    </Col>
                    <Col span={4}>{item.taka_no}</Col>
                    <Col span={3} className="font-medium">
                      Meter:
                    </Col>
                    <Col span={4}>{item.meter}</Col>
                    <Col span={3} className="font-medium">
                      Weight:
                    </Col>
                    <Col span={4}>{item.weight}</Col>
                  </Row>
                </>
              );
            })} */}
        </Flex>
      </Modal>
    </>
  );
};
