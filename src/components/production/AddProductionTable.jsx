import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import { Controller } from "react-hook-form";

const numOfFields = Array.from({ length: 5 }, (_, i) => i + 1);
// const chunkSize = numOfFields.length / 4;

const AddProductionTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  lastProductionTaka,
}) => {
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
      setActiveField((prev) => prev - 1);
      setValue(`meter_${fieldNumber}`, "");
      setValue(`weight_${fieldNumber}`, "");
      setValue(`machine_no_${fieldNumber}`, "");
      setValue(`beam_no_${fieldNumber}`, "");
      setValue(`average_${fieldNumber}`, "");

      setValue(`production_meter_${fieldNumber}`, "");
      setValue(`pending_meter_${fieldNumber}`, "");
      setValue(`pending_percentage_${fieldNumber}`, "");
    }
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
          <th>Weight</th>
          <th>Machine No.</th>
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
                <td className="job-challan-taka-index-column" width={80}>
                  {fieldNumber <= activeField
                    ? lastProductionTaka + fieldNumber
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
                        />
                      )}
                    />
                  </Form.Item>
                </td>
                <td width={150}>
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
            <td>Total</td>
            <td>0</td>
            <td>0</td>
            <td></td>
            <td>0</td>
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
