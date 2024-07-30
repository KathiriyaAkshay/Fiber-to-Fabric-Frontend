import { Button, Flex, Select, Space, Spin, Table, Typography } from "antd";
import {
  AppstoreOutlined,
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../../../api/hooks/auth";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
// import dayjs from "dayjs";
// import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import { getJobBeamReceiveListRequest } from "../../../../api/requests/job/receive/beamReceive";
import dayjs from "dayjs";
import { getPartyListRequest } from "../../../../api/requests/users";

const BeamReceiveList = () => {
  const navigate = useNavigate();
  const { company, companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  const [machine, setMachine] = useState();
  const [beamTypeDropDown, setBeamTypeDropDow] = useState(null);
  const [quality, setQuality] = useState(null);
  const [party, setParty] = useState(null);

  //   const debouncedSearch = useDebounce(search, 500);
  const debouncedMachine = useDebounce(machine, 500);
  const debouncedBeamTypeDropDown = useDebounce(beamTypeDropDown, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedParty = useDebounce(party, 500);

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

  const { data: beamReceiveListData, isLoading } = useQuery({
    queryKey: [
      "beam",
      "receive",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        machine_name: debouncedMachine,
        beam_type: debouncedBeamTypeDropDown,
        quality_id: debouncedQuality,
        party_id: debouncedParty,
      },
    ],
    queryFn: async () => {
      const res = await getJobBeamReceiveListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          machine_name: debouncedMachine,
          beam_type: debouncedBeamTypeDropDown,
          quality_id: debouncedQuality,
          party_id: debouncedParty,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/job/receive/beam-receive/add");
  }

  function navigateToUpdate(id) {
    navigate(`/job/receive/beam-receive/update/${id}`);
  }

  function downloadPdf() {
    const { leftContent, rightContent } = getPDFTitleContent({ user, company });

    const body = beamReceiveListData?.rows?.map((item, index) => {
      const {
        challan_no,
        createdAt,
        inhouse_quality,
        supplier,
        challan_beam_type,
      } = item;
      let totalTaka = 0;
      let totalMeter = 0;
      item.job_beam_receive_details.forEach(({ taka, meter }) => {
        totalTaka += taka;
        totalMeter += meter;
      });

      return [
        index + 1,
        challan_no,
        dayjs(createdAt).format("DD-MM-YYYY"),
        `${inhouse_quality.quality_name} (${inhouse_quality.quality_weight}Kg)`,
        supplier.supplier.supplier_name,
        supplier.supplier.supplier_company,
        totalTaka,
        totalMeter,
        item.job_beam_receive_details.length,
        challan_beam_type,
      ];
    });

    downloadUserPdf({
      body,
      head: [
        [
          "ID",
          "Challan Date",
          "Challan No",
          "Quality",
          "Supplier Name",
          "Supplier Company",
          "Total Taka",
          "Total Meter",
          "No of Beam",
          "Challan Beam Type",
        ],
      ],
      leftContent,
      rightContent,
      title: "Beam Receive List",
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
      title: "Quality",
      render: (details) => {
        return `${details.inhouse_quality.quality_name} (${details.inhouse_quality.quality_weight}KG)`;
      },
    },
    {
      title: "Supplier Name",
      render: (details) =>
        `${details.supplier.first_name} ${details.supplier.last_name}`,
    },
    {
      title: "Supplier Company",
      render: (details) => `${details.supplier.supplier.supplier_company}`,
    },
    {
      title: "Total Taka",
      render: (details) => {
        let totalTaka = 0;
        details.job_beam_receive_details.forEach(({ taka }) => {
          totalTaka += taka;
        });
        return totalTaka;
      },
    },
    {
      title: "Total Meter",
      render: (details) => {
        let totalMeter = 0;
        details.job_beam_receive_details.forEach(({ meter }) => {
          totalMeter += meter;
        });
        return totalMeter;
      },
    },
    {
      title: "No of Beam",
      render: (details) => {
        return details?.job_beam_receive_details?.length;
      },
    },
    {
      title: "Challan Beam Type",
      dataIndex: "challan_beam_type",
      key: "challan_beam_type",
    },
    {
      title: "Action",
      render: (details) => {
        let totalMeter = 0;
        details.job_beam_receive_details.forEach(({ meter }) => {
          totalMeter += meter;
        });

        let totalTaka = 0;
        details.job_beam_receive_details.forEach(({ taka }) => {
          totalTaka += taka;
        });
        return (
          <Space>
            <ViewDetailModal
              title="Beam Receive Details"
              details={[
                { title: "Challan No", value: details.challan_no },
                {
                  title: "Challan Date",
                  value: dayjs(details.createdAt).format("DD-MM-YYYY"),
                },
                {
                  title: "Quality Name",
                  value: `${details.inhouse_quality.quality_name} (${details.inhouse_quality.quality_weight}KG)`,
                },
                {
                  title: "Supplier Name",
                  value: `${details.supplier.first_name} ${details.supplier.last_name}`,
                },
                {
                  title: "Supplier Address",
                  value: `${details.supplier.address}`,
                },
                { title: "Supplier GST", value: `${details.supplier.gst_no}` },
                {
                  title: "Supplier Company Name",
                  value: `${details.supplier.supplier.supplier_company}`,
                },
                {
                  title: "Total Taka",
                  value: totalTaka,
                },
                { title: "Total Meter", value: totalMeter },
                { title: "Beam Type", value: details.challan_beam_type },
              ]}
            />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
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
        dataSource={beamReceiveListData?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: beamReceiveListData?.rows?.count || 0,
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
          <h3 className="m-0 text-primary">Beam Receive List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

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
              options={[
                { label: "Pasarela (Primary)", value: "pasarela (primary)" },
                {
                  label: "Non Pasarela (Primary)",
                  value: "non pasarela (primary)",
                },
                {
                  label: "Non Pasarela (Secondary)",
                  value: "non pasarela (secondary)",
                },
              ]}
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
            disabled={!beamReceiveListData?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
          <Button
            icon={<PrinterOutlined />}
            type="primary"
            disabled={!beamReceiveListData?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default BeamReceiveList;
