import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Form, Input, Row } from "antd";
import { useState } from "react";
import { Controller } from "react-hook-form";

const numOfFields = Array.from({ length: 20 }, (_, i) => i + 1);
const chunkSize = numOfFields.length / 2;

const ReworkChallanFieldTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  getValues,
}) => {
  const [totalTaka, setTotalTaka] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalReceiveMeter, setTotalReceiveMeter] = useState(0);

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
      if (fieldNumber > 1) {
        setActiveField((prev) => prev - 1);
      }
      setValue(`taka_no_${fieldNumber}`, "");
      setValue(`meter_${fieldNumber}`, "");
      setValue(`received_meter_${fieldNumber}`, "");
      setValue(`received_weight_${fieldNumber}`, "");
      setValue(`short_${fieldNumber}`, "");
    }
  };

  const calculateTotal = () => {
    const numOfFields = Array.from({ length: activeField }, (_, i) => i + 1);

    let totalTaka = 0;
    let totalMeter = 0;
    let totalReceiveMeter = 0;
    numOfFields.forEach((fieldNumber) => {
      totalTaka += +getValues(`taka_no_${fieldNumber}`) || 0;
      totalMeter += +getValues(`meter_${fieldNumber}`) || 0;
      totalReceiveMeter += +getValues(`received_meter_${fieldNumber}`) || 0;
    });

    setTotalTaka(totalTaka);
    setTotalMeter(totalMeter);
    setTotalReceiveMeter(totalReceiveMeter);

    setValue("total_meter", totalMeter);
    setValue("total_taka", totalTaka);
    setValue("taka_receive_meter", totalReceiveMeter);
  };
  // const calculateTotalTaka = (value) => {
  //   setTotalTaka((prevValue) => prevValue + +value);
  // };

  // const calculateTotalMeter = (value) => {
  //   setTotalMeter((prevValue) => prevValue + +value);
  // };

  // const calculateTotalReceiveMeter = (value) => {
  //   setTotalReceiveMeter((prevValue) => prevValue + +value);
  // };

  return (
    <Row style={{ marginTop: "-20" }} gutter={18}>
      <Col span={12}>
        <table
          className="job-challan-details-table"
          border={1}
          style={{ width: "100%" }}
        >
          <thead>
            <th>#</th>
            <th>Taka No</th>
            <th>Meter</th>
            <th>Received Meter</th>
            <th>Received Weight</th>
            <th>Short (%)</th>
            <th>
              <MinusCircleOutlined />
            </th>
          </thead>
          <tbody>
            {numOfFields.slice(0, chunkSize).map((fieldNumber) => {
              return (
                <tr key={fieldNumber}>
                  <td
                    className="job-challan-taka-index-column"
                    style={{ textAlign: "center" }}
                  >
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
                      style={{
                        marginBottom: "0px",
                        border: "0px solid !important",
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
                              width: "100%",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField}
                            onChange={(e) => {
                              field.onChange(e);
                              calculateTotal();
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
                              width: "100%",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField}
                            onChange={(e) => {
                              field.onChange(e);
                              calculateTotal();
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`received_meter_${fieldNumber}`}
                      validateStatus={
                        errors[`received_meter_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`received_meter_${fieldNumber}`] &&
                        errors[`received_meter_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`received_meter_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100%",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField}
                            onChange={(e) => {
                              field.onChange(e);
                              calculateTotal();
                            }}
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
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`received_weight_${fieldNumber}`}
                      validateStatus={
                        errors[`received_weight_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`received_weight_${fieldNumber}`] &&
                        errors[`received_weight_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`received_weight_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100%",
                              border: "0px solid",
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
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`short_${fieldNumber}`}
                      validateStatus={
                        errors[`short_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`short_${fieldNumber}`] &&
                        errors[`short_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`short_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100%",
                              border: "0px solid",
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
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Col>

      <Col span={12}>
        <table
          border={1}
          className="job-challan-details-table"
          style={{ width: "100%" }}
        >
          <thead>
            <th>#</th>
            <th>Taka No</th>
            <th>Meter</th>
            <th>Received Meter</th>
            <th>Received Weight</th>
            <th>Short (%)</th>
            <th>
              <MinusCircleOutlined />
            </th>
          </thead>
          <tbody>
            {numOfFields.slice(chunkSize, chunkSize * 2).map((fieldNumber) => {
              return (
                <tr key={fieldNumber}>
                  <td
                    className="job-challan-taka-index-column"
                    style={{ textAlign: "center" }}
                  >
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
                  <td>
                    <Form.Item
                      name={`received_meter_${fieldNumber}`}
                      validateStatus={
                        errors[`received_meter_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`received_meter_${fieldNumber}`] &&
                        errors[`received_meter_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`received_meter_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100%",
                              border: "0px solid",
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
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`received_weight_${fieldNumber}`}
                      validateStatus={
                        errors[`received_weight_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`received_weight_${fieldNumber}`] &&
                        errors[`received_weight_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`received_weight_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100%",
                              border: "0px solid",
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
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                  <td>
                    <Form.Item
                      name={`short_${fieldNumber}`}
                      validateStatus={
                        errors[`short_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`short_${fieldNumber}`] &&
                        errors[`short_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`short_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100%",
                              border: "0px solid",
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
                    ></Button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td>GT</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Col>

      <Col span={12}>
        <Flex style={{ marginTop: "30px", gap: "1rem" }}>
          <Form.Item label="Total Taka">
            <Input disabled value={totalTaka} style={{ width: "300px" }} />
          </Form.Item>
          <Form.Item label="Total Meter">
            <Input disabled value={totalMeter} style={{ width: "300px" }} />
          </Form.Item>
          <Form.Item label="Total Receive Meter">
            <Input
              disabled
              value={totalReceiveMeter}
              style={{ width: "300px" }}
            />
          </Form.Item>
        </Flex>
      </Col>
    </Row>
  );
};

export default ReworkChallanFieldTable;
