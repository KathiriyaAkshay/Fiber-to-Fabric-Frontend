import {
  Button,
  DatePicker,
  Flex,
  Input,
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
  const { companyId, financialYearEnd } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

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
          // pending: true,
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
      render: (text, record, index) => ((page * pageSize) + index) + 1
    },
    {
      title: "Challan Date",
      key: "challan_date",
      render: ({ challan_date }) => {
        return dayjs(challan_date).format("DD-MM-YYYY");
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
      render: (text, record) => (
        `${record?.inhouse_quality?.quality_name} - ${record?.inhouse_quality?.quality_weight}KG`
      )
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      render: (text, record) => (
        `${record?.supplier?.first_name} ${record?.supplier?.last_name}`
      )
    },
    {
      title: "Total meter",
      dataIndex: "total_meter"
    },
    {
      title: "Total taka",
      dataIndex: "recieve_size_beam_details",
      render: (text, record) => {
        let total_taka = 0;
        text.map((element) => {
          total_taka = total_taka + element?.taka;
        })
        return (
          `${total_taka}`
        )
      }
    },
    {
      title: "No Of Beam",
      dataIndex: "recieve_size_beam_details",
      render: (text, record) => (
        `${text?.length}`
      )
    },
    {
      title: "Beam Type",
      dataIndex: "beam_type",
      key: "receive_cartoon_pallet",
    },
    {
      title: "Bill status",
      dataIndex: "bill_status",
      render: (text, record) => (
        record == "pending" ? <>
          <Tag color="red">Pending</Tag>
        </> : <>
          <Tag color="green">{text}</Tag>
        </>
      )
    },
    {
      title: "Action",
      render: (details) => {
        let totalTaka = 0 ; 
        let totalMeter = 0 ; 

        details?.recieve_size_beam_details?.map((element) => {
          totalTaka = Number(totalTaka) + Number(element?.taka) ; 
          totalMeter = Number(totalMeter) + Number(element?.meters) ; 
        })

        return (
          <Space>
            <GridInformationModel
              title =  "Receive size beam details"
              details={[
                {label: "Challan No", value: details?.challan_no}, 
                {label: "Challan Date	", value: moment(details?.createdAt).format("DD-MM-YYYY")}, 
                {label: "Quality Name	", value: `${details?.inhouse_quality?.quality_name} - ${details?.inhouse_quality?.quality_weight}`}, 
                {label: "Supplier Name", value: details?.supplier?.supplier?.supplier_name}, 
                {label: "Supplier Address	", value: details?.supplier?.address}, 
                {label: "Supplier GST	", value: details?.gst_no}, 
                {label: "Supplier Company", value: details?.supplier?.supplier?.supplier_company}, 
                {label: "Total Meter", value: totalMeter}, 
                {label: "Total Taka", value: totalTaka}, 
                {label: "Total Beam", value: details?.recieve_size_beam_details?.length},
                {label: "Beam Type", value: details?.beam_type} 
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
                <DeleteSizeBeamOrderButton
                  details={details}
                />
              </>

            )}
            <SizeBeamChallanModal
              details={details}
            />
            <BeamCardInformationModel
              data={details}
            />
          </Space>
        );
      },
      key: "action",
    },
  ];

  const disableFutureDates = (current) => {
    return current && current > moment().endOf('day');
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
          total: receiveSizeBeamListRes?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{
          overflow: "auto",
        }}
        summary={() => {
          
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Receive size beam list</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10} wrap="wrap">
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

          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "200px",
            }}
          />

          <Button
            icon = {<FilePdfOutlined/>}
            type="primary"
            
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
}

export default ReceiveSizeBeamList;
