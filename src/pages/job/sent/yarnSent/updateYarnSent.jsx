import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Divider,
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
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import {
  getPartyListRequest,
  getVehicleUserListRequest,
} from "../../../../api/requests/users";
import {
  getYarnSentByIdRequest,
  updateYarnSentRequest,
} from "../../../../api/requests/job/sent/yarnSent";
import { disableBeforeDate } from "../../../../utils/date";
import { getYSCDropdownList } from "../../../../api/requests/reports/yarnStockReport";
import dayjs from "dayjs";

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    sent_date: yup.string().required("Please select date."),
    quality_id: yup.string().required("Please select quality"),
    party_id: yup.string().required("Please select party."),
    vehicle_id: yup.string().required("Please select vehicle."),
    challan_no: yup.string().required("Please enter vehicle."),
    delivery_charge: yup.string().required("Please enter delivery charge."),
    power_cost: yup.string().required("Please enter power cost."),
  })
);

const UpdateYarnSent = () => {
  const params = useParams();
  const { id } = params;

  const queryClient = useQueryClient();
  const [fieldArray, setFieldArray] = useState([0]);
  const [denierOptions, setDenierOptions] = useState([]);

  const navigate = useNavigate();
  //   const { data: user } = useCurrentUser();
  const { companyId } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  const { data: yarnSentDetails } = useQuery({
    queryKey: ["yarnSentDetail", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getYarnSentByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateYarnSent, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateYarnSentRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["yarnSent", "update", id],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["yarnSent", "list", companyId]);
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
      sent_date: dayjs(data.sent_date).format("YYYY-MM-DD"),
      quality_id: data.quality_id,
      party_id: data.party_id,
      vehicle_id: data.vehicle_id,
      delivery_charge: parseFloat(data.delivery_charge),
      power_cost: parseFloat(data.power_cost),
      challan_no: data.challan_no,

      job_yarn_sent_details: fieldArray.map((field) => {
        return {
          yarn_company_id: data[`yarn_stock_company_id_${field}`],
          current_stock: parseInt(data[`current_stock_${field}`]),
          cartoon: parseInt(data[`cartoon_${field}`]),
          kg: parseInt(data[`kg_${field}`]),
          remaining_stock: parseInt(data[`remaining_stock_${field}`]),
        };
      }),
    };
    await updateYarnSent(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors,
    setError,
    getValues,
  } = useForm({
    defaultValues: {
      sent_date: dayjs(),
      quality_id: null,
      party_id: null,
      vehicle_id: null,
      challan_no: "",
      delivery_charge: "",
      power_cost: "",
    },
    resolver: addYSCSchemaResolver,
  });

  // ------------------------------------------------------------------------------------------

  const addNewFieldRow = (indexValue) => {
    let isValid = true;

    fieldArray.forEach((item, index) => {
      clearErrors(`yarn_stock_company_id_${index}`);
      clearErrors(`current_stock_${index}`);
      clearErrors(`cartoon_${index}`);
      clearErrors(`kg_${index}`);
      clearErrors(`remaining_stock_${index}`);
    });

    fieldArray.forEach((item, index) => {
      if (index === indexValue) {
        if (!getValues(`yarn_stock_company_id_${index}`)) {
          setError(`yarn_stock_company_id_${index}`, {
            type: "manual",
            message: "Please select yarn stock company",
          });
          isValid = false;
        }
        if (!getValues(`current_stock_${index}`)) {
          setError(`current_stock_${index}`, {
            type: "manual",
            message: "Please enter current stock.",
          });
          isValid = false;
        }
        if (!getValues(`cartoon_${index}`)) {
          setError(`cartoon_${index}`, {
            type: "manual",
            message: "Please enter cartoon.",
          });
          isValid = false;
        }
        if (!getValues(`kg_${index}`)) {
          setError(`kg_${index}`, {
            type: "manual",
            message: "Please enter kg.",
          });
          isValid = false;
        }
        if (!getValues(`remaining_stock_${index}`)) {
          setError(`remaining_stock_${index}`, {
            type: "manual",
            message: "Please enter remaining stock.",
          });
          isValid = false;
        }
      }
    });

    if (isValid) {
      const nextValue = fieldArray[fieldArray.length - 1] + 1;
      setFieldArray((prev) => {
        return [...prev, nextValue];
      });
    }
  };

  const deleteFieldRow = (field) => {
    const newFields = [...fieldArray];
    const actualIndex = newFields.indexOf(field);
    newFields.splice(actualIndex, 1);
    setFieldArray(newFields);
  };

  const { data: dropDownQualityListRes, dropDownQualityLoading } = useQuery({
    queryKey: [
      "dropDownQualityListRes",
      "list",
      {
        company_id: companyId,
        page: 0,
        pageSize: 9999,
        is_active: true,
      },
    ],
    queryFn: async () => {
      const res = await getInHouseQualityListRequest({
        params: {
          company_id: companyId,
          page: 0,
          pageSize: 9999,
          is_active: true,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: vehicleListRes, isLoading: isLoadingVehicleList } = useQuery({
    queryKey: [
      "vehicle",
      "list",
      { company_id: companyId, page: 0, pageSize: 99999 },
    ],
    queryFn: async () => {
      const res = await getVehicleUserListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getPartyListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
    queryKey: ["dropdown", "yarn_company", "list"],
    queryFn: async () => {
      const res = await getYSCDropdownList({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    // set options for denier selection on yarn stock company select
    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      // const { yarn_company_name: name = "", yarn_details = [] } = ysc;
      const { yarn_details = [] } = ysc;
      // if (name === yarn_company_name) {
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
      // }
    });
  }, [yscdListRes?.yarnCompanyList]);

  useEffect(() => {
    if (yarnSentDetails) {
      console.log(yarnSentDetails);
      const {
        sent_date,
        challan_no,
        delivery_charge,
        power_cost,
        quality_id,
        party_id,
        vehicle_id,
        job_yarn_sent_details,
      } = yarnSentDetails;
      setFieldArray(() => {
        return job_yarn_sent_details.map((item, index) => index);
      });
      let jobYarnSentDetails = {};
      job_yarn_sent_details.forEach((item, index) => {
        jobYarnSentDetails[`yarn_stock_company_id_${index}`] =
          item.yarn_company_id;
        jobYarnSentDetails[`current_stock_${index}`] = item.current_stock;
        jobYarnSentDetails[`cartoon_${index}`] = item.cartoon;
        jobYarnSentDetails[`kg_${index}`] = item.kg;
        jobYarnSentDetails[`remaining_stock_${index}`] = item.remaining_stock;
      });
      reset({
        sent_date: dayjs(sent_date),
        challan_no,
        delivery_charge,
        power_cost,
        quality_id,
        party_id,
        vehicle_id,
        ...jobYarnSentDetails,
      });
    }
  }, [yarnSentDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Yarn Sent</h3>
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
              label="Sent Date"
              name="sent_date"
              validateStatus={errors.sent_date ? "error" : ""}
              help={errors.sent_date && errors.sent_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="sent_date"
                render={({ field }) => {
                  return (
                    <DatePicker
                      {...field}
                      style={{ width: "100%" }}
                      disabledDate={disableBeforeDate}
                      format={"DD-MM-YYYY"}
                    />
                  );
                }}
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

          <Col span={6}>
            <Form.Item
              label="Select Party"
              name="party_id"
              validateStatus={errors.party_id ? "error" : ""}
              help={errors.party_id && errors.party_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="party_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingPartyList}
                    placeholder="Select Party"
                    options={partyUserListRes?.partyList?.rows?.map(
                      (party) => ({
                        label:
                          party.first_name +
                          " " +
                          party.last_name +
                          " " +
                          `| ( ${party?.username})`,
                        value: party.id,
                      })
                    )}
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
              label="Select vehicle"
              name="vehicle_id"
              validateStatus={errors.vehicle_id ? "error" : ""}
              help={errors.vehicle_id && errors.vehicle_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="vehicle_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingVehicleList}
                    placeholder="Select Vehicle"
                    options={vehicleListRes?.vehicleList?.rows?.map(
                      (vehicle) => ({
                        label:
                          vehicle.first_name +
                          " " +
                          vehicle.last_name +
                          " " +
                          `| ( ${vehicle?.username})`,
                        value: vehicle.id,
                      })
                    )}
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
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Challan No"
              name="challan_no"
              validateStatus={errors.challan_no ? "error" : ""}
              help={errors.challan_no && errors.challan_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_no"
                render={({ field }) => (
                  <Input {...field} placeholder="CH123456" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Delivery Charge"
              name="delivery_charge"
              validateStatus={errors.delivery_charge ? "error" : ""}
              help={errors.delivery_charge && errors.delivery_charge.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="delivery_charge"
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Power Cost"
              name="power_cost"
              validateStatus={errors.power_cost ? "error" : ""}
              help={errors.power_cost && errors.power_cost.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="power_cost"
                render={({ field }) => <Input {...field} placeholder="0" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {fieldArray.map((field, index) => {
          return (
            <>
              <Row
                gutter={18}
                style={{
                  padding: "12px",
                }}
                key={`${field}_add_yarn_sent`}
              >
                <Col span={6}>
                  <Form.Item
                    label="Denier"
                    name={`yarn_stock_company_id_${field}`}
                    validateStatus={
                      errors[`yarn_stock_company_id_${field}`] ? "error" : ""
                    }
                    help={
                      errors[`yarn_stock_company_id_${field}`] &&
                      errors[`yarn_stock_company_id_${field}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name={`yarn_stock_company_id_${field}`}
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

                <Col span={3}>
                  <Form.Item
                    label="Current Stock"
                    name={`current_stock_${field}`}
                    validateStatus={
                      errors[`current_stock_${field}`] ? "error" : ""
                    }
                    help={
                      errors[`current_stock_${field}`] &&
                      errors[`current_stock_${field}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name={`current_stock_${field}`}
                      render={({ field }) => (
                        <Input {...field} placeholder="23" />
                      )}
                    />
                  </Form.Item>
                </Col>

                <Col span={3}>
                  <Form.Item
                    label="Cartoon"
                    name={`cartoon_${field}`}
                    validateStatus={errors[`cartoon_${field}`] ? "error" : ""}
                    help={
                      errors[`cartoon_${field}`] &&
                      errors[`cartoon_${field}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name={`cartoon_${field}`}
                      render={({ field }) => (
                        <Input {...field} placeholder="23" />
                      )}
                    />
                  </Form.Item>
                </Col>

                <Col span={3}>
                  <Form.Item
                    label="Kg"
                    name={`kg_${field}`}
                    validateStatus={errors[`kg_${field}`] ? "error" : ""}
                    help={
                      errors[`kg_${field}`] && errors[`kg_${field}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name={`kg_${field}`}
                      render={({ field }) => (
                        <Input {...field} placeholder="23" />
                      )}
                    />
                  </Form.Item>
                </Col>

                <Col span={3}>
                  <Form.Item
                    label="Remain Stock"
                    name={`remaining_stock_${field}`}
                    validateStatus={
                      errors[`remaining_stock_${field}`] ? "error" : ""
                    }
                    help={
                      errors[`remaining_stock_${field}`] &&
                      errors[`remaining_stock_${field}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name={`remaining_stock_${field}`}
                      render={({ field }) => (
                        <Input {...field} placeholder="23" />
                      )}
                    />
                  </Form.Item>
                </Col>

                {fieldArray.length > 1 && (
                  <Col span={1}>
                    <Button
                      style={{ marginTop: "1.9rem" }}
                      icon={<DeleteOutlined />}
                      type="primary"
                      onClick={deleteFieldRow.bind(null, field)}
                      className="flex-none"
                    />
                  </Col>
                )}

                {index === fieldArray.length - 1 && (
                  <Col span={1}>
                    <Button
                      style={{ marginTop: "1.9rem" }}
                      icon={<PlusOutlined />}
                      type="primary"
                      onClick={addNewFieldRow.bind(null, index)}
                      className="flex-none"
                    />
                  </Col>
                )}
              </Row>
            </>
          );
        })}

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit" loading={isPending}>
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default UpdateYarnSent;
