import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Col, Form, Input, Select, message } from "antd";
import { Controller } from "react-hook-form";
import {
  addEmployeeTypeRequest,
  getEmployeeTypeListRequest,
} from "../../../api/requests/users";
import { useEffect, useMemo, useState } from "react";
import { CheckOutlined } from "@ant-design/icons";

const { Search } = Input;

function EmployeeSalaryTypeInput({
  errors,
  control,
  watch,
  setValue,
  isUpdate = false,
}) {
  const queryClient = useQueryClient();
  const [salaryTypeList, setSalaryTypeList] = useState([]);
  const [employeeType, setEmployeeType] = useState("");

  const { data: employeeTypeListRes, isLoading: isLoadingEmployeeType } =
    useQuery({
      queryKey: ["dropdown", "employee_type", "list"],
      queryFn: async () => {
        const res = await getEmployeeTypeListRequest();
        return res.data?.data?.employeeTypeList || [];
      },
    });

  const selectedEmployeeTypeId = watch("employee_type_id");

  const { mutateAsync: addEmployeeType } = useMutation({
    mutationFn: async (data) => {
      const res = await addEmployeeTypeRequest({
        data,
      });
      return res.data?.data;
    },
    mutationKey: ["dropdown", "employee_type", "add"],
    onSuccess: (res) => {
      setEmployeeType("");
      setValue("employee_type_id", res?.employeeTypeList?.id);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      queryClient.invalidateQueries(["dropdown", "employee_type", "list"]);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  function onSearch(employee_type) {
    addEmployeeType({ employee_type });
  }

  useEffect(() => {
    const employeeType = employeeTypeListRes?.find(
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
  }, [employeeTypeListRes, isUpdate, selectedEmployeeTypeId, setValue]);

  const etList = useMemo(() => {
    const list = (employeeTypeListRes || [])?.map((et) => ({
      label: et?.employee_type,
      value: et?.id,
    }));
    return [...list, { label: "Other", value: "other" }];
  }, [employeeTypeListRes]);

  return (
    <>
      <Col
        span={12}
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <Form.Item
          label="Type Name"
          name="employee_type_id"
          validateStatus={errors.employee_type_id ? "error" : ""}
          help={errors.employee_type_id && errors.employee_type_id.message}
          wrapperCol={{ sm: 24 }}
          style={{
            width: "100%",
          }}
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
                options={etList}
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
          <div
            style={{
              width: "100%",
              alignSelf: "end",
              display: "flex",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
            <Search
              enterButton={<CheckOutlined />}
              onSearch={onSearch}
              placeholder="other"
              disabled={watch("employee_type_id") !== "other"}
              value={employeeType}
              onChange={(e) => setEmployeeType(e.target.value)}
            />
          </div>
        )}
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
