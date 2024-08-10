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
  SwapOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../lib/pdf/userPdf";
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
import DeleteBeamCard from "../../components/beamCard/DeleteBeamCard";
import MoveBhidanModal from "../../components/beamCard/moveBhidanModal";
import { capitalizeFirstCharacter } from "../../utils/mutationUtils";
import { calculateTimeDifference } from "../../utils/mutationUtils";
import { disabledFutureDate } from "../../utils/date";

const getTakaDetailsObject = (details) => {
  if (details) {
    let object =
      details.non_pasarela_beam_detail ||
      details.recieve_size_beam_detail ||
      details.job_beam_receive_detail;

    return object === null || object === undefined
      ? null
      : { ...object, meter: object?.meters || object?.meter };
  }
};

const getActions = (details) => {
  const obj = getTakaDetailsObject(details);

  switch (details.status) {
    case "running":
      return {
        isView: true,
        isEdit: true,
        isPlus: true,
        isBarCode: true,
        isDelete: false,
        isArrow: false,
      };

    case "finished":
      return {
        isView: true,
        isEdit: true,
        isPlus: true,
        isBarCode: true,
        isDelete: false,
        isArrow: !details.is_completed,
      };

    case "cut":
      return {
        isView: true,
        isEdit: true,
        isPlus: true,
        isBarCode: true,
        isDelete: false,
        isArrow: obj.beam_no === null ? false : !obj.beam_no.includes("NBN"),
      };

    case "pasarela":
      return {
        isView: true,
        isEdit: true,
        isPlus: true,
        isBarCode: true,
        isDelete: Boolean(details.non_pasarela_beam_id),
        isArrow: false,
      };

    case "non-pasarela":
      return {
        isView: true,
        isEdit: true,
        isPlus: false,
        isBarCode: true,
        isDelete: Boolean(details.non_pasarela_beam_id),
        isArrow: false,
      };

    case "bhidan_of_beam":
      return {
        isView: true,
        isEdit: true,
        isPlus: true,
        isBarCode: true,
        isDelete: false,
        isArrow: false,
      };

    case "sent":
      return {
        isView: true,
        isEdit: false,
        isPlus: false,
        isBarCode: true,
        isDelete: false,
        isArrow: false,
      };

    case "primary(advance)":
      return {
        isView: true,
        isEdit: false,
        isPlus: true,
        isBarCode: true,
        isDelete: true,
        isArrow: false,
      };

    default:
      return {
        isView: false,
        isEdit: false,
        isPlus: false,
        isBarCode: false,
        isDelete: false,
      };
  }
};

const BeamCardList = () => {
  const navigate = useNavigate();
  const { company, companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const [isOpenMoveBhidan, setIsOpenMoveBhidan] = useState(false);
  const [row, setRow] = useState(null);

  const [search, setSearch] = useState({
    beamNo: "",
    machNo: "",
  });

  const [isLoadBeamModalOpen, setIsLoadBeamModalOpen] = useState(false);

  const [machine, setMachine] = useState();
  const [beamType, setBeamType] = useState("primary");
  const [beamTypeDropDown, setBeamTypeDropDow] = useState("running");
  const [quality, setQuality] = useState(null);

  const debouncedSearch = useDebounce(search, 500);
  const debouncedMachine = useDebounce(machine, 500);
  const debouncedBeamTypeDropDown = useDebounce(beamTypeDropDown, 500);
  const debouncedQuality = useDebounce(quality, 500);

  // Machine dropdown list request
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

  // DropDown list request
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

  // Beam card list request
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

  function navigateToAdd() {
    navigate("/beam-card/add");
  }

  function navigateToUpdate(id, non_pasarela_beam_id) {
    navigate(`/beam-card/update/${id}`, { state: { non_pasarela_beam_id } });
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
        return item?.beam_no || "-";
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
        return item?.taka || "-";
      },
    },
    {
      title: "Meter",
      render: (details) => {
        const obj =
          details.non_pasarela_beam_detail ||
          details.recieve_size_beam_detail ||
          details.job_beam_receive_detail;
        return obj?.meters || obj?.meter || "-";
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
        return item?.pano || "-";
      },
    },
    {
      title: "Mach.No",
      dataIndex: "machine_no",
      key: "machine_no",
      render: (text, record) => {
        return (
          <div>
            {text} ({record?.machine_name})
          </div>
        )
      }
    },
    {
      title: "Day Duration",
      dataIndex: "day_duration",
      key: "day_duration",
      render: (text, record) => {
        let timeDifference = calculateTimeDifference(record?.createdAt);
        return (
          <div>
            {timeDifference?.days}D {timeDifference?.hours}H {timeDifference?.minutes}M
          </div>
        )
      }
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
      render: (text, record) => {
        if (text == "running") {
          return (
            <Tag color="magenta">{capitalizeFirstCharacter(text)}</Tag>
          )
        } else if (text == "finished") {
          return (
            <Tag color="green">{capitalizeFirstCharacter(text)}</Tag>
          )
        } else if (text == "cut") {
          return (
            <Tag color="red">{capitalizeFirstCharacter(text)}</Tag>
          )
        } else if (text == "pasarela") {
          return (
            <Tag color="orange" >{capitalizeFirstCharacter(text)}</Tag>
          )
        } else if (text == "non-pasarela") {
          return (
            <Tag color="volcano">{capitalizeFirstCharacter(text)}</Tag>
          )
        } else if (text == "bhidan_of_beam") {
          return (
            <Tag color="blue">{capitalizeFirstCharacter(text)}</Tag>
          )
        } else if (text == "sent") {
          return (
            <Tag color="purple">{capitalizeFirstCharacter(text)}</Tag>
          )
        } else if (text == "primary(advance)") {
          return (
            <Tag color="cyan">{capitalizeFirstCharacter(text)}</Tag>
          )
        } else {
          return (
            <Tag>{capitalizeFirstCharacter(text)}</Tag>
          )
        }
      }
    },
    {
      title: "Action",
      render: (details) => {
        const { isView, isEdit, isDelete, isPlus, isArrow, isBarCode } =
          getActions(details);

        return (
          <Space>
            {isView && (
              <BeamCardViewDetailModal title="Beam Details" details={details} />
            )}
            {isEdit && (
              <Button
                onClick={() => {
                  navigateToUpdate(details.id, details.non_pasarela_beam_id);
                }}
              >
                <EditOutlined />
              </Button>
            )}
            {isPlus && (
              <FinishBeamCardModal
                details={details}
                companyId={companyId}
                beamTypeDropDown={details.status}
              />
            )}
            {isBarCode && (
              <Button>
                <AppstoreOutlined details={details} />
              </Button>
            )}
            {isArrow && (
              <Button
                onClick={() => {
                  setRow(details);
                  setIsOpenMoveBhidan(true);
                }}
              >
                <SwapOutlined />
              </Button>
            )}
            {isDelete && (
              <DeleteBeamCard key={"delete_beam_card"} details={details} />
            )}
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

            totalPendingMeter += +details.pending_meter || 0;
            totalMeter += item ? +item.meter : 0;
          });

          return (
            <>

              {/* Total information  */}
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
              </Table.Summary.Row>

              {/* Grand total information  */}
              <Table.Summary.Row className="font-semibold grand-total-div">
                <Table.Summary.Cell style={{ borderTop: "1px solid #efefef" }}>
                  Grand <br />
                  Total
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{beamCardList?.total_meter}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>
                    {beamCardList?.pending_meter}
                  </Typography.Text>
                </Table.Summary.Cell>
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
              disabledDate={disabledFutureDate}
              onChange={setMachine}
              className="min-w-40"
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              disabledDate={disabledFutureDate}
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

      {isOpenMoveBhidan && (
        <MoveBhidanModal
          open={isOpenMoveBhidan}
          handleClose={() => setIsOpenMoveBhidan(false)}
          companyId={companyId}
          row={row}
        />
      )}
    </div>
  );
};

export default BeamCardList;

// Beam card information model
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
          <Row
            gutter={12}
            className="flex-grow"
            style={{ marginTop: "0.40rem" }}
            key={title}
          >
            <Col span={12}>

              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={6}>

                  <Typography.Text className="font-medium beam-card-info-title">
                    Quality Name :
                  </Typography.Text>

                </Col>

                <Col span={12}>
                  <Typography.Text>{`${details.inhouse_quality.quality_name} (${details.inhouse_quality.quality_weight}KG)`}</Typography.Text>
                </Col>

              </Row>

              <Row id="row" className="beam-card-info-title-div">
                <Col span={6}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Beam Load By
                  </Typography.Text>
                </Col>
                <Col span={12}>
                  <Typography.Text>Beam Type</Typography.Text>
                </Col>
              </Row>

            </Col>

            <Col span={12}>
              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={6}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Beam no.
                  </Typography.Text>
                </Col>
                <Col span={12}>
                  <Typography.Text>{item?.beam_no}</Typography.Text>
                </Col>
              </Row>
              <Row id="row" className="beam-card-info-title-div">
                <Col span={8}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Beam create date
                  </Typography.Text>
                </Col>
                <Col span={12}>
                  <Typography.Text>
                    {dayjs(details.createdAt).format("DD-MM-YYYY H:mm:ss")}
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

              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Warper Employee Name (P)
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>-</Typography.Text>
                </Col>
              </Row>

              <Row id="row" className="beam-card-info-title-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Warper Employee Name (S)
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>-</Typography.Text>
                </Col>
              </Row>
              
              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Pasaria Employee Name
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>-</Typography.Text>
                </Col>
              </Row>
            </Col>

            <Col span={12}>
              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Non Pasarela Date (P)
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>-</Typography.Text>
                </Col>
              </Row>
              <Row id="row" className="beam-card-info-title-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Non Pasarela Date (S)
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>-</Typography.Text>
                </Col>
              </Row>
              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Pasarela Date
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>-</Typography.Text>
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
              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Taar
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item?.ends_or_tars}</Typography.Text>
                </Col>
              </Row>
              <Row id="row" className="beam-card-info-title-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Pano
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item?.pano}</Typography.Text>
                </Col>
              </Row>
              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Peak
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{details.peak}</Typography.Text>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Taka
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item?.taka}</Typography.Text>
                </Col>
              </Row>
              <Row id="row" className="beam-card-info-title-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
                    Meter
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>{item?.meter}</Typography.Text>
                </Col>
              </Row>
              <Row id="row" className="beam-card-info-title-div beam-card-main-div">
                <Col span={12}>
                  <Typography.Text className="font-medium beam-card-info-title">
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
