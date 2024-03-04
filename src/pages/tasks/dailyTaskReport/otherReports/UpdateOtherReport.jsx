import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  TimePicker,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useContext, useEffect } from "react";
import dayjs from "dayjs";
import {
  getOtherReportByIdRequest,
  updateOtherReportRequest,
} from "../../../../api/requests/reports/otherReport";
import { GlobalContext } from "../../../../contexts/GlobalContext";

const updateOtherReportSchemaResolver = yupResolver(
  yup.object().shape({
    notes: yup.string().required("Please enter note"),
    report_date: yup.string().required("Please select date"),
    report_time: yup.string(),
  })
);

function UpdateOtherReport() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  const { mutateAsync: updateOtherReport } = useMutation({
    mutationFn: async (data) => {
      const res = await updateOtherReportRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["reports", "other-report", "update", id],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const { data: reportDetails } = useQuery({
    queryKey: ["reports", "other-report", "get", id],
    queryFn: async () => {
      const res = await getOtherReportByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.report;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.report_time;
    await updateOtherReport(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: updateOtherReportSchemaResolver,
  });

  useEffect(() => {
    if (reportDetails) {
      const { notes, report_date } = reportDetails;

      reset({
        notes: notes,
        report_date: dayjs(report_date),
        report_time: dayjs(report_date),
      });
    }
  }, [reportDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update Notes</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12}>
            <Form.Item
              label="Date"
              name="report_date"
              validateStatus={errors.report_date ? "error" : ""}
              help={errors.report_date && errors.report_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="report_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD-MM-YYYY"
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Date"
              name="report_time"
              validateStatus={errors.report_time ? "error" : ""}
              help={errors.report_time && errors.report_time.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="report_time"
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="h:mm:ss A"
                    disabled={true}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Notes"
              name="notes"
              validateStatus={errors.notes ? "error" : ""}
              help={errors.notes && errors.notes.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <Input.TextArea
                    {...field}
                    placeholder="Please enter note"
                    autoSize
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
}

export default UpdateOtherReport;
