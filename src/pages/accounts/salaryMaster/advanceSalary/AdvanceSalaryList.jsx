import { useContext, useState } from "react";
import {
  Button,
  Select,
  DatePicker,
  Flex,
  Typography,
  Input,
  Table,
  Space,
  Spin,
  Tag,
} from "antd";
import { FilePdfOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { disabledFutureDate } from "../../../../utils/date";
import dayjs from "dayjs";
import useDebounce from "../../../../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { getAdvanceSalaryListRequest } from "../../../../api/requests/accounts/salary";
import { USER_ROLES } from "../../../../constants/userRole";
import DeleteAdvanceSalary from "../../../../components/accounts/salary/DeleteAdvanceSalary";

const EMPLOYEE_TYPES = [
  { label: "Employee", value: USER_ROLES.EMPLOYEE.role_id },
  { label: "Vehicle Users", value: USER_ROLES.VEHICLE_USER.role_id },
  { label: "Collection Users", value: USER_ROLES.COLLECTION_USER.role_id },
];

const AdvanceSalaryList = () => {
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);

  const [employeeName, setEmployeeName] = useState("");
  const [employeeType, setEmployeeType] = useState(USER_ROLES.EMPLOYEE.role_id);
  const [advanceType, setAdvanceType] = useState(false);
  const [from, setFrom] = useState();
  const [to, setTo] = useState();

  const debounceEmployeeName = useDebounce(employeeName, 500);
  const debounceEmployeeType = useDebounce(employeeType, 500);
  const debounceAdvanceType = useDebounce(advanceType, 500);
  const debounceFrom = useDebounce(from, 500);
  const debounceTo = useDebounce(to, 500);

  const addClickHandler = () => {
    navigate("add");
  };

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: advanceSalaryData, isLoading: isLoadingAdvanceSalary } =
    useQuery({
      queryKey: [
        "get",
        "advance-salary",
        "list",
        {
          company_id: companyId,
          page,
          pageSize,
          employee_name: debounceEmployeeName,
          from: debounceFrom,
          to: debounceTo,
          role_id: debounceEmployeeType,
          is_clear: debounceAdvanceType,
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          page,
          pageSize,
          employee_name: debounceEmployeeName,
          role_id: debounceEmployeeType,
          is_clear: debounceAdvanceType,
        };
        if (from) {
          params.from = dayjs(debounceFrom).format("YYYY-MM-DD");
        }
        if (to) {
          params.to = dayjs(debounceTo).format("YYYY-MM-DD");
        }

        const response = await getAdvanceSalaryListRequest({ params });
        return response.data.data;
      },
      enabled: Boolean(companyId),
    });

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "Employee Name",
      dataIndex: "user",
      key: "user",
      render: (_, record) => {
        return record?.user?.first_name + " " + record?.user?.last_name || "-";
      },
    },
    {
      title: "Salary Type",
      dataIndex: "salary_type",
      key: "salary_type",
      render: (text) => text || "-",
    },
    {
      title: "Employee Mobile",
      dataIndex: "mobile_no",
      key: "mobile_no",
      render: (text) => text || "-",
    },
    {
      title: "amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => text || 0,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: () => <Tag color="blue">Advance</Tag> || "-",
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      render: (text) => text || "-",
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <DeleteAdvanceSalary details={details} />
          </Space>
        );
      },
    },
  ];

  function renderTable() {
    if (isLoadingAdvanceSalary) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={advanceSalaryData?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: advanceSalaryData?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={() => {
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
                {advanceSalaryData?.total_amount || 0}
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

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Employee Advance List</h3>
            <Button
              onClick={addClickHandler}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
          <Flex align="center" justify="space-end" gap={10}>
            <Flex align="center" gap={10}>
              <Input
                placeholder="Employee Name"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Employee Type
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select employee type"
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                value={employeeType}
                onChange={setEmployeeType}
                options={EMPLOYEE_TYPES}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Advance Type
              </Typography.Text>
              <Select
                placeholder="Select employee type"
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  width: "100px",
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                value={advanceType}
                onChange={setAdvanceType}
                options={[
                  { label: "Cleared", value: true },
                  { label: "Not Cleared", value: false },
                ]}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                From
              </Typography.Text>
              <DatePicker value={from} onChange={setFrom} />
            </Flex>

            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                To
              </Typography.Text>
              <DatePicker
                value={to}
                onChange={setTo}
                disabledDate={disabledFutureDate}
                maxDate={dayjs()}
              />
            </Flex>

            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              // disabled={!creditNotesList?.creditNotes?.rows?.length}
              // onClick={downloadPdf}
              className="flex-none"
            />
          </Flex>
        </div>

        {renderTable()}
      </div>
    </>
  );
};

export default AdvanceSalaryList;
