// import { ArrowLeftOutlined } from "@ant-design/icons";
// import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Card,
  Radio,
  Typography,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useState } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const CostCalculator = () => {
  const [warpingFormArray, setWarpingFormArray] = useState([0]);
  const [weftFormArray, setWeftFormArray] = useState([0]);

  const [warpRadioOption, setWarpRadioOption] = useState("denier");
  const [weftRadioOption, setWeftRadioOption] = useState("denier");

  const [avgCost, setAvgCost] = useState(null);
  const [totalCostPerMeter, setTotalCostPerMeter] = useState(0);

  const [tana, setTana] = useState(0);
  const [wana, setWana] = useState(0);
  //   const { companyId } = useContext(GlobalContext);

  const {
    control,
    // handleSubmit,
    formState: { errors },
    // reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    // watch,
  } = useForm({
    defaultValues: {},
  });

  const addWarpingDetailRow = (indexValue) => {
    let isValid = true;

    warpingFormArray.forEach((item, index) => {
      clearErrors(`warp_denier_${index}`);
      clearErrors(`tars_${index}`);
      clearErrors(`warp_tpm_${index}`);
      clearErrors(`warp_weight_${index}`);
    });

    warpingFormArray.forEach((item, index) => {
      if (index === indexValue) {
        if (!getValues(`warp_denier_${index}`)) {
          setError(`warp_denier_${index}`, {
            type: "manual",
            message: "Please enter denier value",
          });
          isValid = false;
        }
        if (!getValues(`tars_${index}`)) {
          setError(`tars_${index}`, {
            type: "manual",
            message: "Please enter tars.",
          });
          isValid = false;
        }
        if (!getValues(`warp_tpm_${index}`)) {
          setError(`warp_tpm_${index}`, {
            type: "manual",
            message: "Please enter tpm.",
          });
          isValid = false;
        }
        // if (!getValues(`warp_weight_${index}`)) {
        //   setError(`warp_weight_${index}`, {
        //     type: "manual",
        //     message: "Please enter weight.",
        //   });
        //   isValid = false;
        // }
        // if (!getValues(`yarn_stock_company_id_${index}`)) {
        //   setError(`yarn_stock_company_id_${index}`, {
        //     type: "manual",
        //     message: "Please select yarn stock company",
        //   });
        //   isValid = false;
        // }
      }
    });

    if (isValid) {
      const nextValue = warpingFormArray.length;
      setWarpingFormArray((prev) => {
        return [...prev, nextValue];
      });
    }
  };

  const deleteWarpingDetailRow = (field) => {
    const newFields = [...warpingFormArray];
    newFields.splice(field, 1);
    setWarpingFormArray(newFields);
  };

  const addWeftDetailRow = (indexValue) => {
    let isValid = true;

    weftFormArray.forEach((item, index) => {
      clearErrors(`weft_denier_${index}`);
      clearErrors(`pano_${index}`);
      clearErrors(`peak_${index}`);

      clearErrors(`read_${index}`);
      clearErrors(`weft_tpm_${index}`);
    });

    weftFormArray.forEach((item, index) => {
      if (index === indexValue) {
        if (!getValues(`weft_denier_${index}`)) {
          setError(`weft_denier_${index}`, {
            type: "manual",
            message: "Please enter denier",
          });
          isValid = false;
        }
        if (!getValues(`pano_${index}`)) {
          setError(`pano_${index}`, {
            type: "manual",
            message: "Please enter pano.",
          });
          isValid = false;
        }
        if (!getValues(`peak_${index}`)) {
          setError(`peak_${index}`, {
            type: "manual",
            message: "Please enter peak.",
          });
          isValid = false;
        }

        if (!getValues(`read_${index}`)) {
          setError(`read_${index}`, {
            type: "manual",
            message: "Please enter read.",
          });
          isValid = false;
        }
        if (!getValues(`weft_tpm_${index}`)) {
          setError(`weft_tpm_${index}`, {
            type: "manual",
            message: "Please enter tpm.",
          });
          isValid = false;
        }
        // if (!getValues(`weft_weight_${index}`)) {
        //   setError(`weft_weight_${index}`, {
        //     type: "manual",
        //     message: "Please enter weft weight.",
        //   });
        //   isValid = false;
        // }
      }
    });

    if (isValid) {
      const nextValue = weftFormArray.length;
      setWeftFormArray((prev) => {
        return [...prev, nextValue];
      });
    }
  };

  const deleteWeftDetailRow = (field) => {
    const newFields = [...weftFormArray];
    newFields.splice(field, 1);
    setWeftFormArray(newFields);
  };

  const calculateTanaWana = () => {
    let totalTana = 0;
    warpingFormArray.forEach((field, index) => {
      const warping_weight = getValues(`warp_weight_${index}`) ?? 0;
      totalTana += parseFloat(warping_weight);
    });

    let totalWana = 0;
    weftFormArray.forEach((field, index) => {
      const weft_weight = getValues(`weft_weight_${index}`) ?? 0;
      totalWana += parseFloat(weft_weight);
    });

    setTana(totalTana);
    setWana(totalWana);
  };

  const calculateWarpingWeight = (indexValue) => {
    let finalDenierValue;
    const tars = parseFloat(getValues(`tars_${indexValue}`));
    const tpm = parseFloat(getValues(`warp_tpm_${indexValue}`));
    const denier = parseFloat(getValues(`warp_denier_${indexValue}`));

    if (warpRadioOption === "denier") {
      finalDenierValue = denier;
    } else {
      finalDenierValue = parseFloat((5315 / denier).toFixed(3));
    }

    if (tars && tpm && finalDenierValue) {
      if (tpm !== 0) {
        const A = (tpm * 0.0075) / 100;
        const B = A * finalDenierValue;
        const C = B + finalDenierValue;
        const D = (C * tars * 106) / 9000000;

        setValue(`warp_weight_${indexValue}`, D.toFixed(3));
        calculateTanaWana();
      } else {
        const D = (finalDenierValue * tars * 106) / 9000000;
        setValue(`warp_weight_${indexValue}`, D.toFixed(3));
        calculateTanaWana();
      }
    }
  };

  const calculateAllWarpingWeight = (radioOption = "") => {
    warpingFormArray.forEach((field, index) => {
      let finalDenierValue;
      const tars = parseFloat(getValues(`tars_${index}`));
      const tpm = parseFloat(getValues(`warp_tpm_${index}`));
      const denier = parseFloat(getValues(`warp_denier_${index}`));

      if (radioOption === "denier") {
        finalDenierValue = denier;
      } else {
        finalDenierValue = parseFloat((5315 / denier).toFixed(3));
      }

      if (tars && tpm && finalDenierValue) {
        if (tpm !== 0) {
          const A = (tpm * 0.0075) / 100;
          const B = A * finalDenierValue;
          const C = B + finalDenierValue;
          const D = (C * tars * 106) / 9000000;

          setValue(`warp_weight_${index}`, D.toFixed(3));
        } else {
          const D = (finalDenierValue * tars * 106) / 9000000;
          setValue(`warp_weight_${index}`, D.toFixed(3));
        }
      }
    });
    calculateTanaWana();
  };

  const calculateWeftWeight = (indexValue) => {
    let finalDenierValue;
    const denier = parseFloat(getValues(`weft_denier_${indexValue}`));
    const pano = parseFloat(getValues(`pano_${indexValue}`));
    const peak = parseFloat(getValues(`peak_${indexValue}`));
    const tpm = parseFloat(getValues(`weft_tpm_${indexValue}`));
    // const read = parseFloat(getValues(`read_${indexValue}`));

    if (weftRadioOption === "denier") {
      finalDenierValue = denier;
    } else {
      finalDenierValue = parseFloat((5315 / denier).toFixed(3));
    }

    if (pano && peak && tpm && finalDenierValue) {
      if (tpm !== 0) {
        const A = (tpm * 0.0075) / 100;
        const B = A * finalDenierValue;
        const C = B + finalDenierValue;
        const D = (C * pano * peak * 106) / 9000000;

        setValue(`weft_weight_${indexValue}`, D.toFixed(3));
        calculateTanaWana();
      } else {
        const D = (finalDenierValue * pano * peak * 106) / 9000000;
        setValue(`weft_weight_${indexValue}`, D.toFixed(3));
        calculateTanaWana();
      }
    }
  };

  const calculateAllWeftWeight = (radioOption = "") => {
    weftFormArray.forEach((field, index) => {
      let finalDenierValue;
      const denier = parseFloat(getValues(`weft_denier_${index}`));
      const pano = parseFloat(getValues(`pano_${index}`));
      const peak = parseFloat(getValues(`peak_${index}`));
      const tpm = parseFloat(getValues(`weft_tpm_${index}`));
      // const read = parseFloat(getValues(`read_${indexValue}`));

      if (radioOption === "denier") {
        finalDenierValue = denier;
      } else {
        finalDenierValue = parseFloat((5315 / denier).toFixed(3));
      }

      if (pano && peak && tpm && finalDenierValue) {
        if (tpm !== 0) {
          const A = (tpm * 0.0075) / 100;
          const B = A * finalDenierValue;
          const C = B + finalDenierValue;
          const D = (C * pano * peak * 106) / 9000000;

          setValue(`weft_weight_${index}`, D.toFixed(3));
        } else {
          const D = (finalDenierValue * pano * peak * 106) / 9000000;
          setValue(`weft_weight_${index}`, D.toFixed(3));
        }
      }
    });
    calculateTanaWana();
  };

  // return code
  return (
    <>
      <Row
        gutter={18}
        style={{
          margin: 0,
          padding: 0,
        }}
      >
        <Col className="gutter-row" span={18}>
          <>
            {/* Warping Detail[Tana]  */}
            <Card style={{ margin: "1rem 0px" }}>
              <h2 className="m-0 text-primary">WARP [TANA]:</h2>

              <br />
              <Radio.Group
                onChange={(e) => {
                  setWarpRadioOption(e.target.value);
                  calculateAllWarpingWeight(e.target.value);
                }}
                value={warpRadioOption}
              >
                <Radio value={"denier"}> Denier </Radio>
                <Radio value={"count"}> Count </Radio>
              </Radio.Group>

              {warpingFormArray.length
                ? warpingFormArray.map((field, index) => {
                    return (
                      <Row
                        key={field + "_field_warping"}
                        gutter={18}
                        style={{
                          padding: "12px",
                        }}
                      >
                        <Col span={4}>
                          <Form.Item
                            label={"Denier"}
                            name={`warp_denier_${index}`}
                            validateStatus={
                              errors[`warp_denier_${index}`] ? "error" : ""
                            }
                            help={
                              errors[`warp_denier_${index}`] &&
                              errors[`warp_denier_${index}`].message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                          >
                            <Controller
                              control={control}
                              name={`warp_denier_${index}`}
                              render={({ field }) => {
                                return (
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="50"
                                    onChange={(e) => {
                                      field.onChange(e);
                                      if (e.target.value === "") {
                                        setValue(`warp_tpm_${index}`, "");
                                        setValue(`warp_weight_${index}`, "");
                                      } else {
                                        calculateWarpingWeight(index);
                                      }
                                    }}
                                  />
                                );
                              }}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            label={"Tar/Ends"}
                            name={`tars_${index}`}
                            validateStatus={
                              errors[`tars_${index}`] ? "error" : ""
                            }
                            help={
                              errors[`tars_${index}`] &&
                              errors[`tars_${index}`].message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                          >
                            <Controller
                              control={control}
                              name={`tars_${index}`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  {...field}
                                  placeholder="5560"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value === "") {
                                      setValue(`warp_tpm_${index}`, "");
                                      setValue(`warp_weight_${index}`, "");
                                    } else {
                                      calculateWarpingWeight(index);
                                    }
                                  }}
                                />
                              )}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            label={"TPM"}
                            name={`warp_tpm_${index}`}
                            validateStatus={
                              errors[`warp_tpm_${index}`] ? "error" : ""
                            }
                            help={
                              errors[`warp_tpm_${index}`] &&
                              errors[`warp_tpm_${index}`].message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                          >
                            <Controller
                              control={control}
                              name={`warp_tpm_${index}`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="62.00"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    if (e.target.value === "") {
                                      setValue(`warp_weight_${index}`, "");
                                    } else {
                                      calculateWarpingWeight(index);
                                    }
                                  }}
                                />
                              )}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            label={"Weight[100Mtr]"}
                            name={`warp_weight_${index}`}
                            validateStatus={
                              errors[`warp_weight_${index}`] ? "error" : ""
                            }
                            help={
                              errors[`warp_weight_${index}`] &&
                              errors[`warp_weight_${index}`].message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                          >
                            <Controller
                              control={control}
                              name={`warp_weight_${index}`}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="62.00"
                                />
                              )}
                            />
                          </Form.Item>
                        </Col>

                        <Col span={2}>
                          <Flex gap={20}>
                            {warpingFormArray.length > 1 && (
                              <Button
                                style={{ marginTop: "1.9rem" }}
                                icon={<DeleteOutlined />}
                                type="primary"
                                onClick={deleteWarpingDetailRow.bind(
                                  null,
                                  field
                                )}
                                className="flex-none"
                              />
                            )}
                            {index === warpingFormArray.length - 1 && (
                              <Button
                                style={{ marginTop: "1.9rem" }}
                                icon={<PlusOutlined />}
                                type="primary"
                                onClick={addWarpingDetailRow.bind(null, index)}
                                className="flex-none"
                              />
                            )}
                          </Flex>
                        </Col>

                        <Col span={4}>
                          <Form.Item
                            label={"Rate"}
                            name={`warp_rate_${index}`}
                            validateStatus={
                              errors[`warp_rate_${index}`] ? "error" : ""
                            }
                            help={
                              errors[`warp_rate_${index}`] &&
                              errors[`warp_rate_${index}`].message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                          >
                            <Controller
                              control={control}
                              name={`warp_rate_${index}`}
                              render={({ field }) => (
                                <Input
                                  type="number"
                                  {...field}
                                  placeholder="62.00"
                                  onChange={(e) => {
                                    field.onChange(e);
                                  }}
                                />
                              )}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    );
                  })
                : null}
            </Card>

            {/* Weft Detail[Wana]  */}
            <Card style={{ margin: "1rem 0px" }}>
              <h2 className="m-0 text-primary">WEFT [WANA]:</h2>

              <br />
              <Radio.Group
                onChange={(e) => {
                  setWeftRadioOption(e.target.value);
                  calculateAllWeftWeight(e.target.value);
                }}
                value={weftRadioOption}
              >
                <Radio value={"denier"}> Denier </Radio>
                <Radio value={"count"}> Count </Radio>
              </Radio.Group>

              {weftFormArray.length
                ? weftFormArray.map((field, index) => {
                    return (
                      <>
                        <Row
                          key={field + "_field_weft"}
                          gutter={18}
                          style={{
                            padding: "12px",
                          }}
                        >
                          <Col span={5}>
                            <Form.Item
                              label={"Denier"}
                              name={`weft_denier_${index}`}
                              validateStatus={
                                errors[`weft_denier_${index}`] ? "error" : ""
                              }
                              help={
                                errors[`weft_denier_${index}`] &&
                                errors[`weft_denier_${index}`].message
                              }
                              required={true}
                              wrapperCol={{ sm: 24 }}
                            >
                              <Controller
                                control={control}
                                name={`weft_denier_${index}`}
                                render={({ field }) => {
                                  return (
                                    <Input
                                      {...field}
                                      type="number"
                                      placeholder="50"
                                      onChange={(e) => {
                                        field.onChange(e);
                                        if (e.target.value === "") {
                                          setValue(`weft_tpm_${index}`, "");
                                          setValue(`weft_weight_${index}`, "");
                                        } else {
                                          calculateWeftWeight(index);
                                        }
                                      }}
                                    />
                                  );
                                }}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={2}>
                            <Form.Item
                              label={"Pano"}
                              name={`pano_${index}`}
                              validateStatus={
                                errors[`pano_${index}`] ? "error" : ""
                              }
                              help={
                                errors[`pano_${index}`] &&
                                errors[`pano_${index}`].message
                              }
                              required={true}
                              wrapperCol={{ sm: 24 }}
                            >
                              <Controller
                                control={control}
                                name={`pano_${index}`}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="54.00"
                                    onChange={(e) => {
                                      field.onChange(e);
                                      if (e.target.value === "") {
                                        setValue(`weft_tpm_${index}`, "");
                                        setValue(`weft_weight_${index}`, "");
                                      } else {
                                        calculateWeftWeight(index);
                                      }
                                    }}
                                  />
                                )}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={2}>
                            <Form.Item
                              label={"Peak"}
                              name={`peak_${index}`}
                              validateStatus={
                                errors[`peak_${index}`] ? "error" : ""
                              }
                              help={
                                errors[`peak_${index}`] &&
                                errors[`peak_${index}`].message
                              }
                              required={true}
                              wrapperCol={{ sm: 24 }}
                            >
                              <Controller
                                control={control}
                                name={`peak_${index}`}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="62.00"
                                    onChange={(e) => {
                                      field.onChange(e);
                                      if (e.target.value === "") {
                                        setValue(`weft_tpm_${index}`, "");
                                        setValue(`weft_weight_${index}`, "");
                                      } else {
                                        calculateWeftWeight(index);
                                      }
                                    }}
                                  />
                                )}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={2}>
                            <Form.Item
                              label={"Read"}
                              name={`read_${index}`}
                              validateStatus={
                                errors[`read_${index}`] ? "error" : ""
                              }
                              help={
                                errors[`read_${index}`] &&
                                errors[`read_${index}`].message
                              }
                              required={true}
                              wrapperCol={{ sm: 24 }}
                            >
                              <Controller
                                control={control}
                                name={`read_${index}`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    {...field}
                                    placeholder="62.00"
                                  />
                                )}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={2}>
                            <Form.Item
                              label={"TPM"}
                              name={`weft_tpm_${index}`}
                              validateStatus={
                                errors[`weft_tpm_${index}`] ? "error" : ""
                              }
                              help={
                                errors[`weft_tpm_${index}`] &&
                                errors[`weft_tpm_${index}`].message
                              }
                              required={true}
                              wrapperCol={{ sm: 24 }}
                            >
                              <Controller
                                control={control}
                                name={`weft_tpm_${index}`}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    type="number"
                                    placeholder="62.00"
                                    onChange={(e) => {
                                      field.onChange(e);
                                      if (e.target.value === "") {
                                        setValue(`weft_weight_${index}`, "");
                                      } else {
                                        calculateWeftWeight(index);
                                      }
                                    }}
                                  />
                                )}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={3}>
                            <Form.Item
                              label={"Weight[100Mtr]"}
                              name={`weft_weight_${index}`}
                              validateStatus={
                                errors[`weft_weight_${index}`] ? "error" : ""
                              }
                              help={
                                errors[`weft_weight_${index}`] &&
                                errors[`weft_weight_${index}`].message
                              }
                              required={true}
                              wrapperCol={{ sm: 24 }}
                            >
                              <Controller
                                control={control}
                                name={`weft_weight_${index}`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    {...field}
                                    placeholder="62.00"
                                  />
                                )}
                              />
                            </Form.Item>
                          </Col>

                          <Col span={2}>
                            <Flex gap={20}>
                              {weftFormArray.length > 1 && (
                                <Button
                                  style={{ marginTop: "1.9rem" }}
                                  icon={<DeleteOutlined />}
                                  type="primary"
                                  onClick={deleteWeftDetailRow.bind(
                                    null,
                                    field
                                  )}
                                  className="flex-none"
                                />
                              )}

                              {index === weftFormArray.length - 1 && (
                                <Button
                                  style={{ marginTop: "1.9rem" }}
                                  icon={<PlusOutlined />}
                                  type="primary"
                                  onClick={addWeftDetailRow.bind(null, index)}
                                  className="flex-none"
                                />
                              )}
                            </Flex>
                          </Col>

                          <Col span={4}>
                            <Form.Item
                              label={"Rate"}
                              name={`weft_rate_${index}`}
                              validateStatus={
                                errors[`weft_rate_${index}`] ? "error" : ""
                              }
                              help={
                                errors[`weft_rate_${index}`] &&
                                errors[`weft_rate_${index}`].message
                              }
                              required={true}
                              wrapperCol={{ sm: 24 }}
                            >
                              <Controller
                                control={control}
                                name={`weft_rate_${index}`}
                                render={({ field }) => (
                                  <Input
                                    type="number"
                                    {...field}
                                    placeholder="62.00"
                                    onChange={(e) => {
                                      field.onChange(e);
                                    }}
                                  />
                                )}
                              />
                            </Form.Item>
                          </Col>
                        </Row>

                        <div>
                          <Typography>
                            Total Weight [ Tana + Wana ] = {tana} + {wana} ={" "}
                            {(tana + wana).toFixed(3)}
                          </Typography>
                        </div>
                      </>
                    );
                  })
                : null}
            </Card>
          </>
        </Col>
        <Col className="gutter-row" span={6}>
          <Card style={{ margin: "1rem 0px" }}>
            <Typography>
              Yarn cost = <b>Rs.0.00/Meter</b>
            </Typography>
            <Typography>Average making cost is of</Typography>
            <Input
              type="number"
              placeholder="62.00"
              value={avgCost}
              onChange={(e) => setAvgCost(e.target.value)}
            />

            <br />
            <Typography>
              Total cost per meter is of{" "}
              <b>Rs.{totalCostPerMeter.toFixed(2)}</b>
            </Typography>
          </Card>
        </Col>
      </Row>

    </>
  );
};

export default CostCalculator;
