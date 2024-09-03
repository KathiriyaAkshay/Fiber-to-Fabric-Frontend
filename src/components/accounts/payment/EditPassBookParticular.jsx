import { CloseOutlined, EditOutlined } from "@ant-design/icons";
import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Select,
  Typography,
} from "antd";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getParticularListRequest,
  updateParticularRequest,
} from "../../../api/requests/accounts/particular";
import { HEAD_OPTIONS } from "../../../constants/account";

const EditPassBookParticular = () => {
  const { companyId } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // get particular list API
  const { data: particularRes } = useQuery({
    queryKey: [
      "dropdown/passbook_particular_type/list",
      { company_id: companyId },
    ],
    queryFn: async () => {
      const res = await getParticularListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateParticular, isPending } = useMutation({
    mutationKey: ["update", "particular"],
    mutationFn: async (data) => {
      const res = await updateParticularRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["company", "list"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      handleCancel();
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const payload = particularRes?.rows?.map((_, index) => {
      return {
        particular_name: data[`particular_name_${index + 1}`],
        head: data[`head_${index + 1}`],
        is_cost_per_meter: data[`is_cost_per_meter_${index + 1}`],
      };
    });

    await updateParticular(payload);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    if (particularRes && particularRes?.rows?.length) {
      let data = {};
      particularRes.rows.forEach((field, index) => {
        const payload = {
          [`particular_name_${index + 1}`]: field.particular_name,
          [`head_${index + 1}`]: field.head,
          [`is_cost_per_meter_${index + 1}`]: field.is_cost_per_meter,
        };

        data = { ...data, ...payload };
      });

      reset({
        ...data,
      });
    }
  }, [particularRes, reset]);

  return (
    <>
      <Button type="primary" onClick={() => setIsModalOpen(true)}>
        <EditOutlined />
      </Button>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Edit Passbook Particular
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
            width: "600px",
            margin: "auto",
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
          },
        }}
      >
        <table className="custom-table">
          <thead>
            <tr>
              <td>No</td>
              <td>Particular</td>
              <td>Head</td>
            </tr>
          </thead>
          <tbody>
            {particularRes && particularRes.rows.length
              ? particularRes?.rows?.map((_, index) => {
                  const fieldNumber = index + 1;
                  return (
                    <tr key={index + "_particular_row"}>
                      <td style={{ textAlign: "center" }}>{index + 1}.</td>
                      <td>
                        <Form.Item
                          name={`particular_name_${fieldNumber}`}
                          validateStatus={
                            errors[`particular_name_${fieldNumber}`]
                              ? "error"
                              : ""
                          }
                          help={
                            errors[`particular_name_${fieldNumber}`] &&
                            errors[`particular_name_${fieldNumber}`].message
                          }
                          wrapperCol={{ sm: 24 }}
                          style={{ margin: 0 }}
                        >
                          <Controller
                            control={control}
                            name={`particular_name_${fieldNumber}`}
                            render={({ field }) => {
                              return <Input {...field} />;
                            }}
                          />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={`head_${fieldNumber}`}
                          validateStatus={
                            errors[`head_${fieldNumber}`] ? "error" : ""
                          }
                          help={
                            errors[`head_${fieldNumber}`] &&
                            errors[`head_${fieldNumber}`].message
                          }
                          wrapperCol={{ sm: 24 }}
                          style={{ margin: 0 }}
                        >
                          <Controller
                            control={control}
                            name={`head_${fieldNumber}`}
                            render={({ field }) => {
                              return (
                                <Select
                                  {...field}
                                  placeholder="Select Head"
                                  options={HEAD_OPTIONS}
                                />
                              );
                            }}
                          />
                        </Form.Item>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
        <Flex gap={10} style={{ marginTop: "1rem" }} justify="flex-end">
          <Button htmlType="button" onClick={handleCancel}>
            Cancel
          </Button>

          <Button
            type="primary"
            htmlType="button"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Save
          </Button>
        </Flex>
      </Modal>
    </>
  );
};

export default EditPassBookParticular;
