import {
  Button,
  Col,
  Divider,
  Flex,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import {
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import dayjs from "dayjs";
import { getYarnSentListRequest } from "../../../../api/requests/job/sent/yarnSent";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import {
  getDropdownSupplierListRequest,
  // getVehicleUserListRequest,
} from "../../../../api/requests/users";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../../api/hooks/auth";
import DeleteYarnSent from "../../../../components/job/yarnSent/DeleteYarnSent";

const YarnSentList = () => {
  const { company, companyId } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [quality, setQuality] = useState();
  // const [party, setParty] = useState();
  const [supplier, setSupplier] = useState();
  const [supplierCompany, setSupplierCompany] = useState();

  const debouncedSearch = useDebounce(search, 500);
  const debouncedQuality = useDebounce(quality, 500);
  // const debouncedParty = useDebounce(party, 500);
  const debouncedSupplier = useDebounce(supplier, 500);
  const debouncedSupplierCompany = useDebounce(supplierCompany, 500);

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

  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: [
        "inhouse-quality",
        "list",
        { company_id: companyId, page: 0, pageSize: 99999, is_active: 1 },
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

  // const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
  //   queryKey: ["party", "list", { company_id: companyId }],
  //   queryFn: async () => {
  //     const res = await getPartyListRequest({
  //       params: { company_id: companyId },
  //     });
  //     return res.data?.data;
  //   },
  //   enabled: Boolean(companyId),
  // });

  // const { data: vehicleListRes, isLoading: isLoadingVehicleList } = useQuery({
  //   queryKey: [
  //     "vehicle",
  //     "list",
  //     { company_id: companyId, page: 0, pageSize: 99999 },
  //   ],
  //   queryFn: async () => {
  //     const res = await getVehicleUserListRequest({
  //       params: { company_id: companyId, page: 0, pageSize: 99999 },
  //     });
  //     return res.data?.data;
  //   },
  //   enabled: Boolean(companyId),
  // });

  const { data: jobYarnSentList, isLoading } = useQuery({
    queryKey: [
      "jobYarnSent",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        supplier_id: debouncedSupplierCompany,
        quality_id: debouncedQuality,
        search: debouncedSearch,
        // party_id: debouncedParty,
      },
    ],
    queryFn: async () => {
      const res = await getYarnSentListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          supplier_id: debouncedSupplierCompany,
          quality_id: debouncedQuality,
          search: debouncedSearch,
          // party_id: debouncedParty,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/job/sent/yarn-sent/add");
  }

  function navigateToUpdate(id) {
    navigate(`/job/sent/yarn-sent/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = YarnSentList?.row?.map((user, index) => {
      const { quality_name, quality_group, production_type, is_active } = user;
      return [
        index + 1,
        quality_name,
        quality_group,
        production_type,
        is_active ? "Active" : "Inactive",
      ];
    });

    downloadUserPdf({
      body,
      head: [["ID", "Quality Name", "Quality Group", "Product Type", "Status"]],
      leftContent,
      rightContent,
      title: "Trading Quality List",
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
      title: "Sent Date",
      render: (detail) => {
        return dayjs(detail.sent_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Supplier Name",
      render: (detail) => {
        return `${detail?.supplier?.supplier_name ?? ""}`;
      },
    },
    {
      title: "Company Name",
      render: (detail) => {
        let normalStr = detail.company.company_name.replace(/_/g, " ");
        normalStr = normalStr
          .split(" ")
          .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          })
          .join(" ");

        return normalStr;
      },
    },
    {
      title: "Quality Name",
      render: (detail) => {
        return `${detail.inhouse_quality.quality_name} - (${detail.inhouse_quality.quality_weight}KG)`;
      },
    },
    {
      title: "Delivery Charge",
      dataIndex: "delivery_charge",
      key: "delivery_charge",
    },
    {
      title: "Power Cost Per Meter",
      dataIndex: "power_cost",
      key: "power_cost",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewYarnSentDetailsModal
              title="Yarn Sent Details"
              details={details}
            />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteYarnSent details={details} />
            <Button>
              <TruckOutlined />
            </Button>
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
        dataSource={jobYarnSentList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: jobYarnSentList?.rows?.count || 0,
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
          <h3 className="m-0 text-primary">Yarn Sent</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Quality
            </Typography.Text>
            <Select
              placeholder="Select Quality"
              value={quality}
              loading={isLoadingInHouseQualityList}
              options={inHouseQualityList?.rows?.map(
                ({ id = 0, quality_name = "" }) => ({
                  label: quality_name,
                  value: id,
                })
              )}
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
          {/* <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Party
            </Typography.Text>
            <Select
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
          </Flex> */}
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

          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "200px",
            }}
          />

          {/* <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Vehicle
            </Typography.Text>
            <Select
              placeholder="Select vehicle"
              loading={isLoadingVehicleList}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              value={vehicle}
              onChange={setVehicle}
              options={vehicleListRes?.vehicleList?.rows?.map((vehicle) => ({
                label:
                  vehicle.first_name +
                  " " +
                  vehicle.last_name +
                  " " +
                  `| ( ${vehicle?.username})`,
                value: vehicle.id,
              }))}
            />
          </Flex> */}

          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!jobYarnSentList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default YarnSentList;

const ViewYarnSentDetailsModal = ({ title = "-", details = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const yarnSentDetail = [
    { title: "Challan No", value: details.challan_no },
    {
      title: "Sent Date",
      value: dayjs(details.sent_date).format("DD-MM-YYYY"),
    },
    { title: "Delivery Charge", value: details.delivery_charge },
    { title: "Power Cost", value: details.power_cost },
  ];

  const { job_yarn_sent_details } = details;
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
        className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
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
          {yarnSentDetail?.map(({ title = "", value }) => {
            return (
              <Row gutter={12} className="flex-grow" key={title}>
                <Col span={10} className="font-medium">
                  {title}
                </Col>
                <Col span={14}>{value ?? "-"}</Col>
              </Row>
            );
          })}

          {job_yarn_sent_details.map((item, index) => {
            return (
              <>
                <Divider />
                <Row
                  gutter={12}
                  className="flex-grow"
                  key={index + "_job_challan_details"}
                >
                  <Col span={4} className="font-medium">
                    Denier
                  </Col>
                  <Col span={4}>
                    {`${item.yarn_stock_company.yarn_denier}D/${item.yarn_stock_company.filament}F (${item.yarn_stock_company.luster_type} - ${item.yarn_stock_company.yarn_color})`}
                  </Col>
                  <Col span={2} className="font-medium">
                    Cartoon:
                  </Col>
                  <Col span={2}>{item.cartoon}</Col>
                  <Col span={2} className="font-medium">
                    KG:
                  </Col>
                  <Col span={2}>{item.kg}</Col>
                  <Col span={2} className="font-medium">
                    Remaining Stock:
                  </Col>
                  <Col span={2}>{item.remaining_stock}</Col>
                </Row>
              </>
            );
          })}
        </Flex>
      </Modal>
    </>
  );
};
