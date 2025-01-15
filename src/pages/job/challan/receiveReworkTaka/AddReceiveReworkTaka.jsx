import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Col, Divider, Flex, Form, Row, Select, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import dayjs from "dayjs";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import ReceiveReworkTakaFieldTable from "../../../../components/job/challan/receiveReworkTaka/receiveReworkTakaFieldTable";
import { addReceiveReworkTakaRequest } from "../../../../api/requests/job/challan/receiveReworkTaka";
import AlertModal from "../../../../components/common/modal/alertModal";
import { getDisplayQualityName } from "../../../../constants/nameHandler";
import { JOB_QUALITY_TYPE } from "../../../../constants/supplier";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    machine_name: yup.string().required("Please select machine."),
    quality_id: yup.string().required("Please select quality."),
  })
);

const AddReceiveReworkTaka = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeField, setActiveField] = useState(1);

  const { companyId } = useContext(GlobalContext);
  function goBack() {
    navigate(-1);
  }

  // Receive rework taka option handler
  const { mutateAsync: AddReceiveReworkTakaHandler, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addReceiveReworkTakaRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["receive", "rework", "taka", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "receive",
        "rework",
        "taka",
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
      // message.error(errorMessage);
    },
  });

  async function onSubmit(data) {
    const detailArray = Array.from({ length: activeField }, (_, i) => i + 1);

    let hasError = false; 
    const data2 = detailArray.map((field) => {
      const taka_no = +data[`taka_no_${field}`];
      const meter = +data[`meter_${field}`];
      const received_meter = +data[`received_meter_${field}`];
      const short = +data[`short_${field}`];
      const received_weight = +data[`received_weight_${field}`];
      
      const average = +data[`average_${field}`];
      const tp = +data[`tp_${field}`];
      const pis = +data[`pis_${field}`];

      // Skip this iteration if all key values are empty
      if (
        (isNaN(taka_no) || taka_no == "" || taka_no == undefined || taka_no == null) &&
        (isNaN(meter) || meter == "" || meter == undefined || meter == null) &&
        (isNaN(received_meter) || received_meter == "" || received_meter == undefined || received_meter == null) &&
        (isNaN(received_weight) || received_weight == "" || received_weight == undefined || received_weight == null)
      ) {
        return null; 
      }

      // Validation and warning messages
      if (isNaN(taka_no) || taka_no === "" || taka_no === undefined || taka_no === null) {
        message.warning(`Field 'taka_no' in row ${field} is required!`);
        hasError = true ; 
        return null;
      }
      if (isNaN(meter) || meter === "" || meter === undefined || meter === null) {
        message.warning(`Field 'meter' in row ${field} is required!`);
        hasError = true ; 
        return null;
      }
      if (
        isNaN(received_meter) ||
        received_meter === "" ||
        received_meter === undefined ||
        received_meter === null || 
        received_meter == 0
      ) {
        message.warning(`Field 'received_meter' in row ${field} is required!`);
        hasError = true ; 
        return null;
      }
      if (
        isNaN(received_weight) ||
        received_weight === "" ||
        received_weight === undefined ||
        received_weight === null || 
        received_weight == 0
      ) {
        message.warning(`Field 'received_weight' in row ${field} is required!`);
        hasError = true;
        return null;
      }

      return { 
        taka_no, 
        meter, 
        received_meter, 
        short, 
        received_weight, 
        average, 
        tp : tp || 0, 
        pis: pis || 0 };
    });

    // Remove all `null` rows from the array
    const filteredData = data2.filter((row) => row !== null);

    let temp = [];
    filteredData.map((element) => {
      temp.push({
        ...element,
        machine_name: data?.machine_name,
        quality_id: +data?.quality_id,
        createdAt: dayjs(new Date()),
      });
    });

    if (!hasError){
      await AddReceiveReworkTakaHandler(temp);
    }
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    getValues,
    setFocus,
    resetField,
  } = useForm({
    defaultValues: {
      machine_name: null,
      quality_id: null,
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { machine_name, quality_id } = watch();

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

  // Quality dropdown list api ===============================
  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 9999,
          is_active: 1,
          machine_name: machine_name,
          production_type: JOB_QUALITY_TYPE
        },
      ],
      queryFn: async () => {
        if (machine_name) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              page: 0,
              pageSize: 9999,
              is_active: 1,
              machine_name: machine_name,
              production_type: JOB_QUALITY_TYPE
            },
          });
          return res.data?.data;
        }
      },
      enabled: Boolean(companyId),
    });

  // **************************************************************

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [tempOrderValue, setTempOrderValue] = useState(null);

  const qualityChangeHandler = (field, selectedValue) => {
    setTempOrderValue(selectedValue);
    if (activeField >= 1) {
      if (
        getValues(`taka_no_1`) ||
        getValues(`meter_1`) ||
        getValues(`received_meter_1`) ||
        getValues(`received_weight__1`) ||
        getValues(`short_1`) ||
        getValues(`average_1`) ||
        getValues(`tp_1`) ||
        getValues(`pis_1`)
      ) {
        setIsAlertOpen(true);
      } else {
        field.onChange(selectedValue);
      }
    } else {
      field.onChange(selectedValue);
    }
  };

  const onCancelHandler = () => {
    setIsAlertOpen(false);
  };

  const onConfirmHandler = () => {
    const detailArr = Array.from({ length: activeField }, (_, i) => i + 1);

    detailArr.forEach((field) => {
      // resetField(`taka_no_${field}`, "");
      // resetField(`meter_${field}`, "");
      // resetField(`received_meter_${field}`, "");
      // resetField(`received_weight_${field}`, "");
      // resetField(`short_${field}`, "");

      resetField(`taka_no_${field}`, "");
      resetField(`meter_${field}`, "");
      resetField(`received_meter_${field}`, "");
      resetField(`short_${field}`, "");
      resetField(`received_weight_${field}`, "");
      resetField(`average_${field}`, "");
      resetField(`tp_${field}`, "");
      resetField(`pis_${field}`, "");
    });

    setValue("quality_id", tempOrderValue);
    setActiveField(1);
    setIsAlertOpen(false);
    // setTotalTaka(0);
    // setTotalMeter(0);
    // setTotalWeight(0);
  };

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Create Receive Rework Taka</h3>
      </div>
      <Form layout="vertical" style={{ marginTop: "20px" }}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
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
                    allowClear
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
                      onChange={(value) => {
                        // field.onChange(value);
                        qualityChangeHandler(field, value);
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        {quality_id !== undefined && quality_id !== null && (
          <ReceiveReworkTakaFieldTable
            errors={errors}
            control={control}
            setFocus={setFocus}
            setValue={setValue}
            getValues={getValues}
            activeField={activeField}
            setActiveField={setActiveField}
            quality_id={quality_id}
          />
        )}

        <Flex gap={10} justify="flex-end" style={{ marginTop: "1rem" }}>
          <Button htmlType="button" onClick={() => reset()}>
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="button"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Create
          </Button>
        </Flex>
      </Form>

      {isAlertOpen && (
        <AlertModal
          key={"alert_modal"}
          open={isAlertOpen}
          content="Are you sure you want to change? You will lose your entries!"
          onCancel={onCancelHandler}
          onConfirm={onConfirmHandler}
        />
      )}
    </div>
  );
};

export default AddReceiveReworkTaka;
