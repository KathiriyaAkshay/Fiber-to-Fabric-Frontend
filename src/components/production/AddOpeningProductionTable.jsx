import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { useState } from "react";
import { Controller } from "react-hook-form";

const numOfFields = Array.from({ length: 12 }, (_, i) => i + 1);
// const chunkSize = numOfFields.length / 4;

const AddOpeningProductionTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  lastOpeningProductionTaka,
  getValues,
}) => {
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

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
      setValue(`taka_no_${fieldNumber}`, "");
      setValue(`meter_${fieldNumber}`, "");
      setValue(`weight_${fieldNumber}`, "");
      setValue(`machine_${fieldNumber}`, "");
    }
  };

  const calculateTotals = () => {
    let totalMeter = 0;
    let totalWeight = 0;

    const activeFieldArray = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    activeFieldArray.forEach((fieldNumber) => {
      totalMeter += +getValues(`meter_${fieldNumber}`) || 0;
      totalWeight += +getValues(`weight_${fieldNumber}`) || 0;
    });

    setTotalMeter(totalMeter);
    setTotalWeight(totalWeight);
  };

  const total = () => {
    setTimeout(() => {
      calculateTotals();
    }, 500);
  };

  //   useEffect(() => {
  //     numOfFields.forEach((fieldNumber) => {
  //       const value =
  //         fieldNumber <= activeField
  //           ? `O${lastOpeningProductionTaka + fieldNumber}`
  //           : "";
  //       setValue(`taka_no_${fieldNumber}`, value);
  //     });
  //   }, [activeField, lastOpeningProductionTaka, setValue]);

  return (
    <div>
      <table
        style={{ width: "100%", textAlign: "center" }}
        className="job-challan-details-table"
        border={1}
      >
        <thead>
          <th>No</th>
          <th>Taka No</th>
          <th>Meter</th>
          <th>Weight</th>
          <th>Machine No.</th>
          <th>
            <MinusCircleOutlined />
          </th>
        </thead>
        <tbody>
          {numOfFields.map((fieldNumber) => {
            return (
              <tr key={fieldNumber}>
                <td
                  className="job-challan-taka-index-column"
                  style={{ textAlign: "center" }}
                >
                  {fieldNumber}
                </td>
                {/* <td
                  style={{ textAlign: "center" }}
                  className="job-challan-taka-index-column"
                  width={80}
                >
                  {fieldNumber <= activeField
                    ? `O${lastOpeningProductionTaka + fieldNumber}`
                    : ""}
                </td> */}
                <td width={200}>
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
                    style={{
                      marginBottom: "0px",
                      border: "0px solid !important",
                    }}
                  >
                    <Controller
                      control={control}
                      name={`taka_no_${fieldNumber}`}
                      render={({ field }) => {
                        return (
                          <Input
                            {...field}
                            type="text"
                            style={{
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            value={
                              fieldNumber <= activeField
                                ? `O${lastOpeningProductionTaka + fieldNumber}`
                                : ""
                            }
                            // disabled={fieldNumber > activeField}
                            disabled
                          />
                        );
                      }}
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
                          type="number"
                          style={{
                            // width: "100px",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber > activeField}
                          onChange={(e) => {
                            field.onChange(e);
                            total();
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
                          type="number"
                          style={{
                            // width: "100px",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber > activeField}
                          onChange={(e) => {
                            field.onChange(e);
                            total();
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </td>
                <td>
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
                        <Input
                          {...field}
                          type="number"
                          style={{
                            // width: "100px",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          disabled={fieldNumber > activeField}
                          onKeyDown={(event) =>
                            activeNextField(event, fieldNumber)
                          }
                        />
                      )}
                    />
                  </Form.Item>
                </td>
                <td style={{ textAlign: "center" }}>
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
            <td>
              <b>Total</b>
            </td>
            <td></td>
            <td>
              <b>{totalMeter}</b>
            </td>
            <td>
              <b>{totalWeight}</b>
            </td>
            <td></td>
            <td> </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default AddOpeningProductionTable;
