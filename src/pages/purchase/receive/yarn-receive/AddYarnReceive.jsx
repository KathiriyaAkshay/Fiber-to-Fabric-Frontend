import { PlusCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { getYSCDropdownList } from "../../../../api/requests/reports/yarnStockReport";
import { createYarnReceiveRequest } from "../../../../api/requests/purchase/yarnReceive";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import moment from "moment";
import { MinusCircleFilled } from "@ant-design/icons";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const addYarnReceiveSchemaResolver = yupResolver(
  yup.object().shape({
    challan_date: yup.string().required("Please select date"),
    yarn_company_name: yup.string().required("Please select yarn company"),
    yarn_stock_company_id: yup.string().required("Please select Denier"),
    lot_no: yup.string().required("Please enter lot no"),
    // challan_no: yup.string().required("Please enter lot no"),
    // receive_quantity: yup.string().required("Please enter recieve quantity"),
    // receive_cartoon_pallet: yup
    //   .string()
    //   .required("Please enter receive cartoon/pallet"),
    items: yup.array().of(
      yup.object().shape({
        challan_no: yup.string().required("Please enter challan no"),
        receive_quantity: yup.number().required("Please enter receive quantity"),
        receive_cartoon_pallet: yup.number().required("Please enter receive cartoon/pallet")
      })
    )
  })
);

function AddYarnReceive() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [denierOptions, setDenierOptions] = useState([]);

  const disabledDate = (current) => {
    return current && current > moment().endOf('day');
  };

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

  const { mutateAsync: createYarnReceive } = useMutation({
    mutationFn: async (data) => {
      const res = await createYarnReceiveRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["yarn-stock/yarn-receive-challan/create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "yarn-stock/yarn-receive-challan/list",
        { company_id: companyId },
      ]);
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

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue, 
    getValues,
    setError, 
    clearErrors,
    watch,
  } = useForm({
    defaultValues: {
      challan_date: dayjs(), 
    },
    resolver: addYarnReceiveSchemaResolver,
  });

  const { yarn_company_name } = watch();

  useEffect(() => {
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

  const [challanArray, setChallanArray] = useState([0]) ; 

  const AddChallanRow = (indexValue) => {
    let isValid = true ;  

    challanArray.forEach((item, index) => {
      clearErrors(`challan_no_${index}`);
      clearErrors(`receive_quantity_${index}`);
      clearErrors(`receive_cartoon_pallet_${index}`);
    });

    challanArray.forEach((item, index) => {
      if (index == indexValue) {
        if (!getValues(`challan_no_${index}`)) {
          setError(`challan_no_${index}`, {
            type: "manual",
            message: "Please, Enter challan number",
          });
          isValid = false;
        }
        if (!getValues(`receive_quantity_${index}`)) {
          setError(`receive_quantity_${index}`, {
            type: "manual",
            message: "Please, Enter Receive quantity",
          });
          isValid = false;
        }
        if (!getValues(`receive_cartoon_pallet_${index}`)) {
          setError(`receive_cartoon_pallet_${index}`, {
            type: "manual",
            message: "Please, Enter Receive cartoon quantity",
          });
          isValid = false;
        }
      }
    })

    if (isValid){
      const nextValue = challanArray.length ; 
      setChallanArray((prev) => {
        return [ ...prev, nextValue] ; 
      })
    }

  }

  const DeleteChallanRow = (field) => {
    const newFields = [...challanArray] ; 
    newFields.splice(field, 1) ; 
    setChallanArray(newFields) ; 
  }

  async function onSubmit(data) {
    
    const ChallanDetails = challanArray.map((field, index) => {
      return {
        challan_date: data?.challan_date, 
        yarn_stock_company_id: data?.yarn_stock_company_id, 
        lot_no: data?.lot_no, 
        challan_no: data[`challan_no_${index}`],
        receive_quantity: data[`receive_quantity_${index}`], 
        receive_cartoon_pallet : data[`receive_cartoon_pallet_${index}`]
      }
    })
    
    await createYarnReceive(ChallanDetails);

  }

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }


  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Yarn Receive Challan Create</h3>
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
              label="Challan Date"
              name="challan_date"
              validateStatus={errors.challan_date ? "error" : ""}
              help={errors.challan_date && errors.challan_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    disabledDate={disabledDate}
                    format="DD-MM-YYYY"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6} className="flex items-end gap-2">
            <Form.Item
              label="Yarn Company"
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
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddYarnStockCompany}
              className="flex-none mb-6"
              type="primary"
            />
          </Col>

          <Col span={6}>
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
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Lot No"
              name="lot_no"
              validateStatus={errors.lot_no ? "error" : ""}
              help={errors.lot_no && errors.lot_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="lot_no"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>
        
        </Row>

        {challanArray.length
          ?challanArray.map((field, index) => {
            return(
              <>
                <Row
                  key={field + "_field_warping"}
                  gutter={18}
                  style={{
                    padding: "12px",
                  }}
                >
                  <Col span={6}>
                    <Form.Item
                      label = {"Challan No"}
                      name={`challan_no_${index}`}
                      validateStatus={
                        errors[`challan_no_${index}`]
                          ? "error"
                          : ""
                      }
                      required = {true}
                      help={
                        errors[`challan_no_${index}`] &&
                        errors[`challan_no_${index}`].message
                      }
                      wrapperCol={{ sm: 24 }}
                    >
                        <Controller
                          control={control}
                          name={`challan_no_${index}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Challan number"
                            />
                          )}
                        />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label = {"Receive quantity"}
                      name={`receive_quantity_${index}`}
                      validateStatus={
                        errors[`receive_quantity_${index}`]
                          ? "error"
                          : ""
                      }
                      required = {true}
                      help={
                        errors[`receive_quantity_${index}`] &&
                        errors[`receive_quantity_${index}`].message
                      }
                      wrapperCol={{ sm: 24 }}
                    >
                        <Controller
                          control={control}
                          name={`receive_quantity_${index}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Receive Quantity"
                            />
                          )}
                        />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      label = {"Receive cartoon"}
                      name={`receive_cartoon_pallet_${index}`}
                      validateStatus={
                        errors[`receive_cartoon_pallet_${index}`]
                          ? "error"
                          : ""
                      }
                      required = {true}
                      help={
                        errors[`receive_cartoon_pallet_${index}`] &&
                        errors[`receive_cartoon_pallet_${index}`].message
                      }
                      wrapperCol={{ sm: 24 }}
                    >
                        <Controller
                          control={control}
                          name={`receive_cartoon_pallet_${index}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              placeholder="Receive cartoon pallet"
                            />
                          )}
                        />
                    </Form.Item>
                  </Col>

                  {challanArray.length > 1 && (
                      <Col span={1}>
                        <Button
                          style={{ marginTop: "1.9rem" }}
                          icon={<DeleteOutlined />}
                          type="primary"
                          onClick={DeleteChallanRow.bind(null, field)}
                          className="flex-none"
                        />
                      </Col>
                    )}

                    {index === challanArray.length - 1 && (
                      <Col span={1}>
                        <Button
                          style={{ marginTop: "1.9rem" }}
                          icon={<PlusOutlined />}
                          type="primary"
                          onClick={AddChallanRow.bind(null, index)}
                          className="flex-none"
                        />
                      </Col>
                    )}

                </Row>
              </>
            )
        }):null}
        
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
}

export default AddYarnReceive;
