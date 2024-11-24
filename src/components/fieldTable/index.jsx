import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row } from "antd";
import { Controller } from "react-hook-form";
import { useDebounceCallback } from "../../hooks/useDebounce";
import { useEffect, useState } from "react";

const numOfFields = Array.from({ length: 48 }, (_, i) => i + 1);
const chunkSize = numOfFields.length / 4;

const FieldTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  checkUniqueTaka = false,
  checkUniqueTakaHandler,
  isTakaExist,
  setTotalMeter,
  setTotalWeight,
  setTotalTaka,
  getValues,
  clearErrors,
  isUpdate
}) => {

  const [gt_total, set_gt_total] = useState({
    "0": { total_taka: 0, total_meter: 0, total_weight: 0 },
    "1": { total_taka: 0, total_meter: 0, total_weight: 0 },
    "2": { total_taka: 0, total_meter: 0, total_weight: 0 },
    "3": { total_taka: 0, total_meter: 0, total_weight: 0 }
  })

  const CalculateTableWiseTotal = (index) => {
    let array = Array.from({ length: 12 }, (_, index) => index + 1);
    let total_taka = 0;
    let total_meter = 0;
    let total_weight = 0;

    array?.map((element) => {

      let taka_no = getValues(`taka_no_${Number(element) + index}`);
      let meter = getValues(`meter_${Number(element) + index}`);
      let weight = getValues(`weight_${Number(element) + index}`);

      if (taka_no !== undefined && taka_no !== '' && taka_no != null) {
        total_taka = total_taka + 1;
        total_meter = total_meter + Number(meter);
        total_weight = total_weight + Number(weight);
      } else {
      }
    })

    set_gt_total((prevState) => ({
      ...prevState,
      [index]: {
        total_taka: total_taka,
        total_meter: total_meter,
        total_weight: total_weight
      }
    }))
  }

  useEffect(() => {
    CalculateTableWiseTotal(0)
    CalculateTableWiseTotal(1)
    CalculateTableWiseTotal(2)
    CalculateTableWiseTotal(3)
  }, [getValues])

  const activeNextField = (event, fieldNumber, indexTable) => {
    if (event.keyCode === 13) {
      if (isTakaExist) {
        message.error("Please enter valid taka no.");
      } else {
        setActiveField((prev) => prev + 1);
        setTimeout(() => {
          setFocus(`taka_no_${fieldNumber + 1}`);
        }, 0);

        CalculateTableWiseTotal(indexTable);

        // setTotalTaka((prev) => prev + 1);
        // setTotalMeter((prev) => prev + +getValues(`meter_${fieldNumber}`));
        // setTotalWeight((prev) => prev + +getValues(`weight_${fieldNumber}`));
      }
    }
  };

  const removeCurrentField = (fieldNumber) => {
    if (fieldNumber) {
      if (fieldNumber > 1) {
        setActiveField((prev) => prev - 1);
      }

      setValue(`taka_no_${fieldNumber}`, "");
      setValue(`meter_${fieldNumber}`, "");
      setValue(`weight_${fieldNumber}`, "");

      clearErrors(`taka_no_${fieldNumber}`);
      clearErrors(`meter_${fieldNumber}`);
      clearErrors(`weight_${fieldNumber}`);

    }
    calculateTotalHandler();
  };

  const debouncedCheckUniqueTakaHandler = useDebounceCallback(
    (value, fieldNumber) => {
      checkUniqueTakaHandler(value, fieldNumber);
    },
    300
  );

  const calculateTotal = () => {
    const numOfFields = Array.from({ length: activeField }, (_, i) => i + 1);

    let totalTaka = 0;
    let totalMeter = 0;
    let totalWeight = 0;

    numOfFields.forEach((fieldNumber) => {
      let taka_number = getValues(`taka_no_${fieldNumber}`);
      if (
        taka_number !== undefined &&
        taka_number != null &&
        taka_number != ""
      ) {
        totalTaka += 1;
      }
      totalMeter += +getValues(`meter_${fieldNumber}`) || 0;
      totalWeight += +getValues(`weight_${fieldNumber}`) || 0;
    });

    setTotalTaka(totalTaka);
    setTotalMeter(totalMeter);
    setTotalWeight(totalWeight);
  };

  const calculateTotalHandler = useDebounceCallback(calculateTotal, 500);

  return (
    <Row style={{ marginTop: "-20" }}>
      <Col span={6}>
        <table className="job-challan-details-table" border={1}>
          <thead>
            <tr>
              <th>#</th>
              <th>Taka No</th>
              <th>Meter</th>
              <th>Weight</th>
              <th>
                <MinusCircleOutlined />
              </th>
            </tr>
          </thead>
          <tbody>
            {numOfFields.slice(0, chunkSize).map((fieldNumber) => {
              return (
                <tr key={fieldNumber}>
                  <td className="job-challan-taka-index-column">
                    {fieldNumber}
                  </td>
                  <td>
                    <Form.Item
                      name={`taka_no_${fieldNumber}`}
                      validateStatus={
                        errors[`taka_no_${fieldNumber}`] ? "error" : ""
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                          } solid !important`,
                        borderColor: errors[`taka_no_${fieldNumber}`]
                          ? "red"
                          : "",
                      }}
                    >
                      <Controller
                        control={control}
                        name={`taka_no_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "75px",
                              border: `${errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                                } solid !important`,
                              borderColor: errors[`taka_no_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              if (checkUniqueTaka) {
                                debouncedCheckUniqueTakaHandler(
                                  e.target.value,
                                  fieldNumber
                                );
                                calculateTotalHandler();
                              }
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`meter_${fieldNumber}`}
                      validateStatus={
                        errors[`meter_${fieldNumber}`] ? "error" : ""
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                          } solid !important`,
                        borderColor: errors[`meter_${fieldNumber}`]
                          ? "red"
                          : "",
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
                              width: "100px",
                              border: `${errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                                } solid !important`,
                              borderColor: errors[`meter_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              calculateTotalHandler();
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`weight_${fieldNumber}`}
                      validateStatus={
                        errors[`weight_${fieldNumber}`] ? "error" : ""
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                          } solid !important`,
                        borderColor: errors[`weight_${fieldNumber}`]
                          ? "red"
                          : "",
                      }}
                    >
                      <Controller
                        control={control}
                        name={`weight_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100px",
                              border: `${errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                                } solid !important`,
                              borderColor: errors[`weight_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              calculateTotalHandler();
                            }}
                            onKeyDown={(event) =>
                              activeNextField(event, fieldNumber, 0)
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
              <td className="job-challan-taka-index-column">GT</td>
              <td className="total-info-td-cell">{gt_total["0"]?.total_taka}</td>
              <td className="total-info-td-cell">{gt_total["0"]?.total_meter}</td>
              <td className="total-info-td-cell">{gt_total["0"]?.total_weight}</td>
              <td className="total-info-td-cell"></td>
            </tr>
          </tbody>
        </table>
      </Col>

      <Col span={6}>
        <table border={1} className="job-challan-details-table">
          <thead>
            <th>#</th>
            <th>Taka No</th>
            <th>Meter</th>
            <th>Weight</th>
            <th>
              <MinusCircleOutlined />
            </th>
          </thead>
          <tbody>
            {numOfFields.slice(chunkSize, chunkSize * 2).map((fieldNumber) => {
              return (
                <tr key={fieldNumber}>
                  <td className="job-challan-taka-index-column">
                    {fieldNumber}
                  </td>
                  <td>
                    <Form.Item
                      name={`taka_no_${fieldNumber}`}
                      validateStatus={
                        errors[`taka_no_${fieldNumber}`] ? "error" : ""
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                          } solid !important`,
                        borderColor: errors[`taka_no_${fieldNumber}`]
                          ? "red"
                          : "",
                      }}
                    >
                      <Controller
                        control={control}
                        name={`taka_no_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "75px",
                              border: `${errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                                } solid !important`,
                              borderColor: errors[`taka_no_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              if (checkUniqueTaka) {
                                debouncedCheckUniqueTakaHandler(
                                  e.target.value,
                                  fieldNumber
                                );
                                calculateTotalHandler();
                              }
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`meter_${fieldNumber}`}
                      validateStatus={
                        errors[`meter_${fieldNumber}`] ? "error" : ""
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                          } solid !important`,
                        borderColor: errors[`meter_${fieldNumber}`]
                          ? "red"
                          : "",
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
                              width: "100px",
                              border: `${errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                                } solid !important`,
                              borderColor: errors[`meter_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              calculateTotalHandler();
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`weight_${fieldNumber}`}
                      validateStatus={
                        errors[`weight_${fieldNumber}`] ? "error" : ""
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                          } solid !important`,
                        borderColor: errors[`weight_${fieldNumber}`]
                          ? "red"
                          : "",
                      }}
                    >
                      <Controller
                        control={control}
                        name={`weight_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100px",
                              border: `${errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                                } solid !important`,
                              borderColor: errors[`weight_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              calculateTotalHandler();
                            }}
                            onKeyDown={(event) =>
                              activeNextField(event, fieldNumber, 0)
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
              <td className="job-challan-taka-index-column">GT</td>
              <td className="total-info-td-cell">{gt_total["1"]?.total_taka}</td>
              <td className="total-info-td-cell">{gt_total["1"]?.total_meter}</td>
              <td className="total-info-td-cell">{gt_total["1"]?.total_weight}</td>
              <td className="total-info-td-cell"></td>
            </tr>
          </tbody>
        </table>
      </Col>

      <Col span={6}>
        <table border={1} className="job-challan-details-table">
          <thead>
            <th>#</th>
            <th>Taka No</th>
            <th>Meter</th>
            <th>Weight</th>
            <th>
              <MinusCircleOutlined />
            </th>
          </thead>
          <tbody>
            {numOfFields
              .slice(chunkSize * 2, chunkSize * 3)
              .map((fieldNumber) => {
                return (
                  <tr key={fieldNumber}>
                    <td className="job-challan-taka-index-column">
                      {fieldNumber}
                    </td>
                    <td>
                      <Form.Item
                        name={`taka_no_${fieldNumber}`}
                        validateStatus={
                          errors[`taka_no_${fieldNumber}`] ? "error" : ""
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{
                          marginBottom: "0px",
                          border: `${errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                            } solid !important`,
                          borderColor: errors[`taka_no_${fieldNumber}`]
                            ? "red"
                            : "",
                        }}
                      >
                        <Controller
                          control={control}
                          name={`taka_no_${fieldNumber}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              style={{
                                width: "75px",
                                border: `${errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                                  } solid !important`,
                                borderColor: errors[`taka_no_${fieldNumber}`]
                                  ? "red"
                                  : "",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                if (checkUniqueTaka) {
                                  debouncedCheckUniqueTakaHandler(
                                    e.target.value,
                                    fieldNumber
                                  );
                                  calculateTotalHandler();
                                }
                              }}
                            />
                          )}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        name={`meter_${fieldNumber}`}
                        validateStatus={
                          errors[`meter_${fieldNumber}`] ? "error" : ""
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{
                          marginBottom: "0px",
                          border: `${errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                            } solid !important`,
                          borderColor: errors[`meter_${fieldNumber}`]
                            ? "red"
                            : "",
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
                                width: "100px",
                                border: `${errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                                  } solid !important`,
                                borderColor: errors[`meter_${fieldNumber}`]
                                  ? "red"
                                  : "",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                calculateTotalHandler();
                              }}
                            />
                          )}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        name={`weight_${fieldNumber}`}
                        validateStatus={
                          errors[`weight_${fieldNumber}`] ? "error" : ""
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{
                          marginBottom: "0px",
                          border: `${errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                            } solid !important`,
                          borderColor: errors[`weight_${fieldNumber}`]
                            ? "red"
                            : "",
                        }}
                      >
                        <Controller
                          control={control}
                          name={`weight_${fieldNumber}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              style={{
                                width: "100px",
                                border: `${errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                                  } solid !important`,
                                borderColor: errors[`weight_${fieldNumber}`]
                                  ? "red"
                                  : "",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                calculateTotalHandler();
                              }}
                              onKeyDown={(event) =>
                                activeNextField(event, fieldNumber, 0)
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
              <td className="job-challan-taka-index-column">GT</td>
              <td className="total-info-td-cell">{gt_total["2"]?.total_taka}</td>
              <td className="total-info-td-cell">{gt_total["2"]?.total_meter}</td>
              <td className="total-info-td-cell">{gt_total["2"]?.total_weight}</td>
              <td className="total-info-td-cell"></td>
            </tr>
          </tbody>
        </table>
      </Col>

      <Col span={6}>
        <table border={1} className="job-challan-details-table">
          <thead>
            <th>#</th>
            <th>Taka No</th>
            <th>Meter</th>
            <th>Weight</th>
            <th>
              <MinusCircleOutlined />
            </th>
          </thead>
          <tbody>
            {numOfFields
              .slice(chunkSize * 3, chunkSize * 4)
              .map((fieldNumber) => {
                return (
                  <tr key={fieldNumber}>
                    <td className="job-challan-taka-index-column">
                      {fieldNumber}
                    </td>
                    <td>
                      <Form.Item
                        name={`taka_no_${fieldNumber}`}
                        validateStatus={
                          errors[`taka_no_${fieldNumber}`] ? "error" : ""
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{
                          marginBottom: "0px",
                          border: `${errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                            } solid !important`,
                          borderColor: errors[`taka_no_${fieldNumber}`]
                            ? "red"
                            : "",
                        }}
                      >
                        <Controller
                          control={control}
                          name={`taka_no_${fieldNumber}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              style={{
                                width: "75px",
                                border: `${errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                                  } solid !important`,
                                borderColor: errors[`taka_no_${fieldNumber}`]
                                  ? "red"
                                  : "",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                if (checkUniqueTaka) {
                                  debouncedCheckUniqueTakaHandler(
                                    e.target.value,
                                    fieldNumber
                                  );
                                  calculateTotalHandler();
                                }
                              }}
                            />
                          )}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        name={`meter_${fieldNumber}`}
                        validateStatus={
                          errors[`meter_${fieldNumber}`] ? "error" : ""
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{
                          marginBottom: "0px",
                          border: `${errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                            } solid !important`,
                          borderColor: errors[`meter_${fieldNumber}`]
                            ? "red"
                            : "",
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
                                width: "100px",
                                border: `${errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                                  } solid !important`,
                                borderColor: errors[`meter_${fieldNumber}`]
                                  ? "red"
                                  : "",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                calculateTotalHandler();
                              }}
                            />
                          )}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Form.Item
                        name={`weight_${fieldNumber}`}
                        validateStatus={
                          errors[`weight_${fieldNumber}`] ? "error" : ""
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{
                          marginBottom: "0px",
                          border: `${errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                            } solid !important`,
                          borderColor: errors[`weight_${fieldNumber}`]
                            ? "red"
                            : "",
                        }}
                      >
                        <Controller
                          control={control}
                          name={`weight_${fieldNumber}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="number"
                              style={{
                                width: "100px",
                                border: `${errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                                  } solid !important`,
                                borderColor: errors[`weight_${fieldNumber}`]
                                  ? "red"
                                  : "",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber > activeField || isUpdate != undefined && fieldNumber != activeField}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                calculateTotalHandler();
                              }}
                              onKeyDown={(event) =>
                                activeNextField(event, fieldNumber, 0)
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
              <td className="job-challan-taka-index-column">GT</td>
              <td className="total-info-td-cell">{gt_total["2"]?.total_taka}</td>
              <td className="total-info-td-cell">{gt_total["2"]?.total_meter}</td>
              <td className="total-info-td-cell">{gt_total["2"]?.total_weight}</td>
              <td className="total-info-td-cell"></td>
            </tr>
          </tbody>
        </table>
      </Col>

    </Row>
  );
};

export default FieldTable;
