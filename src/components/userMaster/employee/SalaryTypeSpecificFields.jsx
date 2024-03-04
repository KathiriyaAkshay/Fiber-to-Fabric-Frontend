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
                <Input
                  {...field}
                  placeholder="10000"
                  type="number"
                  min={0}
                  step={0.01}
                />
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
                <Input
                  {...field}
                  placeholder="24"
                  type="number"
                  min={0}
                  step={0.01}
                />
              )}
            />
          </Form.Item>
        </Col>
      );

    case "on production":
      return (
        <Col span={12}>
          <Form.Item
            label="Per Meter"
            name="per_meter"
            validateStatus={errors.per_meter ? "error" : ""}
            help={errors.per_meter && errors.per_meter.message}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="per_meter"
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="0.4"
                  type="number"
                  min={0}
                  step={0.01}
                />
              )}
            />
          </Form.Item>
        </Col>
      );

    case "work basis":
      return (
        <>
          <Col span={6}>
            <Form.Item
              label="Machine No. From"
              name="machineNo_from"
              validateStatus={errors.machineNo_from ? "error" : ""}
              help={errors.machineNo_from && errors.machineNo_from.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machineNo_from"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="1"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="To"
              name="machineNo_to"
              validateStatus={errors.machineNo_to ? "error" : ""}
              help={errors.machineNo_to && errors.machineNo_to.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="machineNo_to"
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="50"
                    type="number"
                    min={0}
                    step={0.01}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </>
      );

    default:
      return null;
  }
}

export default SalaryTypeSpecificFields;
