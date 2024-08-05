import {
  Button,
  Col,
  DatePicker,
  Divider,
  Flex,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import {
  AppstoreOutlined,
  CloseOutlined,
  EditOutlined,
  EyeOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../lib/pdf/userPdf";
// import dayjs from "dayjs";
// import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import useDebounce from "../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import { BEAM_TYPE } from "../../constants/beam";
import dayjs from "dayjs";
import FinishBeamCardModal from "../../components/beamCard/FinishBeamCardModal";
import LoadNewBeamModal from "../../components/beamCard/LoadNewBeamModal";
import { getBeamCardListRequest } from "../../api/requests/beamCard";

const getTakaDetailsObject = (details) => {
  if (details) {
    let object =
      details.non_pasarela_beam_detail ||
      details.recieve_size_beam_detail ||
      details.job_beam_receive_detail;
    return { ...object, meter: object.meters || object.meter };
  }
};

const BeamCardList = () => {
  const navigate = useNavigate();
  const { company, companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const [search, setSearch] = useState({
    beamNo: "",
    machNo: "",
  });

  const [isLoadBeamModalOpen, setIsLoadBeamModalOpen] = useState(false);

  const [machine, setMachine] = useState();
  const [beamType, setBeamType] = useState("primary");
  const [beamTypeDropDown, setBeamTypeDropDow] = useState(null);
  const [quality, setQuality] = useState(null);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedMachine = useDebounce(machine, 500);
  const debouncedBeamTypeDropDown = useDebounce(beamTypeDropDown, 500);
  const debouncedQuality = useDebounce(quality, 500);

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
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
          machine_name: debouncedMachine,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        if (debouncedMachine) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              machine_name: debouncedMachine,
              page: 0,
              pageSize: 9999,
              is_active: 1,
            },
          });
          return res.data?.data;
        } else {
          return { row: [] };
        }
      },
      enabled: Boolean(companyId),
    });

  const { data: beamCardList, isLoading } = useQuery({
    queryKey: [
      "beamCard",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        beam_no: debouncedSearch.beamNo,
        machine_no: debouncedSearch.machNo,
        machine_name: debouncedMachine,
        status: debouncedBeamTypeDropDown,
        quality_id: debouncedQuality,
        // status: debouncedStatus,
      },
    ],
    queryFn: async () => {
      const res = await getBeamCardListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          beam_no: debouncedSearch.beamNo,
          machine_no: debouncedSearch.machNo,
          machine_name: debouncedMachine,
          status: debouncedBeamTypeDropDown,
          quality_id: debouncedQuality,
          // status: debouncedStatus,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  //   const {
  //     mutateAsync: updateTradingQuality,
  //     isPending: updatingTradingQuality,
  //     variables,
  //   } = useMutation({
  //     mutationFn: async ({ id, data }) => {
  //       const res = await updateTradingQualityRequest({
  //         id,
  //         data,
  //         params: { company_id: companyId },
  //       });
  //       return res.data;
  //     },
  //     mutationKey: ["trading", "Quantity", "update"],
  //     onSuccess: (res) => {
  //       const successMessage = res?.message;
  //       if (successMessage) {
  //         message.success(successMessage);
  //       }
  //     },
  //     onError: (error) => {
  //       const errorMessage = error?.response?.data?.message;
  //       if (errorMessage && typeof errorMessage === "string") {
  //         message.error(errorMessage);
  //       }
  //     },
  //   });

  function navigateToAdd() {
    navigate("/beam-card/add");
  }

  function navigateToUpdate(id) {
    navigate(`/beam-card/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = beamCardList?.rows?.map((user, index) => {
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
      title: "Beam No",
      render: (details) => {
        const item = getTakaDetailsObject(details);
        return item.beam_no;
      },
    },
    {
      title: "Quality",
      render: (details) =>
        `${details.inhouse_quality.quality_name} (${details.inhouse_quality.quality_weight}KG)`,
    },
    {
      title: "Taka",
      render: (details) => {
        const item = getTakaDetailsObject(details);
        return item.taka;
      },
    },
    {
      title: "Meter",
      render: (details) => {
        const obj =
          details.non_pasarela_beam_detail ||
          details.recieve_size_beam_detail ||
          details.job_beam_receive_detail;
        return obj.meters || obj.meter;
      },
    },
    {
      title: "Pending Meter",
      dataIndex: "pending_meter",
      key: "pending_meter",
      render: (text) => text || 0,
    },
    {
      title: "Shortage %",
      dataIndex: "shortage",
      key: "shortage",
      render: (text) => text || 0,
    },
    {
      title: "pano",
      render: (details) => {
        const item = getTakaDetailsObject(details);
        return item.pano;
      },
    },
    {
      title: "Mach.No",
      dataIndex: "machine_no",
      key: "machine_no",
      render: (text) => text || "-",
    },
    {
      title: "Day Duration",
      dataIndex: "day_duration",
      key: "day_duration",
      render: (text) => text || "-",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <BeamCardViewDetailModal title="Beam Details" details={details} />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <FinishBeamCardModal />
            <Button>
              <AppstoreOutlined />
            </Button>
          </Space>
        );
      },
      key: "action",
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
        dataSource={beamCardList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: beamCardList?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(pageData) => {
          let totalMeter = 0;
          let totalPendingMeter = 0;
          pageData.forEach((details) => {
            const item = getTakaDetailsObject(details);

            totalPendingMeter += +details.pending_meter;
            totalMeter += +item.meter;
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
                  <Typography.Text>{totalPendingMeter}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>
                  Grand <br />
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>
                    {/* {jobChallanList?.total_taka} */}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>
                    {/* {jobChallanList?.total_meter} */}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
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
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Beam Card List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <Flex align="center" gap={10}>
          <Radio.Group
            name="filter"
            value={beamType}
            onChange={(e) => setBeamType(e.target.value)}
          >
            <Flex align="center" gap={10}>
              <Radio value={"primary"}> Primary Beam</Radio>
              <Radio value={"secondary"}> Secondary Beam </Radio>
            </Flex>
          </Radio.Group>
          <Input
            placeholder="BN-155"
            value={search.beamNo}
            onChange={(e) =>
              setSearch((prev) => ({ ...prev, beamNo: e.target.value }))
            }
            style={{ width: "200px" }}
          />
          <Input
            placeholder="Mach No"
            value={search.machNo}
            onChange={(e) =>
              setSearch((prev) => ({ ...prev, machNo: e.target.value }))
            }
            style={{ width: "200px" }}
          />
          <Button
            type="primary"
            onClick={() => setIsLoadBeamModalOpen(true)}
            className="flex-none"
          >
            Load New Beam
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!beamCardList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
          <Button
            icon={<PrinterOutlined />}
            type="primary"
            disabled={!beamCardList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Beam Type
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Beam Type"
              value={beamTypeDropDown}
              options={BEAM_TYPE}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setBeamTypeDropDow}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Machine
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Machine"
              loading={isLoadingMachineList}
              value={machine}
              options={machineListRes?.rows?.map((machine) => ({
                label: machine?.machine_name,
                value: machine?.machine_name,
              }))}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              onChange={setMachine}
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
              //   value={machine}
              onChange={setMachine}
              className="min-w-40"
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              //   value={machine}
              onChange={setMachine}
              className="min-w-40"
            />
          </Flex>
        </Flex>
      </div>
      {renderTable()}

      {isLoadBeamModalOpen && (
        <LoadNewBeamModal
          isModalOpen={isLoadBeamModalOpen}
          setIsModalOpen={setIsLoadBeamModalOpen}
        />
      )}
    </div>
  );
};

export default BeamCardList;

const BeamCardViewDetailModal = ({
  title = "-",
  isScroll = false,
  details = [],
}) => {
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

  const item = getTakaDetailsObject(details);

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
        classNames={{
          header: "text-center",
        }}
        width={"60%"}
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
        }}
      >
        <Flex className="flex-col gap-1">
          {/* {details?.map(({ title = "", value }) => {
            return (
              <Row
                gutter={12}
                className="flex-grow"
                style={{ marginTop: "0.40rem" }}
                key={title}
              >
                <Col span={10} className="font-medium">
                  {title}
                </Col>
                <Col span={14}>{value ?? "-"}</Col>
              </Row>
            );
          })} */}
          <Row
            gutter={12}
            className="flex-grow"
            style={{ marginTop: "0.40rem" }}
            key={title}
          >
            <Col span={12}>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Quality Name
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{`${details.inhouse_quality.quality_name} (${details.inhouse_quality.quality_weight}KG)`}</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Beam Load By
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>Beam Type</Typography.Text>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Beam no.
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item.beam_no}</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Beam create date
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>
                    {dayjs(details.createdAt).format("DD-MM-YYYY")}
                  </Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />

          <Row
            gutter={12}
            className="flex-grow"
            style={{ marginTop: "0.40rem" }}
            key={title}
          >
            <Col span={12}>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Warper Employee Name (P)
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Warper Employee Name (S)
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Pasaria Employee Name
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Non Pasarela Date (P)
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Non Pasarela Date (S)
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Pasarela Date
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider />

          <Row
            gutter={12}
            className="flex-grow"
            style={{ marginTop: "0.40rem" }}
            key={title}
          >
            <Col span={12}>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Taar
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item.end_of_tars}</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Pano
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item.pano}</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Peak
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{details.peak}</Typography.Text>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Taka
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item.taka}</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Meter
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item.meter}</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Read
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{details.read}</Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </Flex>
      </Modal>
    </>
  );
};
