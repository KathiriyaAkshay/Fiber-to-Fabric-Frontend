import { PlusCircleOutlined } from "@ant-design/icons";
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
  Select,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getYSCDropdownList } from "../../../../api/requests/reports/yarnStockReport";
import dayjs from "dayjs";
import {
  getYarnReceiveByIdRequest,
  updateYarnReceiveRequest,
} from "../../../../api/requests/purchase/yarnReceive";
import GoBackButton from "../../../../components/common/buttons/GoBackButton";
import { mutationOnErrorHandler } from "../../../../utils/mutationUtils";
import moment from "moment";

const updateYarnReceiveSchemaResolver = yupResolver(
  yup.object().shape({
    challan_date: yup.string().required("Please select date"),
    yarn_company_name: yup.string().required("Please select yarn company"),
    yarn_stock_company_id: yup.string().required("Please select Denier"),
    // lot_no: yup.string().required("Please enter lot no"),
    // challan_no: yup.string().required("Please enter lot no"),
    receive_quantity: yup.string().required("Please enter recieve quantity"),
    receive_cartoon_pallet: yup
      .string()
      .required("Please enter receive cartoon/pallet"),
  })
);

function UpdateYarnReceive() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const { companyId } = useContext(GlobalContext);

  const [denierOptions, setDenierOptions] = useState([]);

  const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
    queryKey: ["dropdown", "yarn_company", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getYSCDropdownList({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const disabledDate = (current) => {
    return current && current > moment().endOf('day');
  };

  const { mutateAsync: updateYarnReceive } = useMutation({
    mutationFn: async (data) => {
      const res = await updateYarnReceiveRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["yarn-stock/yarn-receive-challan/update", id],
    onSuccess: (res) => {
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      mutationOnErrorHandler({ error, message });
    },
  });

  const { data: yarnReceiveDetails } = useQuery({
    queryKey: ["yarn-stock/yarn-receive-challan/get", id],
    queryFn: async () => {
      const res = await getYarnReceiveByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data?.yarnRecive;
    },
    enabled: Boolean(companyId),
  });

  async function onSubmit(data) {
    // delete parameter's those are not allowed
    delete data?.yarn_company_name;
    await updateYarnReceive(data);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: updateYarnReceiveSchemaResolver,
  });

  const { yarn_company_name } = watch();

  function goToAddYarnStockCompany() {
    navigate("/yarn-stock-company/company-list/add");
  }

  useEffect(() => {
    if (yarnReceiveDetails) {
      const {
        challan_date,
        yarn_stock_company,
        yarn_stock_company_id,
        lot_no,
        challan_no,
        receive_quantity,
        receive_cartoon_pallet,
      } = yarnReceiveDetails;

      reset({
        challan_date: dayjs(challan_date),
        yarn_company_name: yarn_stock_company?.yarn_company_name,
        yarn_stock_company_id,
        lot_no,
        challan_no,
        receive_quantity,
        receive_cartoon_pallet,
      });
    }
  }, [yarnReceiveDetails, reset]);

  useEffect(() => {
    // set options for denier selection on yarn stock company select
    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      const { yarn_company_name: name = "", yarn_details = [] } = ysc;
      if (name === yarn_company_name) {
        const options = yarn_details?.map(
          ({
            yarn_company_id = 0,
            filament = 0,
            yarn_denier = 0,
            luster_type = "",
            yarn_color = "",
          }) => {
            return {
              label: `${yarn_denier}D/${filament}F (${luster_type} - ${yarn_color})`,
              value: yarn_company_id,
            };
          }
        );
        if (options?.length) {
          setDenierOptions(options);
        }
      }
    });
  }, [yarn_company_name, yscdListRes?.yarnCompanyList]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <GoBackButton />
        <h3 className="m-0 text-primary">Edit Yarn Receive Challan</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          gutter={18}
          style={{
            padding: "12px",
          }}
        >
          <Col span={8}>
            <Form.Item
              label="Challan Date"
              name="challan_date"
              validateStatus={errors.challan_date ? "error" : ""}
              help={errors.challan_date && errors.challan_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_date"
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    disabledDate={disabledDate}
                    style={{
                      width: "100%",
                    }}
                    format="DD-MM-YYYY"
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={8} className="flex items-end gap-2">
            <Form.Item
              label="Yarn Company"
              name="yarn_company_name"
              validateStatus={errors.yarn_company_name ? "error" : ""}
              help={
                errors.yarn_company_name && errors.yarn_company_name.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
              className="flex-grow"
            >
              <Controller
                control={control}
                name="yarn_company_name"
                render={({ field }) => (
                  <Select
                    disabled
                    {...field}
                    placeholder="Select Yarn Stock Company"
                    loading={isLoadingYSCDList}
                    options={yscdListRes?.yarnCompanyList?.map(
                      ({ yarn_company_name = "" }) => {
                        return {
                          label: yarn_company_name,
                          value: yarn_company_name,
                        };
                      }
                    )}
                  />
                )}
              />
            </Form.Item>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={goToAddYarnStockCompany}
              className="flex-none mb-6"
              type="primary"
            />
          </Col>

          <Col span={8}>
            <Form.Item
              label="Denier"
              name="yarn_stock_company_id"
              validateStatus={errors.yarn_stock_company_id ? "error" : ""}
              help={
                errors.yarn_stock_company_id &&
                errors.yarn_stock_company_id.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="yarn_stock_company_id"
                render={({ field }) => (
                  <Select
                    disabled
                    {...field}
                    placeholder="Select denier"
                    allowClear
                    loading={isLoadingYSCDList}
                    options={denierOptions}
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
          </Col>

          <Col span={8}>
            <Form.Item
              label="Lot No"
              name="lot_no"
              validateStatus={errors.lot_no ? "error" : ""}
              help={errors.lot_no && errors.lot_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                disabled
                control={control}
                name="lot_no"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Challan No"
              name="challan_no"
              validateStatus={errors.challan_no ? "error" : ""}
              help={errors.challan_no && errors.challan_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                disabled
                control={control}
                name="challan_no"
                render={({ field }) => <Input {...field} />}
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Receive Quantity"
              name="receive_quantity"
              validateStatus={errors.receive_quantity ? "error" : ""}
              help={errors.receive_quantity && errors.receive_quantity.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="receive_quantity"
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

          <Col span={8}>
            <Form.Item
              label="Receive Cartoon/pallet"
              name="receive_cartoon_pallet"
              validateStatus={errors.receive_cartoon_pallet ? "error" : ""}
              help={
                errors.receive_cartoon_pallet &&
                errors.receive_cartoon_pallet.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="receive_cartoon_pallet"
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
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
}

export default UpdateYarnReceive;
