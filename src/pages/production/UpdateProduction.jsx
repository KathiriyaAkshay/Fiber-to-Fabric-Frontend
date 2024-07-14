import { useContext, useEffect, useMemo } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Row,
  Col,
  Flex,
  Divider,
  message,
  Typography,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../contexts/GlobalContext";
import { Controller, useForm } from "react-hook-form";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  getProductionByIdRequest,
  updateProductionRequest,
} from "../../api/requests/production/inhouseProduction";

const updateProductionSchema = yupResolver(
  yup.object().shape({
    quality_id: yup.string().required("Please select quality."),
    company: yup.string().required("Please select company."),
    taka_no: yup.string().required("Please enter taka no."),
    meter: yup.string().required("Please enter meter."),
    weight: yup.string().required("Please enter weight."),
    machine_no: yup.string().required("Please select machine no."),
    average: yup.string().required("Please enter average."),
    beam_no: yup.string().required("Please enter beam no."),
  })
);

const UpdateProduction = () => {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { companyId, companyListRes } = useContext(GlobalContext);

  const { data: productionDetail } = useQuery({
    queryKey: ["productionDetail", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getProductionByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateProduction, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateProductionRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["production", "update"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["production", "list", companyId]);
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

  const onSubmit = async (data) => {
    const newData = {
      quality_id: +data.quality_id,
      meter: +data.meter,
      weight: +data.weight,
      machine_no: +data.machine_no,
      beam_no: data.beam_no,
      average: +data.average,
      beam_load_id: productionDetail.beam_load_id,
      pending_meter: +productionDetail.pending_meter,
    };

    await updateProduction(newData);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError,
    trigger,
  } = useForm({
    defaultValues: {
      quality_id: null,
      company: "",
      taka_no: "",
      meter: "",
      weight: "",
      machine_no: null,
      average: "",
      beam_no: "",
    },
    resolver: updateProductionSchema,
  });

  const { quality_id, meter } = watch();

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          //   machine_name: machine_name,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        // if (machine_name) {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            //   machine_name: machine_name,
            page: 0,
            pageSize: 99999,
            is_active: 1,
          },
        });
        return res.data?.data;
        // } else {
        //   return { row: [] };
        // }
      },
      enabled: Boolean(companyId),
    });

  const avgWeight = useMemo(() => {
    if (
      quality_id &&
      dropDownQualityListRes &&
      dropDownQualityListRes?.rows?.length
    ) {
      const quality = dropDownQualityListRes?.rows?.find(
        ({ id }) => quality_id === id
      );
      return { weight_from: quality.weight_from, weight_to: quality.weight_to };
    }
  }, [dropDownQualityListRes, quality_id]);

  // const [weightPlaceholder, setWeightPlaceholder] = useState(null);

  // const calculateWeight =  (meterValue) => {
  //   const weightFrom = ((avgWeight.weight_from / 100) * meterValue).toFixed(3);
  //   const weightTo = ((avgWeight.weight_to / 100) * meterValue).toFixed(3);

  //   setWeightPlaceholder({
  //     weightFrom: +weightFrom,
  //     weightTo: +weightTo,
  //   });
  // };
  const weightPlaceholder = useMemo(() => {
    if (avgWeight) {
      const weightFrom = ((avgWeight.weight_from / 100) * meter).toFixed(3);
      const weightTo = ((avgWeight.weight_to / 100) * meter).toFixed(3);

      return {
        weightFrom: +weightFrom,
        weightTo: +weightTo,
      };
    }
  }, [avgWeight, meter]);

  const handleWeightChange = (value, field) => {
    if (
      +value >= weightPlaceholder.weightFrom &&
      +value <= weightPlaceholder.weightTo
    ) {
      trigger(`weight`);
    } else {
      setError(`weight`, {
        type: "custom",
        message: "wrong weight",
      });
    }
    field.onChange(value ? value : "");
  };

  useEffect(() => {
    if (productionDetail) {
      const {
        quality_id,
        company_id,
        taka_no,
        weight,
        meter,
        average,
        beam_no,
        machine_no,
      } = productionDetail;

      reset({
        quality_id,
        company: company_id,
        taka_no,
        weight,
        meter,
        beam_no,
        average,
        machine_no,
      });
    }
  }, [productionDetail, reset]);

  return (
    <Form
      form={form}
      layout="vertical"
      style={{ marginTop: "1rem" }}
      onFinish={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-5">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </Button>
            <h3 className="m-0 text-primary">Edit Productions</h3>
          </div>
        </div>

        <Row className="w-100" justify={"flex-start"} style={{ gap: "12px" }}>
          <Col span={6}>
            <Form.Item
              label="Quality"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_id"
                render={({ field }) => {
                  return (
                    <>
                      <Select
                        {...field}
                        placeholder="Select Quality"
                        loading={dropDownQualityLoading}
                        options={
                          dropDownQualityListRes &&
                          dropDownQualityListRes?.rows?.map((item) => ({
                            value: item.id,
                            label: item.quality_name,
                          }))
                        }
                        onChange={(value) => {
                          field.onChange(value);
                          // handleQualityChange();
                        }}
                      />
                      {/* {quality_id && (
                          <Typography.Text style={{ color: "red" }}>
                            Avg weight must be between {avgWeight?.weight_from}{" "}
                            to {avgWeight?.weight_to}
                          </Typography.Text>
                        )} */}
                    </>
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Company"
              name="company"
              validateStatus={errors.company ? "error" : ""}
              help={errors.company && errors.company.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company"
                render={({ field }) => {
                  return (
                    <>
                      <Select
                        {...field}
                        placeholder="Select Company"
                        options={companyListRes?.rows?.map(
                          ({ company_name = "", id = "" }) => ({
                            label: company_name,
                            value: id,
                          })
                        )}
                        disabled
                      />
                    </>
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Row style={{ gap: "16px" }} className="w-100" justify={"start"}>
          <Col span={6}>
            <Form.Item
              label="Taka No"
              name="taka_no"
              validateStatus={errors.taka_no ? "error" : ""}
              help={errors.taka_no && errors.taka_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="taka_no"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="taka_no"
                    style={{
                      width: "100%",
                    }}
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Meter"
              name="meter"
              validateStatus={errors.meter ? "error" : ""}
              help={errors.meter && errors.meter.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="meter"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="meter"
                    style={{
                      width: "100%",
                    }}
                    inputMode="decimal"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      // calculateWeight(+e.target.value);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Weight"
              name="weight"
              validateStatus={errors.weight ? "error" : ""}
              help={errors.weight && errors.weight.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="weight"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="weight"
                    style={{
                      width: "100%",
                    }}
                    placeholder={weightPlaceholder?.weightFrom || ""}
                    onChange={(e) => {
                      handleWeightChange(e.target.value, field);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={5}>
            <Form.Item
              label="Machine No"
              name="machine_no"
              validateStatus={errors.machine_no ? "error" : ""}
              help={errors.machine_no && errors.machine_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_no"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="machine_no"
                    style={{
                      width: "100%",
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row style={{ gap: "16px" }} className="w-100" justify={"start"}>
          <Col span={6}>
            <Form.Item
              label="Average"
              name="average"
              validateStatus={errors.average ? "error" : ""}
              help={errors.average && errors.average.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="average"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="average"
                    style={{
                      width: "100%",
                    }}
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Beam No"
              name="beam_no"
              validateStatus={errors.beam_no ? "error" : ""}
              help={errors.beam_no && errors.beam_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="beam_no"
                render={({ field }) => (
                  <Input
                    {...field}
                    name="beam_no"
                    style={{
                      width: "100%",
                    }}
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        {quality_id && (
          <Typography.Text style={{ color: "red" }}>
            Avg must be between {avgWeight?.weight_from} to{" "}
            {avgWeight?.weight_to}
          </Typography.Text>
        )}

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit" loading={isPending}>
            Update
          </Button>
        </Flex>
      </div>
    </Form>
  );
};

export default UpdateProduction;
