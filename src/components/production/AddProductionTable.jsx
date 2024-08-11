import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Select } from "antd";
import { useMemo, useState } from "react";
import { Controller } from "react-hook-form";

const AddProductionTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  getValues,
  setError,
  trigger,
  lastProductionTaka,
  beamCardList,
  production_filter,
  avgWeight,
  weightPlaceholder,
  setWeightPlaceholder,
  dropDownQualityListRes,
}) => {
  const [totalMeter, setTotalMeter] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalAvg, setTotalAvg] = useState(0);

  const numOfFields = useMemo(() => {
    if (production_filter === "machine_wise") {
      return Array.from({ length: 1 }, (_, i) => i + 1);
    } else {
      return Array.from({ length: 15 }, (_, i) => i + 1);
    }
  }, [production_filter]);

  const activeNextField = (event, fieldNumber) => {
    
    if (event.keyCode === 13) {
      let meters = getValues(`meter_${fieldNumber}`) ; 
      let production_meter = getValues(`production_meter_${fieldNumber}`) ; 

      if (meters  > production_meter){
        message.warning("Please, enter valid meter") ; 
        return ; 
      } else {
        let pending_meter = Number(production_meter) - Number(meters) ; 
        setValue(`pending_meter_${fieldNumber}`, pending_meter) ; 

        let pending_precentage = (Number(pending_meter) * 100) / Number(production_meter) ; 
        setValue(`pending_percentage_${fieldNumber}`, pending_precentage.toFixed(2)) ; 
  
        setActiveField((prev) => prev + 1);
        setTimeout(() => {
          setFocus(`meter_${fieldNumber + 1}`);
        }, 0);

      }

    }
  };

  const removeCurrentField = (fieldNumber) => {
    if (fieldNumber) {
      let delete_taka_production_meter = getValues(`production_meter_${fieldNumber}`);
      let delete_taka_machine_number = getValues(`machine_no_${fieldNumber}`) ; 
      let delete_taka_fieldNumber = fieldNumber + 1 ; 

      numOfFields.map((element, index) => {
        if ((index + 1) > delete_taka_fieldNumber){
          let current_taka_meter =  getValues(`meter_${index}`);
          let current_taka_weight = getValues(`weight_${index}`);
          let current_taka_machine =  getValues(`machine_no_${index}`);
          let current_taka_average = getValues(`average_${index}`) ; 
          let current_beam_no = getValues(`beam_no_${index}`) ; 
          let current_taka_production_meter = getValues(`production_meter_${index}`) ; 
          let current_taka_pending_meter = getValues(`pending_meter_${index}`) ; 
          let current_taka_pending_precentage = getValues(`pending_percentage_${index}`) ; 
          if (delete_taka_machine_number != current_taka_machine){
            setValue(`meter_${index-1}`, current_taka_meter);
            setValue(`weight_${index-1}`, current_taka_weight);
            setValue(`machine_no_${index-1}`, current_taka_machine);
            setValue(`average_${index-1}`, current_taka_average);
            setValue(`beam_no_${index-1}`, current_beam_no);
            setValue(`production_meter_${index-1}`, current_taka_production_meter);
            setValue(`pending_meter_${index-1}`, current_taka_pending_meter);
            setValue(`pending_percentage_${index-1}`, current_taka_pending_precentage);
          } else {
            setValue(`meter_${index-1}`, current_taka_meter);
            setValue(`weight_${index-1}`, current_taka_weight);
            setValue(`machine_no_${index-1}`, current_taka_machine);
            setValue(`average_${index-1}`, current_taka_average);
            setValue(`beam_no_${index-1}`, current_beam_no);
            setValue(`production_meter_${index-1}`, delete_taka_production_meter) ; 
            setValue(`pending_meter_${index-1}`, (Number(delete_taka_production_meter) - current_taka_meter)) ; 

            let pending_precentage = ((Number(delete_taka_production_meter) - current_taka_meter)*100) / Number(delete_taka_production_meter) ; 
            setValue(`pending_percentage_${index-1}`, pending_precentage) ; 
            delete_taka_production_meter = (Number(delete_taka_production_meter) - current_taka_meter) ; 
          }
        } 


      })

      if (activeField < 2){
        setActiveField(1);
      } else {
        setActiveField((prev) => prev - 1);
      }

      total();
  
      if (production_filter === "multi_quality_wise") {
        setValue(`quality_${fieldNumber}`, null);
      }
    }
  };

  const changeMachineNoHandler = (fieldNumber, value) => {
    const beamCard = beamCardList.rows.find(({ machine_no }) => {
      return machine_no === value;
    });

    let lastPendingMeter = undefined ; 

    numOfFields.map((element, index) => {
      let tempPendingMeter = getValues(`pending_meter_${index}`) ; 
      let machineNumber = getValues(`machine_no_${index}`) ; 
    
      if (machineNumber !== undefined && machineNumber !== "" && machineNumber == value){
        if (tempPendingMeter !== undefined && tempPendingMeter !== ""){
          lastPendingMeter = tempPendingMeter ; 
        }
      }
      
    })
    const obj =
      beamCard.non_pasarela_beam_detail ||
      beamCard.recieve_size_beam_detail ||
      beamCard.job_beam_receive_detail;
    
    setValue(`beam_no_${fieldNumber}`, obj.beam_no);
    
    if (lastPendingMeter == undefined){
      setValue(`production_meter_${fieldNumber}`, obj?.meters);
    } else {
      setValue(`production_meter_${fieldNumber}`, lastPendingMeter);
    }
    
    if (production_filter === "multi_quality_wise") {
      setValue(`quality_${fieldNumber}`, beamCard.inhouse_quality.id);
    }
  };

  const calculateWeight = (meterValue) => {
    const weightFrom = ((avgWeight.weight_from / 100) * meterValue).toFixed(3);
    const weightTo = ((avgWeight.weight_to / 100) * meterValue).toFixed(3);

    setWeightPlaceholder({
      weightFrom: +weightFrom,
      weightTo: +weightTo,
    });
  };

  const handleWeightChange = (fieldNumber, value, field) => {
    if (
      +value >= weightPlaceholder.weightFrom &&
      +value <= weightPlaceholder.weightTo
    ) {
      trigger(`weight_${fieldNumber}`);
      // Calculate average weight information 
      let meters = getValues(`meter_${fieldNumber}`) ; 
      
      if (meters !== undefined && meters !== ""){
  
        let average_weight = (Number(value)*100) / Number(meters) ; 
        setValue(`average_${fieldNumber}`, average_weight.toFixed(2)) ; 
      }
    } else {
      setError(`weight_${fieldNumber}`, {
        type: "custom",
        message: "wrong weight",
      });
    }
    field.onChange(value ? value : "");
    
    
  
  };

  const calculateTotals = () => {
    let totalMeter = 0;
    let totalWeight = 0;
    let totalAvg = 0;
    const activeFieldArray = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    activeFieldArray.forEach((fieldNumber) => {
      totalMeter += +getValues(`meter_${fieldNumber}`) || 0;
      totalWeight += +getValues(`weight_${fieldNumber}`) || 0;
      totalAvg += +getValues(`average_${fieldNumber}`) || 0;
    });

    setTotalMeter(totalMeter);
    setTotalWeight(totalWeight);
    setTotalAvg(totalAvg);
  };

  const total = () => {
    setTimeout(() => {
      calculateTotals();
    }, 500);
  };

  return (
    <div className="job-challan-table-div">
      <table
        style={{ width: "100%" }}
        className="job-challan-details-table"
        border={1}
      >
        <thead>
          <th>Taka No</th>
          <th>Meter</th>
          <th>Machine No.</th>
          {production_filter === "multi_quality_wise" ? <th>Quality</th> : null}
          <th>Weight</th>
          <th>Average</th>
          <th>Beam No.</th>
          <th>Prod.Mtr</th>
          <th>Pend.Mtr</th>
          <th>Pend %</th>
          <th style={{ width: "50px" }}>
            <MinusCircleOutlined />
          </th>
        </thead>
        <tbody>
          {numOfFields.map((fieldNumber) => {
            return (
              <tr key={fieldNumber}>
                
                <td
                  style={{ textAlign: "center" }}
                  className="job-challan-taka-index-column"
                  width={80}
                >
                  {fieldNumber <= activeField
                    ? lastProductionTaka?.taka_no + fieldNumber
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
                          onChange={(e) => {
                            field.onChange(+e.target.value);
                            calculateWeight(+e.target.value);
                            total();
                          }}
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
                        <Select
                          {...field}
                          name={`machine_no_${fieldNumber}`}
                          showSearch
                          style={{
                            width: "100%",
                          }}
                          disabled={fieldNumber !== activeField}
                          options={
                            beamCardList &&
                            beamCardList?.rows?.map(({ machine_no }) => ({
                              label: machine_no,
                              value: machine_no,
                            }))
                          }
                          onChange={(value) => {
                            field.onChange(value);
                            changeMachineNoHandler(fieldNumber, value);
                          }}
                        />
                      )}
                    />
                  </Form.Item>
                </td>

                {production_filter === "multi_quality_wise" ? (
                  <td width={150}>
                    <Form.Item
                      name={`quality_${fieldNumber}`}
                      validateStatus={
                        errors[`quality_${fieldNumber}`] ? "error" : ""
                      }
                      help={
                        errors[`quality_${fieldNumber}`] &&
                        errors[`quality_${fieldNumber}`].message
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
                        name={`quality_${fieldNumber}`}
                        render={({ field }) => (
                          <Select
                            {...field}
                            disabled={true}
                            options={
                              dropDownQualityListRes &&
                              dropDownQualityListRes?.rows?.map((item) => ({
                                value: item.id,
                                label: item.quality_name,
                              }))
                            }
                          />
                        )}
                      />
                    </Form.Item>
                  </td>
                ) : null}

                <td width={150}>
                  <Form.Item
                    name={`weight_${fieldNumber}`}
                    validateStatus={
                      errors[`weight_${fieldNumber}`] ? "error" : ""
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
                          name={`weight_${fieldNumber}`}
                          disabled={fieldNumber !== activeField}
                          placeholder={
                            fieldNumber === activeField
                              ? weightPlaceholder?.weightFrom
                              : ""
                          }
                          onChange={(e) => {
                            handleWeightChange(
                              fieldNumber,
                              e.target.value,
                              field
                            );
                            total();
                          }}
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
                          readOnly
                          disabled={fieldNumber !== activeField}
                          onChange={(e) => {
                            field.onChange(e);
                            total();
                          }}
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
                          type="text"
                          style={{
                            width: "100%",
                            border: "0px solid",
                            borderRadius: "0px",
                          }}
                          readOnly
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
                          readOnly
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
                          readOnly
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
                          readOnly
                          disabled={fieldNumber !== activeField}
                        />
                      )}
                    />
                  </Form.Item>
                </td>

                <td style={{ textAlign: "center" }}>
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
          <tr className="job-challan-table-total">
            <td style={{ textAlign: "center" }}>
              <b>Total</b>
            </td>
            <td style={{ textAlign: "center" }}>
              <b>{Number(totalMeter).toFixed(2)}</b>
            </td>
            <td></td>
            <td style={{ textAlign: "center" }}>
              <b>{Number(totalWeight).toFixed(2)}</b>
            </td>
            <td style={{ textAlign: "center" }}>
              <b>{Number(totalAvg).toFixed(2)}</b>
            </td>
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
