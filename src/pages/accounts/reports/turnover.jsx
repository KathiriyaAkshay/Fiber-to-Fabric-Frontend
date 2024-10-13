import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Typography,
} from "antd";
import { usePagination } from "../../../hooks/usePagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useContext, useMemo, useState } from "react";
import { getTurnoverReportService } from "../../../api/requests/accounts/reports";
import { CloseOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import { updateCompanyRequest } from "../../../api/requests/company";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = yupResolver(
  yup.object().shape({
    company: yup.string().nullable().required("Company is required"), // Ensures company is selected (non-null)

    month_limit: yup
      .mixed()
      .typeError("Month limit must be a number") // Error if it's not a valid number
      .required("Month limit is required"),

    year_limit: yup
      .mixed()
      .typeError("Year limit must be a number") // Error if it's not a valid number
      .required("Year limit is required"),
  })
);

const Turnover = () => {
  const { companyId } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: turnoverData, isLoading } = useQuery({
    queryKey: [
      "saleChallan",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
      };
      const res = await getTurnoverReportService({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
      sorter: {
        compare: (a, b) => {
          return a?.company_name - b?.company_name;
        },
      },
    },
    {
      title: "Sales meter",
      dataIndex: "sales_meters",
      key: "sales_meters",
      render: (text) => text || 0,
      sorter: {
        compare: (a, b) => {
          return a?.sales_meters - b?.sales_meters;
        },
      },
    },
    {
      title: "Sales",
      dataIndex: "sales",
      key: "sales",
      render: (text) => text || 0,
      sorter: {
        compare: (a, b) => {
          return a?.sales - b?.sales;
        },
      },
    },
    {
      title: "Month Limit",
      dataIndex: "month_limit",
      key: "month_limit",
      render: (text) => text || 0,
      sorter: {
        compare: (a, b) => {
          return (a?.month_limit || 0) - (b?.month_limit || 0);
        },
      },
    },
    {
      title: "Year Limit",
      dataIndex: "year_limit",
      key: "year_limit",
      render: (text) => text || 0,
      sorter: {
        compare: (a, b) => {
          return (a?.year_limit || 0) - (b?.year_limit || 0);
        },
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
        dataSource={turnoverData || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: turnoverData ? turnoverData?.length : 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        summary={(pageData) => {
          let totalSaleMeter = 0;
          let totalSales = 0;
          let totalMonthLimit = 0;
          let totalYearLimit = 0;

          pageData.forEach((row) => {
            totalSaleMeter += +row.sales_meters || 0;
            totalSales += +row.sales || 0;
            totalMonthLimit += +row.month_limit || 0;
            totalYearLimit += +row.year_limit || 0;
          });
          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>{totalSaleMeter}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{totalSales}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{totalMonthLimit}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{totalYearLimit}</Typography.Text>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Company wise turnover</h3>
            <Button
              onClick={() => setIsModalOpen(true)}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
        </div>
        {renderTable()}
      </div>

      {isModalOpen && (
        <EditCompanyTurnOver
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </>
  );
};

export default Turnover;

const EditCompanyTurnOver = ({ isModalOpen, setIsModalOpen }) => {
  const { companyListRes } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { mutateAsync: updateCompanyDetails, isPending } = useMutation({
    mutationFn: async ({ companyId, data }) => {
      const res = await updateCompanyRequest({
        companyId,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["update", "company"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["saleChallan", "list"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setIsModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const onSubmit = async (data) => {
    console.table("🧑‍💻 || data:", data);
    const payload = {
      month_limit: +data.month_limit,
      year_limit: +data.year_limit,
    };
    await updateCompanyDetails({ companyId: data.company, data: payload });
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      company: null,
      month_limit: "",
      year_limit: "",
    },
    resolver: validationSchema,
  });

  const companyOptions = useMemo(() => {
    if (companyListRes && companyListRes?.rows?.length) {
      const data = companyListRes?.rows.map(({ company_name, id }) => {
        return { label: company_name, value: id };
      });
      return data;
    } else {
      return [];
    }
  }, [companyListRes]);

  return (
    <>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        // title={
        //   <Typography.Text className="text-xl font-medium text-white">
        //     Edit Entry
        //   </Typography.Text>
        // }
        title={"Turnover"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
            width: "600px",
            margin: "auto",
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
          },
        }}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={"Select Company"}
              name="company"
              validateStatus={errors.company ? "error" : ""}
              help={errors.company && errors.company.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="company"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Company"
                      options={companyOptions}
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                      onChange={(value) => {
                        field.onChange(+value);
                        const selectedCompany = companyListRes?.rows?.find(
                          ({ id }) => id === value
                        );
                        console.log({ selectedCompany });
                        setValue(
                          "month_limit",
                          +selectedCompany?.month_limit || 0
                        );
                        setValue(
                          "year_limit",
                          +selectedCompany?.year_limit || 0
                        );
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Month Turnover Limit"
              name="month_limit"
              validateStatus={errors.month_limit ? "error" : ""}
              help={errors.month_limit && errors.month_limit.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="month_limit"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter monthly turnover limit"
                    onChange={(e) => {
                      field.onChange(+e.target.value);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Year Turnover Limit"
              name="year_limit"
              validateStatus={errors.year_limit ? "error" : ""}
              help={errors.year_limit && errors.year_limit.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="year_limit"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter yearly turnover limit"
                    onChange={(e) => {
                      field.onChange(+e.target.value);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Flex gap={10} style={{ marginTop: "1rem" }} justify="flex-end">
          <Button
            type="primary"
            htmlType="button"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Submit
          </Button>
        </Flex>
      </Modal>
    </>
  );
};
