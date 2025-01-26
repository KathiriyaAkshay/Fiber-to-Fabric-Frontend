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
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import dayjs from "dayjs";
import {
  getBeamCardByIdRequest,
  getLoadedMachineListRequest,
  getPasarelaBeamListRequest,
  updateLoadNewBeamRequest,
} from "../../api/requests/beamCard";
import { getDisplayQualityName } from "../../constants/nameHandler";

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
  const [isDisable, setIsDisable] = useState(false);

  const params = useParams();
  const { id } = params;

  const navigate = useNavigate();
  const { companyId, company } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  const { data: beamCardDetails } = useQuery({
    queryKey: ["beamCardDetails", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getBeamCardByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateNewBeam, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateLoadNewBeamRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["beam", "card", "update"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["beamCard", "list", companyId]);
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
    const newData = {
      // loaded_beam_id: +data.beam_no,
      // machine_name: data.machine_name,
      // beam_type: data.beam_type,
      // machine_no: data.machine_no,
      quality_id: +data.quality_id,
      // pbn_id: data.pbn_id,
      // jbn_id: data.jbn_id,
      // non_pasarela_beam_id: data.non_pasarela_beam_id,
      // load_date: dayjs(data.date).format("YYYY-MM-DD"),
      remark: data.remark,
      // pending_meter: +data.meter,
      peak: +data.peak,
      read: +data.read,
    };
    await updateNewBeam(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      machine_name: null,
      machine_no: null,
      beam_type: "Primary (Advance Beam)",
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

      pbn_id: null,
      jbn_id: null,
      non_pasarela_beam_id: null,
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { machine_name, quality_id } = watch();
  // ------------------------------------------------------------------------------------------

  // const { data: machineListRes, isLoading: isLoadingMachineList } =
  useQuery({
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

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          machine_name: machine_name,
          page: 0,
          pageSize: 99999,
          is_active: 1,
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
              is_active: 1,
            },
          });
          return res.data?.data;
        } else {
          return { row: [] };
        }
      },
      enabled: Boolean(companyId),
    });

  const { data: pasarelaBeamList, isLoading: isLoadingPasarelaBeam } = useQuery(
    {
      queryKey: [
        "pasarela",
        "beam",
        "list",
        { company_id: companyId, machine_name, quality_id },
      ],
      queryFn: async () => {
        if (machine_name && quality_id) {
          const res = await getPasarelaBeamListRequest({
            params: { company_id: companyId, machine_name, quality_id },
          });
          return res.data?.data;
        }
      },
      enabled: Boolean(companyId),
      initialData: { rows: [], machineDetail: {} },
    }
  );

  const { data: loadedMachineList } = useQuery({
    queryKey: [
      "loaded",
      "machine",
      "list",
      { company_id: companyId, machine_name },
    ],
    queryFn: async () => {
      if (machine_name) {
        const res = await getLoadedMachineListRequest({
          params: { company_id: companyId, machine_name },
        });
        return res.data?.data;
      }
    },
    enabled: Boolean(companyId),
    initialData: { rows: [], machineDetail: {} },
  });

  const machineNoOption = useMemo(() => {
    if (loadedMachineList.machineDetail) {
      let array = [];
      for (
        let i = 1;
        i <= loadedMachineList.machineDetail.no_of_machines;
        i++
      ) {
        const isExist = loadedMachineList.rows.find(
          ({ machine_no }) => i === +machine_no
        );
        if (!isExist) {
          array.push(i);
        }
      }
      return array;
    }
  }, [loadedMachineList]);

  // useEffect(() => {
  //   if (beam_no && pasarelaBeamList?.rows.length) {
  //     const selectedBeamNo = pasarelaBeamList.rows.find(
  //       ({ id }) => id === beam_no
  //     );
  //     setValue("non_pasarela_beam_id", selectedBeamNo.non_pasarela_beam_id);
  //     setValue("pbn_id", selectedBeamNo.pbn_id);
  //     setValue("jbn_id", selectedBeamNo.jbn_id);

  //     if (selectedBeamNo.non_pasarela_beam_detail) {
  //       setValue("meter", selectedBeamNo.non_pasarela_beam_detail.meters);
  //       setValue("peak", selectedBeamNo.peak || 0);
  //       setValue("read", selectedBeamNo.read || 0);

  //       setValue("taka", selectedBeamNo.non_pasarela_beam_detail.taka);
  //       setValue("pano", selectedBeamNo.non_pasarela_beam_detail.pano);
  //       setValue("tar", selectedBeamNo.non_pasarela_beam_detail.ends_or_tars);
  //     }
  //     if (selectedBeamNo.job_beam_receive_detail) {
  //       setValue("meter", selectedBeamNo.job_beam_receive_detail.meters);
  //       setValue("peak", selectedBeamNo.peak || 0);
  //       setValue("read", selectedBeamNo.read || 0);

  //       setValue("taka", selectedBeamNo.job_beam_receive_detail.taka);
  //       setValue("pano", selectedBeamNo.job_beam_receive_detail.pano);
  //       setValue("tar", selectedBeamNo.job_beam_receive_detail.ends_or_tars);
  //     }
  //     if (selectedBeamNo.recieve_size_beam_detail) {
  //       setValue("meter", selectedBeamNo.recieve_size_beam_detail.meters);
  //       setValue("peak", selectedBeamNo.peak || 0);
  //       setValue("read", selectedBeamNo.read || 0);

  //       setValue("taka", selectedBeamNo.recieve_size_beam_detail.taka);
  //       setValue("pano", selectedBeamNo.recieve_size_beam_detail.pano);
  //       setValue("tar", selectedBeamNo.recieve_size_beam_detail.ends_or_tars);
  //     }
  //   }
  // }, [pasarelaBeamList, beam_no, setValue]);

  // useEffect(() => {
  //   company && setValue("company_name", company.company_name);
  // }, [company, setValue]);

  useEffect(() => {
    if (beamCardDetails) {
      const {
        id,
        remark,
        peak,
        read,
        company_id,
        quality_id,
        machine_name,
        machine_no,
        createdAt,
        beam_type,
        non_pasarela_beam_detail,
        job_beam_receive_detail,
        recieve_size_beam_detail,

        pbn_id,
        jbn_id,

        non_pasarela_beam_id,
        status,
      } = beamCardDetails.loadedBeam;

      setIsDisable(status !== "pasarela" && status !== "non-pasarela");

      const obj =
        non_pasarela_beam_detail ||
        job_beam_receive_detail ||
        recieve_size_beam_detail;

      reset({
        beam_type,
        machine_name,
        beam_no: id,
        // beam_no: obj.beam_no,
        machine_no,
        remark,
        peak,
        read,
        company_name:
          company && company.id === company_id ? company.company_name : "",
        quality_id,
        date: dayjs(createdAt),

        taka: obj?.taka || 0,
        meter: obj?.meter || obj?.meters || 0,
        pano: obj?.pano || 0,
        tar: obj?.ends_or_tars || 0,

        non_pasarela_beam_id,
        pbn_id,
        jbn_id,
      });
    }
  }, [beamCardDetails, reset, company]);

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
          {/* <Col span={12}>
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
          </Col> */}

          {/* <Col span={6}>
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
          </Col> */}
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
                          label: getDisplayQualityName(item),
                        }))
                      }
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
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
                    disabled
                    loading={isLoadingPasarelaBeam}
                    placeholder="Select Beam No"
                    options={pasarelaBeamList?.rows?.map(({ beam_no, id }) => {
                      return { label: beam_no, value: id };
                    })}
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
                    disabled
                    placeholder="Select Machine No"
                    options={machineNoOption?.map((item) => ({
                      label: item,
                      value: item,
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
            marginTop: -20
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
                render={({ field }) => (
                  <Input {...field} disabled={isDisable} placeholder="12" />
                )}
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
                render={({ field }) => (
                  <Input {...field} disabled={isDisable} placeholder="12" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
            marginTop: -20
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
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="12" />
                )}
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
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="12" />
                )}
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
                render={({ field }) => (
                  <Input {...field} disabled={isDisable} placeholder="12" />
                )}
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
                render={({ field }) => (
                  <Input {...field} disabled={isDisable} placeholder="12" />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row
          gutter={18}
          style={{
            padding: "12px",
            marginTop: -20
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
                    disabled
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
                  <TimePicker {...field} style={{ width: "100%" }} disabled />
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
          <Button type="primary" htmlType="submit" loading={isPending}>
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default UpdateBeamCard;
