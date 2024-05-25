import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, DatePicker, Flex, Form, Input, Row, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import {
  getReceiveSizeBeamByIdRequest,
  updateReceiveSizeBeamRequest,
} from "../../../../api/requests/purchase/purchaseSizeBeam";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";

const updateReceiveSizeBeamSchemaResolver = yupResolver(
  yup.object().shape({
    challan_date: yup.string().required("Please select date"),
    lot_no: yup.string().required("Please enter lot no"),
    challan_no: yup.string().required("Please enter lot no"),
    receive_quantity: yup.string().required("Please enter recieve quantity"),
    receive_cartoon_pallet: yup
      .string()
      .required("Please enter receive cartoon/pallet"),
  })
);

function UpdateReceiveSizeBeam() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateReceiveSizeBeam } = useMutation({
    mutationFn: async (data) => {
      const res = await updateReceiveSizeBeamRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["order-master/recive-size-beam/update", id],
    onSuccess: (res) => {
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

  const { data: receiveSizeBeamdetails } = useQuery({
    queryKey: ["order-master/recive-size-beam/get", id],
    queryFn: async () => {
      const res = await getReceiveSizeBeamByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    await updateReceiveSizeBeam(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: updateReceiveSizeBeamSchemaResolver,
  });

  useEffect(() => {
    if (receiveSizeBeamdetails) {
      const {
        challan_date,
        lot_no,
        challan_no,
        receive_quantity,
        receive_cartoon_pallet,
      } = receiveSizeBeamdetails;

      reset({
        challan_date: dayjs(challan_date),
        lot_no,
        challan_no,
        receive_quantity,
        receive_cartoon_pallet,
      });
    }
  }, [receiveSizeBeamdetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Receive size beam</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={8}>
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
                    format="DD-MM-YYYY"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
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

          <Col span={8}>
            <Form.Item
              label="Challan No"
              name="challan_no"
              validateStatus={errors.challan_no ? "error" : ""}
              help={errors.challan_no && errors.challan_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_no"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Receive Quantity"
              name="receive_quantity"
              validateStatus={errors.receive_quantity ? "error" : ""}
              help={errors.receive_quantity && errors.receive_quantity.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="receive_quantity"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Receive Cartoon/pallet"
              name="receive_cartoon_pallet"
              validateStatus={errors.receive_cartoon_pallet ? "error" : ""}
              help={
                errors.receive_cartoon_pallet &&
                errors.receive_cartoon_pallet.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="receive_cartoon_pallet"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
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
    </div>
  );
}

export default UpdateReceiveSizeBeam;
