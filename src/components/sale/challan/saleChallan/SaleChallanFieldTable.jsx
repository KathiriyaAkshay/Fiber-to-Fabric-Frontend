import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row } from "antd";
import { Controller } from "react-hook-form";
import { createSaleChallanTakaDetailRequest } from "../../../../api/requests/sale/challan/challan";

const numOfFields = Array.from({ length: 48 }, (_, i) => i + 1);
const chunkSize = numOfFields.length / 4;

const SaleChallanFieldTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  type,
  companyId,
  getValues,
  setTotalMeter,
  setTotalTaka,
  setTotalWeight,
  // setPendingMeter,
  // setPendingTaka,
  // setPendingWeight,
}) => {
  const getModelFromTakaNo = async (taka_no) => {
    try {
      const data = {
        sale_challan_type: type,
      };
      const response = await createSaleChallanTakaDetailRequest({
        data,
        params: {
          company_id: companyId,
          taka_no,
        },
      });
      return response.data;
    } catch (error) {
      message.error(error.response.data.message);
    }
  };

  const activeNextField = async (event, fieldNumber) => {
    if (event.keyCode === 13) {
      const data = await getModelFromTakaNo(event.target.value);

      if (data.success) {
        setValue(`meter_${fieldNumber}`, data.data.meter);
        setValue(`weight_${fieldNumber}`, data.data.weight);
        setValue(`model_${fieldNumber}`, data.data.model);

        setTotalTaka((prev) => prev + 1);
        setTotalMeter((prev) => prev + +data.data.meter);
        setTotalWeight((prev) => prev + +data.data.weight);

        // setPendingTaka((prev) => prev - 1);
        // setPendingMeter((prev) => {
        //   return +prev - +data.data.meter;
        // });
        // setPendingWeight((prev) => {
        //   return prev - +data.data.weight;
        // });

        setActiveField((prev) => prev + 1);
        setTimeout(() => {
          setFocus(`taka_no_${fieldNumber + 1}`);
        }, 0);
      } else {
        message.error(
          `Taka details not exist for Taka No: ${event.target.value}`
        );
      }
    }
  };

  const removeCurrentField = (fieldNumber) => {
    if (fieldNumber) {
      if (fieldNumber > 1) {
        setActiveField((prev) => prev - 1);
      }

      setTotalTaka((prev) => prev - 1);
      setTotalMeter((prev) => prev - (+getValues(`meter_${fieldNumber}`) || 0));
      setTotalWeight(
        (prev) => prev - (+getValues(`weight_${fieldNumber}`) || 0)
      );

      // setPendingTaka((prev) => prev + 1);
      // setPendingMeter((prev) => prev + +getValues(`meter_${fieldNumber}`));
      // setPendingWeight((prev) => prev + +getValues(`weight_${fieldNumber}`));
      setTimeout(() => {
        setValue(`taka_no_${fieldNumber}`, "");
        setValue(`meter_${fieldNumber}`, "");
        setValue(`weight_${fieldNumber}`, "");
      }, 200);
    }
  };

  return (
    <>
      <Row style={{ marginTop: "-20" }}>
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
                                width: "75px",
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
                                width: "100px",
                                border: "0px solid",
                                borderRadius: "0px",
                              }}
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
                              style={{
                                width: "100px",
                                border: "0px solid",
                                borderRadius: "0px",
                              }}
                              disabled={fieldNumber > activeField}
                            />
                          )}
                        />
                      </Form.Item>

                      {/* <Form.Item
                      name={`model_${fieldNumber}`}
                      validateStatus={
                        errors[`model_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`model_${fieldNumber}`] &&
                        errors[`model_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    > */}
                      <Controller
                        control={control}
                        name={`model_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="hidden"
                            style={{
                              width: "100px",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            disabled={fieldNumber > activeField}
                          />
                        )}
                      />
                      {/* </Form.Item> */}
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
              {numOfFields
                .slice(chunkSize, chunkSize * 2)
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
    </>
  );
};

export default SaleChallanFieldTable;
