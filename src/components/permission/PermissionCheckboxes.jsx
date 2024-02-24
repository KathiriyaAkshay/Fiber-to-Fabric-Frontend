import { Checkbox, Col, Row } from "antd";
import { useState } from "react";

function PermissionCheckboxes({ module, sub_module_index = 0 }) {
  const { name = "", id = 0, operations = [] } = module;
  const [disabled, setDisabled] = useState(true);

  return (
    <Row>
      <Col span={4}>
        <Checkbox
          checked={!disabled}
          className="font-bold"
          onChange={(e) => {
            setDisabled(!e.target.checked);
          }}
        >
          {name}
        </Checkbox>
      </Col>
      <Col span={18}>
        <Row>
          {operations?.map((operation) => {
            return (
              <Col span={4} key={operation}>
                <Checkbox disabled={disabled}>{operation}</Checkbox>
              </Col>
            );
          })}
        </Row>
      </Col>
      <Col span={2}>
        <Checkbox disabled={disabled}>all</Checkbox>
      </Col>
    </Row>
  );
}

export default PermissionCheckboxes;
