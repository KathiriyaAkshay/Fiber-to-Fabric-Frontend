import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { SALARY_TYPES } from "../../../../constants/account";
import {
  getEmployeeListRequest,
  getOtherUserListRequest,
  getVehicleUserListRequest,
} from "../../../../api/requests/users";
import {
  createAdvanceSalaryRequest,
  getAdvanceSalaryListRequest,
} from "../../../../api/requests/accounts/salary";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    salary_type: yup.string().required("Please select salary type."),
    user_id: yup.string().required("Please select employee."),
    amount: yup.string().required("Please enter amount."),
    mobile_no: yup.string().required("Please enter mobile no."),
    is_cash: yup.string().required("Please select source."),
    createdAt: yup.string().required("Please enter date."),
    remark: yup.string().required("Please enter remark."),
  })
);

const AddAdvanceSalary = () => {
  // const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: AddNewAdvanceSalary, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createAdvanceSalaryRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "advance", "salary"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      mutationOnErrorHandler({ error });
    },
  });

  async function onSubmit(data) {
    const payload = {
      salary_type: data?.salary_type,
      user_id: +data.user_id,
      mobile_no: data.mobile_no,
      amount: +data.amount,
      is_cash: data.is_cash === "true" ? true : false,
      remark: data.remark,
      createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
    };
    await AddNewAdvanceSalary(payload);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    resetField,
  } = useForm({
    defaultValues: {
      salary_type: null,
      user_id: null,
      mobile_no: "",
      amount: "",
      is_cash: true,
      remark: "",
      createdAt: dayjs(),
    },
    resolver: addJobTakaSchemaResolver,
  });

  const { salary_type, user_id } = watch();

  const salaryTypeOptions = useMemo(() => {
    return [
      ...SALARY_TYPES,
      { label: "Collection Users", value: "collection" },
      { label: "Vehicle Users", value: "vehicle" },
      { label: "Folding Users", value: "folding" },
      { label: "Mending Users", value: "mending" },
    ];
  }, []);

  const { data: userSalaryData, isLoading: isLoadingUserSalaryData } = useQuery(
    {
      queryKey: [
        "get",
        "user",
        "advance-salary",
        {
          company_id: companyId,
          user_id: user_id,
        },
      ],
      queryFn: async () => {
        const params = {
          company_id: companyId,
          page: 0,
          pageSize: 999999,
          user_id: user_id,
        };

        const response = await getAdvanceSalaryListRequest({ params });
        return response.data.data;
      },
      enabled: Boolean(companyId && user_id),
    }
  );

  const { data: employeeList, isLoading: isLoadingEmployeeList } = useQuery({
    queryKey: [
      "get",
      "employee-drop-down",
      "list",
      {
        company_id: companyId,
        salary_type,
      },
    ],
    queryFn: async () => {
      if (
        [
          "attendance",
          "monthly",
          "on production",
          "work basis",
          "BEAM pasaria",
          "BEAM warpar",
        ].includes(salary_type)
      ) {
        const res = await getEmployeeListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 999999,
          },
        });
        return res.data?.data?.empoloyeeList?.rows || [];
      } else if (salary_type === "vehicle") {
        const res = await getVehicleUserListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 999999,
          },
        });
        return res.data?.data?.vehicleList?.rows || [];
      } else if (salary_type === "folding") {
        alert("add api for folding users");
      } else if (["collection", "mending"].includes(salary_type)) {
        const res = await getOtherUserListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 999999,
            is_active: 1,
          },
        });
        return res.data?.data?.userList || [];
      }
    },
    enabled: Boolean(companyId && salary_type),
  });

  useEffect(() => {
    if (user_id && employeeList && employeeList?.length) {
      const emp = employeeList.find((emp) => emp.id === user_id);
      setValue("mobile_no", emp.mobile);
    } else {
      setValue("mobile_no", "");
    }
  }, [employeeList, setValue, user_id]);

  // --------------------------------------------------------------

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
      title: "Advance Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text) => text || 0,
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      render: (text) => text || "-",
      width: "180px",
    },
    {
      title: "Advance Status",
      dataIndex: "is_clear",
      key: "is_clear",
      width: "80px",
      render: (text) =>
        (
          <Tag color={text ? "green" : "red"}>
            {text ? "Clear" : "Not clear"}
          </Tag>
        ) || "-",
    },
  ];

  function renderTable() {
    if (isLoadingUserSalaryData) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={userSalaryData?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={false}
        summary={() => {
          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0}>
                <b>Total</b>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}>
                {userSalaryData?.total_amount || 0}
              </Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
              <Table.Summary.Cell index={0}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Add Employee Advance Salary</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            paddingTop: "12px",
          }}
        >
          <Col span={12}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label="Salary Type"
                  name="salary_type"
                  validateStatus={errors.salary_type ? "error" : ""}
                  help={errors.salary_type && errors.salary_type.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="salary_type"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select salary type"
                        options={salaryTypeOptions}
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        onChange={(value) => {
                          field.onChange(value);
                          resetField("user_id");
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Select Employee"
                  name="user_id"
                  validateStatus={errors.user_id ? "error" : ""}
                  help={errors.user_id && errors.user_id.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="user_id"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select employee"
                        loading={isLoadingEmployeeList}
                        options={
                          employeeList && employeeList?.length
                            ? employeeList?.map((emp) => {
                                return {
                                  label: `${emp?.first_name} ${emp?.last_name}`,
                                  value: emp?.id,
                                };
                              })
                            : []
                        }
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Mobile No."
                  name="mobile_no"
                  validateStatus={errors.mobile_no ? "error" : ""}
                  help={errors.mobile_no && errors.mobile_no.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="mobile_no"
                    render={({ field }) => (
                      <Input {...field} placeholder="+91" disabled />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Amount"
                  name="amount"
                  validateStatus={errors.amount ? "error" : ""}
                  help={errors.amount && errors.amount.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => (
                      <Input {...field} type="number" placeholder="5000" />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Source"
                  name="is_cash"
                  validateStatus={errors.is_cash ? "error" : ""}
                  help={errors.is_cash && errors.is_cash.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="is_cash"
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select source"
                        options={[
                          { label: "Cash", value: true },
                          { label: "Bank", value: false },
                        ]}
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Date"
                  name="createdAt"
                  validateStatus={errors.createdAt ? "error" : ""}
                  help={errors.createdAt && errors.createdAt.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="createdAt"
                    render={({ field }) => (
                      <DatePicker {...field} style={{ width: "100%" }} />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Remark"
                  name="remark"
                  validateStatus={errors.remark ? "error" : ""}
                  help={errors.remark && errors.remark.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="remark"
                    render={({ field }) => (
                      <Input {...field} placeholder="Enter remark" />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Flex gap={10} justify="flex-end" style={{ marginTop: "30px" }}>
                  <Button htmlType="button" onClick={() => reset()}>
                    Reset
                  </Button>
                  <Button type="primary" htmlType="submit" loading={isPending}>
                    Create
                  </Button>
                </Flex>
              </Col>
            </Row>
          </Col>
          <Col span={12}>{renderTable()}</Col>
        </Row>
      </Form>
    </div>
  );
};

export default AddAdvanceSalary;
