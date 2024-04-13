import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Form, Input, Select, Table, message } from "antd";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../../contexts/GlobalContext";
import { mutationOnErrorHandler } from "../../../../../utils/mutationUtils";
import { createAssignRollReportRequest } from "../../../../../api/requests/reports/assignRollReport";
import { SALARY_TYPE_LIST, TPM_LIST } from "../../../../../constants/userRole";
import { getEmployeeListRequest } from "../../../../../api/requests/users";
import { getYSCDropdownList } from "../../../../../api/requests/reports/yarnStockReport";
import { DeleteOutlined } from "@ant-design/icons";

const addAssignRollReportSchemaResolver = yupResolver(
  yup.object().shape({
    assignRollArray: yup.array().of(
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
    ),
  })
);

const initialAssignRollDetail = {
  type: undefined,
  user_id: undefined,
  tpm: "s",
  yarn_stock_company_id: undefined,
  yarn_company_name: undefined,
  rolls: "",
  weight: "",
  notes: "",
};

function AddAssignRollReport() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [latestSalaryType, setLatestSalaryType] = useState();

  const {
    mutateAsync: createAssignRollReport,
    isLoading: isLoadingCreateAssignRollReport,
  } = useMutation({
    mutationFn: async (data) => {
      const res = await createAssignRollReportRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["reports/assign-roll-reports/create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reports", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      mutationOnErrorHandler({ error, message });
    },
  });

  async function onSubmit(data) {
    const { assignRollArray } = data;
    assignRollArray?.forEach((d) => {
      delete d?.yarn_company_name;
    });
    await createAssignRollReport(assignRollArray);
  }

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    // setValue,
  } = useForm({
    resolver: addAssignRollReportSchemaResolver,
    defaultValues: {
      // harcoded 5 elements in array
      assignRollArray: Array.from({ length: 5 }, () => initialAssignRollDetail),
    },
  });

  const { assignRollArray } = watch();

  const { isLoading: isLoadingEmployeeList } = useQuery({
    queryKey: [
      "employee/list",
      {
        company_id: companyId,
        salary_type: latestSalaryType,
      },
    ],
    queryFn: async () => {
      const res = await getEmployeeListRequest({
        params: {
          company_id: companyId,
          salary_type: latestSalaryType,
        },
      });
      return res.data?.data?.empoloyeeList;
    },
    enabled: Boolean(companyId),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "assignRollArray",
  });

  const columns = [
    {
      title: "Type",
      key: "type",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`assignRollArray.${index}.type`}
            validateStatus={
              errors.assignRollArray?.[index]?.type ? "error" : ""
            }
            help={
              errors.assignRollArray?.[index]?.type &&
              errors.assignRollArray?.[index]?.type.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`assignRollArray.${index}.type`}
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    onChange={(selected_type) => {
                      setLatestSalaryType(selected_type);
                      field.onChange(selected_type);
                    }}
                    placeholder="Select type"
                    options={SALARY_TYPE_LIST}
                    style={{
                      textTransform: "capitalize",
                    }}
                    dropdownStyle={{
                      textTransform: "capitalize",
                    }}
                    className="min-w-36"
                  />
                );
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Employee",
      key: "user_id",
      render: (text, record, index) => {
        const salary_type = assignRollArray?.[index]?.type;
        return (
          <Form.Item
            key={text?.id}
            name={`assignRollArray.${index}.user_id`}
            validateStatus={
              errors.assignRollArray?.[index]?.user_id ? "error" : ""
            }
            help={
              errors.assignRollArray?.[index]?.user_id &&
              errors.assignRollArray?.[index]?.user_id.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`assignRollArray.${index}.user_id`}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Employee"
                  loading={
                    isLoadingEmployeeList && salary_type === latestSalaryType
                  }
                  options={
                    salary_type
                      ? queryClient
                          .getQueryData([
                            "employee/list",
                            {
                              company_id: companyId,
                              salary_type: salary_type,
                            },
                          ])
                          ?.rows?.map(({ id, first_name }) => {
                            return {
                              label: first_name,
                              value: id,
                            };
                          })
                      : []
                  }
                  // options={EmployeeListRes?.rows?.map(({ id, first_name }) => {
                  //   return {
                  //     label: first_name,
                  //     value: id,
                  //   };
                  // })}
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
        );
      },
    },
    {
      title: "T.P.M",
      key: "tpm",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`assignRollArray.${index}.tpm`}
            validateStatus={errors.assignRollArray?.[index]?.tpm ? "error" : ""}
            help={
              errors.assignRollArray?.[index]?.tpm &&
              errors.assignRollArray?.[index]?.tpm.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`assignRollArray.${index}.tpm`}
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
                  className="min-w-16"
                />
              )}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Yarn Company",
      key: "yarn_company_name",
      render: (text, record, index) => {
        return (
          <Form.Item
            name={`assignRollArray.${index}.yarn_company_name`}
            validateStatus={
              errors.assignRollArray?.[index]?.yarn_company_name ? "error" : ""
            }
            help={
              errors.assignRollArray?.[index]?.yarn_company_name &&
              errors.assignRollArray?.[index]?.yarn_company_name.message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
            className="flex-grow mb-0"
          >
            <Controller
              control={control}
              name={`assignRollArray.${index}.yarn_company_name`}
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
                  className="min-w-40"
                />
              )}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Denier",
      key: "yarn_stock_company_id",
      render: (text, record, index) => {
        const yarn_company_name = assignRollArray?.[index]?.yarn_company_name;
        let options = [];
        // set options for denier selection on yarn stock company select
        yscdListRes?.yarnCompanyList?.forEach((ysc) => {
          const { yarn_company_name: name = "", yarn_details = [] } = ysc;
          if (name === yarn_company_name) {
            options = yarn_details?.map(
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
          }
        });
        return (
          <Form.Item
            name={`assignRollArray.${index}.yarn_stock_company_id`}
            validateStatus={
              errors.assignRollArray?.[index]?.yarn_stock_company_id
                ? "error"
                : ""
            }
            help={
              errors.assignRollArray?.[index]?.yarn_stock_company_id &&
              errors.assignRollArray?.[index]?.yarn_stock_company_id.message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`assignRollArray.${index}.yarn_stock_company_id`}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select denier"
                  allowClear
                  loading={isLoadingYSCDList}
                  options={options}
                  style={{
                    textTransform: "capitalize",
                  }}
                  dropdownStyle={{
                    textTransform: "capitalize",
                  }}
                  className="min-w-40"
                />
              )}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Rolls/Cartoon",
      key: "rolls",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`assignRollArray.${index}.rolls`}
            validateStatus={
              errors.assignRollArray?.[index]?.rolls ? "error" : ""
            }
            help={
              errors.assignRollArray?.[index]?.rolls &&
              errors.assignRollArray?.[index]?.rolls.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`assignRollArray.${index}.rolls`}
              render={({ field }) => (
                <Input {...field} type="number" min={0} step={0.01} />
              )}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Weight/KG",
      key: "weight",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`assignRollArray.${index}.weight`}
            validateStatus={
              errors.assignRollArray?.[index]?.weight ? "error" : ""
            }
            help={
              errors.assignRollArray?.[index]?.weight &&
              errors.assignRollArray?.[index]?.weight.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`assignRollArray.${index}.weight`}
              render={({ field }) => (
                <Input {...field} type="number" min={0} step={0.01} />
              )}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Notes",
      key: "notes",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`assignRollArray.${index}.notes`}
            validateStatus={
              errors.assignRollArray?.[index]?.notes ? "error" : ""
            }
            help={
              errors.assignRollArray?.[index]?.notes &&
              errors.assignRollArray?.[index]?.notes.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`assignRollArray.${index}.notes`}
              render={({ field }) => (
                <Input.TextArea {...field} className="min-w-40" />
              )}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record, index) => {
        return (
          <Button
            key={text?.id}
            onClick={() => {
              remove(index);
            }}
          >
            <DeleteOutlined />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <h3 className="m-0 text-primary">Roll Assign</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Table
          dataSource={fields}
          columns={columns}
          pagination={false}
          footer={() => (
            <Flex justify="flex-end" gap={10}>
              <Button
                htmlType="button"
                onClick={() => {
                  append(initialAssignRollDetail);
                }}
              >
                Add
              </Button>
            </Flex>
          )}
          rowKey={"id"}
          className="overflow-auto"
        />

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoadingCreateAssignRollReport}
          >
            Create
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default AddAssignRollReport;
