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
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import {
  getBrokerListRequest,
  getPartyListRequest,
} from "../../../../api/requests/users";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import { createSaleBillRequest } from "../../../../api/requests/sale/bill/saleBill";
import { getDisplayQualityName } from "../../../../constants/nameHandler";

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
    let isValid = true;
    fieldArray.forEach((item, index) => {
      clearErrors(`supplier_beam_no_${index}`);
      clearErrors(`tars_${index}`);
      clearErrors(`pano_${index}`);
      clearErrors(`taka_${index}`);
      clearErrors(`meter_${index}`);
    });

    fieldArray.forEach((item, index) => {
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

      if (!getValues(`amount_${index}`)) {
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
    });

    if (isValid){
      const newData = fieldArray.map((field) => {
        const calculatedAmount = +data[`amount_${field}`] ; 
        const SGST_value = 2.5; 
        const CGST_value = 2.5 ; 
        const IGST_value = 2.5 ; 

        const SGST_amount = +calculatedAmount * +SGST_value ; 
        const CGST_amount = +calculatedAmount * +CGST_value ; 
        const IGST_amount = +calculatedAmount * +IGST_value ; 

        let net_amount = +calculatedAmount + +SGST_amount + +CGST_amount + +IGST_amount ; 
        let final_net_amount = Math.round(net_amount); 
        let round_off_amount = +final_net_amount - +net_amount ;   
  
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
          net_amount: +calculatedAmount,
          due_days: +data[`due_days_${field}`],
          hsn_no: `HSN_${field}`,
          discount_value: 0,
          discount_amount: 0,
          SGST_value: SGST_value,
          SGST_amount: SGST_amount,
          CGST_value: CGST_value,
          CGST_amount: CGST_amount,
          IGST_value: IGST_value,
          IGST_amount: IGST_amount,
          round_off_amount: round_off_amount,
          amount: final_net_amount,
        };
      });
      await addSaleBill(newData);
    }

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
  const formValues = watch(); // Watch all form values

  useEffect(() => {
    if (fieldArray?.length > 0) {
      fieldArray.forEach((element, index) => {
        const total_meter = getValues(`total_meter_${index}`);
        const rate = getValues(`rate_${index}`);
        const currentAmount = getValues(`amount_${index}`);
        const SGST_value = 2.5; 
        const CGST_value = 2.5 ; 
        const IGST_value = 2.5 ; 

        // Only calculate and update the amount if total_meter and rate are defined and have valid values
        if (
          total_meter !== undefined &&
          total_meter !== "" &&
          rate !== undefined &&
          rate !== ""
        ) {
          const calculatedAmount = +total_meter * +rate;

          // Only update amount if it has changed
          if (+calculatedAmount !== +currentAmount) {
            setValue(`amount_${index}`, calculatedAmount);

            const SGST_amount = +calculatedAmount * +SGST_value ; 
            const CGST_amount = +calculatedAmount * +CGST_value ; 
            const IGST_amount = +calculatedAmount * +IGST_value ; 

            let net_amount = +calculatedAmount + +SGST_amount + +CGST_amount + +IGST_amount ; 
            let final_net_amount = Math.round(net_amount); 

            setValue(`net_amount_${index}`, parseFloat(final_net_amount).toFixed(2))
            
            let round_off_amount = +final_net_amount - +net_amount ;   
            setValue(`round_off_${index}`, parseFloat(round_off_amount).toFixed(2))

          }
        }
      });
    }
  }, [fieldArray, formValues, getValues, setValue]); 



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

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
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

  return (
    <div className="flex flex-col p-4">
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <Button onClick={goBack}>
            <ArrowLeftOutlined />
          </Button>
          <div>
            <h3 className="m-0 text-primary">Create Opening Bill & Challan</h3>
            <Flex gap={10} style={{marginTop: 4}}>
              <Flex>
                <div style={{fontWeight: 600, color: "blue"}}>SGST : </div>
                <div> 2.5</div>
              </Flex>
              <Flex>
                <div style={{fontWeight: 600, color: "blue"}}>SGST : </div>
                <div> 2.5</div>
              </Flex>
              <Flex>
                <div style={{fontWeight: 600, color: "blue"}}>IGST : </div>
                <div>0</div>
              </Flex>
            </Flex>
          </div>
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
  getValues,
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

        {/* Bill date selection  */}
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
        
        {/* Invoice number information  */}
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
              render={({ field }) => (
                <Input type="number" {...field} placeholder="0" />
              )}
            />
          </Form.Item>
        </Col>
        
        {/* Machine number information  */}
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
        
        {/* Quality selection  */}
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
                        label: getDisplayQualityName(item),
                      }))
                    }
                  />
                );
              }}
            />
          </Form.Item>
        </Col>
        
        {/* Total taka information  */}
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
        
        {/* Total meter information  */}
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
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="0"
                  type="number"
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue(`total_meter_${fieldNumber}`, value);

                    let rate = getValues(`rate_${fieldNumber}`);
                    if (rate !== "" && rate !== undefined) {
                      let calculatedRate = Number(rate) * Number(value);
                      setValue(`net_amount_${fieldNumber}`, calculatedRate);
                    }
                  }}
                />
              )}
            />
          </Form.Item>
        </Col>

        {/* Rate information  */}
        <Col span={2} >
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
                />
              )}
            />
          </Form.Item>
        </Col>

        {/* Amount information  */}
        <Col span={2} >
          <Form.Item
            label="Amount"
            name={`amount_${fieldNumber}`}
            validateStatus={errors[`rate_${fieldNumber}`] ? "error" : ""}
            help={
              errors[`amount_${fieldNumber}`] &&
              errors[`amount_${fieldNumber}`].message
            }
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name={`amount_${fieldNumber}`}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  placeholder="0"
                />
              )}
            />
          </Form.Item>
        </Col>

        <Col span={3}>
          <div>
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
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
                    onChange={(e) => {
                      setValue(`net_amount_${index}`, e.target.value);
                      let totalMeter = getValues(`total_meter_${fieldNumber}`);
                      if (totalMeter !== "" && totalMeter !== undefined) {
                        let rate = Number(e.target.value) / Number(totalMeter);
                        setValue(`rate_${index}`, rate);
                      }
                    }}
                  />
                )}
              />
            </Form.Item>
            <div>
              Round Off: <span style={{color: "green", fontWeight: 600}}>{getValues(`round_off_${index}`)}</span>
            </div>
          </div>
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
