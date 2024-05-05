import { PlusCircleOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { getYSCDropdownList } from "../../../../../api/requests/reports/yarnStockReport";
import {
  getAssignRollReportByIdRequest,
  updateAssignRollReportRequest,
} from "../../../../../api/requests/reports/assignRollReport";
import GoBackButton from "../../../../../components/common/buttons/GoBackButton";
import { SALARY_TYPE_LIST, TPM_LIST } from "../../../../../constants/userRole";
import { getEmployeeListRequest } from "../../../../../api/requests/users";

const updateAssignRollReportSchemaResolver = yupResolver(
  yup.object().shape({
    type: yup.string().required("Please enter type"),
    user_id: yup.string().required("Please select Employee"),
    tpm: yup.string().required("Please enter TPM"),
    yarn_company_name: yup.string().required("Please select Yarn company"),
    yarn_stock_company_id: yup
      .string()
      .required("Please enter yarn stock company ID"),
    rolls: yup.string().required("Please enter rolls"),
    weight: yup.string().required("Please enter weight"),
    notes: yup.string().notRequired(),
  })
);

function UpdateAssignRollReport() {
  const [denierOptions, setDenierOptions] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
    queryKey: ["dropdown", "yarn_company", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getYSCDropdownList({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateAssignRollReport } = useMutation({
    mutationFn: async (data) => {
      const res = await updateAssignRollReportRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["reports/assign-roll-reports/update", id],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const { data: reportDetails } = useQuery({
    queryKey: ["reports/assign-roll-reports/get", id],
    queryFn: async () => {
      const res = await getAssignRollReportByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.report;
    },
    enabled: Boolean(companyId),
  });

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.yarn_company_name;
    await updateAssignRollReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: updateAssignRollReportSchemaResolver,
  });

  const { yarn_company_name, type } = watch();

  const { data: EmployeeListRes, isLoading: isLoadingEmployeeList } = useQuery({
    queryKey: [
      "employee/list",
      {
        company_id: companyId,
        salary_type: type,
      },
    ],
    queryFn: async () => {
      const res = await getEmployeeListRequest({
        params: {
          company_id: companyId,
          salary_type: type,
        },
      });
      return res.data?.data?.empoloyeeList;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    // set options for denier selection on yarn stock company select
    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      const { yarn_company_name: name = "", yarn_details = [] } = ysc;
      if (name === yarn_company_name) {
        const options = yarn_details?.map(
          ({
            yarn_company_id = 0,
            filament = 0,
            yarn_denier = 0,
            luster_type = "",
            yarn_color = "",
          }) => {
            return {
              label: `${yarn_denier}D/${filament}F (${luster_type} - ${yarn_color})`,
              value: yarn_company_id,
            };
          }
        );
        if (options?.length) {
          setDenierOptions(options);
        }
      }
    });
  }, [yarn_company_name, yscdListRes?.yarnCompanyList]);

  useEffect(() => {
    if (reportDetails) {
      const {
        yarn_stock_company_id,
        yarn_stock_company = {},
        type,
        user_id,
        tpm,
        rolls,
        weight,
        notes,
      } = reportDetails;
      const { yarn_company_name } = yarn_stock_company;

      reset({
        yarn_stock_company_id,
        yarn_company_name,
        type,
        user_id,
        tpm,
        rolls,
        weight,
        notes,
      });
    }
  }, [reportDetails, reset, EmployeeListRes]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Update Assign Roll Report</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={8}>
            <Form.Item
              label="Salary Type"
              name="type"
              validateStatus={errors?.type ? "error" : ""}
              help={errors?.type && errors?.type.message}
              required={true}
            >
              <Controller
                control={control}
                name="type"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select type"
                      options={SALARY_TYPE_LIST}
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Employee"
              name={`user_id`}
              validateStatus={errors?.user_id ? "error" : ""}
              help={errors?.user_id && errors?.user_id.message}
              required={true}
            >
              <Controller
                control={control}
                name={`user_id`}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Employee"
                    loading={isLoadingEmployeeList}
                    options={EmployeeListRes?.rows?.map(
                      ({ id, first_name }) => {
                        return {
                          label: first_name,
                          value: id?.toString(),
                        };
                      }
                    )}
                    style={{
                      textTransform: "capitalize",
                    }}
                    dropdownStyle={{
                      textTransform: "capitalize",
                    }}
                    className="min-w-36"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="TPM Type"
              name={`tpm`}
              validateStatus={errors?.tpm ? "error" : ""}
              help={errors?.tpm && errors?.tpm.message}
              required={true}
            >
              <Controller
                control={control}
                name={`tpm`}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={TPM_LIST}
                    style={{
                      textTransform: "capitalize",
                    }}
                    dropdownStyle={{
                      textTransform: "capitalize",
                    }}
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8} className="flex items-end gap-2">
            <Form.Item
              label="Yarn Stock Company Name"
              name="yarn_company_name"
              validateStatus={errors.yarn_company_name ? "error" : ""}
              help={
                errors.yarn_company_name && errors.yarn_company_name.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="yarn_company_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Yarn Stock Company"
                    loading={isLoadingYSCDList}
                    options={yscdListRes?.yarnCompanyList?.map(
                      ({ yarn_company_name = "" }) => {
                        return {
                          label: yarn_company_name,
                          value: yarn_company_name,
                        };
                      }
                    )}
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddYarnStockCompany}
              className="flex-none mb-6"
              type="primary"
            />
          </Col>

          <Col span={8}>
            <Form.Item
              label="Denier"
              name="yarn_stock_company_id"
              validateStatus={errors.yarn_stock_company_id ? "error" : ""}
              help={
                errors.yarn_stock_company_id &&
                errors.yarn_stock_company_id.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_stock_company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select denier"
                    allowClear
                    loading={isLoadingYSCDList}
                    options={denierOptions}
                    style={{
                      textTransform: "capitalize",
                    }}
                    dropdownStyle={{
                      textTransform: "capitalize",
                    }}
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Rolls/Cartoon"
              name={`rolls`}
              validateStatus={errors?.rolls ? "error" : ""}
              help={errors?.rolls && errors?.rolls.message}
              required={true}
            >
              <Controller
                control={control}
                name={`rolls`}
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Weight/KG"
              name={`weight`}
              validateStatus={errors?.weight ? "error" : ""}
              help={errors?.weight && errors?.weight.message}
              required={true}
            >
              <Controller
                control={control}
                name={`weight`}
                render={({ field }) => (
                  <Input {...field} type="number" min={0} step={0.01} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Notes"
              name={`notes`}
              validateStatus={errors?.notes ? "error" : ""}
              help={errors?.notes && errors?.notes.message}
              required={true}
            >
              <Controller
                control={control}
                name={`notes`}
                render={({ field }) => (
                  <Input.TextArea {...field} className="min-w-40" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

    </div>
  );
}

export default UpdateAssignRollReport;
