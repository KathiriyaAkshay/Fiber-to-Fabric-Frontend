import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useContext, useEffect } from "react";
import {
  getMachineByIdRequest,
  updateMachineRequest,
} from "../../api/requests/machine";
import MachineTypeFields from "../../components/machine/MachineTypeFields";
import { GlobalContext } from "../../contexts/GlobalContext";

const updateMachineSchemaResolver = yupResolver(
  yup.object().shape({
    // machine_type: yup.string().required("Please select machine type"),
    // machine_name: yup.string().required("Please select machine name"),
    no_of_machines: yup.string().required("Please enter number of machines"),
    no_of_employees: yup.string().required("please enter number of employees"),
    // company_id: yup.string(),
  })
);

function UpdateMachine() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateMachine } = useMutation({
    mutationFn: async (data) => {
      const res = await updateMachineRequest({
        id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["machine", "update", id],
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

  const { data: machineDetails } = useQuery({
    queryKey: ["machine", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getMachineByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.machine;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    await updateMachine(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: updateMachineSchemaResolver,
  });

  useEffect(() => {
    if (machineDetails) {
      const { machine_type, machine_name, no_of_machines, no_of_employees } =
        machineDetails;
      reset({ machine_type, machine_name, no_of_machines, no_of_employees });
    }
  }, [machineDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Machine</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <MachineTypeFields
            errors={errors}
            control={control}
            watch={watch}
            setValue={setValue}
            isUpdate={true}
          />
          <Col span={6}>
            <Form.Item
              label="No of Machine"
              name="no_of_machines"
              validateStatus={errors.no_of_machines ? "error" : ""}
              help={errors.no_of_machines && errors.no_of_machines.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="no_of_machines"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="3"
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
              label="No of Employee"
              name="no_of_employees"
              validateStatus={errors.no_of_employees ? "error" : ""}
              help={errors.no_of_employees && errors.no_of_employees.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="no_of_employees"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="1"
                    type="number"
                    min={0}
                    step={0.01}
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

export default UpdateMachine;
