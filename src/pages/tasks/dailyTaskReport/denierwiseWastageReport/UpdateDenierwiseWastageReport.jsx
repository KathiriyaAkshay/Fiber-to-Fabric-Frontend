import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
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
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import {
  getDenierwiseWastageReportByIdRequest,
  updateDenierwiseWastageReportRequest,
} from "../../../../api/requests/reports/denierwiseWastageReport";
import { getYSCDropdownList } from "../../../../api/requests/reports/yarnStockReport";
import dayjs from "dayjs";

const updateDenierwiseWastageReportSchemaResolver = yupResolver(
  yup.object().shape({
    report_date: yup.string(),
    machine_id: yup.string().required("Please select machine name"),
    notes: yup.string(),
    yarn_stock_company_id: yup.string(),
    wastage: yup.string().required(),
  })
);

function UpdateDenierwiseWastageReport() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  const [denierOptions, setDenierOptions] = useState([]);

  function goBack() {
    navigate(-1);
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

  const { mutateAsync: updateDenierwiseWastageReport } = useMutation({
    mutationFn: async (data) => {
      const res = await updateDenierwiseWastageReportRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["reports/denierwise-wastage-report/update", id],
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
    queryKey: ["reports/denierwise-wastage-report/get", id],
    queryFn: async () => {
      const res = await getDenierwiseWastageReportByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.denierWastageReport;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.report_time;
    await updateDenierwiseWastageReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: updateDenierwiseWastageReportSchemaResolver,
  });

  const { yarn_company_name } = watch();

  useEffect(() => {
    if (reportDetails) {
      const { report_date, machine_id, notes, wastage } = reportDetails;

      reset({
        report_date: dayjs(report_date),
        machine_id,
        notes,
        wastage,
      });
    }
  }, [reportDetails, reset]);

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

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Denierwise wastage report</h3>
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
              label="Date"
              name="report_date"
              validateStatus={errors.report_date ? "error" : ""}
              help={errors.report_date && errors.report_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="report_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD-MM-YYYY"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Machine Name"
              name="machine_id"
              validateStatus={errors.machine_id ? "error" : ""}
              help={errors.machine_id && errors.machine_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
              style={{
                marginBottom: "8px",
              }}
            >
              <Controller
                control={control}
                name="machine_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine Name"
                    allowClear
                    loading={isLoadingMachineList}
                    options={machineListRes?.rows?.map((machine) => ({
                      label: machine?.machine_name,
                      value: machine?.id,
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
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Denier/Count & Filament  "
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
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Wastage"
              name="wastage"
              validateStatus={errors.wastage ? "error" : ""}
              help={errors.wastage && errors.wastage.message}
              required={true}
            >
              <Controller
                control={control}
                name="wastage"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="100000"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Notes"
              name="notes"
              validateStatus={errors.notes ? "error" : ""}
              help={errors.notes && errors.notes.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    placeholder="Please enter note"
                    autoSize
                  />
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

      <DevTool control={control} />
    </div>
  );
}

export default UpdateDenierwiseWastageReport;
