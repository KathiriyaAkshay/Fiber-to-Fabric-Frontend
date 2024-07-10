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
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import {
  getBrokerListRequest,
  getPartyListRequest,
} from "../../../../api/requests/users";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import { createSaleBillRequest } from "../../../../api/requests/sale/bill/saleBill";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    party_id: yup.string().required("Please select party."),
    broker_id: yup.string().required("Please select broker."),
  })
);

const AddSaleBill = () => {
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const [fieldArray, setFieldArray] = useState([0]);
  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: addSaleBill, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createSaleBillRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["sale", "bill", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["saleBill", "list"]);
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
    console.log({ data });
    const newData = fieldArray.map((field) => {

      let net_amount = data[`net_amount_${field}`] ; 
      let sgst_amount = Number(net_amount)*Number(2.5) / 100 ; 
      let cgst_amount = Number(net_amount)*Number(2.5) / 100 ; 
      let final_amount = Number(net_amount) + Number(sgst_amount) + Number(cgst_amount) ; 
      
      let roundOff_amount = Math.round(final_amount) ; 
      roundOff_amount = Number(roundOff_amount) - final_amount ; 

      return {
        order_id: null,
        party_id: +data.party_id,
        broker_id: +data.broker_id,
        invoice_no: data[`invoice_no_${field}`],
        machine_name: data[`machine_name_${field}`],
        quality_id: +data[`quality_id_${field}`],
        total_taka: +data[`total_taka_${field}`],
        total_meter: +data[`total_meter_${field}`],
        rate: +data[`rate_${field}`],
        net_amount: Math.round(final_amount),
        due_days: +data[`due_days_${field}`],
        hsn_no: `HSN_${field}`,
        discount_value: 0,
        discount_amount: 0,
        SGST_value: 2.5,
        SGST_amount: sgst_amount,
        CGST_value: 2.5,
        CGST_amount: cgst_amount,
        IGST_value: 0,
        IGST_amount: 0,
        round_off_amount: roundOff_amount,
        amount: net_amount,
      };
    });

    console.log({ newData });
    await addSaleBill(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
    clearErrors,
    setError,
    setValue,
  } = useForm({
    defaultValues: {
      year_type: "current",
      party_id: null,
      broker_id: null,
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { machine_name } = watch();
  // ------------------------------------------------------------------------------------------

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


  const { data: dropDownQualityListRes, dropDownQualityLoading } = useQuery({
    queryKey: [
      "dropDownQualityListRes",
      "list",
      {
        company_id: companyId,
        machine_name: machine_name,
        page: 0,
        pageSize: 99999,
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
            pageSize: 99999,
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

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const addNewFieldRow = (indexValue) => {
    let isValid = true;

    fieldArray.forEach((item, index) => {
      clearErrors(`supplier_beam_no_${index}`);
      clearErrors(`tars_${index}`);
      clearErrors(`pano_${index}`);
      clearErrors(`taka_${index}`);
      clearErrors(`meter_${index}`);
    });

    fieldArray.forEach((item, index) => {
      if (index === indexValue) {
        if (!getValues(`date_${index}`)) {
          setError(`date_${index}`, {
            type: "manual",
            message: "Required",
          });
          isValid = false;
        }
        if (!getValues(`invoice_no_${index}`)) {
          setError(`invoice_no_${index}`, {
            type: "manual",
            message: "Required",
          });
          isValid = false;
        }
        if (!getValues(`machine_name_${index}`)) {
          setError(`machine_name_${index}`, {
            type: "manual",
            message: "Required",
          });
          isValid = false;
        }
        if (!getValues(`quality_id_${index}`)) {
          setError(`quality_id_${index}`, {
            type: "manual",
            message: "Required",
          });
          isValid = false;
        }
        if (!getValues(`total_taka_${index}`)) {
          setError(`total_taka_${index}`, {
            type: "manual",
            message: "Required",
          });
          isValid = false;
        }
        if (!getValues(`total_meter_${index}`)) {
          setError(`total_meter_${index}`, {
            type: "manual",
            message: "Required",
          });
          isValid = false;
        }

        if (!getValues(`rate_${index}`)) {
          setError(`rate_${index}`, {
            type: "manual",
            message: "Required",
          });
          isValid = false;
        }

        if (!getValues(`net_amount_${index}`)) {
          setError(`net_amount_${index}`, {
            type: "manual",
            message: "Required",
          });
          isValid = false;
        }

        if (!getValues(`due_days_${index}`)) {
          setError(`due_days_${index}`, {
            type: "manual",
            message: "Required",
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

  const disableFutureDates = (current) => {
    return current && current > Date.now();
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <Button onClick={goBack}>
            <ArrowLeftOutlined />
          </Button>
          <h3 className="m-0 text-primary">Create Opening Bill & Challan</h3>
        </div>
      </div>
      <Form
        layout="vertical"
        style={{ marginTop: "1rem" }}
        onFinish={handleSubmit(onSubmit)}
      >
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Year Type"
              name="year_type"
              validateStatus={errors.year_type ? "error" : ""}
              help={errors.year_type && errors.year_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="year_type"
                render={({ field }) => (
                  <Radio.Group {...field}>
                    <Flex align="center" gap={10}>
                      <Radio value={"current"}>Current Year</Radio>
                      <Radio value={"previous"}>Previous Year</Radio>
                    </Flex>
                  </Radio.Group>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="Party Company"
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
                    placeholder="Select Party"
                    loading={isLoadingPartyList}
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
          <Col span={4}>
            <Form.Item
              label="Broker"
              name="broker_id"
              validateStatus={errors.broker_id ? "error" : ""}
              help={errors.broker_id && errors.broker_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="broker_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Broker"
                    loading={isLoadingBrokerList}
                    options={brokerUserListRes?.brokerList?.rows?.map(
                      (broker) => ({
                        label:
                          broker.first_name +
                          " " +
                          broker.last_name +
                          " " +
                          `| (${broker?.username})`,
                        value: broker.id,
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

        {/* <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={4}>
            <Form.Item
              label="Supplier Name"
              name="supplier_name"
              validateStatus={errors.supplier_name ? "error" : ""}
              help={errors.supplier_name && errors.supplier_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingDropdownSupplierList}
                    placeholder="Select Supplier"
                    options={dropdownSupplierListRes?.map((supervisor) => ({
                      label: supervisor?.supplier_name,
                      value: supervisor?.supplier_name,
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

          <Col span={4}>
            <Form.Item
              label="Supplier Company"
              name="supplier_id"
              validateStatus={errors.supplier_id ? "error" : ""}
              help={errors.supplier_id && errors.supplier_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingDropdownSupplierList}
                    placeholder="Select Supplier Company"
                    options={dropDownSupplierCompanyOption}
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

          <Col span={2}>
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
                  <Input
                    {...field}
                    name="challan_no"
                    placeholder="Challan No"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Beam Type"
              name="challan_beam_type"
              validateStatus={errors.challan_beam_type ? "error" : ""}
              help={
                errors.challan_beam_type && errors.challan_beam_type.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_beam_type"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Beam Type"
                      options={[
                        {
                          label: "Pasarela (Primary)",
                          value: "pasarela (primary)",
                        },
                        {
                          label: "Non Pasarela (Primary)",
                          value: "non pasarela (primary)",
                        },
                        {
                          label: "Non Pasarela (Secondary)",
                          value: "non pasarela (secondary)",
                        },
                      ]}
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

          <Col span={3}>
            <Form.Item
              label="Time"
              name="time"
              validateStatus={errors.time ? "error" : ""}
              help={errors.time && errors.time.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="time"
                render={({ field }) => (
                  <TimePicker {...field} style={{ width: "100%" }} />
                )}
              />
            </Form.Item>
          </Col>
        </Row> */}

        {fieldArray.map((fieldNumber, index) => {
          return (
            <FormRow
              key={index + "_form_row"}
              index={index}
              errors={errors}
              control={control}
              fieldNumber={fieldNumber}
              isLoadingMachineList={isLoadingMachineList}
              machineListRes={machineListRes}
              dropDownQualityLoading={dropDownQualityLoading}
              dropDownQualityListRes={dropDownQualityListRes}
              addNewFieldRow={addNewFieldRow}
              deleteFieldRow={deleteFieldRow}
              fieldArray={fieldArray}
              setValue={setValue}
              companyId={companyId}
              getValues={getValues}
            />
          );
        })}

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default AddSaleBill;

const FormRow = ({
  index,
  errors,
  control,
  fieldNumber,
  isLoadingMachineList,
  machineListRes,
  addNewFieldRow,
  deleteFieldRow,
  fieldArray,
  setValue,
  companyId,
  getValues
}) => {
  const [qualityList, setQualityList] = useState([]);

  const machineNameChangeHandler = async (value) => {
    try {
      setValue(`machine_name_${fieldNumber}`, value);
      if (value) {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            machine_name: value,
            page: 0,
            pageSize: 99999,
            is_active: 1,
          },
        });
        setQualityList(res.data?.data);
      } else {
        setQualityList({ row: [] });
      }
    } catch (error) {
      console.log("fetch quality error", error);
    }
  };

  const disableFutureDates = (current) => {
    return current && current > Date.now();
  };
  return (
    <>
      <Row
        key={index + "_add_beam_receive"}
        gutter={18}
        style={{
          padding: "12px",
        }}
      >
        <Col span={3}>
          <Form.Item
            label="Bill Date"
            name={`date_${fieldNumber}`}
            validateStatus={errors[`date_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`date_${fieldNumber}`] &&
              errors[`date_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`date_${fieldNumber}`}
              render={({ field }) => (
                <DatePicker
                  disabledDate={disableFutureDates}
                  {...field}
                  format={"DD-MM-YYYY"}
                  style={{ width: "100%" }}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={2}>
          <Form.Item
            label="Invoice No"
            name={`invoice_no_${fieldNumber}`}
            validateStatus={errors[`invoice_no_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`invoice_no_${fieldNumber}`] &&
              errors[`invoice_no_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`invoice_no_${fieldNumber}`}
              render={({ field }) => <Input type="number" {...field} placeholder="0" />}
            />
          </Form.Item>
        </Col>

        <Col span={3}>
          <Form.Item
            label="Machine Name"
            name={`machine_name_${fieldNumber}`}
            validateStatus={
              errors[`machine_name_${fieldNumber}`] ? "error" : ""
            }
            help={
              errors[`machine_name_${fieldNumber}`] &&
              errors[`machine_name_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`machine_name_${fieldNumber}`}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Select Machine Name"
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
                  onChange={machineNameChangeHandler}
                  allowClear
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item
            label="Select Quality"
            name={`quality_id_${fieldNumber}`}
            validateStatus={errors[`quality_id_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`quality_id_${fieldNumber}`] &&
              errors[`quality_id_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`quality_id_${fieldNumber}`}
              render={({ field }) => {
                return (
                  <Select
                    {...field}
                    placeholder="Select Quality"
                    options={
                      qualityList &&
                      qualityList?.rows?.map((item) => ({
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

        <Col span={2}>
          <Form.Item
            label="Total Taka"
            name={`total_taka_${fieldNumber}`}
            validateStatus={errors[`total_taka_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`total_taka_${fieldNumber}`] &&
              errors[`total_taka_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`total_taka_${fieldNumber}`}
              render={({ field }) => (
                <Input {...field} type="number" placeholder="0" />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={2}>
          <Form.Item
            label="Total Meter"
            name={`total_meter_${fieldNumber}`}
            validateStatus={errors[`total_meter_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`total_meter_${fieldNumber}`] &&
              errors[`total_meter_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`total_meter_${fieldNumber}`}
              render={({ field }) => <Input 
                {...field} 
                placeholder="0" 
                onChange={(e) => {
                  setValue(`total_meter_${fieldNumber}`, e.target.value) ; 

                  let totalMeter = getValues(`rate_${fieldNumber}`) ; 
                  if (totalMeter !== "" && totalMeter !== undefined){
                    let rate = Number(totalMeter)*Number(e.target.value) ; 
                    setValue(`net_amount_${fieldNumber}`, rate) ; 
                  }
                }}
              />}
            />
          </Form.Item>
        </Col>

        <Col span={2}>
          <Form.Item
            label="Rate"
            name={`rate_${fieldNumber}`}
            validateStatus={errors[`rate_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`rate_${fieldNumber}`] &&
              errors[`rate_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`rate_${fieldNumber}`}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="number" 
                  placeholder="0" 
                  onChange={(e) => {
                    setValue(`rate_${fieldNumber}`, e.target.value) ; 

                    let totalMeter = getValues(`total_meter_${fieldNumber}`) ; 
                    if (totalMeter !== "" && totalMeter !== undefined){
                      let rate = Number(totalMeter)*Number(e.target.value) ; 
                      setValue(`net_amount_${fieldNumber}`, rate) ; 
                    }
                    
                  }}
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={3}>
          <Form.Item
            label="Net Amount"
            name={`net_amount_${fieldNumber}`}
            validateStatus={errors[`net_amount_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`net_amount_${fieldNumber}`] &&
              errors[`net_amount_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`net_amount_${fieldNumber}`}
              render={({ field }) => (
                <Input {...field} type="number" placeholder="0" />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={2}>
          <Form.Item
            label="Due Days"
            name={`due_days_${fieldNumber}`}
            validateStatus={errors[`due_days_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`due_days_${fieldNumber}`] &&
              errors[`due_days_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`due_days_${fieldNumber}`}
              render={({ field }) => <Input {...field} placeholder="0" />}
            />
          </Form.Item>
        </Col>

        {fieldArray.length > 1 && (
          <Col span={1}>
            <Button
              style={{ marginTop: "1.9rem" }}
              icon={<DeleteOutlined />}
              type="primary"
              onClick={deleteFieldRow.bind(null, fieldNumber)}
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
};
