import { Button, Flex, Select, Spin, Table, Tag, Typography } from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import LoadNewBeamModal from "../../../../components/beamCard/LoadNewBeamModal";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { BEAM_TYPE_OPTION_LIST } from "../../../../constants/orderMaster";
import { getPartyListRequest } from "../../../../api/requests/users";
import dayjs from "dayjs";
import { getBeamSaleChallanListRequest } from "../../../../api/requests/sale/challan/beamSale";
import DeleteBeamSale from "../../../../components/sale/challan/beamSale/DeleteBeamSale";
import BeamSaleChallanModel from "../../../../components/sale/challan/beamSale/BeamSaleChallan";
import PrintBeamSaleChallan from "../../../../components/sale/challan/beamSale/printBeamSaleChallan";
import { UndoOutlined } from "@ant-design/icons";
import ReturnBeamSaleChallan from "../../../../components/sale/challan/beamSale/returnBeamSaleChallan";

const BeamSaleList = () => {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [beamSaleChallanModel, setBeamSaleChallanModel] = useState({
    isModalOpen: false,
    details: null,
    mode: "",
  });

  const handleCloseModal = () => {
    setBeamSaleChallanModel((prev) => ({ ...prev, isModalOpen: false }));
  };

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

  const { data: beamSaleListData, isLoading: isLoadingBeamSale } = useQuery({
    queryKey: [
      "beamSale",
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
      const res = await getBeamSaleChallanListRequest({
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
    navigate("add");
  }

  function navigateToUpdate(id) {
    navigate(`update/${id}`);
  }

  // function downloadPdf() {
  //   const { leftContent, rightContent } = getPDFTitleContent({ user, company });

  //   const body = beamSaleListData?.rows?.map((user, index) => {
  //     const { quality_name, quality_group, production_type, is_active } = user;
  //     return [
  //       index + 1,
  //       quality_name,
  //       quality_group,
  //       production_type,
  //       is_active ? "Active" : "Inactive",
  //     ];
  //   });

  //   downloadUserPdf({
  //     body,
  //     head: [["ID", "Quality Name", "Quality Group", "Product Type", "Status"]],
  //     leftContent,
  //     rightContent,
  //     title: "Trading Quality List",
  //   });
  // }

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
      title: "Quality Name",
      render: (detail) => {
        return `${detail?.inhouse_quality?.quality_name} - (${detail?.inhouse_quality?.quality_weight}KG)`;
      },
    },
    {
      title: "Total Meter",
      dataIndex: "total_meter",
      key: "total_meter",
      // render: (detail) => {
      //   const { job_beam_sent_details } = detail;
      //   let totalMeter = 0;
      //   job_beam_sent_details?.map((item) => {
      //     const obj =
      //       item.loaded_beam.non_pasarela_beam_detail ||
      //       item.loaded_beam.recieve_size_beam_detail ||
      //       item.loaded_beam.job_beam_receive_detail;

      //     totalMeter += obj.meters;
      //   });

      //   return totalMeter;
      // },
    },
    {
      title: "Total Weight",
      render: (detail) => {
        const { beam_sale_details } = detail;
        let totalWeight = 0;
        beam_sale_details?.map((item) => {
          const obj =
            item?.loaded_beam?.non_pasarela_beam_detail ||
            item?.loaded_beam?.recieve_size_beam_detail ||
            item?.loaded_beam?.job_beam_receive_detail;

          totalWeight += obj?.net_weight || 0;
        });

        return totalWeight;
      },
    },
    {
      title: "Bill Status",
      dataIndex: "bill_status",
      key: "status",
      render: (text) => {
        if (text.toLowerCase() === "pending")
          return <Tag color="red">{String(text).toUpperCase()}</Tag>;
        else return <Tag color="green">{String(text).toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      render: (record) => {
        return (
          <Flex gap={5} align="start">
            
            <PrintBeamSaleChallan details={record} />

            {record.bill_status.toLowerCase() !== "confirmed" ? (
              <>
                <Button
                  onClick={() => {
                    navigateToUpdate(record.id);
                  }}
                >
                  <EditOutlined />
                </Button>
                <DeleteBeamSale details={record} />
              </>
            ) : (
              <Button>
                <TruckOutlined />
              </Button>
            )}
            
            <Button
              onClick={() => {
                let MODE;
                if (record.bill_status) {
                  if (record.bill_status.toLowerCase() === "pending") {
                    MODE = "ADD";
                  } else if (record.bill_status.toLowerCase() === "confirmed") {
                    MODE = "VIEW";
                  }
                } else {
                  MODE = "ADD";
                }
                setBeamSaleChallanModel((prev) => {
                  return {
                    ...prev,
                    isModalOpen: true,
                    details: record,
                    mode: MODE,
                  };
                });
              }}
            >
              <FileTextOutlined />
            </Button>

            {record?.bill_status !== "pending" && (
              <>
                <ReturnBeamSaleChallan
                  details = {record}
                /> 
              </>
            )}

          </Flex>
        );
      },
      key: "action",
    },
  ];

  function renderTable() {
    if (isLoadingBeamSale) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={beamSaleListData?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: beamSaleListData?.rows?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(pageData) => {
          let totalMeter = 0;
          let totalWeight = 0;
          pageData.forEach(({ total_meter, enter_weight }) => {
            totalMeter += +total_meter;
            totalWeight += +enter_weight;
          });
          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
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
          <h3 className="m-0 text-primary">Beam Sale Challan List</h3>
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
            {/* <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!beamSaleListData?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            /> */}
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

      {beamSaleChallanModel.isModalOpen && (
        <BeamSaleChallanModel
          beamDetails={beamSaleChallanModel.details}
          isModelOpen={beamSaleChallanModel.isModalOpen}
          handleCloseModal={handleCloseModal}
          MODE={beamSaleChallanModel.mode}
        />
      )}
    </div>
  );
};

export default BeamSaleList;
