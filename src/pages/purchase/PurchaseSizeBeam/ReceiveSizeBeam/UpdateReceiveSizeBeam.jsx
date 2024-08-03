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
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import { updateReceiveSizeBeamRequest } from "../../../../api/requests/purchase/purchaseSizeBeam";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import { BEAM_TYPE_OPTION_LIST } from "../../../../constants/orderMaster";
import moment from "moment/moment";
import { getReceiveSizeBeamOrderRequest } from "../../../../api/requests/purchase/yarnReceive";
import UpdateSizeBeamDetail from "../../../../components/purchase/PurchaseSizeBeam/ReceiveSizeBeam/UpdateSizeBeamDetails";
import { getSizeBeamOrderByIdRequest } from "../../../../api/requests/orderMaster";
import { getLastBeamNumberRequest } from "../../../../api/requests/orderMaster";

const addReceiveSizeBeamSchemaResolver = yupResolver(
  yup.object().shape({
    receive_date: yup.string().required("Please select Date"),
    beam_details: yup.array().of(
      yup.object().shape({
        ends_or_tars: yup.string().required("Please enter ends of tars"),
        tpm: yup.string().required("Please enter tpm"),
        meters: yup.string().notRequired(),
        pano: yup.string().required("Please enter pano"),
      })
    ),
  })
);

function UpdateReceiveSizeBeam() {
  const params = useParams();
  const { id } = params;

  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);

  const [totalMeter, setTotalMeter] = useState(0);
  const [remaingMeter, setRemaingMeter] = useState(0);
  const [pendingMeter, setPendingMeter] = useState(0);

  const queryClient = useQueryClient();

  // Machine dropdown list
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

  // InHouse Quality dropdown list 
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

  // Particular receive size beam order information
  const { data: receiveSizeBeamDetails } = useQuery({
    queryKey: ["order-master/recive-size-beam/get", id],
    queryFn: async () => {
      const res = await getReceiveSizeBeamOrderRequest({
        id,
        params: { company_id: companyId }
      })
      return res?.data?.data;
    },
    enabled: Boolean(companyId)
  })

  // Update size beam request handler ==========================================================

  const { mutateAsync: updateReceiveSizeBeam } = useMutation({
    mutationFn: async (data) => {
      setLoading(true);
      const res = await updateReceiveSizeBeamRequest({
        id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["order-master/recive-size-beam/create"],
    onSuccess: (res) => {
      setLoading(false);
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
      setLoading(false);
      mutationOnErrorHandler({ error, message });
    },
  });

  async function onSubmit(data) {
    delete data?.supplier_name;
    delete data?.supplier_company;

    let beamData = data?.beam_details?.map((element) => {
      return { ...element, size_beam_order_detail_id: receiveSizeBeamDetails?.size_beam_order_id }
    })

    let tempRemaingMeter = Number(totalMeter) - Number(pendingMeter) ; 
    if (tempRemaingMeter <0 ){
      tempRemaingMeter = 0 ;
    }

    let requestData = {
      "size_beam_order_id": receiveSizeBeamDetails?.size_beam_order_id,
      "quality_id": receiveSizeBeamDetails?.quality_id,
      "supplier_id": receiveSizeBeamDetails?.supplier_id,
      "challan_no": receiveSizeBeamDetails?.challan_no,
      "beam_type": receiveSizeBeamDetails?.beam_type,
      "receive_date": data?.receive_date,
      "total_meter": totalMeter,
      "remaining_meter": tempRemaingMeter,
      "machine_name": receiveSizeBeamDetails?.machine_name,
      "beam_details": beamData
    };

    await updateReceiveSizeBeam(requestData);

  }

  // Update data handler ========================================================================

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues
  } = useForm({
    resolver: addReceiveSizeBeamSchemaResolver,
    defaultValues: {
      receive_date: dayjs(),
    },
  });

  const { size_beam_order_id, beam_type } = watch();
  const [totalOrderBeam, setTotalOrderBeam] = useState(0);

  // Get particular size beam order information 
  const { data: sizeBeamOrderListRes, isLoading: isLoadingSizeBeamOrderList } =
    useQuery({
      queryKey: [
        "order-master",
        "size-beam-order",
        "get",
        size_beam_order_id,
        { company_id: companyId },
      ],
      queryFn: async () => {
        const res = await getSizeBeamOrderByIdRequest({
          id: size_beam_order_id,
          params: {
            company_id: companyId,
          },
        });
        setTotalOrderBeam(res?.data?.data?.size_beam_order_details?.length);
        return res.data?.data;
      },
      enabled: Boolean(companyId && size_beam_order_id),
    });

  // Get last beam number information 
  const pasarela_primary_beam = "PBN";
  const non_pasarela_primary_beam = "PBN";
  const secondary_beam = "SPBN";

  const { data: lastBeamNo } = useQuery({
    queryKey: [
      "last",
      "beamNo",
      { company_id: companyId, beam_type: beam_type },
    ],
    queryFn: async () => {
      const res = await getLastBeamNumberRequest({
        companyId,
        params: { company_id: companyId, beam_type: beam_type },
      });
      return res?.data?.data;
    },
    enabled: Boolean(companyId && beam_type),
  });

  const [appendLastBeamNumber, setAppendLastBeamNumber] = useState(null);
  const [appendBeamType, setAppendBeamType] = useState(null);

  useEffect(() => {
    if (beam_type !== undefined) {
      let beam = lastBeamNo;
      let beamType = null;
      let lastNumber = 1;

      if (beam == null) {
        if (beam_type == "pasarela(primary)") {
          beamType = pasarela_primary_beam;
        } else if (beam_type == "non pasarela (primary)") {
          beamType = non_pasarela_primary_beam;
        } else {
          beamType = secondary_beam;
        }
      } else {
        let beam_part = String(beam).split("-");
        beamType = beam_part[0];
        setAppendBeamType(beamType);

        lastNumber = parseInt(beam_part[1]);
        setAppendLastBeamNumber(lastNumber);
      };
    }
  }, [beam_type])

  useEffect(() => {
    if (receiveSizeBeamDetails) {

      let temp = [];

      receiveSizeBeamDetails?.recieve_size_beam_details?.map((element) => {
        let value = {
          ends_or_tars: element?.ends_or_tars,
          grade: element?.grade,
          meters: element?.meters,
          pano: element?.pano,
          remark: element?.remark || "",
          beam_no: element?.beam_no,
          taka: element?.taka,
          net_weight: element?.net_weight,
          tpm: element?.tpm,
          supplier_beam_no: element?.supplier_beam_no
        };
        temp.push(value);
      });

      reset({
        size_beam_order_id: receiveSizeBeamDetails?.size_beam_order_id,
        quality_id: receiveSizeBeamDetails?.inhouse_quality?.id,
        machine_name: receiveSizeBeamDetails?.machine_name,
        challan_no: receiveSizeBeamDetails?.challan_no,
        beam_type: receiveSizeBeamDetails?.beam_type,
        beam_details: temp,
        supplier_name: receiveSizeBeamDetails?.supplier?.supplier?.supplier_name,
        supplier_company: receiveSizeBeamDetails?.supplier?.supplier?.supplier_company
      });

      setRemaingMeter(receiveSizeBeamDetails?.remaining_meter);
      setTotalMeter(receiveSizeBeamDetails?.total_meter);

    }
  }, [receiveSizeBeamDetails, reset])

  function disabledDate(current) {
    if (current && current > moment().endOf('day')) {
      return true;
    }
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Update Receive size beam</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

        <Flex className="mt-3" gap={20}>
          <Flex>
            <div className="font-weight-bold">Total meter: {receiveSizeBeamDetails?.total_meter}</div>
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
              name="order_no"
              validateStatus={errors.order_no ? "error" : ""}
              help={
                errors.order_no && errors.order_no.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="order_no"
                disabled
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select size beam order"
                    loading={isLoadingSizeBeamOrderList}
                    value={sizeBeamOrderListRes?.order_no || "100"}
                    options={sizeBeamOrderListRes?.SizeBeamOrderList?.map(
                      ({ order_no = "", id = "", total_meters = 0 }) => {
                        return {
                          label: order_no,
                          value: order_no,
                          total_meter: total_meters
                        };
                      }
                    )}
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
                disabled
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
              name="machine_name"
              validateStatus={errors.machine_name ? "error" : ""}
              help={errors.machine_name && errors.machine_name.message}
              required={true}
            >
              <Controller
                control={control}
                name="machine_name"
                // disabled
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine Name"
                    allowClear
                    disabled
                    loading={isLoadingMachineList}
                    options={machineListRes?.rows?.map((machine) => ({
                      label: machine?.machine_name,
                      value: machine?.machine_name,
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
              disabled
              validateStatus={errors.challan_no ? "error" : ""}
              help={errors.challan_no && errors.challan_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_no"
                render={({ field }) => (
                  <Input {...field} readOnly />
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
                disabled
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

        {!isLoadingSizeBeamOrderList && appendBeamType !== null && appendLastBeamNumber !== null && (
          <UpdateSizeBeamDetail
            control={control}
            errors={errors}
            appendBeamType={appendBeamType}
            appendLastBeamNumber={appendLastBeamNumber}
            setAppendLastBeamNumber={setAppendLastBeamNumber}
            sizeBeamOrderListRes={totalOrderBeam}
            totalMeter={totalMeter}
            setPendingMeter={setPendingMeter}
            getValues={getValues}
            setValue={setValue}
          />
        )}

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
}

export default UpdateReceiveSizeBeam;
