import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row } from "antd";
import { Controller } from "react-hook-form";
import { useDebounceCallback } from "../../hooks/useDebounce";

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
}) => {
  const activeNextField = (event, fieldNumber) => {
    if (event.keyCode === 13) {
      if (isTakaExist) {
        message.error("Please enter valid taka no.");
      } else {
        setActiveField((prev) => prev + 1);
        setTimeout(() => {
          setFocus(`taka_no_${fieldNumber + 1}`);
        }, 0);

        // setTotalTaka((prev) => prev + 1);
        // setTotalMeter((prev) => prev + +getValues(`meter_${fieldNumber}`));
        // setTotalWeight((prev) => prev + +getValues(`weight_${fieldNumber}`));
      }
    }
  };

  const removeCurrentField = (fieldNumber) => {
    if (fieldNumber) {
      // setActiveField((prev) => prev - 1);
      if (fieldNumber > 1) {
        setActiveField((prev) => prev - 1);
      }

      // const takaNo = getValues(`taka_no_${fieldNumber}`);
      // const meter = +getValues(`meter_${fieldNumber}`);
      // const weight = +getValues(`weight_${fieldNumber}`);

      // if (takaNo && meter && weight) {
      //   setTotalTaka((prev) => (prev === 0 ? prev : prev - 1));
      //   setTotalMeter((prev) => (prev === 0 ? prev : prev - meter));
      //   setTotalWeight((prev) => (prev === 0 ? prev : prev - weight));
      // }

      setValue(`taka_no_${fieldNumber}`, "");
      setValue(`meter_${fieldNumber}`, "");
      setValue(`weight_${fieldNumber}`, "");

      clearErrors(`taka_no_${fieldNumber}`);
      clearErrors(`meter_${fieldNumber}`);
      clearErrors(`weight_${fieldNumber}`);
    }
  };

  const debouncedCheckUniqueTakaHandler = useDebounceCallback(
    (value, fieldNumber) => {
      checkUniqueTakaHandler(value, fieldNumber);
    },
    500
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
                      // help={
                      //   errors[`taka_no_${fieldNumber}`] &&
                      //   errors[`taka_no_${fieldNumber}`].message
                      // }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${
                          errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
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
                              border: `${
                                errors[`taka_no_${fieldNumber}`] ? "1px" : "0px"
                              } solid !important`,
                              borderColor: errors[`taka_no_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField}
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
                      // help={
                      //   errors[`meter_${fieldNumber}`] &&
                      //   errors[`meter_${fieldNumber}`].message
                      // }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${
                          errors[`meter_${fieldNumber}`] ? "1px" : "0px"
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
                              border: `${
                                errors[`meter_${fieldNumber}`] ? "1px" : "0px"
                              } solid !important`,
                              borderColor: errors[`meter_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField}
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
                      // help={
                      //   errors[`weight_${fieldNumber}`] &&
                      //   errors[`weight_${fieldNumber}`].message
                      // }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{
                        marginBottom: "0px",
                        border: `${
                          errors[`weight_${fieldNumber}`] ? "1px" : "0px"
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
                              border: `${
                                errors[`weight_${fieldNumber}`] ? "1px" : "0px"
                              } solid !important`,
                              borderColor: errors[`weight_${fieldNumber}`]
                                ? "red"
                                : "",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField}
                            // onChange={(e) => {
                            //   console.log("space bar click", e);
                            //   if (e.key === " ") {
                            //     e.stopPropagation();
                            //   }
                            //   setValue(
                            //     `weight_${fieldNumber}`,
                            //     e.target.value
                            //   );
                            // }}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              calculateTotalHandler();
                            }}
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
              <td>GT</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td></td>
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
                      help={
                        errors[`taka_no_${fieldNumber}`] &&
                        errors[`taka_no_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`taka_no_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            style={{
                              width: "75px",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber !== activeField}
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
                      help={
                        errors[`meter_${fieldNumber}`] &&
                        errors[`meter_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`meter_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            style={{
                              width: "100px",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber !== activeField}
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
                      help={
                        errors[`weight_${fieldNumber}`] &&
                        errors[`weight_${fieldNumber}`].message
                      }
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
                            style={{
                              width: "100px",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber !== activeField}
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
                    ></Button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td>GT</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td></td>
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
                        help={
                          errors[`taka_no_${fieldNumber}`] &&
                          errors[`taka_no_${fieldNumber}`].message
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{ marginBottom: "0px" }}
                      >
                        <Controller
                          control={control}
                          name={`taka_no_${fieldNumber}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              style={{
                                width: "75px",
                                border: "0px solid",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber !== activeField}
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
                        help={
                          errors[`meter_${fieldNumber}`] &&
                          errors[`meter_${fieldNumber}`].message
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{ marginBottom: "0px" }}
                      >
                        <Controller
                          control={control}
                          name={`meter_${fieldNumber}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              style={{
                                width: "100px",
                                border: "0px solid",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber !== activeField}
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
                        help={
                          errors[`weight_${fieldNumber}`] &&
                          errors[`weight_${fieldNumber}`].message
                        }
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
                              style={{
                                width: "100px",
                                border: "0px solid",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber !== activeField}
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
                      ></Button>
                    </td>
                  </tr>
                );
              })}
            <tr>
              <td>GT</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td></td>
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
                        help={
                          errors[`taka_no_${fieldNumber}`] &&
                          errors[`taka_no_${fieldNumber}`].message
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{ marginBottom: "0px" }}
                      >
                        <Controller
                          control={control}
                          name={`taka_no_${fieldNumber}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              style={{
                                width: "75px",
                                border: "0px solid",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber !== activeField}
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
                        help={
                          errors[`meter_${fieldNumber}`] &&
                          errors[`meter_${fieldNumber}`].message
                        }
                        required={true}
                        wrapperCol={{ sm: 24 }}
                        style={{ marginBottom: "0px" }}
                      >
                        <Controller
                          control={control}
                          name={`meter_${fieldNumber}`}
                          render={({ field }) => (
                            <Input
                              {...field}
                              style={{
                                width: "100px",
                                border: "0px solid",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber !== activeField}
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
                        help={
                          errors[`weight_${fieldNumber}`] &&
                          errors[`weight_${fieldNumber}`].message
                        }
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
                              style={{
                                width: "100px",
                                border: "0px solid",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber !== activeField}
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
                      ></Button>
                    </td>
                  </tr>
                );
              })}
            <tr>
              <td>GT</td>
              <td>0</td>
              <td>0</td>
              <td>0</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  );
};

export default FieldTable;
