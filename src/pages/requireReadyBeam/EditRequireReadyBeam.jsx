import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Col, Flex, Form, Input, Row, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import {
  getInHouseQualityByIdRequest,
  updateInHouseQualityRequest,
} from "../../api/requests/qualityMaster";
import dayjs from "dayjs";

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    require_non_pasarela_beam: yup
      .string()
      .required("Please enter require non pasarela beam."),
    require_pasarela_beam: yup
      .string()
      .required("Please enter require pasarela beam."),
  })
);

const EditRequireReadyBeam = () => {
  // const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;

  // const [qualityNames, setQualityNames] = useState([]);
  // const [options, setOptions] = useState([]);

  function goBack() {
    navigate(-1);
  }

  const { companyId } = useContext(GlobalContext);

  const { data: requireReadyBeamDetail } = useQuery({
    queryKey: ["requireReadyBeamDetail", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getInHouseQualityByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateRequireReadyBeam } = useMutation({
    mutationFn: async (data) => {
      const res = await updateInHouseQualityRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["require", "ready", "beam", "update", id],
    onSuccess: (res) => {
      //   queryClient.invalidateQueries([
      //     "yarn-stock",
      //     "company",
      //     "list",
      //     companyId,
      //   ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  async function onSubmit(data) {
    const newData = {
      quality_detail: {
        require_non_pasarela_beam: +data.require_non_pasarela_beam,
        require_pasarela_beam: +data.require_pasarela_beam
      }
    };
    await updateRequireReadyBeam(newData);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      quality: "",
      require_non_pasarela_beam: "",
      require_pasarela_beam: "",
      date: null,
      time: null,
    },
    resolver: addYSCSchemaResolver,
  });

  useEffect(() => {
    if (requireReadyBeamDetail) {
      const { quality_name, require_non_pasarela_beam, require_pasarela_beam, createdAt } =
        requireReadyBeamDetail.quality;
      console.log(quality_name, require_non_pasarela_beam, require_pasarela_beam, createdAt);
      reset({
        quality: quality_name,
        require_non_pasarela_beam,
        require_pasarela_beam,
        date: dayjs(createdAt).format("DD-MM-YYYY"),
        time: dayjs(createdAt).format("HH:mm:ss A"),
      });
    }
  }, [requireReadyBeamDetail, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Require Ready Beam</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Quality"
              name="quality"
              validateStatus={errors.quality ? "error" : ""}
              help={errors.quality && errors.quality.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality"
                render={({ field }) => {
                  return (
                    <Input {...field} placeholder="Quality" disabled />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Require everyday non pasarela beam"
              name="require_non_pasarela_beam"
              validateStatus={
                errors.require_non_pasarela_beam ? "error" : ""
              }
              help={
                errors.require_non_pasarela_beam &&
                errors.require_non_pasarela_beam.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="require_non_pasarela_beam"
                render={({ field }) => {
                  return <Input {...field} placeholder="10" />;
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Require everyday pasarela beam"
              name="require_pasarela_beam"
              validateStatus={
                errors.require_pasarela_beam ? "error" : ""
              }
              help={
                errors.require_pasarela_beam &&
                errors.require_pasarela_beam.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="require_pasarela_beam"
                render={({ field }) => <Input {...field} placeholder="10" />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Date"
              name="date"
              validateStatus={errors.date ? "error" : ""}
              help={errors.date && errors.date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="date"
                render={({ field }) => <Input {...field} disabled />}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Time"
              name="time"
              validateStatus={errors.time ? "error" : ""}
              help={errors.time && errors.time.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="time"
                render={({ field }) => <Input {...field} disabled />}
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
};

export default EditRequireReadyBeam;
