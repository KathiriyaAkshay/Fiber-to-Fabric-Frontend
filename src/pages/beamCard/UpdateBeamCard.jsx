import { ArrowLeftOutlined } from "@ant-design/icons";
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
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import { getBrokerListRequest } from "../../api/requests/users";
// import { useCurrentUser } from "../../../../api/hooks/auth";
import { addJobTakaRequest } from "../../api/requests/job/jobTaka";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import dayjs from "dayjs";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    machine_name: yup.string().required("Please select machine name."),
    machine_no: yup.string().required("Please select machine no."),
    beam_type: yup.string().required("Please enter beam type."),
    quality_id: yup.string().required("Please select quality."),
    beam_no: yup.string().required("Please select beam no."),
    taka: yup.string().required("Please enter taka."),
    meter: yup.string().required("Please enter meter."),
    peak: yup.string().required("Please enter peak."),
    read: yup.string().required("Please enter read."),
    pano: yup.string().required("Please enter pano."),
    tar: yup.string().required("Please enter tar."),
    date: yup.string().required("Please enter date."),
    time: yup.string().required("Please enter time."),
    remark: yup.string().required("Please enter remark."),
  })
);

const UpdateBeamCard = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  const { id } = params;

  const navigate = useNavigate();
  //   const { data: user } = useCurrentUser();
  const { companyId, company } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  //   const { data: beamCardDetails } = useQuery({
  //     queryKey: ["yarnSentDetail", "get", id, { company_id: companyId }],
  //     queryFn: async () => {
  //       const res = await getJobTakaByIdRequest({
  //         id,
  //         params: { company_id: companyId },
  //       });
  //       return res.data?.data;
  //     },
  //     enabled: Boolean(companyId),
  //   });

  const { mutateAsync: updateNewBeam, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addJobTakaRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["job", "taka", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["jobTaka", "list", companyId]);
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
    // const newData = {
    //   delivery_address: data.delivery_address,
    //   gst_state: data.gst_state,
    //   gst_in: data.gst_in,
    //   challan_no: data.challan_no,
    //   gray_order_id: data.gray_order_id,
    //   supplier_id: data.supplier_id,
    //   broker_id: data.broker_id,
    //   quality_id: data.quality_id,
    //   total_meter: parseInt(data.total_meter),
    //   total_weight: parseInt(data.total_weight),
    //   pending_meter: parseInt(data.pending_meter),
    //   pending_weight: parseInt(data.pending_weight),
    //   pending_taka: parseInt(data.pending_taka),
    //   total_taka: parseInt(data.total_taka),
    //   is_grey: data.is_grey,
    //   job_challan_detail: fieldArray.map((field) => {
    //     return {
    //       taka_no: parseInt(data[`taka_no_${field}`]),
    //       meter: parseInt(data[`meter_${field}`]),
    //       weight: parseInt(data[`weight_${field}`]),
    //     };
    //   }),
    // };
    console.log({ data });
    // await AddJobTaka(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      machine_name: null,
      machine_no: null,
      beam_type: "Primary (Advance Beam)",
      broker_id: null,
      quality_id: null,
      beam_no: null,
      company_name: "",
      taka: "",
      meter: "",
      peak: "",
      read: "",
      pano: "",
      tar: "",
      date: dayjs(),
      time: dayjs(),
      remark: "",
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { machine_name } = watch();
  // ------------------------------------------------------------------------------------------

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const { data: dropDownQualityListRes, dropDownQualityLoading } = useQuery({
    queryKey: [
      "dropDownQualityListRes",
      "list",
      {
        company_id: companyId,
        machine_name: machine_name,
        page: 0,
        pageSize: 99999,
        is_active: true,
      },
    ],
    queryFn: async () => {
      if (machine_name) {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            machine_name: machine_name,
            page: 0,
            pageSize: 99999,
            is_active: true,
          },
        });
        return res.data?.data;
      } else {
        return { row: [] };
      }
    },
    enabled: Boolean(companyId),
  });

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    company && setValue("company_name", company.company_name);
  }, [company, setValue]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Beam</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12}>
            <Form.Item
              label="Machine Name"
              name="machine_name"
              validateStatus={errors.machine_name ? "error" : ""}
              help={errors.machine_name && errors.machine_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine Name"
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

          <Col span={6}>
            <Form.Item
              label="Beam Type"
              name="beam_type"
              validateStatus={errors.beam_type ? "error" : ""}
              help={errors.beam_type && errors.beam_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="beam_type"
                render={({ field }) => {
                  return <Input {...field} placeholder="Beam Type" />;
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Machine No"
              name="machine_no"
              validateStatus={errors.machine_no ? "error" : ""}
              help={errors.machine_no && errors.machine_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machine_no"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine No"
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
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12}>
            <Form.Item
              label="Select Quality"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Quality"
                      loading={dropDownQualityLoading}
                      options={
                        dropDownQualityListRes &&
                        dropDownQualityListRes?.rows?.map((item) => ({
                          value: item.id,
                          label: item.quality_name,
                        }))
                      }
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Beam No"
              name="beam_no"
              validateStatus={errors.beam_no ? "error" : ""}
              help={errors.beam_no && errors.beam_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="beam_no"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingBrokerList}
                    placeholder="Select Beam No"
                    options={brokerUserListRes?.brokerList?.rows?.map(
                      (broker) => ({
                        label:
                          broker.first_name +
                          " " +
                          broker.last_name +
                          " " +
                          `| (${broker?.username})`,
                        value: broker.id,
                      })
                    )}
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
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12}>
            <Form.Item
              label="Company Name"
              name="company_name"
              validateStatus={errors.company_name ? "error" : ""}
              help={errors.company_name && errors.company_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_name"
                render={({ field }) => <Input {...field} disabled />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Taka"
              name="taka"
              validateStatus={errors.taka ? "error" : ""}
              help={errors.taka && errors.taka.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="taka"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Meter"
              name="meter"
              validateStatus={errors.meter ? "error" : ""}
              help={errors.meter && errors.meter.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="meter"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Peak"
              name="peak"
              validateStatus={errors.peak ? "error" : ""}
              help={errors.peak && errors.peak.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="peak"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Read"
              name="read"
              validateStatus={errors.read ? "error" : ""}
              help={errors.read && errors.read.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="read"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Pano"
              name="pano"
              validateStatus={errors.pano ? "error" : ""}
              help={errors.pano && errors.pano.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="pano"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Tar"
              name="tar"
              validateStatus={errors.tar ? "error" : ""}
              help={errors.tar && errors.tar.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="tar"
                render={({ field }) => <Input {...field} placeholder="12" />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Date"
              name="date"
              validateStatus={errors.date ? "error" : ""}
              help={errors.date && errors.date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    format={"DD-MM-YYYY"}
                    style={{ width: "100%" }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Time"
              name="time"
              validateStatus={errors.time ? "error" : ""}
              help={errors.time && errors.time.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="time"
                render={({ field }) => (
                  <TimePicker {...field} style={{ width: "100%" }} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Remark"
              name="remark"
              validateStatus={errors.remark ? "error" : ""}
              help={errors.remark && errors.remark.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="remark"
                render={({ field }) => (
                  <Input {...field} placeholder="remark" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Create
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default UpdateBeamCard;
