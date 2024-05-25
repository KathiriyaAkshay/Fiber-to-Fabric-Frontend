import { Button, Flex, Select, Space, Spin, Table, Typography } from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import dayjs from "dayjs";
import { getYarnSentListRequest } from "../../../../api/requests/job/sent/yarnSent";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import {
  getPartyListRequest,
  getVehicleUserListRequest,
} from "../../../../api/requests/users";
import {
  downloadUserPdf,
  getPDFTitleContent,
} from "../../../../lib/pdf/userPdf";
import { useCurrentUser } from "../../../../api/hooks/auth";
import ViewDetailModal from "../../../../components/common/modal/ViewDetailModal";
import DeleteYarnSent from "../../../../components/job/yarnSent/DeleteYarnSent";

const YarnSentList = () => {
  const { company, companyId } = useContext(GlobalContext);
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const [quality, setQuality] = useState();
  const [party, setParty] = useState();
  const [vehicle, setVehicle] = useState();
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedParty = useDebounce(party, 500);
  const debouncedVehicle = useDebounce(vehicle, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: ["inhouse-quality", "list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
          },
        });
        return res.data?.data;
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

  const { data: vehicleListRes, isLoading: isLoadingVehicleList } = useQuery({
    queryKey: [
      "vehicle",
      "list",
      { company_id: companyId, page: 0, pageSize: 99999 },
    ],
    queryFn: async () => {
      const res = await getVehicleUserListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: jobYarnSentList, isLoading } = useQuery({
    queryKey: [
      "jobYarnSent",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        vehicle_id: debouncedVehicle,
        quality_id: debouncedQuality,
        party_id: debouncedParty,
      },
    ],
    queryFn: async () => {
      const res = await getYarnSentListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          vehicle_id: debouncedVehicle,
          quality_id: debouncedQuality,
          party_id: debouncedParty,
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
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Sent Date",
      render: (detail) => {
        return dayjs(detail.sent_date).format("DD-MM-YYYY");
      },
    },
    {
      title: "Quality Name",
      render: (detail) => {
        return `${detail.inhouse_quality.quality_name} - (${detail.inhouse_quality.quality_weight}KG)`;
      },
    },
    {
      title: "Party",
      render: (detail) => {
        return `${detail.party.first_name} ${detail.party.last_name}`;
      },
    },
    {
      title: "Vehicle",
      render: (detail) => {
        return `${detail.vehicle.first_name} ${detail.vehicle.last_name}`;
      },
    },
    {
      title: "Delivery Charge",
      dataIndex: "delivery_charge",
      key: "delivery_charge",
    },
    {
      title: "Power Cost",
      dataIndex: "power_cost",
      key: "power_cost",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewDetailModal
              title="Yarn Sent Details"
              details={[
                { title: "Challan No", value: details.challan_no },
                {
                  title: "Sent Date",
                  value: dayjs(details.sent_date).format("DD-MM-YYYY"),
                },
                { title: "Delivery Charge", value: details.delivery_charge },
                { title: "Power Cost", value: details.power_cost },
              ]}
            />
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteYarnSent details={details} />
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
          <Flex align="center" gap={10}>
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
          </Flex>

          <Flex align="center" gap={10}>
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
          </Flex>

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
