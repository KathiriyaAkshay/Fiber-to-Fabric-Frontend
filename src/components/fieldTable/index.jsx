import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, Row } from "antd";
import { Controller } from "react-hook-form";

const numOfFields = Array.from({ length: 48 }, (_, i) => i + 1);
const chunkSize = numOfFields.length / 4;

const FieldTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
}) => {
  const activeNextField = (event, fieldNumber) => {
    if (event.keyCode === 32) {
      setActiveField((prev) => prev + 1);
      setTimeout(() => {
        setFocus(`taka_no_${fieldNumber + 1}`);
      }, 0);
    }
  };

  const removeCurrentField = (fieldNumber) => {
    if (fieldNumber) {
      setActiveField((prev) => prev - 1);
      setValue(`taka_no_${fieldNumber}`, "");
      setValue(`meter_${fieldNumber}`, "");
      setValue(`weight_${fieldNumber}`, "");
    }
  };

  return (
    <Row>
      <Col span={6}>
        <table className="job-challan-details-table" border={1}>
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
            {numOfFields.slice(0, chunkSize).map((fieldNumber) => {
              return (
                <tr key={fieldNumber}>
                  <td>{fieldNumber}</td>
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
                            type="number"
                            style={{ width: "75px" }}
                            disabled={fieldNumber > activeField}
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
                            type="number"
                            style={{ width: "100px" }}
                            disabled={fieldNumber > activeField}
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
                            style={{ width: "100px" }}
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
                  <td>{fieldNumber}</td>
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
                            style={{ width: "75px" }}
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
                            style={{ width: "100px" }}
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
                            style={{ width: "100px" }}
                            disabled={fieldNumber !== activeField}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Button
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
                    <td>{fieldNumber}</td>
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
                              style={{ width: "75px" }}
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
                              style={{ width: "100px" }}
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
                              style={{ width: "100px" }}
                              disabled={fieldNumber !== activeField}
                            />
                          )}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Button
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
                    <td>{fieldNumber}</td>
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
                              style={{ width: "75px" }}
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
                              style={{ width: "100px" }}
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
                              style={{ width: "100px" }}
                              disabled={fieldNumber !== activeField}
                            />
                          )}
                        />
                      </Form.Item>
                    </td>
                    <td>
                      <Button
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
