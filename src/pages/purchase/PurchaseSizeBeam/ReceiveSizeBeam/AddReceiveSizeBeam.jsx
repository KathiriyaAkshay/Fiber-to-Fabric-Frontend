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
  TimePicker,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { createReceiveSizeBeamRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import { getSizeBeamOrderListRequest } from "../../../../api/requests/orderMaster";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";

const addReceiveSizeBeamSchemaResolver = yupResolver(
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

function AddReceiveSizeBeam() {
  const { companyId } = useContext(GlobalContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: sizeBeamOrderListRes, isLoading: isLoadingSizeBeamOrderList } =
    useQuery({
      queryKey: [
        "order-master",
        "size-beam-order",
        "list",
        { company_id: companyId },
      ],
      queryFn: async () => {
        const res = await getSizeBeamOrderListRequest({
          params: { company_id: companyId },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: [
        "quality-master/inhouse-quality/list",
        {
          company_id: companyId,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { mutateAsync: createReceiveSizeBeam } = useMutation({
    mutationFn: async (data) => {
      const res = await createReceiveSizeBeamRequest({
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["order-master/recive-size-beam/create"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "order-master/recive-size-beam/list",
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

  async function onSubmit(data) {
    // delete not allowed properties here
    await createReceiveSizeBeam(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: addReceiveSizeBeamSchemaResolver,
    defaultValues: {
      challan_date: dayjs(),
    },
  });

  const { size_beam_order_id } = watch();
  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Add Receive size beam</h3>
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
              label="Order No."
              name="size_beam_order_id"
              validateStatus={errors.size_beam_order_id ? "error" : ""}
              help={
                errors.size_beam_order_id && errors.size_beam_order_id.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="size_beam_order_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select supplier Company"
                    loading={isLoadingSizeBeamOrderList}
                    options={sizeBeamOrderListRes?.SizeBeamOrderList?.map(
                      ({ order_no = "", id = "" }) => {
                        return {
                          label: order_no,
                          value: id,
                        };
                      }
                    )}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Quality"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              required={true}
            >
              <Controller
                control={control}
                name="quality_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Quality"
                    allowClear={true}
                    loading={isLoadingInHouseQualityList}
                    options={inHouseQualityList?.rows?.map(
                      ({ id = 0, quality_name = "" }) => ({
                        label: quality_name,
                        value: id,
                      })
                    )}
                  />
                )}
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
                render={({ field }) => (
                  <Input {...field} disabled={!size_beam_order_id} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Date"
              name="receive_date"
              validateStatus={errors.receive_date ? "error" : ""}
              help={errors.receive_date && errors.receive_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="receive_date"
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
              label="Time"
              name="report_time"
              validateStatus={errors.report_time ? "error" : ""}
              help={errors.report_time && errors.report_time.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="report_time"
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    value={dayjs()}
                    style={{
                      width: "100%",
                    }}
                    format="h:mm:ss A"
                    disabled={true}
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
    </div>
  );
}

export default AddReceiveSizeBeam;
