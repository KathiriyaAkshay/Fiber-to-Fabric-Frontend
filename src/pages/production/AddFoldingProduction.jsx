import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Button,
  Radio,
  Form,
  Input,
  Select,
  Row,
  Col,
  DatePicker,
  Checkbox,
  Flex,
  Space,
  Divider,
  message,
  Typography,
  Tooltip,
} from "antd";
import {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowUpOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  getEmployeeListRequest,
  getOtherUserListRequest,
} from "../../api/requests/users";
import { useMutation, useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../contexts/GlobalContext";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import {
  getLoadedBeamFromMachineRequest,
  getLoadedMachineListRequest,
} from "../../api/requests/beamCard";
import { USER_ROLES } from "../../constants/userRole";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import _, { debounce } from "lodash";
import { addFoldingProductionRequest } from "../../api/requests/production/foldingProduction";
import { checkUniqueTakaNoRequest } from "../../api/requests/purchase/purchaseTaka";
import { useDebounceCallback } from "../../hooks/useDebounce";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const disableFutureDates = (current) => {
  return current && current > new Date().setHours(0, 0, 0, 0);
};

// const COLUMS = [0, 1, 2, 3, 4];

const getTakaDetailsObject = (details) => {
  if (details) {
    let object =
      details.non_pasarela_beam_detail ||
      details.recieve_size_beam_detail ||
      details.job_beam_receive_detail;

    return object === null || object === undefined
      ? null
      : { ...object, meter: object?.meters || object?.meter };
  }
};

const validationSchema = yupResolver(
  yup.object().shape({
    // grade: yup.string().required(),
    // generate_qr_code: yup.string().required(),
    // auto_taka_generate: yup.string().required(),
    folding_user_id: yup.string().required(),
    machine_name: yup.string().required(),
    machine_no: yup.string().required(),
    taka_no: yup.string().required(),
    quality_id: yup.string().required(),
    beam_no: yup.string().required(),
    beam_load_id: yup.string().required(),
    pending_meter: yup.string().required(),
    createdAt: yup.string().required(),

    //
    weight: yup.string().required(),
    average: yup.string().required(),
    actual_meter: yup.string().required(),
    is_tp: yup.string().required(),
    pis: yup.string().required(),
    notes: yup.string().required(),
  })
);

const AddFoldingProduction = () => {
  const navigate = useNavigate();
  const { companyId /*company*/ } = useContext(GlobalContext);

  const [weightPlaceholder, setWeightPlaceholder] = useState(null);
  const [finalMeter, setFinalMeter] = useState(null);
  const [actualMeterCopy, setActualMeterCopy] = useState(0);
  // const [actualWeight, setActualWeight] = useState(0);

  // ----------------------------------------------------------------------------------------------------------------------------------

  const [fieldArray, setFieldArray] = useState([0, 1, 2]);
  const [isRunningBeamFound, setIsRunningBeamFound] = useState(null);

  const addNewFieldRow = () => {
    const nextValue = fieldArray[fieldArray.length - 1] + 1;

    setValue(`createdAt_${nextValue}_0`, null);
    setValue(`day_meter_${nextValue}_1`, null);
    setValue(`night_meter_${nextValue}_1`, null);

    setValue(`day_meter_${nextValue}_2`, null);
    setValue(`night_meter_${nextValue}_2`, null);

    setValue(`day_meter_${nextValue}_3`, null);
    setValue(`night_meter_${nextValue}_3`, null);

    setValue(`day_meter_${nextValue}_4`, null);
    setValue(`night_meter_${nextValue}_4`, null);

    setFieldArray((prev) => {
      return [...prev, nextValue];
    });
  };

  const deleteFieldRow = (field) => {
    // const newFields = [...fieldArray];
    // console.table("🧑‍💻 || newFields:", newFields);
    // const actualIndex = newFields.indexOf(field);
    // newFields.splice(actualIndex, 1);
    // console.table("🧑‍💻 || newFields:", newFields);
    // setFieldArray(newFields);
    setFieldArray((prev) => prev.filter((item) => item !== field));
  };

  // Add New Production option handler ===================================================================================
  const { mutateAsync: addFoldingProduction, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addFoldingProductionRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "production"],
    onSuccess: (res) => {
      // queryClient.invalidateQueries(["production", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate("/production/inhouse-production");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    let payload = {
      folding_user_id: +data?.folding_user_id,
      machine_name: data.machine_name,
      machine_no: data.machine_no,
      taka_no: String(data.taka_no),
      quality_id: data.quality_id,
      beam_no: data.beam_no,
      beam_load_id: +data.beam_load_id, // running beam id -> take from selected machine no.
      pending_meter: data.pending_meter,
      createdAt: dayjs(data.createdAt).format("YYYY-MM-DD"),
      grade: data.grade,
      generate_qr_code: data.generate_qr_code,
      weight: +data.weight,
      average: +data.average,
      meter: +data.actual_meter,
      extra_meter: +data.extra_meter || 0,
      is_tp: data.is_tp,
      pis: +data.pis,
      notes: data.notes,
    };

    const takaDetails = [];
    fieldArray.forEach((row) => {
      [1, 2, 3, 4].forEach((col) => {
        if (data[`employee_${col}`]) {
          if (
            (!_.isUndefined(data[`day_meter_${row}_${col}`]) ||
              !_.isUndefined(data[`night_meter_${row}_${col}`])) &&
            (!_.isNull(data[`day_meter_${row}_${col}`]) ||
              !_.isNull(data[`night_meter_${row}_${col}`])) &&
            (!_.isEmpty(data[`day_meter_${row}_${col}`]) ||
              !_.isEmpty(data[`night_meter_${row}_${col}`]))
          ) {
            takaDetails.push({
              createdAt: dayjs(data[`createdAt_${row}_0`]).format("YYYY-MM-DD"),
              user_id: data[`employee_${col}`],
              day_meter: +data[`day_meter_${row}_${col}`] || 0,
              night_meter: +data[`night_meter_${row}_${col}`] || 0,
            });
          }
        }
      });
    });

    payload = { ...payload, taka_details: takaDetails };

    // console.log({ payload, takaDetails });
    await addFoldingProduction(payload);
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setError,
    resetField,
    setValue,
    getValues,
    clearErrors,
    trigger,
  } = useForm({
    defaultValues: {
      grade: "A",
      generate_qr_code: false,
      auto_taka_generate: false,
      //
      folding_user_id: null,
      machine_name: null,
      machine_no: null,
      taka_no: "",
      quality_id: null,
      beam_no: "",
      beam_load_id: "",
      pending_meter: "",
      createdAt: dayjs(),

      //
      weight: "",
      average: "",
      actual_meter: "",
      is_tp: false,
      pis: "",
      notes: "",
    },
    resolver: validationSchema,
  });
  const {
    machine_name,
    folding_user_id,
    machine_no,
    extra_meter,
    actual_meter,
    quality_id,
    pis,
    is_tp,
    auto_taka_generate,
    // weight,
    average,
  } = watch();

  // get folding user list
  const { data: userListRes, isLoading: isLoadingUserList } = useQuery({
    queryKey: [
      "other-user",
      "list",
      {
        company_id: companyId,
        is_active: 1,
      },
    ],
    queryFn: async () => {
      const res = await getOtherUserListRequest({
        params: {
          company_id: companyId,
          is_active: 1,
          role_id: USER_ROLES.FOLDING_USER.role_id,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  // get selected user for from taka no and to taka no
  const selectedUser = useMemo(() => {
    if (userListRes && folding_user_id) {
      return userListRes?.userList?.find((user) => user.id === folding_user_id);
    }
  }, [userListRes, folding_user_id]);

  // Load machine name dropdown list
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

  // Loaded Machine number dropdownlist request
  const { data: loadedMachineList, isLoading: isLoadingLoadedMachineList } =
    useQuery({
      queryKey: [
        "loaded",
        "machine",
        "list",
        { company_id: companyId, machine_name: machine_name },
      ],
      queryFn: async () => {
        if (machine_name) {
          const res = await getLoadedMachineListRequest({
            params: { company_id: companyId, machine_name: machine_name },
          });
          return res.data?.data;
        }
      },
      enabled: Boolean(companyId && machine_name),
    });

  const machineNoOption = useMemo(() => {
    if (
      loadedMachineList &&
      loadedMachineList?.machineDetail &&
      loadedMachineList?.rows?.length
    ) {
      // let array = [];
      // for (
      //   let i = 1;
      //   i <= loadedMachineList.machineDetail.no_of_machines;
      //   i++
      // ) {
      //   // const isExist = loadedMachineList.rows.find(
      //   //   ({ machine_no }) => i === +machine_no
      //   // );
      //   // if (!isExist) {
      //   array.push(i);
      //   // }
      // }
      // return array;
      return loadedMachineList?.rows?.map(({ machine_no }) => machine_no);
    }
  }, [loadedMachineList]);

  // get quality list drop down
  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          machine_name: machine_name,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            machine_name: machine_name,
            page: 0,
            pageSize: 9999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId && machine_name),
    });

  const avgWeight = useMemo(() => {
    if (
      quality_id &&
      dropDownQualityListRes &&
      dropDownQualityListRes?.rows?.length
    ) {
      const quality = dropDownQualityListRes?.rows?.find(
        ({ id }) => quality_id === id
      );
      return {
        weight_from: quality.weight_from || 0,
        weight_to: quality.weight_to || 0,
      };
    } else {
      return { weight_from: 0, weight_to: 0 };
    }
  }, [dropDownQualityListRes, quality_id]);

  const { data: runningBeam } = useQuery({
    queryKey: [
      "running",
      "beam",
      {
        company_id: companyId,
        machine_name: machine_name,
        machine_no: machine_no,
      },
    ],
    queryFn: async () => {
      const res = await getLoadedBeamFromMachineRequest({
        id: machine_no,
        params: {
          company_id: companyId,
          machine_name: machine_name,
        },
      });

      if (!res.data?.data?.runningBeamDetail) {
        message.error("No running beam available.");
      }
      return res.data?.data;
    },
    enabled: Boolean(companyId && machine_name && machine_no),
  });

  useEffect(() => {
    if (runningBeam !== undefined) {
      if (runningBeam && runningBeam?.runningBeamDetail) {
        setIsRunningBeamFound(true);
        const data = {
          ...getTakaDetailsObject(runningBeam?.runningBeamDetail),
        };

        setValue("beam_no", data.beam_no);
        setValue("beam_load_id", runningBeam?.runningBeamDetail?.id);
        setValue(
          "pending_meter",
          runningBeam?.runningBeamDetail?.pending_meter || 0
        );
        setValue("quality_id", runningBeam?.runningBeamDetail?.quality_id);
      } else {
        setIsRunningBeamFound(false);
      }
    }
  }, [runningBeam, setValue]);

  const calculateActualMeter = () => {
    let actualMeter = 0;
    fieldArray.forEach((row) => {
      [1, 2, 3, 4].forEach((col) => {
        actualMeter += +getValues(`day_meter_${row}_${col}`) || 0;
        actualMeter += +getValues(`night_meter_${row}_${col}`) || 0;
      });
    });

    setValue("actual_meter", +actualMeter);
    setActualMeterCopy(+actualMeter);
  };

  useEffect(() => {
    if (actual_meter) {
      const weightFrom = (
        (avgWeight.weight_from / 100) *
        +actual_meter
      ).toFixed(3);
      const weightTo = ((avgWeight.weight_to / 100) * +actual_meter).toFixed(3);

      setWeightPlaceholder({
        weightFrom: +weightFrom,
        weightTo: +weightTo,
      });
    } else {
      setWeightPlaceholder(null);
    }
  }, [avgWeight.weight_from, avgWeight.weight_to, actual_meter]);

  useEffect(() => {
    if (extra_meter) {
      const finalMeter = +extra_meter + +actual_meter;
      setFinalMeter(finalMeter);
    } else {
      setFinalMeter(0);
    }
  }, [actual_meter, extra_meter]);

  const handleWeightChange = (value, field) => {
    if (
      +value >= weightPlaceholder.weightFrom &&
      +value <= weightPlaceholder.weightTo
    ) {
      trigger(`weight`);
      // Calculate average weight information
      // let meters = getValues(`meter_${fieldNumber}`);
      let meters = +actual_meter;

      if (meters !== undefined && meters !== "") {
        let average_weight = (Number(value) * 100) / Number(meters);
        setValue(`average`, average_weight.toFixed(2));
      }
    } else {
      setError(`weight`, {
        type: "manual",
        message: "Weight's average is invalid.",
      });
    }
    field.onChange(value ? value : "");
  };

  // Check Folding production related taka validation handler
  const checkTakaNumberCheckHandler = async (value) => {
    try {
      const params = { company_id: companyId, taka_no: +value };
      const response = await checkUniqueTakaNoRequest({ params });
      if (response.data.success) {
        clearErrors("taka_no");
      } else {
        setError(`taka_no`, {
          type: "manual",
          message: "Taka number already in used",
        });
      }
    } catch (error) {
      setError("taka_no", {
        type: "manual",
        message: "Invalid taka no.",
      });
    }
  };

  const debouncedCheckUniqueTakaHandler = useDebounceCallback((value) => {
    checkTakaNumberCheckHandler(value);
  }, 300);

  const onChangeTakaNoHandler = (e, field) => {
    const FROM = selectedUser?.folding_mending_user_detail?.from_taka_number;
    const TO = selectedUser?.folding_mending_user_detail?.to_taka_number;
    field.onChange(e.target.value);
    if (+e.target.value < +FROM || +e.target.value > +TO) {
      setError("taka_no", {
        type: "manual",
        message: "Invalid taka no.",
      });
    } else {
      let status = debouncedCheckUniqueTakaHandler(+e.target.value);
      clearErrors("taka_no");
    }
  };

  // Handle Auto taka generate related functionality handler =======================
  const GenerateTakaNumber = async () => {
    let from_taka = selectedUser?.folding_mending_user_detail?.from_taka_number;
    let to_taka = selectedUser?.folding_mending_user_detail?.to_taka_number;
    const params = {
      company_id: companyId,
      from_taka: from_taka,
      to_taka: to_taka,
      auto: 1,
    };
    const response = await checkUniqueTakaNoRequest({ params });
    if (response.data?.success) {
      setValue("taka_no", response.data.data?.taka_no);
    }
  };

  useEffect(() => {
    if (
      auto_taka_generate &&
      selectedUser?.folding_mending_user_detail !== undefined
    ) {
      GenerateTakaNumber();
    }
  }, [auto_taka_generate, selectedUser]);

  // =========== Pis related functionality handling ==================== //
  const [pisWeight, setPisWeight] = useState(undefined);

  useEffect(() => {
    if (pis && !is_tp) {
      if (+pis > actualMeterCopy || +pis < 0) {
        setError("pis", {
          type: "manual",
          message: "You have enter invalid pis.",
        });
        setPisWeight(undefined);
        return;
      }
      // trigger("pis");
      // setValue("actual_meter", actualMeterCalc);
    } else {
      setValue("actual_meter", +actual_meter - +pis);
      // setValue("actual_meter", actualMeterCopy);
    }
  }, [actualMeterCopy, is_tp, pis, setError, setValue, trigger]);

  useEffect(() => {
    if (pis) {
      if (+pis < actualMeterCopy || +pis > 0) {
        if (!is_tp) {
          setValue("actual_meter", +actualMeterCopy - pis);
        } else {
          setValue("actual_meter", actualMeterCopy);
        }
      }
    }
  }, [pis, actualMeterCopy, is_tp]);

  useEffect(() => {
    if (pis) {
      if (+pis < actualMeterCopy || +pis > 0) {
        if (!is_tp) {
          // Set Pis weight information
          let average_weight = (average * actualMeterCopy) / 100;
          let pis_weight = (pis * average_weight) / actualMeterCopy;
          setPisWeight(parseFloat(pis_weight).toFixed(2));

          // Update other weight information
          let other_weight = average_weight - pis_weight;
          setValue("weight", parseFloat(other_weight).toFixed(2));

          // Update actual meter information
          setValue("actual_meter", +actualMeterCopy - pis);
        } else {
          setValue("actual_meter", actualMeterCopy);

          // Reset other wight
          let average_weight = (average * actualMeterCopy) / 100;
          setValue("weight", parseFloat(average_weight).toFixed(2));
        }
      }
    }
  }, [pis, actual_meter, is_tp]);

  return (
    <Form
      // form={form}
      layout="vertical"
      style={{ marginTop: "1rem" }}
      onFinish={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col gap-2 p-4 pt-2">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-5">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </Button>
            <h3 className="m-0 text-primary">Add Folding Production</h3>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <Space>
              <div>GRADE: </div>
              <Controller
                control={control}
                name="grade"
                render={({ field }) => (
                  <Radio.Group
                    {...field}
                    name="grade"
                    buttonStyle="solid"
                    optionType="button"
                  >
                    <Radio value={"A"}>A</Radio>
                    <Radio value={"B"}>B</Radio>
                    <Radio value={"C"}>C</Radio>
                    <Radio value={"D"}>D</Radio>
                  </Radio.Group>
                )}
              />
            </Space>
          </div>
          <div style={{ marginLeft: "" }}>
            <Controller
              control={control}
              name="generate_qr_code"
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  Generate QR Code
                </Checkbox>
              )}
            />
          </div>
          <div style={{ marginLeft: "" }}>
            <Controller
              control={control}
              name="auto_taka_generate"
              render={({ field }) => (
                <Checkbox
                  {...field}
                  checked={field.value} // Ensure the `checked` state is controlled
                  onChange={(e) => field.onChange(e.target.checked)} // Update the state
                >
                  Auto Taka Generate
                </Checkbox>
              )}
            />
          </div>
        </div>

        {isRunningBeamFound === false ? (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "1rem",
              textAlign: "center",
            }}
          >
            No running beam available.
          </div>
        ) : null}

        <Row className="w-100" justify={"flex-start"} style={{ gap: "12px" }}>
          <Col span={6}>
            <Form.Item
              label="Users"
              name="folding_user_id"
              required={true}
              wrapperCol={{ sm: 24 }}
              validateStatus={errors.folding_user_id ? "error" : ""}
              help={errors.folding_user_id && errors.folding_user_id.message}
            >
              <Controller
                control={control}
                name="folding_user_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Folding User"
                    loading={isLoadingUserList}
                    options={userListRes?.userList?.map((user) => ({
                      label: `${user?.first_name} ${user?.last_name}`,
                      value: user?.id,
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
              label="Machine"
              name="machine_name"
              required={true}
              wrapperCol={{ sm: 24 }}
              validateStatus={errors.machine_name ? "error" : ""}
              help={errors.machine_name && errors.machine_name.message}
            >
              <Controller
                control={control}
                name="machine_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine"
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
                    onChange={(value) => {
                      field.onChange(value);
                      resetField("machine_no");
                      resetField("quality_id");
                      resetField("beam_no");
                      resetField("beam_load_id");
                      resetField("pending_meter");
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Machine No."
              name="machine_no"
              required={true}
              wrapperCol={{ sm: 24 }}
              validateStatus={errors.machine_no ? "error" : ""}
              help={errors.machine_no && errors.machine_no.message}
            >
              <Controller
                control={control}
                name="machine_no"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select Machine No."
                    showSearch
                    loading={isLoadingLoadedMachineList}
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
          <Col span={5}>
            <Form.Item
              label="Taka No."
              name="taka_no"
              required={true}
              wrapperCol={{ sm: 24 }}
              validateStatus={errors.taka_no ? "error" : ""}
              help={errors.taka_no && errors.taka_no.message}
            >
              <Controller
                control={control}
                name="taka_no"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter taka no."
                    onChange={(e) => onChangeTakaNoHandler(e, field)}
                    readOnly={auto_taka_generate ? true : false}
                    addonAfter={
                      errors.taka_no ? (
                        <CloseOutlined style={{ color: "red" }} />
                      ) : (
                        <CheckOutlined style={{ color: "green" }} />
                      )
                    }
                  />
                )}
              />
              {selectedUser && !errors.taka_no ? (
                <span style={{ color: "red" }}>
                  Enter between{" "}
                  {selectedUser?.folding_mending_user_detail?.from_taka_number}{" "}
                  to {selectedUser?.folding_mending_user_detail?.to_taka_number}
                </span>
              ) : null}
            </Form.Item>
          </Col>
        </Row>

        <Row
          className="w-100"
          justify={"flex-start"}
          style={{ gap: "12px", marginTop: -15 }}
        >
          <Col span={6}>
            <Form.Item
              label="Quality"
              name="quality_id"
              required={true}
              wrapperCol={{ sm: 24 }}
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
            >
              <Controller
                control={control}
                name="quality_id"
                render={({ field }) => (
                  <>
                    <Select
                      {...field}
                      disabled
                      placeholder="Select Quality"
                      loading={dropDownQualityLoading}
                      options={
                        dropDownQualityListRes &&
                        dropDownQualityListRes?.rows?.map((item) => ({
                          value: item.id,
                          label: item.quality_name,
                        }))
                      }
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                    />
                    {quality_id && (
                      <Typography.Text style={{ color: "red" }}>
                        Avg weight must be between {avgWeight?.weight_from} to{" "}
                        {avgWeight?.weight_to}
                      </Typography.Text>
                    )}
                  </>
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="B No."
              name="beam_no"
              required={true}
              wrapperCol={{ sm: 24 }}
              validateStatus={errors.beam_no ? "error" : ""}
              help={errors.beam_no && errors.beam_no.message}
            >
              <Controller
                control={control}
                name="beam_no"
                render={({ field }) => <Input {...field} disabled />}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="P. Mtr"
              name="pending_meter"
              required={true}
              wrapperCol={{ sm: 24 }}
              validateStatus={errors.pending_meter ? "error" : ""}
              help={errors.pending_meter && errors.pending_meter.message}
            >
              <Controller
                control={control}
                name="pending_meter"
                render={({ field }) => <Input {...field} disabled />}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item
              label="Date"
              name="createdAt"
              required={true}
              wrapperCol={{ sm: 24 }}
              validateStatus={errors.createdAt ? "error" : ""}
              help={errors.createdAt && errors.createdAt.message}
            >
              <Controller
                control={control}
                name="createdAt"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{ width: "100%" }}
                    disabledDate={disableFutureDates}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Divider
          style={{
            marginTop: 0,
          }}
        />

        {machine_no && isRunningBeamFound ? (
          <ProductionMeterForm
            control={control}
            companyId={companyId}
            fieldArray={fieldArray}
            addNewFieldRow={addNewFieldRow}
            deleteFieldRow={deleteFieldRow}
            watch={watch}
            getValues={getValues}
            setValue={setValue}
            calculateActualMeter={calculateActualMeter}
          />
        ) : null}

        {machine_no && isRunningBeamFound ? (
          <div>
            <Row
              className="w-100"
              justify={"flex-start"}
              style={{ gap: "12px" }}
            >
              <Col span={2}>
                <Form.Item
                  label="Weight"
                  name="weight"
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  validateStatus={errors.weight ? "error" : ""}
                  help={errors.weight && errors.weight.message}
                >
                  <Controller
                    control={control}
                    name="weight"
                    render={({ field }) => (
                      <Input
                        {...field}
                        placeholder={weightPlaceholder?.weightFrom || ""}
                        onChange={(e) => {
                          handleWeightChange(e.target.value, field);
                        }}
                        readOnly={
                          pis !== undefined ? (pis == "" ? false : true) : false
                        }
                      />
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item
                  label="Average"
                  name="average"
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  validateStatus={errors.average ? "error" : ""}
                  help={errors.average && errors.average.message}
                >
                  <Controller
                    control={control}
                    name="average"
                    render={({ field }) => <Input {...field} disabled />}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Form.Item
                  label="Actual Meter"
                  name="actual_meter"
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  validateStatus={errors.actual_meter ? "error" : ""}
                  help={errors.actual_meter && errors.actual_meter.message}
                >
                  <Controller
                    control={control}
                    name="actual_meter"
                    render={({ field }) => <Input {...field} disabled />}
                  />
                  {extra_meter ? (
                    <span style={{ color: "green" }}>
                      Final meter {+finalMeter}
                    </span>
                  ) : null}
                </Form.Item>
              </Col>
              <Col span={1}>
                <Form.Item
                  label=" "
                  name="is_tp"
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  validateStatus={errors.is_tp ? "error" : ""}
                  help={errors.is_tp && errors.is_tp.message}
                >
                  <Controller
                    control={control}
                    name="is_tp"
                    render={({ field }) => (
                      <Checkbox {...field} checked={field.value}>
                        TP
                      </Checkbox>
                    )}
                  />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  label="Pis"
                  name="pis"
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  validateStatus={errors.pis ? "error" : ""}
                  help={errors.pis && errors.pis.message}
                >
                  <Controller
                    control={control}
                    name="pis"
                    render={({ field }) => <Input {...field} placeholder="" />}
                  />
                </Form.Item>
                <div
                  style={{
                    fontWeight: 600,
                    color: "green",
                    marginTop: -10,
                  }}
                >
                  {pisWeight !== undefined ? `Weight Info ${pisWeight}` : ""}
                </div>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Notes"
                  name="notes"
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  validateStatus={errors.notes ? "error" : ""}
                  help={errors.notes && errors.notes.message}
                >
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field }) => <Input {...field} />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        ) : null}

        <Flex gap={10} justify="flex-end">
          <Button htmlType="button" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Save
          </Button>
        </Flex>
      </div>

      {/* <TableListView company={company} /> */}
    </Form>
  );
};

export default AddFoldingProduction;

const ProductionMeterForm = ({
  control,
  companyId,
  getValues,
  fieldArray,
  addNewFieldRow,
  deleteFieldRow,
  watch,
  setValue,
  calculateActualMeter,
}) => {
  const { employee_1, employee_2, employee_3, employee_4 } = watch();
  useState;

  const [sort, setSort] = useState("desc");

  const { data: employeeListRes, isLoading: isLoadingEmployeeList } = useQuery({
    queryKey: [
      "employee/list",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const res = await getEmployeeListRequest({
        params: {
          company_id: companyId,
          salary_type: "Work basis",
        },
      });
      return res.data?.data?.empoloyeeList;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    if (employeeListRes && employeeListRes?.rows?.length) {
      Array.from({ length: 4 }).forEach((_, index) => {
        const item = index + 1;
        if (item <= employeeListRes?.rows?.length) {
          const data = employeeListRes?.rows[index];
          setValue(`employee_${item}`, data.id);
        }
      });
    }
  }, [employeeListRes, setValue]);

  const employeeViewHandler = () => {
    window.open(
      `${window.location.origin}/account/salary-master/employee-average-report`,
      "_blank"
    );
  };

  const getDateForMeters = useCallback(
    (numOfDays) => {
      if (sort === "asc") {
        return dayjs().subtract(fieldArray.length - numOfDays - 1, "day");
      } else {
        return dayjs().subtract(numOfDays, "day");
      }
    },
    [fieldArray, sort]
  );

  const IS_DAY_SHIFT_COL_1 = useMemo(() => {
    if (employee_1) {
      const selectedEmp = employeeListRes?.rows?.find(
        (emp) => emp.id === employee_1
      );
      if (selectedEmp?.employer?.shift === "day") return true;
      else return false;
    } else {
      return false;
    }
  }, [employeeListRes?.rows, employee_1]);

  const IS_DAY_SHIFT_COL_2 = useMemo(() => {
    if (employee_2) {
      const selectedEmp = employeeListRes?.rows?.find(
        (emp) => emp.id === employee_2
      );
      if (selectedEmp?.employer?.shift === "day") return true;
      else return false;
    } else {
      return false;
    }
  }, [employeeListRes?.rows, employee_2]);

  const IS_DAY_SHIFT_COL_3 = useMemo(() => {
    if (employee_3) {
      const selectedEmp = employeeListRes?.rows?.find(
        (emp) => emp.id === employee_3
      );
      if (selectedEmp?.employer?.shift === "day") return true;
      else return false;
    } else {
      return false;
    }
  }, [employeeListRes?.rows, employee_3]);

  const IS_DAY_SHIFT_COL_4 = useMemo(() => {
    if (employee_4) {
      const selectedEmp = employeeListRes?.rows?.find(
        (emp) => emp.id === employee_4
      );
      if (selectedEmp?.employer?.shift === "day") return true;
      else return false;
    } else {
      return false;
    }
  }, [employeeListRes?.rows, employee_4]);

  const debouncedCalculate = useCallback(
    debounce(calculateActualMeter, 300),
    []
  );

  const checkIsEmployeeSelected = (selected, field, item) => {
    let isValid = true;
    Array.from({ length: 4 }).forEach((_, index) => {
      if (index !== item && selected === getValues(`employee_${index}`)) {
        isValid = false;
        return;
      }
    });

    if (!isValid) {
      message.error("This employee is already selected");
      field.onChange(null);
    } else {
      field.onChange(selected);
    }
  };

  useEffect(() => {
    fieldArray.forEach((item) => {
      setValue(`createdAt_${item}_0`, getDateForMeters(item));
    });
  }, [fieldArray, getDateForMeters, setValue, sort]);

  return (
    <div
      style={{
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        padding: "2px",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }} border={0}>
        <thead>
          <tr style={{ backgroundColor: "#f6f6f6", fontWeight: "bold" }}>
            <td width={150}>
              <Space size="small">
                <span>Date</span>
                <Tooltip title="Ascending">
                  <Button
                    type={sort === "asc" ? "default" : "text"}
                    onClick={() => setSort("asc")}
                  >
                    <ArrowUpOutlined />
                  </Button>
                </Tooltip>
                <Tooltip title="Descending">
                  <Button
                    type={sort === "desc" ? "default" : "text"}
                    onClick={() => setSort("desc")}
                  >
                    <ArrowDownOutlined />
                  </Button>
                </Tooltip>
              </Space>
            </td>
            {Array.from({ length: 4 }).map((_, index) => {
              const item = index + 1;
              return (
                <td key={item + "_employee"}>
                  <Flex gap={12}>
                    <Controller
                      control={control}
                      name={`employee_${item}`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          name={`employee_${item}`}
                          placeholder={"Select Employee"}
                          style={{
                            textTransform: "capitalize",
                            width: "100%",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                          loading={isLoadingEmployeeList}
                          options={employeeListRes?.rows?.map(
                            ({ id = 0, first_name = "" }) => ({
                              label: first_name,
                              value: id,
                            })
                          )}
                          onChange={(selected) =>
                            checkIsEmployeeSelected(selected, field, item)
                          }
                        />
                      )}
                    />
                    <Button type="primary" onClick={employeeViewHandler}>
                      <EyeOutlined />
                    </Button>
                  </Flex>
                </td>
              );
            })}

            <td>
              <Space size="large">Actions</Space>
            </td>
          </tr>
        </thead>
        <tbody>
          {fieldArray.map((item) => {
            return (
              <tr key={item}>
                {/* Colum 0................. */}
                <td>
                  <Space size="large">
                    <Controller
                      control={control}
                      name={`createdAt_${item}_0`}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          key={sort + "_" + item}
                          // value={getDateForMeters(item)}
                          placeholder={`date_${item}_0_${sort}`}
                          disabled
                        />
                      )}
                    />
                  </Space>
                </td>
                {/* Colum 1................. */}
                <td>
                  <Space>
                    <Controller
                      control={control}
                      name={`day_meter_${item}_1`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          // placeholder={`day_meter_${item}_1`}
                          placeholder={`Day meter`}
                          disabled={!employee_1 || !IS_DAY_SHIFT_COL_1}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            debouncedCalculate();
                          }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`night_meter_${item}_1`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          // placeholder={`night_meter_${item}_1`}
                          placeholder={`Night meter`}
                          disabled={!employee_1 || IS_DAY_SHIFT_COL_1}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            debouncedCalculate();
                          }}
                        />
                      )}
                    />
                  </Space>
                </td>
                {/* Colum 2................. */}
                <td>
                  <Space>
                    <Controller
                      control={control}
                      name={`day_meter_${item}_2`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          // placeholder={`day_meter_${item}_2`}
                          placeholder={`Day meter`}
                          disabled={!employee_2 || !IS_DAY_SHIFT_COL_2}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            debouncedCalculate();
                          }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`night_meter_${item}_2`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          // placeholder={`night_meter_${item}_2`}
                          placeholder={`Night meter`}
                          disabled={!employee_2 || IS_DAY_SHIFT_COL_2}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            debouncedCalculate();
                          }}
                        />
                      )}
                    />
                  </Space>
                </td>
                {/* Colum 3................. */}
                <td>
                  <Space>
                    <Controller
                      control={control}
                      name={`day_meter_${item}_3`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          // placeholder={`day_meter_${item}_3`}
                          placeholder={`Day meter`}
                          disabled={!employee_3 || !IS_DAY_SHIFT_COL_3}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            debouncedCalculate();
                          }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`night_meter_${item}_3`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          // placeholder={`night_meter_${item}_3`}
                          placeholder={`Night meter`}
                          disabled={!employee_3 || IS_DAY_SHIFT_COL_3}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            debouncedCalculate();
                          }}
                        />
                      )}
                    />
                  </Space>
                </td>
                {/* Colum 4................. */}
                <td>
                  <Space>
                    <Controller
                      control={control}
                      name={`day_meter_${item}_4`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          // placeholder={`day_meter_${item}_4`}
                          placeholder={`Day meter`}
                          disabled={!employee_4 || !IS_DAY_SHIFT_COL_4}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            debouncedCalculate();
                          }}
                        />
                      )}
                    />
                    <Controller
                      control={control}
                      name={`night_meter_${item}_4`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          // placeholder={`night_meter_${item}_4`}
                          placeholder={`Night meter`}
                          disabled={!employee_4 || IS_DAY_SHIFT_COL_4}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            debouncedCalculate();
                          }}
                        />
                      )}
                    />
                  </Space>
                </td>
                {/* Colum 5................. */}
                <td>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteFieldRow(item)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ textAlign: "left", padding: "1rem 1rem 1rem 6px" }}>
        <Button type="primary" onClick={addNewFieldRow}>
          Add Row
        </Button>
        <Controller
          control={control}
          name={`extra_meter`}
          render={({ field }) => (
            <Input {...field} className="w-28 ml-1" placeholder="extra meter" />
          )}
        />
      </div>
    </div>
  );
};

// const TableListView = ({ company }) => {
//   const dataBelow = [
//     {
//       key: "1",
//       date: "24-11-2024",
//       takaNo: 4567,
//       employee1: 200,
//       employee2: 0,
//       test: 0,
//     },
//     {
//       key: "2",
//       date: "23-11-2024",
//       takaNo: null,
//       employee1: 0,
//       employee2: 0,
//       test: 0,
//     },
//     {
//       key: "3",
//       date: "22-11-2024",
//       takaNo: null,
//       employee1: 0,
//       employee2: 0,
//       test: 0,
//     },
//     // Add more rows as needed
//   ];

//   // Calculate totals for each column
//   const totals = {
//     takaNo: dataBelow.reduce((sum, row) => sum + (row.takaNo || 0), 0),
//     employee1: dataBelow.reduce((sum, row) => sum + (row.employee1 || 0), 0),
//     employee2: dataBelow.reduce((sum, row) => sum + (row.employee2 || 0), 0),
//     test: dataBelow.reduce((sum, row) => sum + (row.test || 0), 0),
//   };

//   const columnsBelow = [
//     {
//       title: "Date",
//       dataIndex: "date",
//       key: "date",
//     },
//     {
//       title: "Taka No",
//       dataIndex: "takaNo",
//       key: "takaNo",
//       render: (text) =>
//         text ? text : <span style={{ color: "red" }}>--</span>,
//     },
//     {
//       title: "EMPLOYE_WORK_BASIS_2 (1-88)",
//       dataIndex: "employee1",
//       key: "employee1",
//       render: (text) => (text ? text : <span style={{ color: "red" }}>0</span>),
//     },
//     {
//       title: "NEW EMPLOYEE (1-10)",
//       dataIndex: "employee2",
//       key: "employee2",
//       render: (text) => (text ? text : <span style={{ color: "red" }}>0</span>),
//     },
//     {
//       title: "TEST (1-20)",
//       dataIndex: "test",
//       key: "test",
//       render: (text) => (text ? text : <span style={{ color: "red" }}>0</span>),
//     },
//   ];

//   const footer = () => (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "space-between",
//         fontWeight: "bold",
//       }}
//     >
//       <span>Total</span>
//       <span>{totals.takaNo || 0}</span>
//       <span>{totals.employee1 || 0}</span>
//       <span>{totals.employee2 || 0}</span>
//       <span>{totals.test || 0}</span>
//     </div>
//   );

//   return (
//     <div>
//       <div>
//         <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
//           {company?.company_name || ""}
//         </h3>
//         <p
//           style={{
//             textAlign: "center",
//             fontWeight: "bold",
//             marginBottom: "20px",
//           }}
//         >
//           November-2024
//         </p>
//         <Table
//           dataSource={dataBelow}
//           columns={columnsBelow}
//           pagination={{
//             pageSize: 10,
//             showSizeChanger: true,
//             showQuickJumper: true,
//             showTotal: (total) =>
//               `Showing 1 to ${total} of ${dataBelow.length} entries`,
//           }}
//           bordered
//           footer={footer}
//         />
//       </div>
//     </div>
//   );
// };
