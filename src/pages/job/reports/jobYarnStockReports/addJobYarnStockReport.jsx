import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import {
  getDropdownSupplierListRequest,
  getSupervisorListRequest,
} from "../../../../api/requests/users";
import { addJobYarnStockReportRequest } from "../../../../api/requests/job/reports/jobYarnStockReport";
import { useCurrentUser } from "../../../../api/hooks/auth";

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    supplier_name: yup.string().required("Please select supplier."),
    supervisor_id: yup.string().required("Please select supervisor"),
    machine_name: yup.string().required("Please select machine."),
    quality_id: yup.string().required("Please select quality."),
    gray_stock_meter: yup.string().required("Please enter meter."),
    taka: yup.string().required("Please enter taka."),
    yarn_stock_total_kg: yup
      .string()
      .required("Please enter yarn stock total kg."),
    beam_stock: yup.string().required("Please enter beam stock."),
    remark: yup.string().required("Please enter remark."),
  })
);

const AddJobYarnStockReport = () => {
  // const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { companyId } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: addJobYarnStockReport } = useMutation({
    mutationFn: async (data) => {
      const res = await addJobYarnStockReportRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["job", "yarn-stock-report", "add"],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  async function onSubmit(data) {
    const newData = {
      supplier_name: data.supplier_name,
      supervisor_id: parseInt(data.supervisor_id),
      machine_name: data.machine_name,
      quality_id: parseInt(data.quality_id),
      gray_stock_meter: parseInt(data.gray_stock_meter),
      taka: parseInt(data.taka),
      yarn_stock_total_kg: parseInt(data.yarn_stock_total_kg),
      beam_stock: parseInt(data.beam_stock),
      remark: data.remark,
      company_id: companyId,
      created_by: user.id,
    };
    await addJobYarnStockReport(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      supplier_name: null,
      supervisor_id: null,
      machine_name: null,
      quality_id: null,
      gray_stock_meter: "",
      taka: "",
      yarn_stock_total_kg: "",
      beam_stock: "",
      remark: "",
    },
    resolver: addYSCSchemaResolver,
  });

  const { machine_name } = watch();

  // ------------------------------------------------------------------------------------------

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          machine_name: machine_name,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        if (machine_name) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              machine_name: machine_name,
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

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const { data: supervisorListRes, isLoading: isLoadingSupervisorList } =
    useQuery({
      queryKey: ["supervisor", "list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getSupervisorListRequest({
          params: { company_id: companyId },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Create Job Stock</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Select Supplier"
              name="supplier_name"
              validateStatus={errors.supplier_name ? "error" : ""}
              help={errors.supplier_name && errors.supplier_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Supplier"
                      loading={isLoadingDropdownSupplierList}
                      options={dropdownSupplierListRes?.map((supervisor) => ({
                        label: supervisor?.supplier_name,
                        value: supervisor?.supplier_name,
                      }))}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Select Supervisor"
              name="supervisor_id"
              validateStatus={errors.supervisor_id ? "error" : ""}
              help={errors.supervisor_id && errors.supervisor_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supervisor_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Supervisor"
                      loading={isLoadingSupervisorList}
                      options={supervisorListRes?.supervisorList?.rows?.map(
                        (supervisor) => ({
                          label: supervisor?.first_name,
                          value: supervisor?.id,
                        })
                      )}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Select Machine"
              name="machine_name"
              validateStatus={errors.machine_name ? "error" : ""}
              help={errors.machine_name && errors.machine_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingMachineList}
                    placeholder="Select Machine"
                    options={machineListRes?.rows?.map((machine) => ({
                      label: machine?.machine_name,
                      value: machine?.machine_name,
                    }))}
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

          <Col span={6}>
            <Form.Item
              label="Select Quality"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Quality"
                      loading={dropDownQualityLoading}
                      // onChange={(newValue) => {
                      //   field.onChange(newValue?.value);
                      // }}
                      options={
                        dropDownQualityListRes &&
                        dropDownQualityListRes?.rows?.map((item) => ({
                          value: item.id,
                          label: item.quality_name,
                        }))
                      }
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Grey Stock Meter"
              name="gray_stock_meter"
              validateStatus={errors.gray_stock_meter ? "error" : ""}
              help={errors.gray_stock_meter && errors.gray_stock_meter.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="gray_stock_meter"
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Taka"
              name="taka"
              validateStatus={errors.taka ? "error" : ""}
              help={errors.taka && errors.taka.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="taka"
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Yarn Stock Total KG"
              name="yarn_stock_total_kg"
              validateStatus={errors.yarn_stock_total_kg ? "error" : ""}
              help={
                errors.yarn_stock_total_kg && errors.yarn_stock_total_kg.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_stock_total_kg"
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Beam Stock"
              name="beam_stock"
              validateStatus={errors.beam_stock ? "error" : ""}
              help={errors.beam_stock && errors.beam_stock.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="beam_stock"
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
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
                  <Input {...field} placeholder="Enter your remark" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default AddJobYarnStockReport;
