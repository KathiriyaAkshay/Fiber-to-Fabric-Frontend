import { MinusCircleOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Select } from "antd";
import { Controller } from "react-hook-form";
import { useDebounceCallback } from "../../hooks/useDebounce";

const numOfFields = Array.from({ length: 100 }, (_, i) => i + 1);
const AddOpeningProductionTable = ({
  errors,
  control,
  setFocus,
  activeField,
  setActiveField,
  setValue,
  lastOpeningProductionTaka,
  getValues,
  totalMeter,
  setTotalMeter,
  totalWeight,
  setTotalWeight,
  totalTaka,
  setTotalTaka,
  loadedMachineList
}) => {
  // const [totalMeter, setTotalMeter] = useState(0);
  // const [totalWeight, setTotalWeight] = useState(0);

  const activeNextField = (event, fieldNumber) => {
    if (event.keyCode === 13) {
      let taka_meter = getValues(`meter_${fieldNumber}`) ; 
      let taka_weight = getValues(`weight_${fieldNumber}`) ; 
      let taka_machine_number = getValues(`machine_no_${fieldNumber}`) ; 
      if (taka_meter == undefined || taka_meter == ""){
        message.warning(`Please, Enter taka meter`) ; 
      } else if (taka_weight == undefined || taka_weight == ""){
        message.warning(`Please, Enter taka weight`) ; 
      } else if (taka_machine_number == undefined || taka_machine_number == ""){
        message.warning(`Please, taka machine number`) ; 
      } else {
        setActiveField((prev) => prev + 1);
        setTimeout(() => {
          setFocus(`meter_${fieldNumber + 1}`);
        }, 0);
      }
    }
  };

  const removeCurrentField = (fieldNumber) => {
    if (fieldNumber) {
      if (fieldNumber > 1) {
        setActiveField((prev) => prev - 1);
      }

      const takaNo = getValues(`taka_no_${fieldNumber}`);
      const meter = +getValues(`meter_${fieldNumber}`);
      const weight = +getValues(`weight_${fieldNumber}`);

      if (takaNo && meter && weight) {
        setTotalTaka((prev) => (prev === 0 ? prev : prev - 1));
        setTotalMeter((prev) => (prev === 0 ? prev : prev - meter));
        setTotalWeight((prev) => (prev === 0 ? prev : prev - weight));
      }

      setValue(`taka_no_${fieldNumber}`, "");
      setValue(`meter_${fieldNumber}`, "");
      setValue(`weight_${fieldNumber}`, "");
      setValue(`machine_no_${fieldNumber}`, "");
    }
  };

  const calculateTotals = () => {
    let totalMeter = 0;
    let totalWeight = 0;
    let totalTaka = 0;

    const activeFieldArray = Array.from(
      { length: activeField },
      (_, i) => i + 1
    );

    activeFieldArray.forEach((fieldNumber) => {
      totalTaka += 1;
      totalMeter += +getValues(`meter_${fieldNumber}`) || 0;
      totalWeight += +getValues(`weight_${fieldNumber}`) || 0;
    });

    setTotalMeter(totalMeter);
    setTotalWeight(totalWeight);
    setTotalTaka(totalTaka);
  };

  const total = useDebounceCallback(calculateTotals, 200);

  return (
    <div className="production-table-div">
      <table
        style={{ width: "100%", textAlign: "center" }}
        className="job-challan-details-table receive-rework-taka-table"
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
                  className="job-challan-taka-index-column job-production-index-column"
                  style={{ textAlign: "center", color: "#FFF" }}
                >
                  {fieldNumber}
                </td>
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
                                ? `${lastOpeningProductionTaka + fieldNumber}`
                                : ""
                            }
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
                    {/* <Controller
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
                    /> */}
                    <Controller
                      control={control}
                      name={`machine_no_${fieldNumber}`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          name={`machine_no_${fieldNumber}`}
                          style={{
                            width: "100%",
                          }}
                          showSearch
                          disabled={fieldNumber > activeField} // Maintain disabling logic
                          // loading={isLoadingLoadedMachineNo} // Optional: Show loading if needed
                          options={loadedMachineList.map((item) => ({
                            label: item, // Displayed value
                            value: item, // Actual value
                          }))}
                          onKeyDown={(event) => activeNextField(event, fieldNumber)} // Keep the `onKeyDown` logic
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
          <tr className="job-challan-table-total production-table-total">
            <td>
              <b>Total</b>
            </td>
            <td>
              <b>{totalTaka}</b>
            </td>
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
