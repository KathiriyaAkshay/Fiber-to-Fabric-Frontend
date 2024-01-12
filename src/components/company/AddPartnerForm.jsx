import { useForm, Controller } from "react-hook-form";
import { Form, Input, Button, message, Flex } from "antd";
import { DevTool } from "@hookform/devtools";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPartnerToCompanyRequest } from "../../api/requests/company";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const addPartnerSchemaResolver = yupResolver(
  yup.object().shape({
    first_name: yup.string().required("Please enter first name"),
    last_name: yup.string().required("Please enter last name"),
    ratio: yup.string().required("Please enter ratio"),
    capital: yup.string().required("Please enter capital"),
  })
);

const AddPartnerForm = ({ companyDetails }) => {
  const queryClient = useQueryClient();

  const { mutateAsync: addPartner } = useMutation({
    mutationFn: async (data) => {
      const res = await addPartnerToCompanyRequest(data);
      return res?.data;
    },
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries(["company", "list"]);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      company_id: companyDetails.id,
      type: "PARTNER",
    },
    resolver: addPartnerSchemaResolver,
  });

  async function onSubmit(data) {
    await addPartner(data);
    reset();
  }

  return (
    <>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <h2>Add</h2>
        <Flex gap={10} justify="space-between" align="center">
          <Form.Item
            // className="w-full"
            label="First Name"
            name="first_name"
            validateStatus={errors.first_name ? "error" : ""}
            help={errors.first_name && errors.first_name.message}
          >
            <Controller
              control={control}
              name="first_name"
              render={({ field }) => (
                <Input {...field} placeholder="First Name" />
              )}
            />
          </Form.Item>

          <Form.Item
            // className="w-full"
            label="Last Name"
            name="last_name"
            validateStatus={errors.last_name ? "error" : ""}
            help={errors.last_name && errors.last_name.message}
          >
            <Controller
              control={control}
              name="last_name"
              render={({ field }) => (
                <Input {...field} placeholder="Last Name" />
              )}
            />
          </Form.Item>
          {/* </Flex>
        <Flex gap={10} justify="space-between"> */}
          <Form.Item
            // className="w-full"
            label="Ratio"
            name="ratio"
            validateStatus={errors.ratio ? "error" : ""}
            help={errors.ratio && errors.ratio.message}
          >
            <Controller
              control={control}
              name="ratio"
              render={({ field }) => (
                <Input {...field} placeholder="75" type="number" min={0} />
              )}
            />
          </Form.Item>

          <Form.Item
            // className="w-full"
            label="Capital"
            name="capital"
            validateStatus={errors.capital ? "error" : ""}
            help={errors.capital && errors.capital.message}
          >
            <Controller
              control={control}
              name="capital"
              render={({ field }) => (
                <Input {...field} placeholder="50000" type="number" min={0} />
              )}
            />
          </Form.Item>
        </Flex>
        <Button type="primary" htmlType="submit">
          Add
        </Button>
      </Form>
      <DevTool control={control} />
    </>
  );
};

export default AddPartnerForm;
