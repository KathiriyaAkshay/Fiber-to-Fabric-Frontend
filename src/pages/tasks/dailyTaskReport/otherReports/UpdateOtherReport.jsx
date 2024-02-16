import { ArrowLeftOutlined } from "@ant-design/icons";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Row,
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useCompanyList } from "../../../../api/hooks/company";
import {
  getOtherReportByIdRequest,
  updateOtherReportRequest,
} from "../../../../api/requests/reports/otherReport";
import { getSupervisorListRequest } from "../../../../api/requests/users";

const updateOtherReportSchemaResolver = yupResolver(
  yup.object().shape({
    user_id: yup.string().required("Please select supervisor"),
    assign_time: yup.string().required("Please select time"),
  })
);

function UpdateOtherReport() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  function goBack() {
    navigate(-1);
  }

  const { data: companyListRes } = useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

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
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: supervisorListRes, isLoading: isLoadingSupervisorList } =
    useQuery({
      queryKey: ["supervisor", "list", { company_id: companyId }],
      queryFn: async () => {
        const res = await getSupervisorListRequest({
          params: { company_id: companyId },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.user_id;
    delete data?.created_date;
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
      const { user_id, createdAt, assign_time } = reportDetails;

      reset({
        user_id,
        created_date: dayjs(createdAt),
        assign_time,
      });
    }
  }, [reportDetails, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h2 className="m-0">Update Notes</h2>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={12} className="flex items-end gap-2">
            <Form.Item
              label="Select Supervisor Name"
              name="user_id"
              validateStatus={errors.user_id ? "error" : ""}
              help={errors.user_id && errors.user_id.message}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="user_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select supervisor"
                    loading={isLoadingSupervisorList}
                    options={supervisorListRes?.supervisorList?.rows?.map(
                      (supervisor) => ({
                        label: supervisor?.first_name,
                        value: supervisor?.id,
                      })
                    )}
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Created Date"
              name="created_date"
              validateStatus={errors.created_date ? "error" : ""}
              help={errors.created_date && errors.created_date.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="created_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    style={{
                      width: "100%",
                    }}
                    format="DD/MM/YYYY"
                    disabled
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
