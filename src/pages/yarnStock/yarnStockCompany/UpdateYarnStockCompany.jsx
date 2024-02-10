import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useEffect } from "react";
import {
  getYarnStockCompanyByIdRequest,
  updateYarnStockCompanyRequest,
} from "../../../api/requests/yarnStock";

const updateYSCSchemaResolver = yupResolver(
  yup.object().shape({
    no_of_employees: yup.string().required("please enter number of employees"),
  })
);

function UpdateYarnStockCompany() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateYSC } = useMutation({
    mutationFn: async (data) => {
      const res = await updateYarnStockCompanyRequest({
        id,
        data,
      });
      return res.data;
    },
    mutationKey: ["yarn-stock", "company", "update", id],
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

  const { data: ysCompanyDetails } = useQuery({
    queryKey: ["yarn-stock", "company", "list", id],
    queryFn: async () => {
      const res = await getYarnStockCompanyByIdRequest({ id });
      return res.data?.data;
    },
  });

  async function onSubmit(data) {
    await updateYSC(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: updateYSCSchemaResolver,
  });

  useEffect(() => {
    if (ysCompanyDetails) {
      const { no_of_employees } = ysCompanyDetails;
      reset({ no_of_employees });
    }
  }, [ysCompanyDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h2 className="m-0">Edit Yarn Company</h2>
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
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default UpdateYarnStockCompany;
