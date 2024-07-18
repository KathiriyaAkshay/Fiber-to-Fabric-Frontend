import {
  Button,
  Col,
  Divider,
  Flex,
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
import { useCurrentUser } from "../../../../api/hooks/auth";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import LoadNewBeamModal from "../../../../components/beamCard/LoadNewBeamModal";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { BEAM_TYPE_OPTION_LIST } from "../../../../constants/orderMaster";
import { getPartyListRequest } from "../../../../api/requests/users";
import { getBeamSentListRequest } from "../../../../api/requests/job/sent/beamSent";
import dayjs from "dayjs";
import DeleteBeamSent from "../../../../components/job/beamSent/DeleteBeamSent";

const BeamSentList = () => {
  const navigate = useNavigate();
  const { company, companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const [isLoadBeamModalOpen, setIsLoadBeamModalOpen] = useState(false);

  const [machine, setMachine] = useState();
  const [party, setParty] = useState();
  const [beamTypeDropDown, setBeamTypeDropDow] = useState(null);
  const [quality, setQuality] = useState(null);

  const debouncedParty = useDebounce(party, 500);
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

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } = useQuery({
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

  const { data: beamSentListData, isLoading } = useQuery({
    queryKey: [
      "beamSent",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        party_id: debouncedParty,
        machine_name: debouncedMachine,
        beam_type: debouncedBeamTypeDropDown,
        quality_id: debouncedQuality,
      },
    ],
    queryFn: async () => {
      const res = await getBeamSentListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          party_id: debouncedParty,
          machine_name: debouncedMachine,
          beam_type: debouncedBeamTypeDropDown,
          quality_id: debouncedQuality,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
    initialData: { rows: [], count: 0 },
  });

  function navigateToAdd() {
    navigate("/job/sent/beam-sent/add");
  }

  function navigateToUpdate(id) {
    navigate(`/job/sent/beam-sent/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = beamSentListData?.rows?.map((user, index) => {
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
      title: "Challan Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Party Company Name",
      dataIndex: ["supplier", "supplier_company"],
      key: ["supplier", "supplier_company"],
    },
    {
      title: "Total Meter",
      render: (detail) => {
        const { job_beam_sent_details } = detail;
        let totalMeter = 0;
        job_beam_sent_details?.map((item) => {
          const obj =
            item.loaded_beam.non_pasarela_beam_detail ||
            item.loaded_beam.recieve_size_beam_detail ||
            item.loaded_beam.job_beam_receive_detail;

          totalMeter += obj.meters;
        });

        return totalMeter;
      },
    },
    {
      title: "Total Weight",
      render: (detail) => {
        const { job_beam_sent_details } = detail;
        let totalWeight = 0;
        job_beam_sent_details?.map((item) => {
          const obj =
            item.loaded_beam.non_pasarela_beam_detail ||
            item.loaded_beam.recieve_size_beam_detail ||
            item.loaded_beam.job_beam_receive_detail;

          totalWeight += obj.net_weight || 0;
        });

        return totalWeight;
      },
    },
    {
      title: "Delivery Charge",
      dataIndex: "delivery_charge",
      key: "delivery_charge",
    },
    {
      title: "Power Cost Per Meter",
      dataIndex: "power_cost_per_meter",
      key: "power_cost_per_meter",
    },
    {
      title: "Action",
      render: (details) => {
        console.log({ details });
        return (
          <Space>
            <BeamSentViewDetailModal
              title="Beam Sent Details"
              details={details}
            />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteBeamSent details={details} />
            <Button>
              <TruckOutlined />
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
        dataSource={beamSentListData?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: beamSentListData?.rows?.count || 0,
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
          <h3 className="m-0 text-primary">Beam Sent List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
          <Flex align="center" gap={10}>
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
                Beam Type
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Beam Type"
                value={beamTypeDropDown}
                options={BEAM_TYPE_OPTION_LIST}
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
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!beamSentListData?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>
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

export default BeamSentList;

const BeamSentViewDetailModal = ({
  title = "-",
  isScroll = false,
  details = [],
}) => {
  console.log("BeamSentViewDetailModal", details);
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
                  <Typography.Text>value</Typography.Text>
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
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Beam create date
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>Beam Type</Typography.Text>
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
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Pano
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Peak
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
                    Taka
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Meter
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
              <Row id="row">
                <Col span={12}>
                  <Typography.Text className="font-medium">
                    Read
                  </Typography.Text>
                </Col>
                <Col span={6}>
                  <Typography.Text>value</Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </Flex>
      </Modal>
    </>
  );
};
