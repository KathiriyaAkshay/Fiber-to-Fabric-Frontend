import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select } from "antd";
import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";

const AddProductionTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  getValues,
  setError,
  trigger,
  lastProductionTaka,
  beamCardList,
  production_filter,
  avgWeight,
  weightPlaceholder,
  setWeightPlaceholder,
  dropDownQualityListRes,
}) => {
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalAvg, setTotalAvg] = useState(0);

  const numOfFields = useMemo(() => {
    if (production_filter === "machine_wise") {
      return Array.from({ length: 1 }, (_, i) => i + 1);
    } else {
      return Array.from({ length: 5 }, (_, i) => i + 1);
    }
  }, [production_filter]);

  const activeNextField = (event, fieldNumber) => {
    if (event.keyCode === 32) {
      setActiveField((prev) => prev + 1);
      setTimeout(() => {
        setFocus(`meter_${fieldNumber + 1}`);
      }, 0);
    }
  };

  const removeCurrentField = (fieldNumber) => {
    if (fieldNumber) {
      if (fieldNumber > 1) {
        setActiveField((prev) => prev - 1);
      }
      setValue(`meter_${fieldNumber}`, "");
      setValue(`weight_${fieldNumber}`, "");
      setValue(`machine_no_${fieldNumber}`, "");
      setValue(`average_${fieldNumber}`, "");
      setValue(`beam_no_${fieldNumber}`, "");
      setValue(`production_meter_${fieldNumber}`, "");
      setValue(`pending_meter_${fieldNumber}`, "");
      setValue(`pending_percentage_${fieldNumber}`, "");
      if (production_filter === "multi_quality_wise") {
        setValue(`quality_${fieldNumber}`, null);
      }
    }
  };

  const changeMachineNoHandler = (fieldNumber, value) => {
    const beamCard = beamCardList.rows.find(({ id }) => {
      return id === value;
    });
    console.log({ beamCard });
    const obj =
      beamCard.non_pasarela_beam_detail ||
      beamCard.recieve_size_beam_detail ||
      beamCard.job_beam_receive_detail;

    setValue(`beam_no_${fieldNumber}`, obj.beam_no);
    setValue(`production_meter_${fieldNumber}`, "");
    setValue(`pending_meter_${fieldNumber}`, beamCard.pending_meter || 0);
    setValue(`pending_percentage_${fieldNumber}`, "");

    if (production_filter === "multi_quality_wise") {
      setValue(`quality_${fieldNumber}`, beamCard.inhouse_quality.id);
    }
  };

  const calculateWeight = (meterValue) => {
    const weightFrom = ((avgWeight.weight_from / 100) * meterValue).toFixed(3);
    const weightTo = ((avgWeight.weight_to / 100) * meterValue).toFixed(3);

    setWeightPlaceholder({
      weightFrom: +weightFrom,
      weightTo: +weightTo,
    });
  };

  const handleWeightChange = (fieldNumber, value, field) => {
    // if (production_filter !== "multi_quality_wise") {
    if (
      +value >= weightPlaceholder.weightFrom &&
      +value <= weightPlaceholder.weightTo
    ) {
      trigger(`weight_${fieldNumber}`);
    } else {
      setError(`weight_${fieldNumber}`, {
        type: "custom",
        message: "wrong weight",
      });
    }
    field.onChange(value ? value : "");
  };

  const calculateTotals = () => {
    let totalMeter = 0;
    let totalWeight = 0;
    let totalAvg = 0;
    const activeFieldArray = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    activeFieldArray.forEach((fieldNumber) => {
      totalMeter += +getValues(`meter_${fieldNumber}`);
      totalWeight += +getValues(`weight_${fieldNumber}`);
      totalAvg += +getValues(`average_${fieldNumber}`);
    });

    setTotalMeter(totalMeter);
    setTotalWeight(totalWeight);
    setTotalAvg(totalAvg);
  };

  const total = () => {
    setTimeout(() => {
      calculateTotals();
    }, 500);
  };

  return (
    <div>
      <table
        style={{ width: "100%" }}
        className="job-challan-details-table"
        border={1}
      >
        <thead>
          <th>Taka No</th>
          <th>Meter</th>
          <th>Machine No.</th>
          {production_filter === "multi_quality_wise" ? <th>Quality</th> : null}
          <th>Weight</th>
          <th>Average</th>
          <th>Beam No.</th>
          <th>Prod.Mtr</th>
          <th>Pend.Mtr</th>
          <th>Pend %</th>
          <th>
            <MinusCircleOutlined />
          </th>
        </thead>
        <tbody>
          {numOfFields.map((fieldNumber) => {
            return (
              <tr key={fieldNumber}>
                <td
                  style={{ textAlign: "center" }}
                  className="job-challan-taka-index-column"
                  width={80}
                >
                  {fieldNumber <= activeField
                    ? lastProductionTaka?.taka_no + fieldNumber
                    : ""}
                </td>
                <td width={150}>
                  <Form.Item
                    name={`meter_${fieldNumber}`}
                    validateStatus={
                      errors[`meter_${fieldNumber}`] ? "error" : ""
                    }
                    help={
                      errors[`meter_${fieldNumber}`] &&
                      errors[`meter_${fieldNumber}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{
                      marginBottom: "0px",
                      border: "0px solid !important",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`meter_${fieldNumber}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          style={{
                            width: "100%",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber !== activeField}
                          onChange={(e) => {
                            field.onChange(+e.target.value);
                            calculateWeight(+e.target.value);
                            total();
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </td>

                <td width={150}>
                  <Form.Item
                    name={`machine_no_${fieldNumber}`}
                    validateStatus={
                      errors[`machine_no_${fieldNumber}`] ? "error" : ""
                    }
                    help={
                      errors[`machine_no_${fieldNumber}`] &&
                      errors[`machine_no_${fieldNumber}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ marginBottom: "0px" }}
                  >
                    <Controller
                      control={control}
                      name={`machine_no_${fieldNumber}`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          name={`machine_no_${fieldNumber}`}
                          style={{
                            width: "100%",
                          }}
                          disabled={fieldNumber !== activeField}
                          options={
                            beamCardList &&
                            beamCardList?.rows?.map(({ id, machine_no }) => ({
                              label: machine_no,
                              value: id,
                            }))
                          }
                          onChange={(value) => {
                            field.onChange(value);
                            changeMachineNoHandler(fieldNumber, value);
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </td>

                {production_filter === "multi_quality_wise" ? (
                  <td width={150}>
                    <Form.Item
                      name={`quality_${fieldNumber}`}
                      validateStatus={
                        errors[`quality_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`quality_${fieldNumber}`] &&
                        errors[`quality_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: "0px solid !important",
                      }}
                    >
                      <Controller
                        control={control}
                        name={`quality_${fieldNumber}`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            disabled={fieldNumber !== activeField}
                            options={
                              dropDownQualityListRes &&
                              dropDownQualityListRes?.rows?.map((item) => ({
                                value: item.id,
                                label: item.quality_name,
                              }))
                            }
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                ) : null}

                <td width={150}>
                  <Form.Item
                    name={`weight_${fieldNumber}`}
                    validateStatus={
                      errors[`weight_${fieldNumber}`] ? "error" : ""
                    }
                    // help={
                    //   errors[`weight_${fieldNumber}`] &&
                    //   errors[`weight_${fieldNumber}`].message
                    // }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{ marginBottom: "0px" }}
                  >
                    <Controller
                      control={control}
                      name={`weight_${fieldNumber}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          name={`weight_${fieldNumber}`}
                          disabled={fieldNumber !== activeField}
                          placeholder={
                            fieldNumber === activeField
                              ? weightPlaceholder?.weightFrom
                              : ""
                          }
                          onChange={(e) => {
                            handleWeightChange(
                              fieldNumber,
                              e.target.value,
                              field
                            );
                            total();
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </td>

                <td width={150}>
                  <Form.Item
                    name={`average_${fieldNumber}`}
                    validateStatus={
                      errors[`average_${fieldNumber}`] ? "error" : ""
                    }
                    help={
                      errors[`average_${fieldNumber}`] &&
                      errors[`average_${fieldNumber}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{
                      marginBottom: "0px",
                      border: "0px solid !important",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`average_${fieldNumber}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          style={{
                            width: "100%",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber !== activeField}
                          onChange={(e) => {
                            field.onChange(e);
                            total();
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </td>
                <td width={150}>
                  <Form.Item
                    name={`beam_no_${fieldNumber}`}
                    validateStatus={
                      errors[`beam_no_${fieldNumber}`] ? "error" : ""
                    }
                    help={
                      errors[`beam_no_${fieldNumber}`] &&
                      errors[`beam_no_${fieldNumber}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{
                      marginBottom: "0px",
                      border: "0px solid !important",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`beam_no_${fieldNumber}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          style={{
                            width: "100%",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber !== activeField}
                        />
                      )}
                    />
                  </Form.Item>
                </td>
                <td width={150}>
                  <Form.Item
                    name={`production_meter_${fieldNumber}`}
                    validateStatus={
                      errors[`production_meter_${fieldNumber}`] ? "error" : ""
                    }
                    help={
                      errors[`production_meter_${fieldNumber}`] &&
                      errors[`production_meter_${fieldNumber}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{
                      marginBottom: "0px",
                      border: "0px solid !important",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`production_meter_${fieldNumber}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          style={{
                            width: "100%",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber !== activeField}
                        />
                      )}
                    />
                  </Form.Item>
                </td>
                <td width={150}>
                  <Form.Item
                    name={`pending_meter_${fieldNumber}`}
                    validateStatus={
                      errors[`pending_meter_${fieldNumber}`] ? "error" : ""
                    }
                    help={
                      errors[`pending_meter_${fieldNumber}`] &&
                      errors[`pending_meter_${fieldNumber}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{
                      marginBottom: "0px",
                      border: "0px solid !important",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`pending_meter_${fieldNumber}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          style={{
                            width: "100%",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber !== activeField}
                        />
                      )}
                    />
                  </Form.Item>
                </td>
                <td width={150}>
                  <Form.Item
                    name={`pending_percentage_${fieldNumber}`}
                    validateStatus={
                      errors[`pending_percentage_${fieldNumber}`] ? "error" : ""
                    }
                    help={
                      errors[`pending_percentage_${fieldNumber}`] &&
                      errors[`pending_percentage_${fieldNumber}`].message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                    style={{
                      marginBottom: "0px",
                      border: "0px solid !important",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`pending_percentage_${fieldNumber}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          style={{
                            width: "100%",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber !== activeField}
                          onKeyDown={(event) =>
                            activeNextField(event, fieldNumber)
                          }
                        />
                      )}
                    />
                  </Form.Item>
                </td>
                <td>
                  <Button
                    className="job-challan-taka-plus-option"
                    icon={<MinusCircleOutlined />}
                    disabled={fieldNumber !== activeField}
                    onClick={() => removeCurrentField(fieldNumber)}
                  ></Button>
                </td>
              </tr>
            );
          })}
          <tr>
            <td style={{ textAlign: "center" }}>
              <b>Total</b>
            </td>
            <td style={{ textAlign: "center" }}>
              <b>{totalMeter}</b>
            </td>
            <td style={{ textAlign: "center" }}>
              <b>{totalWeight}</b>
            </td>
            <td></td>
            <td style={{ textAlign: "center" }}>
              <b>{totalAvg}</b>
            </td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AddProductionTable;
