import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  AutoComplete,
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
import { useContext, useEffect } from "react";
import {
  getYarnStockCompanyByIdRequest,
  updateYarnStockCompanyRequest,
} from "../../../api/requests/yarnStock";
import {
  LUSTER_TYPE_LIST,
  YARN_COLOR_LIST,
  YARN_FIBER_TYPE_LIST,
  YARN_SUBTYPE_LIST,
} from "../../../constants/yarnStockCompany";
import dayjs from "dayjs";
import { GlobalContext } from "../../../contexts/GlobalContext";
import moment from 'moment';


const updateYSCSchemaResolver = yupResolver(
  yup.object().shape({
    // yarn_company_name: yup.string().required("Please enter yarn company name"),
    yarn_type: yup.string().required("Please enter yarn type"),
    yarn_Sub_type: yup.string(),
    luster_type: yup.string().required("Please enter luster type"),
    yarn_color: yup.string().required("Please enter yarn color"),
    yarn_count: yup.string(),
    yarn_denier: yup.string().required("Please enter yarn denier"),
    filament: yup.string().required("Please enter filament"),
    hsn_no: yup.string().required("Please enter HSN No"),
    avg_daily_stock: yup.string().required("Please enter average daily stock"),
    stock_date: yup.string(),
    // company_id: yup.string().required("Please enter company id"),
  })
);

function UpdateYarnStockCompany() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateYSC } = useMutation({
    mutationFn: async (data) => {
      const res = await updateYarnStockCompanyRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["yarn-stock", "company", "update", id],
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

  const { data: ysCompanyDetails } = useQuery({
    queryKey: ["yarn-stock", "company", "get", id],
    queryFn: async () => {
      const res = await getYarnStockCompanyByIdRequest({
        id,
        params: {
          company_id: companyId,
        },
      });
      return res.data?.data?.yarnComany;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    await updateYSC({ ...data, yarn_company_name: undefined });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: updateYSCSchemaResolver,
  });

  useEffect(() => {
    if (ysCompanyDetails) {
      const {
        yarn_company_name,
        yarn_type,
        yarn_Sub_type,
        luster_type,
        yarn_color,
        yarn_count,
        yarn_denier,
        filament,
        hsn_no,
        avg_daily_stock,
        stock_date,
        // company_id,
      } = ysCompanyDetails;
      reset({
        yarn_company_name,
        yarn_type,
        yarn_Sub_type,
        luster_type,
        yarn_color,
        yarn_count,
        yarn_denier,
        filament,
        hsn_no,
        avg_daily_stock,
        stock_date: dayjs(stock_date),
        // company_id,
      });
    }
  }, [ysCompanyDetails, reset]);

  const { yarn_count } = watch();

  useEffect(() => {
    if (yarn_count) {
      setValue("yarn_denier", Math.ceil(5315 / yarn_count));
    }
  }, [setValue, yarn_count]);

  const disabledDate = current => {
    // Disable all dates before today
    return current && current < moment().startOf('day');
  };


  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Yarn Company</h3>
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
              label="Company Name"
              name="yarn_company_name"
              validateStatus={errors.yarn_company_name ? "error" : ""}
              help={
                errors.yarn_company_name && errors.yarn_company_name.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_company_name"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Company Name"
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Yarn/Fiber Type"
              name="yarn_type"
              validateStatus={errors.yarn_type ? "error" : ""}
              help={errors.yarn_type && errors.yarn_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_type"
                render={({ field }) => (
                  <Select
                    allowClear
                    placeholder="Select Yarn Company Type"
                    {...field}
                    options={YARN_FIBER_TYPE_LIST}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Yarn Sub Type(Not Mandatory)"
              name="yarn_Sub_type"
              validateStatus={errors.yarn_Sub_type ? "error" : ""}
              help={errors.yarn_Sub_type && errors.yarn_Sub_type.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_Sub_type"
                render={({ field }) => (
                  <AutoComplete
                    {...field}
                    options={YARN_SUBTYPE_LIST}
                    placeholder="Enter yarn sub type"
                    filterOption={(inputValue, option) =>
                      option.value
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Luster Type"
              name="luster_type"
              validateStatus={errors.luster_type ? "error" : ""}
              help={errors.luster_type && errors.luster_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="luster_type"
                render={({ field }) => (
                  <Select
                    allowClear
                    placeholder="Select Luster Type"
                    {...field}
                    options={LUSTER_TYPE_LIST}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Yarn Color"
              name="yarn_color"
              validateStatus={errors.yarn_color ? "error" : ""}
              help={errors.yarn_color && errors.yarn_color.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_color"
                render={({ field }) => (
                  <AutoComplete
                    {...field}
                    options={YARN_COLOR_LIST}
                    placeholder="Enter yarn color"
                    filterOption={(inputValue, option) =>
                      option.value
                        .toUpperCase()
                        .indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Count"
              name="yarn_count"
              validateStatus={errors.yarn_count ? "error" : ""}
              help={errors.yarn_count && errors.yarn_count.message}
              wrapperCol={{ sm: 24 }}
              required = {true}
            >
              <Controller
                control={control}
                name="yarn_count"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={3}>
            <Form.Item
              label="Denier"
              name="yarn_denier"
              validateStatus={errors.yarn_denier ? "error" : ""}
              help={errors.yarn_denier && errors.yarn_denier.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_denier"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Fillament"
              name="filament"
              validateStatus={errors.filament ? "error" : ""}
              help={errors.filament && errors.filament.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="filament"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="48"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="HSN No."
              name="hsn_no"
              validateStatus={errors.hsn_no ? "error" : ""}
              help={errors.hsn_no && errors.hsn_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="hsn_no"
                render={({ field }) => <Input {...field} placeholder="2541" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Avg daily stock in kg"
              name="avg_daily_stock"
              validateStatus={errors.avg_daily_stock ? "error" : ""}
              help={errors.avg_daily_stock && errors.avg_daily_stock.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="avg_daily_stock"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="1200"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Stock Date"
              name="stock_date"
              validateStatus={errors.stock_date ? "error" : ""}
              help={errors.stock_date && errors.stock_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="stock_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD/MM/YYYY"
                    disabledDate={disabledDate}
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

    </div>
  );
}

export default UpdateYarnStockCompany;
