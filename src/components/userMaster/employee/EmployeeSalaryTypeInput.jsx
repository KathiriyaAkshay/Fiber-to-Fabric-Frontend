import { useQuery } from "@tanstack/react-query";
import { Col, Form, Select } from "antd";
import { Controller } from "react-hook-form";
import { getEmployeeTypeListRequest } from "../../../api/requests/users";
import { useEffect, useState } from "react";

function EmployeeSalaryTypeInput({
  errors,
  control,
  watch,
  setValue,
  isUpdate = false,
}) {
  const [salaryTypeList, setSalaryTypeList] = useState([]);

  const { data: employeeTypeList, isLoading: isLoadingEmployeeType } = useQuery(
    {
      queryKey: ["dropdown", "employee_type", "list"],
      queryFn: async () => {
        const res = await getEmployeeTypeListRequest();
        return res.data?.data?.employeeTypeList || [];
      },
    }
  );

  const selectedEmployeeTypeId = watch("employee_type_id");

  useEffect(() => {
    const employeeType = employeeTypeList?.find(
      (et) => et?.id === selectedEmployeeTypeId
    );
    const salaryTypeList = employeeType?.salary_type?.map((st) => ({
      label: st,
      value: st,
    }));
    if (!isUpdate) {
      setValue("salary_type", undefined);
    }
    setSalaryTypeList(salaryTypeList ?? []);
  }, [employeeTypeList, isUpdate, selectedEmployeeTypeId, setValue]);

  return (
    <>
      <Col span={12}>
        <Form.Item
          label="Type Name"
          name="employee_type_id"
          validateStatus={errors.employee_type_id ? "error" : ""}
          help={errors.employee_type_id && errors.employee_type_id.message}
          wrapperCol={{ sm: 24 }}
        >
          <Controller
            control={control}
            name="employee_type_id"
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select employee type"
                allowClear
                loading={isLoadingEmployeeType}
                options={employeeTypeList?.map((et) => ({
                  label: et?.employee_type,
                  value: et?.id,
                }))}
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
      </Col>
      <Col span={12}>
        <Form.Item
          label="Salary Type"
          name="salary_type"
          validateStatus={errors.salary_type ? "error" : ""}
          help={errors.salary_type && errors.salary_type.message}
          wrapperCol={{ sm: 24 }}
        >
          <Controller
            control={control}
            name="salary_type"
            render={({ field }) => (
              <Select
                {...field}
                placeholder="Select Salary Type"
                allowClear
                loading={isLoadingEmployeeType}
                options={salaryTypeList}
                style={{
                  textTransform: "capitalize",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                disabled={isUpdate}
              />
            )}
          />
        </Form.Item>
      </Col>
    </>
  );
}

export default EmployeeSalaryTypeInput;
