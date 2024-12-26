import { useContext, useState } from "react";
import {
  Button,
  Table,
  Input,
  Select,
  Flex,
  Space,
  Spin,
  Typography,
  Tag,
} from "antd";
import { EditOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { usePagination } from "../../hooks/usePagination";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getTakaCuttingListRequest } from "../../api/requests/production/takaTpCutting";
import DeleteTakaTpCutting from "../../components/production/DeleteTakaTpCutting";
import useDebounce from "../../hooks/useDebounce";
import dayjs from "dayjs";
import { CUT_TAG_COLOR, SAMPLE_CUTTING_TAG_COLOR, TAKA_IP_TAG_COLOR } from "../../constants/tag";

const TakaTpCutting = () => {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [status, setStatus] = useState("taka_tp");
  const [status2, setStatus2] = useState(null);
  const [search, setSearch] = useState("");

  const debounceStatus = useDebounce(status, 500);
  const debounceStatus2 = useDebounce(status2, 500);
  const debounceSearch = useDebounce(search, 500);

  const { data: tpCuttingData, isLoading } = useQuery({
    queryKey: [
      "tpCutting",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        status: debounceStatus,
        bill_status: debounceStatus2,
        search: debounceSearch,
      },
    ],
    queryFn: async () => {
      const res = await getTakaCuttingListRequest({
        params: {
          company_id: companyId,
          page,
          pageSize,
          status: debounceStatus,
          bill_status: debounceStatus2,
          search: debounceSearch,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });
  console.log({ tpCuttingData });

  function navigateToAdd() {
    navigate("add");
  }

  function navigateToUpdate(id) {
    navigate(`/production/update-production/${id}`);
  }

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Sr.No",
      dataIndex: "sr_number",
      key: "sr_no",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD/MM/YYYY"),
    },
    {
      title: "Machine Name",
      dataIndex: "machine_name",
      key: "machine_name",
      render: (text) => text || "-",
    },
    {
      title: "From Taka",
      dataIndex: "from_taka",
      key: "from_taka",
      render: (text, record) => {
        return(
          <div>
            <div style = {{
              fontWeight: 600
            }}><Tag color="purple">{text}</Tag></div>
            <div>( {record?.from_taka_meter} - {record?.total_meter} ) = {+record?.from_taka_meter - +record?.total_meter}</div>
          </div>
        )
      }
    },
    {
      title: "To Taka",
      dataIndex: "to_taka",
      key: "to_taka",
      render: (text, record) => {
        return(
          <div>
            <div style = {{
              fontWeight: 600
            }}><Tag color="cyan">{text}</Tag></div>
            <div>( {record?.to_taka_meter} + {record?.total_meter} ) = {+record?.to_taka_meter + +record?.total_meter}</div>
          </div>
        )
      }
    },
    {
      title: "Meter (Pis)",
      dataIndex: "total_meter",
      key: "total_meter",
    },
    {
      title: "Cut-pis",
      dataIndex: "is_cut",
      key: "is_cut",
      render: (text) => (text ? 1 : 0),
    },
    {
      title: "Weight",
      dataIndex: "total_weight",
      key: "total_weight",
    },
    {
      title: "Remarks",
      dataIndex: "remark",
      key: "remark",
    },
    {
      title: "Status", 
      dataIndex: "", 
      render: (text, record) => {
        if (record?.is_taka_tp){
          return(
            <Tag color={TAKA_IP_TAG_COLOR}>TAKA I/P</Tag>
          )
        } else if (record?.is_sample_cutting){
          return(
            <Tag color={SAMPLE_CUTTING_TAG_COLOR}>Sample Cutting</Tag>
          )
        } else {
          return(
            <Tag color={CUT_TAG_COLOR}>Cut</Tag>
          )
        }
      }
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            {/* <ViewProductionDetailModal
              title="Production Details"
              details={details}
            /> */}
            <Button
              onClick={() => {
                navigateToUpdate(details.id);
              }}
            >
              <EditOutlined />
            </Button>
            <DeleteTakaTpCutting details={details} />
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
        dataSource={tpCuttingData?.row || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: tpCuttingData?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(tableData) => {
          // let totalMeter = 0;
          let totalCutPis = 0;

          tableData.forEach(({ /*total_meter,*/ is_cut }) => {
            // totalMeter += +total_meter;
            if (is_cut) totalCutPis++;
          });

          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="left">
                  <b>Total</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{tpCuttingData?.total_meter?.toFixed(2)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{totalCutPis}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Taka TP/Cutting</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Status
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Type"
              value={status}
              onChange={setStatus}
              options={[
                { label: "TAKA TP", value: "taka_tp" },
                { label: "Sample Cutting", value: "sample_cutting" },
                { label: "Pis", value: "pis" },
              ]}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Select
              allowClear
              placeholder="Select Status"
              value={status2}
              onChange={setStatus2}
              options={[
                { label: "Pending", value: "pending" },
                { label: "Generated", value: "generated" },
              ]}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Search
            </Typography.Text>
            <Input
              placeholder="Search Taka No"
              value={search}
              onChange={setSearch}
              style={{ width: "150px" }}
            />
          </Flex>
        </Flex>
      </div>

      {renderTable()}
    </div>
  );
};

export default TakaTpCutting;
