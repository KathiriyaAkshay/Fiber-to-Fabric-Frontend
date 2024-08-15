import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Col, Form, Input, message, Row } from "antd";
import { useContext, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import useDebounce from "../../../../hooks/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getReworkChallanByIdRequest } from "../../../../api/requests/job/challan/reworkChallan";


const ReceiveReworkTakaFieldTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  getValues,
  quality_id,
}) => {
  const { companyId } = useContext(GlobalContext);
  
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalReceiveMeter, setTotalReceiveMeter] = useState(0);
  const [totalFieldRow, setTotalFieldRow] = useState(1) ; 
  const [numOfFields, setNumOfFields] = useState(Array.from({ length: totalFieldRow }, (_, i) => i + 1));

  const [storeTakaNo, setStoreTakaNo] = useState();
  const debounceTakaNo = useDebounce(storeTakaNo, 500);

  const activeNextField = (event, fieldNumber) => {
    if (event.keyCode === 13) {
      setTotalFieldRow((prev) => prev + 1)
      setActiveField((prev) => prev + 1);
      console.log("Field number", fieldNumber);
      
      setTimeout(() => {
        setFocus(`taka_no_${fieldNumber + 1}`);
        setValue(`taka_no${fieldNumber}`, undefined) ; 
        setValue(``)
      }, 20);
    }
  };

  useEffect(() => {
    setNumOfFields(Array.from({ length: totalFieldRow }, (_, i) => i + 1))
  }, [totalFieldRow])

  const removeCurrentField = (fieldNumber) => {
    if (fieldNumber) {
      if (fieldNumber > 1) {
        setActiveField((prev) => prev - 1);
        console.log("numberof field information", fieldNumber);
        let temp = numOfFields.filter(item => item!=fieldNumber) ; 
        setNumOfFields(temp) ; 
        setTotalFieldRow((prev) => prev -1) ;
      }
      
      // setValue(`taka_no_${fieldNumber}`, "");
      // setValue(`meter_${fieldNumber}`, "");
      // setValue(`received_meter_${fieldNumber}`, "");
      // setValue(`short_${fieldNumber}`, "");
      // setValue(`received_weight_${fieldNumber}`, "");
      // setValue(`average_${fieldNumber}`, "");
      // setValue(`tp_${fieldNumber}`, "");
      // setValue(`pis_${fieldNumber}`, "");
    }
  };

  const calculateTotal = () => {
    const numOfFields = Array.from({ length: activeField }, (_, i) => i + 1);

    let totalMeter = 0;
    let totalReceiveMeter = 0;
    numOfFields.forEach((fieldNumber) => {
      totalMeter += +getValues(`meter_${fieldNumber}`) || 0;
      totalReceiveMeter += +getValues(`received_meter_${fieldNumber}`) || 0;
    });

    setTotalMeter(totalMeter);
    setTotalReceiveMeter(totalReceiveMeter);
  };

  const { data: reworkChallan } = useQuery({
    queryKey: [
      "rework",
      "challan",
      { company_id: companyId, taka_no: debounceTakaNo, quality_id },
    ],
    queryFn: async () => {
      if (debounceTakaNo && quality_id) {
        const res = await getReworkChallanByIdRequest({
          id: 0,
          params: {
            company_id: companyId,
            taka_no: debounceTakaNo,
            quality_id,
          },
        });
        return res.data?.data;
      }
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    if (reworkChallan) {
      console.log({ reworkChallan });
      setValue(`meter_${activeField}`, reworkChallan.total_meter);
    } else {
      setValue(`meter_${activeField}`, "");
    }
  }, [activeField, reworkChallan, setValue]);

  return (
    <Row style={{ marginTop: "-20px" }} gutter={18}>
      <Col span={24}>
        <table
          className="job-challan-details-table receive-rework-taka-table"
          border={1}
          style={{ width: "100%" }}
        >
          <thead>
            {/* <th>#</th> */}
            <th>Taka No</th>
            <th>Meter</th>
            <th>Received Mtr</th>
            <th>Short (%)</th>
            <th>Weight</th>
            <th>Average</th>
            <th style={{color: "green"}}>TP</th>
            <th style={{color: "orange"}}>PIS</th>
            <th>
              <MinusCircleOutlined />
            </th>
          </thead>
          <tbody>
            {numOfFields.map((fieldNumber) => {
              return (
                <tr key={fieldNumber}>
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
                              setStoreTakaNo(e.target.value);
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
                            // disabled={fieldNumber > activeField}
                            readOnly
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
                              
                              let meter = getValues(`meter_${fieldNumber}`) ; 
                              
                              if (meter == undefined || meter == ""){
                                message.warning("Please, Enter taka number")
                                setValue(`short_${fieldNumber}`, undefined)
                                field.onChange("");
                              } else if  (Number(meter) < Number(e.target.value)){
                                message.warning("Please, Provide valid receive meter") ; 
                                field.onChange("");
                                setValue(`short_${fieldNumber}`, undefined)
                              } else {
                                field.onChange(e);
                                
                                let shortage = Number(e.target.value)*100 / Number(meter) ; 
                                shortage = 100 - shortage ; 
                                setValue(`short_${fieldNumber}`, shortage.toFixed(2))
                                calculateTotal();
                              }

                            }}
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
                            readOnly
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
                            onChange={(e) => {
                              setValue(`average_${fieldNumber}`, "100") ; 
                            }}
                          />
                        )}
                      />
                    </Form.Item>
                  </td>

                  <td>
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
                      style={{ marginBottom: "0px" }}
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
                            readOnly
                          />
                        )}
                      />
                    </Form.Item>
                  </td>

                  <td>
                    <Form.Item
                      name={`tp_${fieldNumber}`}
                      validateStatus={
                        errors[`tp_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`tp_${fieldNumber}`] &&
                        errors[`tp_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`tp_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100%",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            onChange={(e) => {

                              let meter = getValues(`meter_${fieldNumber}`) ; 

                              if (meter == undefined || meter == ""){
                                message.warning("Please, Provide taka number") ; 
                              }  else if (Number(meter) < Number(e.target.value)){
                                message.warning("Please, Provide pis number less than taka meter") ; 
                              } else {
                                field.onChange(e) ; 
                              }
                            }}
                          /> 
                        )}
                      />
                    </Form.Item>
                  </td>

                  <td>
                    <Form.Item
                      name={`pis_${fieldNumber}`}
                      validateStatus={
                        errors[`pis_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`pis_${fieldNumber}`] &&
                        errors[`pis_${fieldNumber}`].message
                      }
                      required={true}
                      wrapperCol={{ sm: 24 }}
                      style={{ marginBottom: "0px" }}
                    >
                      <Controller
                        control={control}
                        name={`pis_${fieldNumber}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            style={{
                              width: "100%",
                              border: "0px solid",
                              borderRadius: "0px",
                            }}
                            readOnly={fieldNumber > activeField}
                            onChange={(e) => {

                              let meter = getValues(`meter_${fieldNumber}`) ; 

                              if (meter == undefined || meter == ""){
                                message.warning("Please, Provide taka number") ; 
                              }  else if (Number(meter) < Number(e.target.value)){
                                message.warning("Please, Provide pis number less than taka meter") ; 
                              } else {
                                field.onChange(e) ; 
                              }
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
                      disabled={fieldNumber > activeField}
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
                <b>{totalReceiveMeter}</b>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  );
};

export default ReceiveReworkTakaFieldTable;
