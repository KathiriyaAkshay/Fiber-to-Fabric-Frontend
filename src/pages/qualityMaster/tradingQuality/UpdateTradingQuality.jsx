import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
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
import { yupResolver } from "@hookform/resolvers/yup";
import { QUALITY_GROUP_LIST } from "../../../constants/yarnStockCompany";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import {
  // getQualityNameDropDownRequest,
  getTradingQualityByIdRequest,
  updateTradingQualityRequest,
} from "../../../api/requests/qualityMaster";
import { CloseOutlined } from "@ant-design/icons";
import { getCompanyMachineListRequest } from "../../../api/requests/machine";

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    quality_name: yup.string().required("Please enter quality name"),
    quality_group: yup.string().required("Please enter quality group"),
    vat_hsn_no: yup.string().required("Please enter VAT HSN No"),
    machine_name: yup.string().required("Please enter machine name"),
    production_type: yup.boolean(),
    other_quality_name: yup.string(),
    other_quality_weight: yup.number(),
  })
);

export const UpdateTradingQuality = () => {
  // const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { qualityId: id } = params;

  // const [qualityNames, setQualityNames] = useState([]);
  // const [options, setOptions] = useState([]);

  function goBack() {
    navigate(-1);
  }

  const { companyId } = useContext(GlobalContext);

  const { data: tradingQualityDetail } = useQuery({
    queryKey: ["tradingQuality", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getTradingQualityByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateTradingQuality } = useMutation({
    mutationFn: async (data) => {
      const res = await updateTradingQualityRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["quality-master", "trading-quality", "update", id],
    onSuccess: (res) => {
      //   queryClient.invalidateQueries([
      //     "yarn-stock",
      //     "company",
      //     "list",
      //     companyId,
      //   ]);
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
    // let quality;
    // if (data.quality_name === 0 || data.quality_name === "0") {
    //   quality = {
    //     quality_name: data.other_quality_name,
    //     quality_weight: data.other_quality_weight,
    //   };
    // } else {
    //   quality = qualityNames.find(
    //     (item) => item.id === parseInt(data.quality_name)
    //   );
    // }

    const newData = {
      production_type: "purchase/trading",
      quality_name: data.quality_name,
      quality_weight: data.quality_weight,
      quality_group: data.quality_group,
      machine_name: data.machine_name,
      vat_hsn_no: data.vat_hsn_no,
    };
    await updateTradingQuality(newData);
  }

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
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      quality_name: null,
      quality_group: null,
      vat_hsn_no: "",
      machine_name: null,
      production_type: true,
      other_quality_name: "",
      other_quality_weight: "",
    },
    resolver: addYSCSchemaResolver,
  });

  const { quality_name } = watch();

  //   useEffect(() => {
  //     if (yarn_count) {
  //       setValue("yarn_denier", Math.ceil(5315 / yarn_count));
  //     }
  //   }, [setValue, yarn_count]);

  // const { mutateAsync: searchQualityName } = useMutation({
  //   mutationFn: async (searchValue) => {
  //     const res = await getQualityNameDropDownRequest({
  //       params: {
  //         company_id: companyId,
  //         search: searchValue,
  //       },
  //     });
  //     return res.data;
  //   },
  //   // mutationKey: ["quality-master", "trading-quality", "add"],
  //   onSuccess: (res) => {
  //     if (res.success) {
  //       if (res.data.row.length) {
  //         setQualityNames(res.data.row);
  //         setOptions(
  //           res.data.row.map((item) => ({
  //             label: item.quality_name,
  //             value: item.id,
  //           }))
  //         );
  //       } else {
  //         setOptions([{ label: "Other", value: 0 }]);
  //         setQualityNames([]);
  //       }
  //     } else {
  //       setQualityNames([]);
  //       setOptions([{ label: "Other", value: 0 }]);
  //     }
  //     //   const successMessage = res?.message;
  //     //   if (successMessage) {
  //     //     message.success(successMessage);
  //     //   }
  //   },
  //   onError: (error) => {
  //     const errorMessage = error?.response?.data?.message || error.message;
  //     message.error(errorMessage);
  //   },
  // });

  useEffect(() => {
    if (tradingQualityDetail) {
      const {
        quality_name,
        quality_weight,
        quality_group,
        vat_hsn_no,
        machine_name,
      } = tradingQualityDetail;
      reset({
        vat_hsn_no,
        quality_group,
        quality_weight,
        quality_name,
        machine_name,
      });
    }
  }, [tradingQualityDetail, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Trading Quality</h3>
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
              label="Quality Name"
              name="quality_name"
              validateStatus={errors.quality_name ? "error" : ""}
              help={errors.quality_name && errors.quality_name.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_name"
                render={({ field }) => {
                  return (
                    // <Select
                    //   showSearch
                    //   {...field}
                    //   placeholder="Search Quality"
                    //   labelInValue
                    //   allowClear
                    //   filterOption={false}
                    //   onChange={(newValue) => {
                    //     field.onChange(newValue?.value);
                    //   }}
                    //   onSearch={(value) => {
                    //     console.log("onSearch", value);
                    //     searchQualityName(value);
                    //   }}
                    //   options={options}
                    // />
                    <Input {...field} placeholder="Search Quality" disabled />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Quality Group"
              name="quality_group"
              validateStatus={errors.quality_group ? "error" : ""}
              help={errors.quality_group && errors.quality_group.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_group"
                render={({ field }) => {
                  return (
                    <Select
                      allowClear
                      placeholder="Select group"
                      {...field}
                      options={QUALITY_GROUP_LIST}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="VAT HSN No."
              name="vat_hsn_no"
              validateStatus={errors.vat_hsn_no ? "error" : ""}
              help={errors.vat_hsn_no && errors.vat_hsn_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="vat_hsn_no"
                render={({ field }) => <Input {...field} placeholder="5407" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Machine"
              name="machine_name"
              validateStatus={errors.machine_name ? "error" : ""}
              help={errors.machine_name && errors.machine_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_name"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      allowClear
                      placeholder="Select Machine"
                      loading={isLoadingMachineList}
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
                      disabled
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          {quality_name === 0 ? (
            <>
              <Col span={6}>
                <Form.Item
                  label="Quality Name"
                  name="other_quality_name"
                  validateStatus={errors.other_quality_name ? "error" : ""}
                  help={
                    errors.other_quality_name &&
                    errors.other_quality_name.message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="other_quality_name"
                    render={({ field }) => (
                      <Input {...field} placeholder="60 GRAM" type="text" />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item
                  label="Quality Weight"
                  name="other_quality_weight"
                  validateStatus={errors.other_quality_weight ? "error" : ""}
                  help={
                    errors.other_quality_weight &&
                    errors.other_quality_weight.message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="other_quality_weight"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder="5.6"
                        type="number"
                        min={0}
                        step={0.5}
                      />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Button
                  style={{ marginTop: "1.9rem" }}
                  icon={<CloseOutlined />}
                  type="primary"
                  onClick={() => {
                    setValue("quality_name", null);
                    setValue("other_quality_name", "");
                    setValue("other_quality_weight", "");
                  }}
                  className="flex-none"
                />
              </Col>
            </>
          ) : (
            <>
              <Col span={6}></Col>
              <Col span={6}></Col>
              <Col span={6}></Col>
            </>
          )}

          <Col span={6}>
            <Form.Item
              label="Production Type"
              name="production_type"
              validateStatus={errors.yarn_company_name ? "error" : ""}
              help={
                errors.yarn_company_name && errors.yarn_company_name.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="production_type"
                render={({ field }) => {
                  return (
                    <Checkbox {...field} checked={field.value} disabled={true}>
                      Purchase/Trading
                    </Checkbox>
                  );
                }}
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
};
