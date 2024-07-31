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
  Card
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
import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
const { Title, Text } = Typography;
import ReactToPrint from "react-to-print";
import moment from "moment";

const YarnSentList = () => {
  const { company, companyId } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [quality, setQuality] = useState();
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

    const tableTitle = [
      "No", 
      "Date", 
      "Challan No", 
      "Party Name", 
      "Company Name", 
      "Cartoon", 
      "Kg"
    ]; 

    let temp = [] ; 
    let total_cartoon = 0 ; 
    let total_kg = 0 ; 

    jobYarnSentList?.rows?.map((element, index) => {
      let normalStr = element.company.company_name.replace(/_/g, " ");
      normalStr = normalStr
      .split(" ")
      .map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");

      let temp_cartoon = 0;
      let temp_kg = 0 ; 
      element?.job_yarn_sent_details?.map((data) => {
        total_cartoon = total_cartoon + Number(data?.cartoon);
        temp_cartoon = temp_cartoon + Number(data?.cartoon);

        total_kg = total_kg + Number(data?.kg) ; 
        temp_kg = temp_kg + Number(data?.kg) ; 
      })


      temp.push([
        index + 1,
        moment(element?.sent_date).format("DD-MM-YYYY"), 
        element?.challan_no, 
        element?.supplier?.supplier_name, 
        normalStr, 
        temp_cartoon, 
        temp_kg
      ]); 

    })
    ; 

    console.log("Temp information");
    console.log(temp);
    
    let total = [
      "", 
      "", 
      "", 
      "", 
      "", 
      total_cartoon, 
      total_kg
    ]

    localStorage.setItem("print-title", "Yarn sent List") ; 
    localStorage.setItem("print-head", JSON.stringify(tableTitle)) ; 
    localStorage.setItem("print-array", JSON.stringify(temp)) ; 
    localStorage.setItem("total-count", "1") ; 
    localStorage.setItem("total-data", JSON.stringify(total)) ; 

    window.open("/print") ; 


    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    // const body = YarnSentList?.row?.map((user, index) => {
    //   const { quality_name, quality_group, production_type, is_active } = user;
    //   return [
    //     index + 1,
    //     quality_name,
    //     quality_group,
    //     production_type,
    //     is_active ? "Active" : "Inactive",
    //   ];
    // });

    // downloadUserPdf({
    //   body,
    //   head: [["ID", "Quality Name", "Quality Group", "Product Type", "Status"]],
    //   leftContent,
    //   rightContent,
    //   title: "Trading Quality List",
    // });
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
      title: "Party Name",
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
      title: "Cartoon",
      dataIndex: "cartoon",
      key: "cartoon",
      render: (text, record) => {
        let total_cartoon = 0;
        record?.job_yarn_sent_details?.map((element) => {
          total_cartoon = total_cartoon + Number(element?.cartoon);
        })

        return (
          <div>{total_cartoon}</div>
        )
      }
    },
    {
      title: "Kg",
      dataIndex: "kg",
      key: "kg",
      render: (text, record) => {
        let total_kg = 0;
        record?.job_yarn_sent_details?.map((element) => {
          total_kg = total_kg + Number(element?.kg);
        })
        return (
          <div>{total_kg}</div>
        )
      }
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
              allowClear
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

          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "200px",
            }}
          />


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

const ViewYarnSentDetailsModal = ({ title = "-",
  isScroll = false,
  details = [] }) => {

  const { company, companyId } = useContext(GlobalContext);
  console.log(details);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const adjustHeight = {};
  if (isScroll) {
    adjustHeight.height = "calc(100vh - 150px)";
    adjustHeight.overflowY = "scroll";
  }

  const [dataSource, setDataSource] = useState([]);

  const ModalColumns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
    },
    {
      title: 'Company name',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: 'Denier',
      dataIndex: 'dennier',
      key: 'dennier',
    },
    {
      title: 'KG',
      dataIndex: 'kg',
      key: 'kg',
    },
    {
      title: 'Cartoon',
      dataIndex: 'cartoon',
      key: 'cartoon',
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      key: 'remark',
    },
  ];

  useEffect(() => {
    let temp = [];

    details?.job_yarn_sent_details?.map((element, index) => {
      temp.push({
        no: index + 1,
        company_name: element?.yarn_stock_company?.yarn_company_name,
        dennier: `${element?.yarn_stock_company?.yarn_type}-${element?.yarn_stock_company?.yarn_Sub_type}-${element?.yarn_stock_company?.yarn_color}`,
        kg: element?.kg,
        cartoon: element?.cartoon,
        remark: ""
      });
    })
    setDataSource(temp);
  }, [details]);

  const componentRef = useRef();

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
        footer={() => {
          return (
            <>
              <ReactToPrint
                trigger={() => <Flex>
                  <Button type="primary" style={{ marginLeft: "auto", marginTop: 15 }}>
                    PRINT
                  </Button>
                </Flex>
                }
                content={() => componentRef.current}
              />
            </>
          )
        }}
        onCancel={handleCancel}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"65%"}
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
            ...adjustHeight,
          },
          footer: {
            paddingBottom: 10,
            paddingRight: 10,
            backgroundColor: "#efefef"
          }
        }}
      >
        <div ref={componentRef} style={{ padding: "25px" }}>

          <Card className="card-wrapper" >

            <Row className="header-row">
              <Col span={11} className="header-col">
                <Card className="header-card">
                  <Title level={4} className="header-title card-text">TO: {details?.supplier?.supplier_company}</Title>
                  <div className="header-card-text">
                    <Text strong>Address: {details?.supplier?.user?.address}</Text><br />
                    <Text >GST NO: {details?.supplier?.user?.gst_no}</Text><br />
                  </div>
                </Card>
              </Col>
              <Col span={2}></Col>
              <Col span={11} className="header-col">
                <Card className="header-card">
                  <Title level={4} className="header-title">FROM: {company?.company_name}</Title>
                  <div className="header-card-text">
                    <Text strong>Address: {company.address_line_1}, {company.address_line_2}, {company.city}, {company.state}, {company.pincode}, {company.country}</Text><br />
                    <Text >GST NO: {company?.gst_no}</Text><br />
                  </div>
                </Card>
              </Col>
            </Row>

            <div class="dotted-line"></div>
            <Row gutter={16} style={{ marginTop: 8, paddingLeft: 12, paddingRight: 12, marginBottom: 8 }}>
              <Col span={6}>
                <Flex gap={2} justify="center">
                  <Text strong>E Bill Number:</Text><br />
                  <Text>-</Text><br />
                </Flex>
              </Col>
              <Col span={6}>
                <Flex gap={2} justify="center">
                  <Text strong>Challan No:</Text><br />
                  <Text>{details?.challan_no}</Text><br />
                </Flex>
              </Col>
              <Col span={6}>
                <Flex gap={2} justify="center">
                  <Text strong>Vehicle No:</Text><br />
                  <Text>{details?.vehicle?.vehicle?.vehicleNo}</Text><br />
                </Flex>
              </Col>
              <Col span={6}>
                <Flex gap={2} justify="center ">
                  <Text strong>Date:</Text><br />
                  <Text>{moment(details?.createdAt).format("DD-MM-YYYY")}</Text><br />
                </Flex>
              </Col>
            </Row>
            <div class="dotted-line"></div>
            <Table
              dataSource={dataSource}
              columns={ModalColumns}
              pagination={false}
              className="data-table"
              style={{ marginTop: 16 }}
              bordered
              summary={() => {
                let totalCartoon = 0;
                let totalKG = 0;
                dataSource?.map((element) => {
                  totalCartoon = totalCartoon + Number(element?.cartoon);
                  totalKG = totalKG + Number(element?.kg);

                })
                return (
                  <>
                    <Table.Summary.Row className="font-semibold">
                      <Table.Summary.Cell>Total</Table.Summary.Cell>
                      <Table.Summary.Cell />
                      <Table.Summary.Cell />
                      <Table.Summary.Cell>
                        <Typography.Text>{totalKG}</Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        <Typography.Text>{totalCartoon}</Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell />
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
            <div class="dotted-line"></div>
            <Row gutter={16} style={{ marginTop: 16, paddingLeft: 12, paddingRight: 12, marginBottom: 40 }}>
              <Col span={12}>
                <Text ><strong>Receivers sign</strong></Text>
              </Col>
              <Col span={12}>
                <Text strong>
                  <strong>
                    Senders sign
                  </strong>
                </Text>
              </Col>
            </Row>
          </Card>

          <div class="red-dotted-line"></div>

          <Card className="card-wrapper" >

            <Row className="header-row">
              <Col span={11} className="header-col">
                <Card className="header-card">
                  <Title level={4} className="header-title card-text">TO: {details?.supplier?.supplier_company}</Title>
                  <div className="header-card-text">
                    <Text strong>Address: {details?.supplier?.user?.address}</Text><br />
                    <Text >GST NO: {details?.supplier?.user?.gst_no}</Text><br />
                  </div>
                </Card>
              </Col>
              <Col span={2}></Col>
              <Col span={11} className="header-col">
                <Card className="header-card">
                  <Title level={4} className="header-title">FROM: {company?.company_name}</Title>
                  <div className="header-card-text">
                    <Text strong>Address: {company.address_line_1}, {company.address_line_2}, {company.city}, {company.state}, {company.pincode}, {company.country}</Text><br />
                    <Text >GST NO: {company?.gst_no}</Text><br />
                  </div>
                </Card>
              </Col>
            </Row>

            <div class="dotted-line"></div>
            <Row gutter={16} style={{ marginTop: 8, paddingLeft: 12, paddingRight: 12, marginBottom: 8 }}>
              <Col span={6}>
                <Flex gap={2} justify="center">
                  <Text strong>E Bill Number:</Text><br />
                  <Text>-</Text><br />
                </Flex>
              </Col>
              <Col span={6}>
                <Flex gap={2} justify="center">
                  <Text strong>Challan No:</Text><br />
                  <Text>{details?.challan_no}</Text><br />
                </Flex>
              </Col>
              <Col span={6}>
                <Flex gap={2} justify="center">
                  <Text strong>Vehicle No:</Text><br />
                  <Text>{details?.vehicle?.vehicle?.vehicleNo}</Text><br />
                </Flex>
              </Col>
              <Col span={6}>
                <Flex gap={2} justify="center ">
                  <Text strong>Date:</Text><br />
                  <Text>{moment(details?.createdAt).format("DD-MM-YYYY")}</Text><br />
                </Flex>
              </Col>
            </Row>
            <div class="dotted-line"></div>
            <Table
              dataSource={dataSource}
              columns={ModalColumns}
              pagination={false}
              className="data-table"
              style={{ marginTop: 16 }}
              bordered
              summary={() => {
                let totalCartoon = 0;
                let totalKG = 0;
                dataSource?.map((element) => {
                  totalCartoon = totalCartoon + Number(element?.cartoon);
                  totalKG = totalKG + Number(element?.kg);

                })
                return (
                  <>
                    <Table.Summary.Row className="font-semibold">
                      <Table.Summary.Cell>Total</Table.Summary.Cell>
                      <Table.Summary.Cell />
                      <Table.Summary.Cell />
                      <Table.Summary.Cell>
                        <Typography.Text>{totalKG}</Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell>
                        <Typography.Text>{totalCartoon}</Typography.Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell />
                    </Table.Summary.Row>
                  </>
                );
              }}
            />
            <div class="dotted-line"></div>
            <Row gutter={16} style={{ marginTop: 16, paddingLeft: 12, paddingRight: 12, marginBottom: 40 }}>
              <Col span={12}>
                <Text ><strong>Receivers sign</strong></Text>
              </Col>
              <Col span={12}>
                <Text strong>
                  <strong>
                    Senders sign
                  </strong>
                </Text>
              </Col>
            </Row>
          </Card>

        </div>

      </Modal>
    </>
  );
};
