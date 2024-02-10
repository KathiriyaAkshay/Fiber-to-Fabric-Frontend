import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addYarnStockCompanyRequest } from "../../../api/requests/yarnStock";
import { getCompanyListRequest } from "../../../api/requests/company";
import { useBrokerList } from "../../../hooks/userMaster";

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    yarn_company_name: yup.string().required("Please enter yarn company name"),
    yarn_type: yup.string().required("Please enter yarn type"),
    yarn_Sub_type: yup.string(),
    luster_type: yup.string().required("Please enter luster type"),
    yarn_color: yup.string().required("Please enter yarn color"),
    yarn_count: yup.string(),
    yarn_denier: yup.string().required("Please enter yarn denier"),
    filament: yup.string().required("Please enter filament"),
    hsn_no: yup.string().required("Please enter HSN No"),
    avg_daily_stock: yup.string().required("Please enter average daily stock"),
    stock_date: yup.string().required("Please enter stock date"),
    company_id: yup.string().required("Please enter company id"),
  })
);

function AddYarnStockCompany() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  function goBack() {
    navigate(-1);
  }

  const { data: companyListRes } = useQuery({
    queryKey: ["company", "list"],
    queryFn: async () => {
      const res = await getCompanyListRequest({});
      return res.data?.data;
    },
  });

  const companyId = companyListRes?.rows?.[0]?.id;

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } =
    useBrokerList(companyId);

  const { mutateAsync: addYSC } = useMutation({
    mutationFn: async (data) => {
      const res = await addYarnStockCompanyRequest({
        data,
      });
      return res.data;
    },
    mutationKey: ["yarn-stock", "company", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "yarn-stock",
        "company",
        "list",
        companyId,
      ]);
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
    await addYSC({ ...data, company_id: companyId });
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: addYSCSchemaResolver,
  });

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h2 className="m-0">Add New Yarn Company</h2>
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
              label="Company Name"
              name="yarn_company_name"
              validateStatus={errors.yarn_company_name ? "error" : ""}
              help={
                errors.yarn_company_name && errors.yarn_company_name.message
              }
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_company_name"
                render={({ field }) => (
                  <Input {...field} placeholder="Company Name" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Yarn/Fiber Type"
              name="broker_ids"
              validateStatus={errors.broker_ids ? "error" : ""}
              help={errors.broker_ids && errors.broker_ids.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="broker_ids"
                render={({ field }) => (
                  <Select
                    allowClear
                    placeholder="Select Yarn Company Type"
                    loading={isLoadingBrokerList}
                    {...field}
                    options={brokerUserListRes?.brokerList?.rows?.map(
                      (broker) => ({
                        label: broker.first_name + " " + broker.last_name,
                        value: broker.id,
                      })
                    )}
                  />
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

export default AddYarnStockCompany;
