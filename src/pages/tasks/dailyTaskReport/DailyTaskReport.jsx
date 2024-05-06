import { Card, Col, Row } from "antd";
import { DAILY_TASK_REPORT_LIST } from "../../../constants/task";
import { useNavigate } from "react-router-dom";

function DailyTaskReport() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Daily Task Report</h3>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {DAILY_TASK_REPORT_LIST.map(({ title, path = "", avatar }) => {
          return (
            <Col className="gutter-row" span={6} key={title}>
              <Card
                hoverable
                onClick={() => {
                  navigate(`/tasks/daily-task-report/${path}`);
                }}
              >
                <Card.Meta
                  avatar={avatar}
                  className="items-center"
                  title={title}
                />
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

export default DailyTaskReport;
