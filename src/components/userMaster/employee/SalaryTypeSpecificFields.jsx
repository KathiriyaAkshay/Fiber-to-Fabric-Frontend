import { Col, Form, Input } from "antd";
import { Controller } from "react-hook-form";

function SalaryTypeSpecificFields({ salaryType, errors, control }) {
  switch (salaryType) {
    case "monthly":
      return (
        <Col span={12}>
          <Form.Item
            label="Salary"
            name="salary"
            validateStatus={errors.salary ? "error" : ""}
            help={errors.salary && errors.salary.message}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="salary"
              render={({ field }) => (
                <Input {...field} placeholder="10000" type="number" min={0} />
              )}
            />
          </Form.Item>
        </Col>
      );

    case "attendance":
      return (
        <Col span={12}>
          <Form.Item
            label="Per Attendance"
            name="per_attendance"
            validateStatus={errors.per_attendance ? "error" : ""}
            help={errors.per_attendance && errors.per_attendance.message}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="per_attendance"
              render={({ field }) => (
                <Input {...field} placeholder="24" type="number" min={0} />
              )}
            />
          </Form.Item>
        </Col>
      );

    default:
      return null;
  }
}

export default SalaryTypeSpecificFields;
