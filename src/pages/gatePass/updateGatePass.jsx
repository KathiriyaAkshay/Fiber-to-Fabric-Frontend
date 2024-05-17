import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { getGatePassByIdRequest, updateGatePassRequest } from "../../api/requests/gatePass";
import dayjs from "dayjs";
  
const { TextArea } = Input;

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    person_name: yup.string().required("Please enter person name."),
    company_name: yup.string().required("Please enter company name."),
    address: yup.string().required("Please enter address."),
    date: yup.string().required("Please enter date."),
  })
);

const UpdateGatePass = () => {
  // const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { gatePassId: id } = params;
  const [formArray, setFormArray] = useState([0]);
  function goBack() {
    navigate(-1);
  }

  const { companyId } = useContext(GlobalContext);

  const { data: gatePassDetail } = useQuery({
    queryKey: ["gatePassDetail", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getGatePassByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateGatePass } = useMutation({
    mutationFn: async (data) => {
      const res = await updateGatePassRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["gate", "pass", "update", id],
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
    const newData = {
      person_name: data.person_name,
      company_name: data.company_name,
      address: data.address,
      gate_pass_date: dayjs(data.date).format("YYYY-MM-DD"),
      is_returnable: data.is_returnable,
      status: "pending",
      gate_pass_details: formArray.map((field) => {
        return {
          particular: data[`particular_${field}`],
          piece: parseInt(data[`piece_${field}`]),
          quality: parseInt(data[`quality_${field}`]),
          problem_in_material: data[`problem_in_material_${field}`],
        };
      }),
    };

    await updateGatePass(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    clearErrors,
    reset,
    setError,
  } = useForm({
    defaultValues: {
      person_name: "",
      company_name: null,
      address: "",
      date: null,
      is_returnable: true,
    },
    resolver: addYSCSchemaResolver,
  });

  const addNewRow = (indexValue) => {
    let isValid = true;

    formArray.forEach((item) => {
      clearErrors(`sr_no_${item}`);
      clearErrors(`particular_${item}`);
      clearErrors(`piece_${item}`);
      clearErrors(`quality_${item}`);
      clearErrors(`problem_in_material_${item}`);
    });

    formArray.forEach((item, index) => {
      if (index === indexValue) {
        if (!getValues(`particular_${index}`)) {
          setError(`particular_${index}`, {
            type: "manual",
            message: "Please enter particular",
          });
          isValid = false;
        }
        if (!getValues(`piece_${index}`)) {
          setError(`piece_${index}`, {
            type: "manual",
            message: "Please enter piece.",
          });
          isValid = false;
        }
        if (!getValues(`quality_${index}`)) {
          setError(`quality_${index}`, {
            type: "manual",
            message: "Please enter quality.",
          });
          isValid = false;
        }
        if (!getValues(`problem_in_material_${index}`)) {
          setError(`problem_in_material_${index}`, {
            type: "manual",
            message: "Please enter problem in material.",
          });
          isValid = false;
        }
      }
    });

    if (isValid) {
      const nextValue = formArray.length;
      setFormArray((prev) => {
        return [...prev, nextValue];
      });
    }
  };

  const deleteRow = (field) => {
    const newFields = [...formArray];
    newFields.splice(field, 1);
    setFormArray(newFields);
  };

  useEffect(() => {
    if (gatePassDetail) {
      const {
        person_name,
        company_name,
        address,
        gate_pass_date,
        gate_pass_details
      } = gatePassDetail.gatePass;
      setFormArray(() => {
        return gate_pass_details.map((item, index) => index + 1);
      })
      let gatePassDetails = {};
      gate_pass_details.forEach((item, index) => {
        gatePassDetails[`particular_${index+1}`] = item.particular;
        gatePassDetails[`piece_${index+1}`] = item.piece;
        gatePassDetails[`quality_${index+1}`] = item.quality;
        gatePassDetails[`problem_in_material_${index+1}`] = item.problem_in_material;
      })
      reset({
        person_name,
        company_name,
        address,
        date: dayjs(gate_pass_date),
        ...gatePassDetails
      });
      
    }
  }, [gatePassDetail, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Gate Pass</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          {/* <Col span={2}>
            <Form.Item
              label="Sr No."
              name="sr_no"
              validateStatus={errors.sr_no ? "error" : ""}
              help={errors.sr_no && errors.sr_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="sr_no"
                render={({ field }) => <Input {...field} placeholder="1" />}
              />
            </Form.Item>
          </Col> */}

          <Col span={4}>
            <Form.Item
              label="Person Name"
              name="person_name"
              validateStatus={errors.person_name ? "error" : ""}
              help={errors.person_name && errors.person_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="person_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Person Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Company Name"
              name="company_name"
              validateStatus={errors.company_name ? "error" : ""}
              help={errors.company_name && errors.company_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Company Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item
              label="Date"
              name="date"
              validateStatus={errors.date ? "error" : ""}
              help={errors.date && errors.date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker {...field} style={{ width: "100%" }} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Address"
              name="address"
              validateStatus={errors.address ? "error" : ""}
              help={errors.address && errors.address.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="address"
                render={({ field }) => (
                  <TextArea {...field} placeholder="Address" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider />
        {formArray.length
          ? formArray.map((field, index) => {
              return (
                <Row
                  key={field + "_field_warping"}
                  gutter={18}
                  style={{
                    padding: "12px",
                  }}
                >
                  {/* <Col span={2}>
                    <Form.Item
                      label="Sr No."
                      name={`sr_no_${field}`}
                      validateStatus={errors[`sr_no_${field}`] ? "error" : ""}
                      help={
                        errors[`sr_no_${field}`] &&
                        errors[`sr_no_${field}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`sr_no_${field}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="1" />
                        )}
                      />
                    </Form.Item>
                  </Col> */}

                  <Col span={4}>
                    <Form.Item
                      label="Particular"
                      name={`particular_${field}`}
                      validateStatus={
                        errors[`particular_${field}`] ? "error" : ""
                      }
                      help={
                        errors[`particular_${field}`] &&
                        errors[`particular_${field}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`particular_${field}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="Particular" />
                        )}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      label="PIS"
                      name={`piece_${field}`}
                      validateStatus={errors[`piece_${field}`] ? "error" : ""}
                      help={
                        errors[`piece_${field}`] &&
                        errors[`piece_${field}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`piece_${field}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="Piece" />
                        )}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={3}>
                    <Form.Item
                      label="Quality"
                      name={`quality_${field}`}
                      validateStatus={errors[`quality_${field}`] ? "error" : ""}
                      help={
                        errors[`quality_${field}`] &&
                        errors[`quality_${field}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`quality_${field}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="Quality" />
                        )}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={2}>
                    {formArray.length > 1 && (
                      <Button
                        style={{ marginTop: "1.9rem" }}
                        icon={<DeleteOutlined />}
                        type="primary"
                        onClick={deleteRow.bind(null, field)}
                        className="flex-none"
                      />
                    )}

                    {index === formArray.length - 1 && (
                      <Button
                        style={{ marginTop: "1.9rem", marginLeft: "1rem" }}
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={addNewRow.bind(null, index)}
                        className="flex-none"
                      />
                    )}
                  </Col>

                  <Col span={4}>
                    <Form.Item
                      label="Problem in Material"
                      name={`problem_in_material_${field}`}
                      validateStatus={
                        errors[`problem_in_material_${field}`] ? "error" : ""
                      }
                      help={
                        errors[`problem_in_material_${field}`] &&
                        errors[`problem_in_material_${field}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                    >
                      <Controller
                        control={control}
                        name={`problem_in_material_${field}`}
                        render={({ field }) => <Input {...field} />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              );
            })
          : null}
        <Flex justify="flex-end">
          <div style={{ border: "1px solid #ccc", padding: 10 }}>
            <Controller
              control={control}
              name="is_returnable"
              render={({ field }) => (
                <Checkbox checked={field.value} {...field} />
              )}
            />
            &nbsp;&nbsp;Returnable
          </div>
        </Flex>
        <Flex gap={10} justify="flex-end" style={{ marginTop: "1rem" }}>
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  )
}

export default UpdateGatePass