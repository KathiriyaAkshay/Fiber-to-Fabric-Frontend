import { useQuery } from "@tanstack/react-query";
import { Col, Form, Input, Radio, Select } from "antd";
import { Controller } from "react-hook-form";
import { useEffect } from "react";
import { machineTypeList } from "../../constants/machine";
import { getMachineDropdownListRequest } from "../../api/requests/machine";

function MachineTypeFields({
  errors,
  control,
  watch,
  setValue,
  isUpdate = false,
}) {
  const machineType = watch("machine_type");
  const { data: machineNameList, isLoading: isLoadingMachineType } = useQuery({
    queryKey: ["dropdown", "machine_name", "list", machineType],
    queryFn: async () => {
      const res = await getMachineDropdownListRequest({
        params: { machine_type: machineType },
      });
      return res.data?.data || [];
    },
    enabled: Boolean(
      machineType && machineTypeList.map((mt) => mt.value).includes(machineType)
    ),
  });

  useEffect(() => {
    if (!isUpdate) {
      setValue("machine_name", undefined);
    }
  }, [isUpdate, machineType, setValue]);

  return (
    <>
      <Col span={6}>
        <Form.Item
          label="Machine Type"
          name="machine_type"
          validateStatus={errors.machine_type ? "error" : ""}
          help={errors.machine_type && errors.machine_type.message}
          wrapperCol={{ sm: 24 }}
        >
          <Controller
            control={control}
            name="machine_type"
            render={({ field }) => (
              <Radio.Group {...field} disabled={isUpdate}>
                {machineTypeList.map(({ value, label }) => {
                  return (
                    <Radio value={value} key={value}>
                      {label}
                    </Radio>
                  );
                })}
              </Radio.Group>
            )}
          />
        </Form.Item>
      </Col>

      <Col span={6}>
        <Form.Item
          label="Type Name"
          name="machine_name"
          validateStatus={errors.machine_name ? "error" : ""}
          help={errors.machine_name && errors.machine_name.message}
          wrapperCol={{ sm: 24 }}
          style={{
            marginBottom: "8px",
          }}
        >
          <Controller
            control={control}
            name="machine_name"
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Machine Name"
                allowClear
                loading={isLoadingMachineType}
                options={machineNameList?.machineType?.map((mn) => ({
                  label: mn?.machine_name,
                  value: mn?.machine_name,
                }))}
                disabled={isUpdate}
                style={{
                  textTransform: "capitalize",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
              />
            )}
          />
        </Form.Item>
        {!isUpdate && (
          <Form.Item name="machine_name" wrapperCol={{ sm: 24 }}>
            <Controller
              control={control}
              name="machine_name"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="other"
                  style={{
                    textTransform: "capitalize",
                  }}
                />
              )}
            />
          </Form.Item>
        )}
      </Col>
    </>
  );
}

export default MachineTypeFields;
