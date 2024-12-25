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
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import useDebounce from "../../../../hooks/useDebounce";
import { getReceiveSizeBeamListRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
import DeleteSizeBeamOrderButton from "../../../../components/purchase/PurchaseSizeBeam/ReceiveSizeBeam/DeleteSizeBeamButton";
import SizeBeamChallanModal from "../../../../components/purchase/PurchaseSizeBeam/ReceiveSizeBeam/ReceiveSizeChallan";
import BeamCardInformationModel from "../../../../components/common/modal/beamCardInformation";
import GridInformationModel from "../../../../components/common/modal/gridInformationModel";
import moment from "moment";
import { FilePdfOutlined } from "@ant-design/icons";
import { BEAM_TYPE_OPTION_LIST } from "../../../../constants/orderMaster";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import BeamInformationModel from "../../../../components/common/modal/beamInfomrationModel";

function ReceiveSizeBeamList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  const [toDate, setToDate] = useState();
  const debouncedToDate = useDebounce(
    toDate && dayjs(toDate).format("YYYY-MM-DD"),
    500
  );
  const [fromDate, setFromDate] = useState();
  const debouncedFromDate = useDebounce(
    fromDate && dayjs(fromDate).format("YYYY-MM-DD"),
    500
  );

  const [beamType, setBeamType] = useState(null);
  const debounceBeamType = useDebounce(beamType, 500);

  const [status, setStatus] = useState(null);
  const debouceStatus = useDebounce(status, 500);

  const [machine, setMachine] = useState(null);
  const debouncedMachine = useDebounce(machine, 500);

  const [quality, setQuality] = useState(null);
  const deboucedQuality = useDebounce(quality, 500);

  const [isBeamInformationModel, setIsBeamInformationModel] = useState(false);
  const [beamInforamtion, setBeamInformation] = useState(null);

  const { companyId, financialYearEnd } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

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

  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: [
        "inhouse-quality",
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
        }
      },
      enabled: Boolean(companyId),
    });

  const {
    data: receiveSizeBeamListRes,
    isLoading: isLoadingReceiveSizeBeamList,
  } = useQuery({
    queryKey: [
      "order-master/recive-size-beam/list",
      {
        company_id: companyId,
        page,
        pageSize,
        search: debouncedSearch,
        toDate: debouncedToDate,
        fromDate: debouncedFromDate,
        end: financialYearEnd,
        beam_type: debounceBeamType,
        status: debouceStatus,
        quality_id: deboucedQuality,
      },
    ],
    queryFn: async () => {
      const res = await getReceiveSizeBeamListRequest({
        companyId,
        params: {
          company_id: companyId,
          page,
          pageSize,
          search: debouncedSearch,
          toDate: debouncedToDate,
          fromDate: debouncedFromDate,
          end: financialYearEnd,
          beam_type: debounceBeamType,
          status: debouceStatus,
          quality_id: deboucedQuality,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/purchase/purchase-size-beam/receive-size-beam/add");
  }

  function navigateToUpdate(id) {
    navigate(`/purchase/purchase-size-beam/receive-size-beam/update/${id}`);
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => page * pageSize + index + 1,
    },
    {
      title: "Challan Date",
      key: "challan_date",
      render: ({ createdAt }) => {
        return dayjs(createdAt).format("DD-MM-YYYY");
      },
    },
    {
      title: "Challan No",
      dataIndex: "challan_no",
      key: "challan_no",
    },
    {
      title: "Quantity KG",
      dataIndex: "inhouse_quality",
      key: "inhouse_quality",
      render: (text, record) =>
        `${record?.inhouse_quality?.quality_name} - ${record?.inhouse_quality?.quality_weight}KG`,
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      render: (text, record) =>
        `${record?.supplier?.first_name} ${record?.supplier?.last_name}`,
    },
    {
      title: "Total meter",
      dataIndex: "recieve_size_beam_details",
      render: (text) => {
        let total_meter = 0;
        text.map((element) => {
          total_meter = total_meter + Number(element?.meters);
        });

        return <div>{total_meter || "-"}</div>;
      },
    },
    {
      title: "Total taka",
      dataIndex: "recieve_size_beam_details",
      render: (text) => {
        let total_taka = 0;
        text.map((element) => {
          total_taka = total_taka + element?.taka;
        });
        return <div>{total_taka}</div>;
      },
    },
    {
      title: "No Of Beam",
      dataIndex: "recieve_size_beam_details",
      render: (text, record) => {
        let tempBeamInfo = {
          challan_no: record?.challan_no,
          createdAt: record?.challan_date,
          supplier: record?.supplier,
          inhouse_quality: record?.inhouse_quality,
          job_beam_receive_details: record?.recieve_size_beam_details,
        };
        return (
          <div
            className="number-of-beam-div"
            onClick={() => {
              setIsBeamInformationModel(true);
              setBeamInformation(tempBeamInfo);
            }}
          >
            {text?.length}
          </div>
        );
      },
    },
    {
      title: "Beam Type",
      dataIndex: "beam_type",
      key: "receive_cartoon_pallet",
    },
    {
      title: "Bill status",
      dataIndex: "bill_status",
      render: (text) =>
        text == "pending" ? (
          <Tag color="red">Pending</Tag>
        ) : (
          <Tag color="green">{text}</Tag>
        ),
    },
    {
      title: "Action",
      render: (details) => {
        let totalTaka = 0;
        let totalMeter = 0;
        let beam_info_list = [];

        details?.recieve_size_beam_details?.map((element) => {
          totalTaka = Number(totalTaka) + Number(element?.taka);
          totalMeter = Number(totalMeter) + Number(element?.meters);
          beam_info_list.push(element);
        });

        return (
          <Space>
            <GridInformationModel
              title="Receive size beam details"
              details={[
                { label: "Challan No", value: details?.challan_no },
                {
                  label: "Challan Date	",
                  value: moment(details?.createdAt).format("DD-MM-YYYY"),
                },
                {
                  label: "Quality Name	",
                  value: `${details?.inhouse_quality?.quality_name} - ${details?.inhouse_quality?.quality_weight}`,
                },
                {
                  label: "Supplier Name",
                  value: details?.supplier?.supplier?.supplier_name,
                },
                {
                  label: "Supplier Address",
                  value: details?.supplier?.address,
                },
                { label: "Supplier GST	", value: details?.supplier?.gst_no },
                {
                  label: "Supplier Company",
                  value: details?.supplier?.supplier?.supplier_company,
                },
                { label: "Total Meter", value: totalMeter },
                { label: "Total Taka", value: totalTaka },
                {
                  label: "Total Beam",
                  value: details?.recieve_size_beam_details?.length,
                },
                { label: "Beam Type", value: details?.beam_type },
              ]}
            />

            {details?.bill_status == "pending" && (
              <>
                <Button
                  onClick={() => {
                    navigateToUpdate(details.id);
                  }}
                >
                  <EditOutlined />
                </Button>
                <DeleteSizeBeamOrderButton details={details} />
              </>
            )}

            <SizeBeamChallanModal
              details={details}
              mode={details?.bill_status == "pending" ? "CREATE" : "VIEW"}
            />

            <BeamCardInformationModel data={beam_info_list} />
          </Space>
        );
      },
      key: "action",
    },
  ];

  const disableFutureDates = (current) => {
    return current && current > moment().endOf("day");
  };

  function renderTable() {
    if (isLoadingReceiveSizeBeamList) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={receiveSizeBeamListRes?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: receiveSizeBeamListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{
          overflow: "auto",
        }}
        summary={() => {
          if (receiveSizeBeamListRes?.rows?.length == 0) return;
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {receiveSizeBeamListRes?.totalMeter}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {receiveSizeBeamListRes?.totalTaka}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {receiveSizeBeamListRes?.totalBeam}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  // Download PDF Functionality
  const DownloadPDF = () => {
    let tableTitle = [
      "No",
      "Challan Date",
      "Challan No",
      "Quality Name",
      "Supplier Name",
      "Supplier Company",
      "Total Taka",
      "Total Meter",
      "No. Of Beam",
    ];

    let temp = [];

    receiveSizeBeamListRes?.rows?.map((element, index) => {
      let temp_total_taka = 0;
      let temp_total_meter = 0;

      element?.recieve_size_beam_details?.map((data) => {
        temp_total_taka = temp_total_taka + Number(data?.taka);
        temp_total_meter = temp_total_meter + Number(data?.meters);
      });

      temp.push([
        index + 1,
        moment(element?.challan_date).format("DD-MM-YYYY"),
        element?.challan_no,
        element?.inhouse_quality?.quality_name,
        element?.supplier?.supplier?.supplier_name,
        element?.supplier?.supplier?.supplier_company,
        temp_total_taka,
        temp_total_meter,
        element?.recieve_size_beam_details?.length,
      ]);
    });

    localStorage.setItem("print-title", "Receive Size Beam List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");
    localStorage.setItem("print-array", JSON.stringify(temp));

    window.open("/print");
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary" style={{ whiteSpace: "nowrap" }}>
            Receive size beam list
          </h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" justify="flex-end" gap={10} wrap="wrap">
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Machine
            </Typography.Text>
            <Select
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
              allowClear
            />
          </Flex>

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
              allowClear
              className="min-w-40"
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={fromDate}
              onChange={setFromDate}
              disabledDate={disableFutureDates}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              allowClear={true}
              style={{
                width: "200px",
              }}
              format="YYYY-MM-DD"
              value={toDate}
              onChange={setToDate}
              disabledDate={disableFutureDates}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Beam Type
            </Typography.Text>
            <Select
              placeholder="Beam Type"
              options={BEAM_TYPE_OPTION_LIST}
              allowClear
              value={beamType}
              onChange={setBeamType}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Status
            </Typography.Text>
            <Select
              placeholder="Status"
              options={[
                {
                  label: "Pending",
                  value: "pending",
                },
                {
                  label: "Completed",
                  value: "completed",
                },
              ]}
              allowClear
              value={status}
              onChange={setStatus}
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
            onClick={DownloadPDF}
          />
        </Flex>
      </div>
      {renderTable()}

      {isBeamInformationModel && (
        <BeamInformationModel
          details={beamInforamtion}
          setBeamModel={setIsBeamInformationModel}
        />
      )}
    </div>
  );
}

export default ReceiveSizeBeamList;
