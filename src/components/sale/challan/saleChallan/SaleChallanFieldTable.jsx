import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row, Tag } from "antd";
import { Controller } from "react-hook-form";
import { createSaleChallanTakaDetailRequest } from "../../../../api/requests/sale/challan/challan";
import { useEffect, useState } from "react";
import { PURCHASE_TAG_COLOR, SALE_TAG_COLOR, JOB_TAG_COLOR } from "../../../../constants/tag";
import { array } from "yup";

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
  setSaleChallanTypes,
  quality_id
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
          quality_id: quality_id
        },
      });
      return response.data;
    } catch (error) {
      return { "success": false };
    }
  };

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
    CalculateTableWiseTotal(0);
    CalculateTableWiseTotal(1);
    CalculateTableWiseTotal(2);
  }, [getValues])

  const activeNextField = async (event, fieldNumber, indexTable) => {
    if (event.keyCode === 13) {
      const data = await getModelFromTakaNo(event.target.value);

      if (data.success) {

        setSaleChallanTypes((prev) => {
          if (data.data.model && !prev.includes(data.data.model))
            return [...prev, data.data.model];
          else return [...prev];
        });

        setValue(`meter_${fieldNumber}`, data.data.meter);
        setValue(`weight_${fieldNumber}`, data.data.weight);
        setValue(`model_${fieldNumber}`, data.data.model);

        setTotalTaka((prev) => prev + 1);
        setTotalMeter((prev) => prev + +data.data.meter);
        setTotalWeight((prev) => prev + +data.data.weight);
        setActiveField((prev) => prev + 1);

        CalculateTableWiseTotal(indexTable);

        setTimeout(() => {
          setFocus(`taka_no_${fieldNumber + 1}`);
        }, 10);
      } else {
        message.error(
          `Taka details not exist for Taka No: ${event.target.value}`
        );
        setValue(`meter_${fieldNumber}`, undefined);
        setValue(`weight_${fieldNumber}`, undefined);
        setValue(`model_${fieldNumber}`, undefined);
        setValue(`taka_no_${fieldNumber}`, undefined);
      }
    }
  };

  const removeCurrentField = (fieldNumber, indexColumn) => {
    if (fieldNumber) {
      if (fieldNumber > 1) {
        setActiveField((prev) => prev - 1);
      }

      setTotalTaka((prev) => prev - 1);
      setTotalMeter((prev) => prev - (+getValues(`meter_${fieldNumber}`) || 0));
      setTotalWeight(
        (prev) => prev - (+getValues(`weight_${fieldNumber}`) || 0)
      );

      setTimeout(() => {
        setValue(`taka_no_${fieldNumber}`, "");
        setValue(`meter_${fieldNumber}`, "");
        setValue(`weight_${fieldNumber}`, "");
        setValue(`model_${fieldNumber}`, "");
      }, 200);

      setTimeout(() => {
        setFocus(`taka_no_${fieldNumber + 1}`);
      }, 10);

      let temp_taka = gt_total[indexColumn]?.total_taka;
      let temp_meter = gt_total[indexColumn]?.total_meter;
      let temp_weight = gt_total[indexColumn]?.total_weight;

      temp_taka = temp_taka - 1;
      temp_meter = temp_meter - Number(getValues(`meter_${fieldNumber}`));
      temp_weight = temp_weight - Number(getValues(`weight_${fieldNumber}`));

      set_gt_total((prevState) => ({
        ...prevState,
        [indexColumn]: {
          total_taka: temp_taka,
          total_meter: temp_meter,
          total_weight: temp_weight
        }
      }))

    }
  };

  return (
    <>
      <Row style={{ marginTop: "-20" }}>

        <Col span={8}>
          <table className="job-challan-details-table" border={1}>
            <thead>
              <th>#</th>
              <th>Taka No</th>
              <th>Meter</th>
              <th>Weight</th>
              <th style={{ minWidth: 90 }}>Info</th>
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
                              disabled={fieldNumber !== activeField}
                              onKeyDown={(event) =>
                                activeNextField(event, fieldNumber, 0)
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
                              readOnly
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
                              readOnly
                            />
                          )}
                        />
                      </Form.Item>
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
                            disabled={fieldNumber !== activeField}
                          />
                        )}
                      />
                    </td>

                    <td style={{ paddingLeft: 10, minWidth: 90, justifyContent: "center" }}>
                      {getValues(`model_${fieldNumber}`) !== "" && getValues(`model_${fieldNumber}`) !== undefined && (
                        <Tag color={getValues(`model_${fieldNumber}`) == "taka(inhouse)" ? SALE_TAG_COLOR :
                          getValues(`model_${fieldNumber}`) == "purchase/trading" ? PURCHASE_TAG_COLOR : JOB_TAG_COLOR}>
                          {
                            String(
                              getValues(`model_${fieldNumber}`)).toUpperCase() == "PURCHASE/TRADING"
                              ? "PURCHASE"
                              : String(getValues(`model_${fieldNumber}`)).toUpperCase() == "TAKA(INHOUSE)" ? "INHOUSE" : "JOB"
                          }
                        </Tag>
                      )}
                    </td>

                    <td>
                      <Button
                        className="job-challan-taka-plus-option"
                        icon={<MinusCircleOutlined />}
                        disabled={fieldNumber > activeField}
                        onClick={() => removeCurrentField(fieldNumber, 0)}
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
                <td className="total-info-td-cell"></td>
              </tr>
            </tbody>
          </table>
        </Col>

        <Col span={8}>
          <table border={1} className="job-challan-details-table">
            <thead>
              <th>#</th>
              <th>Taka No</th>
              <th>Meter</th>
              <th>Weight</th>
              <th style={{ minWidth: 90 }}>Info</th>
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
                                onKeyDown={(event) =>
                                  activeNextField(event, fieldNumber, 1)
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

                      <td style={{ paddingLeft: 10, minWidth: 90, justifyContent: "center" }}>
                        {getValues(`model_${fieldNumber}`) !== "" && getValues(`model_${fieldNumber}`) !== undefined && (
                          <Tag color={getValues(`model_${fieldNumber}`) == "taka(inhouse)" ? SALE_TAG_COLOR :
                            getValues(`model_${fieldNumber}`) == "purchase/trading" ? PURCHASE_TAG_COLOR : JOB_TAG_COLOR}>
                            {
                              String(
                                getValues(`model_${fieldNumber}`)).toUpperCase() == "PURCHASE/TRADING"
                                ? "PURCHASE"
                                : String(getValues(`model_${fieldNumber}`)).toUpperCase() == "TAKA(INHOUSE)" ? "INHOUSE" : "JOB"
                            }
                          </Tag>
                        )}
                      </td>
                      <td>
                        <Button
                          className="job-challan-taka-plus-option"
                          icon={<MinusCircleOutlined />}
                          disabled={fieldNumber > activeField}
                          onClick={() => removeCurrentField(fieldNumber, 0)}
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
                <td className="total-info-td-cell"></td>
              </tr>
            </tbody>
          </table>
        </Col>

        <Col span={8}>
          <table border={1} className="job-challan-details-table">
            <thead>
              <th>#</th>
              <th>Taka No</th>
              <th>Meter</th>
              <th>Weight</th>
              <th style={{ minWidth: 90 }}>Info</th>
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
                                onKeyDown={(event) =>
                                  activeNextField(event, fieldNumber, 2)
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
                      <td style={{ paddingLeft: 10, minWidth: 90, justifyContent: "center" }}>
                        {getValues(`model_${fieldNumber}`) !== "" && getValues(`model_${fieldNumber}`) !== undefined && (
                          <Tag color={getValues(`model_${fieldNumber}`) == "taka(inhouse)" ? SALE_TAG_COLOR :
                            getValues(`model_${fieldNumber}`) == "purchase/trading" ? PURCHASE_TAG_COLOR : JOB_TAG_COLOR}>
                            {
                              String(
                                getValues(`model_${fieldNumber}`)).toUpperCase() == "PURCHASE/TRADING"
                                ? "PURCHASE"
                                : String(getValues(`model_${fieldNumber}`)).toUpperCase() == "TAKA(INHOUSE)" ? "INHOUSE" : "JOB"
                            }
                          </Tag>
                        )}
                      </td>
                      <td>
                        <Button
                          className="job-challan-taka-plus-option"
                          icon={<MinusCircleOutlined />}
                          disabled={fieldNumber > activeField}
                          onClick={() => removeCurrentField(fieldNumber, 0)}
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
                <td className="total-info-td-cell"></td>
              </tr>
            </tbody>
          </table>
        </Col>

        {/* <Col span={6}>
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
                                onKeyDown={(event) =>
                                  activeNextField(event, fieldNumber, 3)
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
                          disabled={fieldNumber > activeField}
                          onClick={() => removeCurrentField(fieldNumber, 0)}
                        ></Button>
                      </td>
                    </tr>
                  );
                })}
              <tr>
                <td className="job-challan-taka-index-column">GT</td>
                <td className="total-info-td-cell">{gt_total["3"]?.total_taka}</td>
                <td className="total-info-td-cell">{gt_total["3"]?.total_meter}</td>
                <td className="total-info-td-cell">{gt_total["3"]?.total_weight}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </Col> */}
      </Row>
    </>
  );
};

export default SaleChallanFieldTable;
