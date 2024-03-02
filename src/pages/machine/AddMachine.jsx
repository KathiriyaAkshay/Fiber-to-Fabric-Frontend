import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addMachineRequest } from "../../api/requests/machine";
import MachineTypeFields from "../../components/machine/MachineTypeFields";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useContext } from "react";

const addMachineSchemaResolver = yupResolver(
  yup.object().shape({
    machine_type: yup.string().required("Please select machine type"),
    machine_name: yup.string().required("Please select machine name"),
    no_of_machines: yup.string().required("Please enter number of machines"),
    no_of_employees: yup.string().required("please enter number of employees"),
    company_id: yup.string(),
  })
);

function AddMachine() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  const { companyId } = useContext(GlobalContext);

  const { mutateAsync: addMachine } = useMutation({
    mutationFn: async (data) => {
      const res = await addMachineRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["machine", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["machine", "list", companyId]);
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
    await addMachine({ ...data, company_id: companyId });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: addMachineSchemaResolver,
  });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Add New Machine</h3>
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
                  <Input {...field} placeholder="3" type="number" min={0} />
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
                  <Input {...field} placeholder="1" type="number" min={0} />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit">
            Create
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default AddMachine;
