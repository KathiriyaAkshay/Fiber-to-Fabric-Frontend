import { Col, Row } from "antd";

function PermissionCheckboxes({ module }) {
  const { name = "", id = 0, operations = [] } = module;
  return (
    <Row>
      <Col span={4}>{name}</Col>
      <Col span={18}>
        <Row>
          {operations?.map((operation) => {
            return (
              <Col span={4} key={operation}>
                {operation}
              </Col>
            );
          })}
        </Row>
      </Col>
      <Col span={2}>all</Col>
    </Row>
  );
}

export default PermissionCheckboxes;
