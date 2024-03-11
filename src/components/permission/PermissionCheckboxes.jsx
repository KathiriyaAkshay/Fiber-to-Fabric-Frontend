import { Checkbox, Col, Row } from "antd";
import { useState } from "react";

function PermissionCheckboxes({ module, watch, setValue }) {
  const { name = "", id = 0, operations = [] } = module;
  const { permissions, company_id, user_id } = watch();
  const [disabled, setDisabled] = useState(true);
  // console.log("permissions----->", permissions);

  return (
    <Row>
      <Col span={4}>
        <Checkbox
          checked={!disabled}
          className="font-bold"
          onChange={(e) => {
            setDisabled(!e.target.checked);
          }}
          disabled={!company_id || !user_id}
        >
          {name}
        </Checkbox>
      </Col>
      <Col span={18}>
        <Row>
          {operations?.map((operation) => {
            return (
              <Col span={4} key={`${id} ${operation}`}>
                <Checkbox
                  disabled={disabled}
                  name={`permissions.${id}.operations.${operation}`}
                  checked={permissions?.[id]?.operations?.[operation]}
                  onChange={(e) => {
                    setValue(
                      `permissions.${id}.operations.${operation}`,
                      e.target.checked
                    );
                  }}
                >
                  {operation}
                </Checkbox>
              </Col>
            );
          })}
        </Row>
      </Col>
      <Col span={2}>
        <Checkbox
          disabled={disabled}
          checked={operations.every(
            (op) => permissions?.[id]?.operations?.[op]
          )}
          onChange={(e) => {
            operations?.forEach((op) => {
              setValue(`permissions.${id}.operations.${op}`, e.target.checked);
            });
          }}
        >
          all
        </Checkbox>
      </Col>
    </Row>
  );
}

export default PermissionCheckboxes;
