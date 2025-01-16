import { useNavigate } from "react-router-dom";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import {
  createWastageSaleReportRequest,
  getDropdownParticularWastageListRequest,
} from "../../../../api/requests/reports/wastageSaleReport";

const addWastageSalesReportSchemaResolver = yupResolver(
  yup.object().shape({
    particular: yup.string().required("Please select particular"),
    particular_type: yup.string().required("Please select particular type"),
    pis: yup.string().required("Please enter pis"),
    rate_par_pis: yup.string().required("Please enter rate per pis"),
    total: yup.string(),
    notes: yup.string(),
  })
);

function AddWastageSalesReport() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [numOfFields, setNumOfFields] = useState([0]);

  const {
    data: particularWastageListRes,
    isLoading: isLoadingParticularWastageList,
  } = useQuery({
    queryKey: ["dropdown/particular_wastage/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownParticularWastageListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.particularWastageList;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: createWastageSalesReport } = useMutation({
    mutationFn: async (data) => {
      const res = await createWastageSaleReportRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["reports/wastage-sale-report/create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["reports", "list", companyId]);
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

  function goBack() {
    navigate(-1);
  }

  async function onSubmit(data) {
    const payload = numOfFields.map((item) => {
      return {
        particular: data[`particular_${item}`],
        particular_type: data[`particular_type_${item}`],
        notes: data[`notes_${item}`],
        pis: data[`pis_${item}`],
        rate_par_pis: data[`rate_par_pis_${item}`],
        total: data[`total_${item}`],
      };
    });
    await createWastageSalesReport(payload);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    resetField,
    getValues,
  } = useForm({
    resolver: addWastageSalesReportSchemaResolver,
    defaultValues: {},
  });

  const { particular, rate_par_pis, pis } = watch();

  useEffect(() => {
    if (pis && rate_par_pis) {
      const total = Number(pis) * Number(rate_par_pis);
      setValue("total", Math.max(0, total));
    }
  }, [pis, rate_par_pis, setValue]);

  const resetEntry = (fieldNo) => {
    resetField(`particular_${fieldNo}`, "");
    resetField(`particular_type_${fieldNo}`, "");
    resetField(`pis_${fieldNo}`, "");
    resetField(`rate_par_pis_${fieldNo}`, "");
    resetField(`total_${fieldNo}`, "");
    resetField(`notes_${fieldNo}`, "");
  };

  const addNewEntry = (currentField) => {
    const particular = getValues(`particular_${currentField}`);
    const particularType = getValues(`particular_type_${currentField}`);
    const pis = getValues(`pis_${currentField}`);
    const rateParPis = getValues(`rate_par_pis_${currentField}`);
    const total = getValues(`total_${currentField}`);
    const notes = getValues(`notes_${currentField}`);

    if (
      !particular ||
      !particularType ||
      !pis ||
      !rateParPis ||
      !total ||
      !notes
    ) {
      message.error("Please fill all fields.");
      return;
    }

    let nextNo = numOfFields[numOfFields.length - 1] + 1;
    setNumOfFields((prev) => {
      return [...prev, nextNo];
    });
    resetEntry(nextNo);
  };

  const removeNewEntry = (removeField) => {
    setNumOfFields((prev) => {
      return prev.filter((field) => field !== removeField);
    });
    resetEntry(removeField);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Wastage Sales report</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {numOfFields?.map((field) => {
          return (
            <Row
              key={field}
              gutter={18}
              style={{
                padding: "12px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Col span={4}>
                <Form.Item
                  label="Particular"
                  name={`particular_${field}`}
                  validateStatus={errors[`particular_${field}`] ? "error" : ""}
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
                      <Select
                        {...field}
                        placeholder="Select Particular"
                        allowClear
                        loading={isLoadingParticularWastageList}
                        options={particularWastageListRes?.map(
                          ({ particular }) => ({
                            label: particular,
                            value: particular,
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
                  label="Type"
                  name={`particular_type_${field}`}
                  validateStatus={
                    errors[`particular_type_${field}`] ? "error" : ""
                  }
                  help={
                    errors[`particular_type_${field}`] &&
                    errors[`particular_type_${field}`].message
                  }
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`particular_type_${field}`}
                    render={({ field }) => (
                      <Select
                        {...field}
                        placeholder="Select Particular type"
                        allowClear
                        loading={isLoadingParticularWastageList}
                        options={particularWastageListRes
                          ?.find(({ particular: p }) => p === particular)
                          ?.type?.map((type) => ({
                            label: type,
                            value: type,
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
                  label="Pis/KG"
                  name={`pis_${field}`}
                  validateStatus={errors[`pis_${field}`] ? "error" : ""}
                  help={
                    errors[`pis_${field}`] && errors[`pis_${field}`].message
                  }
                  required={true}
                >
                  <Controller
                    control={control}
                    name={`pis_${field}`}
                    render={({ field }) => (
                      <Input {...field} type="number" min={0} step={0.01} />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Rate per Pis/KG/Meter"
                  name={`rate_par_pis_${field}`}
                  validateStatus={
                    errors[`rate_par_pis_${field}`] ? "error" : ""
                  }
                  help={
                    errors[`rate_par_pis_${field}`] &&
                    errors[`rate_par_pis_${field}`].message
                  }
                  required={true}
                >
                  <Controller
                    control={control}
                    name={`rate_par_pis_${field}`}
                    render={({ field }) => (
                      <Input {...field} type="number" min={0} step={0.01} />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item
                  label="Total"
                  name={`total_${field}`}
                  validateStatus={errors[`total_${field}`] ? "error" : ""}
                  help={
                    errors[`total_${field}`] && errors[`total_${field}`].message
                  }
                  required={true}
                >
                  <Controller
                    control={control}
                    name={`total_${field}`}
                    render={({ field }) => (
                      <Input {...field} type="number" min={0} step={0.01} />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Notes"
                  name={`notes_${field}`}
                  validateStatus={errors[`notes_${field}`] ? "error" : ""}
                  help={
                    errors[`notes_${field}`] && errors[`notes_${field}`].message
                  }
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name={`notes_${field}`}
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
              <Col span={2}>
                <Flex gap={12}>
                  {numOfFields.length !== 1 ? (
                    <Button
                      danger
                      onClick={() => removeNewEntry(field)}
                      icon={<DeleteOutlined />}
                    ></Button>
                  ) : null}

                  {field === numOfFields[numOfFields.length - 1] ? (
                    <Button
                      type="primary"
                      onClick={() => addNewEntry(field)}
                      icon={<PlusOutlined />}
                    ></Button>
                  ) : null}
                </Flex>
              </Col>
            </Row>
          );
        })}

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

export default AddWastageSalesReport;
