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
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { createReceiveSizeBeamRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import { getSizeBeamOrderListRequest } from "../../../../api/requests/orderMaster";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { BEAM_TYPE_OPTION_LIST } from "../../../../constants/orderMaster";
import ReceiveSizeBeamDetail from "../../../../components/purchase/PurchaseSizeBeam/ReceiveSizeBeam/ReceiveSizeBeamDetail";

const addReceiveSizeBeamSchemaResolver = yupResolver(
  yup.object().shape({
    size_beam_order_id: yup.string().required("Please select order"),
    quality_id: yup.string().required("Please select Quality"),
    supplier_id: yup.string().required("Please select supplier"),
    challan_no: yup.string().required("Please enter challan number"),
    beam_type: yup.string().required("Please select Beam type"),
    receive_date: yup.string().required("Please select Date"),
    // total_meter:yup.string().required("Please enter Total meter"),
    // remaining_meter: yup.string().required("Please enter remaining meter"),
    // machine_name: yup.string().required("Please enter machine name"),
    beam_details: yup.array().of(
      yup.object().shape({
        ends_or_tars: yup.string().required("Please enter ends of tars"),
        tpm: yup.string().required("Please enter tpm"),
        // grade: yup.string().required("Please enter grade"),
        meters: yup.string().required("Please enter meters"),
        pano: yup.string().required("Please enter pano"),
        remark: yup.string().optional(),
        beam_no: yup.string().required("Please enter beam no"),
        supplier_beam_no: yup
          .string()
          .required("Please enter supplier beam no"),
        taka: yup.string().required("Please enter taka"),
        net_weight: yup.string().required("Please enter net weight"),
      })
    ),
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

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: [`machine/list/${companyId}`, { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
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
    delete data?.supplier_name;
    delete data?.supplier_company;
    await createReceiveSizeBeam(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: addReceiveSizeBeamSchemaResolver,
    defaultValues: {
      receive_date: dayjs(),
    },
  });

  console.log("errors----->", errors);

  const { size_beam_order_id } = watch();

  useEffect(() => {
    sizeBeamOrderListRes?.SizeBeamOrderList?.forEach(
      ({
        id = 0,
        supplier,
        supplier_id = 0,
        size_beam_order_details,
        total_meters = 0,
      }) => {
        if (id == size_beam_order_id) {
          const { supplier_name = "", supplier_company = "" } = supplier || {};
          setValue("supplier_id", supplier_id);
          setValue("supplier_name", supplier_name);
          setValue("supplier_company", supplier_company);
          setValue("total_meter", total_meters);
          // Naa tme koi value pass Kari do..like total meter j send kari do payload ma
          setValue("remaining_meter", total_meters);
          setValue(
            "beam_details",
            (size_beam_order_details || [])?.map(
              ({
                beam_no,
                ends_or_tars,
                tpm,
                pano,
                taka,
                meters,
                net_weight,
                grade,
              }) => {
                return {
                  beam_no,
                  ends_or_tars,
                  tpm,
                  pano,
                  taka,
                  meters,
                  net_weight,
                  grade,
                };
              }
            )
          );
        }
      }
    );
  }, [setValue, sizeBeamOrderListRes?.SizeBeamOrderList, size_beam_order_id]);
  
  function disabledDate(current) {
    // Disable future dates
    if (current && current > moment().endOf('day')) {
     return true;
    }
  }

  const [pendingMeter, setPendingMeter] = useState(0) ; 
  const [totalMeter, setTotalMeter] = useState(0) ; 

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Add Receive size beam</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

        <Flex className="mt-3" gap={20}>
          <Flex>
            <div className="font-weight-bold">Total meter: {totalMeter}</div>
          </Flex>
          <Flex>
            <div>Pending meter: {pendingMeter}</div>
          </Flex>
        </Flex>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={4}>
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
                    placeholder="Select size beam order"
                    loading={isLoadingSizeBeamOrderList}
                    options={sizeBeamOrderListRes?.SizeBeamOrderList?.map(
                      ({ order_no = "", id = "", total_meters = 0 }) => {
                        return {
                          label: order_no,
                          value: id,
                          total_meter: total_meters
                        };
                      }
                    )}
                    onSelect={(value, option) => {
                      setTotalMeter(option?.total_meter == null?0:option?.total_meter)
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
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

          <Col span={4}>
            <Form.Item
              label="Machine name"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              required={true}
            >
              <Controller
                control={control}
                name="machine_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine Name"
                    allowClear
                    loading={isLoadingMachineList}
                    options={machineListRes?.rows?.map((machine) => ({
                      label: machine?.machine_name,
                      value: machine?.id,
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
              label="Supplier Name"
              name="supplier_name"
              validateStatus={errors.supplier_name ? "error" : ""}
              help={errors.supplier_name && errors.supplier_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => <Input {...field} disabled={true} />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Supplier Company"
              name="supplier_company"
              validateStatus={errors.supplier_company ? "error" : ""}
              help={errors.supplier_company && errors.supplier_company.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_company"
                render={({ field }) => <Input {...field} disabled={true} />}
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
              label="Beam Type"
              name="beam_type"
              validateStatus={errors.beam_type ? "error" : ""}
              help={errors.beam_type && errors.beam_type.message}
              required={true}
            >
              <Controller
                control={control}
                name="beam_type"
                render={({ field }) => (
                  <Select
                    allowClear
                    {...field}
                    options={BEAM_TYPE_OPTION_LIST}
                  />
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
                    disabledDate={disabledDate}
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

        {size_beam_order_id && (
          <ReceiveSizeBeamDetail control={control} errors={errors} />
        )}

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
