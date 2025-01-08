import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Table,
  Typography,
} from "antd";
import { usePagination } from "../../../hooks/usePagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { useContext, useMemo, useState } from "react";
import { getTurnoverReportService } from "../../../api/requests/accounts/reports";
import { CloseOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Controller, useForm } from "react-hook-form";
import { updateCompanyRequest } from "../../../api/requests/company";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = yupResolver(
  yup.object().shape({
    company: yup.string().nullable().required("Company is required"), // Ensures company is selected (non-null)

    month_limit: yup
      .mixed()
      .typeError("Month limit must be a number") // Error if it's not a valid number
      .required("Month limit is required"),

    year_limit: yup
      .mixed()
      .typeError("Year limit must be a number") // Error if it's not a valid number
      .required("Year limit is required"),
  })
);

const Turnover = () => {
  const { companyId } = useContext(GlobalContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: turnoverData, isLoading } = useQuery({
    
    queryKey: [
      "saleChallan",
      "list",
      {
        company_id: companyId
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const res = await getTurnoverReportService({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const columns = [
    {
      title: "No.",
      dataIndex: "no",
      key: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Type",
      dataIndex: "key",
      key: "company_name",
      sorter: {
        compare: (a, b) => {
          return a?.company_name - b?.company_name;
        },
      },
      render: (text, record) => {
        return(
          <div>
            {text}
          </div>
        )
      }
    },
    {
      title: "Sales meter",
      dataIndex: "sales_meters",
      key: "sales_meters",
      render: (text, record) => {
       return(
        <div>
          {record?.total_meter}
        </div>
       )
      },
    },
    {
      title: "Taka",
      dataIndex: "total_taka",
      key: "sales",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
    },
    {
      title: "Total Net Amount",
      dataIndex: "total_net_amount",
    },
  ];

  function renderTable() {
    if (isLoading) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <div style={{
      }}>
        {turnoverData && turnoverData?.map((element) => {
          let tableData = [] ; 
          
          tableData.push({
            key: "Sale Meter", 
            ...element?.sale_bill_analitics
          })

          tableData.push({
            key: "Gray Sale Meter", 
            ...element?.gray_sale_bill_analitics
          })

          tableData.push({
            key: "Sale Return", 
            ...element?.credit_note_analitics
          }) 

          tableData.push({
            key: "Discount Note", 
            ...element?.discount_note_analitics
          })

          return(
            <>
              <div style={{
              }}>
                <Flex style={{
                  gap: 10, 
                  marginBottom: 20, 
                  paddingTop: 15
                }}>
                  {/* Company name information  */}
                  <div style={{
                    color: "#000"
                  }}>
                    <span style={{
                      fontWeight: 600
                    }}>Company </span> : {element?.company_name} | 
                  </div>
                  
                  {/* Month transaction limit related information  */}
                  <div style={{
                    color: "#000"
                  }}>
                    <span style={{
                      fontWeight: 600
                    }}>Monthly limit </span> : {element?.month_limit} |
                  </div>

                  {/* Yearly transaction limit related information  */}
                  <div style={{
                    color: "#000"
                  }}>
                    <span style={{
                      fontWeight: 600
                    }}>Yearly limit </span> : {element?.year_limit}
                  </div>
                </Flex>
                
                {/* ==== Data information ====  */}
                <Table
                  dataSource={tableData || []}
                  columns={columns}
                  rowKey={"id"}
                  pagination = {false}
                  summary={() => {
                    
                    let total_amount_without_gst = +element?.sale_bill_analitics?.total_amount + +element?.gray_sale_bill_analitics?.total_amount ;
                    let total_amount_with_gst = +element?.sale_bill_analitics?.total_net_amount + +element?.sale_bill_analitics?.total_net_amount ; 

                    return(
                      <Table.Summary>
                        
                        <Table.Summary.Row>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell>
                            <strong style={{color: "green"}}>
                              {"Total sale => "}
                            </strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell>
                            <Flex>
                              <div>
                                {parseFloat(total_amount_without_gst).toFixed(2)} <span style={{fontWeight: 400}}>Without GST</span>
                              </div>
                              <div style={{
                                fontWeight: 600, 
                                marginLeft: 5, 
                                marginRight: 5
                              }}>
                                |
                              </div>
                              <div>
                                {parseFloat(total_amount_with_gst).toFixed(2)} <span style={{fontWeight: 400}}>With GST</span>
                              </div>
                            </Flex>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                        </Table.Summary.Row>

                        <Table.Summary.Row>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell>
                            <strong style={{color: "green"}}>
                              {"Return => "}
                            </strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell>
                            <Flex>
                              <div>
                                {element?.credit_note_analitics?.total_amount} <span style={{fontWeight: 400}}>Without GST</span>
                              </div>
                              <div style={{fontWeight: 600, marginLeft: 5, marginRight: 5}}>
                                |
                              </div>
                              <div>
                                {element?.credit_note_analitics?.total_net_amount} <span style={{fontWeight: 400}}>Without GST</span>
                              </div>
                            </Flex>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                        </Table.Summary.Row>
                        
                        <Table.Summary.Row>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell>
                            <strong style={{color: "green"}}>
                              {"Discount => "}
                            </strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell>
                            <Flex>
                              <div>
                                {element?.discount_note_analitics?.total_amount} <span style={{fontWeight: 400}}>Without GST</span>
                              </div>
                              <div style={{fontWeight: 600, marginLeft: 5, marginRight: 5}}>
                                |
                              </div>
                              <div>
                                {element?.discount_note_analitics?.total_net_amount} <span style={{fontWeight: 400}}>Without GST</span>
                              </div>
                            </Flex>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                          <Table.Summary.Cell></Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    )

                  }}
                />
              </div>
            </>
          )
        })}        

      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary" style={{
              marginLeft: -15
            }}>Company wise turnover</h3>
            <Button
              onClick={() => setIsModalOpen(true)}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
        </div>
        {renderTable()}
      </div>

      {isModalOpen && (
        <EditCompanyTurnOver
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </>
  );
};

export default Turnover;

const EditCompanyTurnOver = ({ isModalOpen, setIsModalOpen }) => {
  const { companyListRes } = useContext(GlobalContext);
  const queryClient = useQueryClient();

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const { mutateAsync: updateCompanyDetails, isPending } = useMutation({
    mutationFn: async ({ companyId, data }) => {
      const res = await updateCompanyRequest({
        companyId,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["update", "company"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["saleChallan", "list"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setIsModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message;
      if (errorMessage && typeof errorMessage === "string") {
        message.error(errorMessage);
      }
    },
  });

  const onSubmit = async (data) => {
    const payload = {
      month_limit: +data.month_limit,
      year_limit: +data.year_limit,
    };
    await updateCompanyDetails({ companyId: data.company, data: payload });
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      company: null,
      month_limit: "",
      year_limit: "",
    },
    resolver: validationSchema,
  });

  const companyOptions = useMemo(() => {
    if (companyListRes && companyListRes?.rows?.length) {
      const data = companyListRes?.rows.map(({ company_name, id }) => {
        return { label: company_name, value: id };
      });
      return data;
    } else {
      return [];
    }
  }, [companyListRes]);

  return (
    <>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={"Turnover"}
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        className="view-in-house-quality-model"
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
            width: "600px",
            margin: "auto",
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
          },
        }}
      >
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              label={"Select Company"}
              name="company"
              validateStatus={errors.company ? "error" : ""}
              help={errors.company && errors.company.message}
              wrapperCol={{ sm: 24 }}
              required
            >
              <Controller
                control={control}
                name="company"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Company"
                      options={companyOptions}
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                      onChange={(value) => {
                        field.onChange(+value);
                        const selectedCompany = companyListRes?.rows?.find(
                          ({ id }) => id === value
                        );
                        console.log({ selectedCompany });
                        setValue(
                          "month_limit",
                          +selectedCompany?.month_limit || 0
                        );
                        setValue(
                          "year_limit",
                          +selectedCompany?.year_limit || 0
                        );
                      }}
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Month Turnover Limit"
              name="month_limit"
              validateStatus={errors.month_limit ? "error" : ""}
              help={errors.month_limit && errors.month_limit.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="month_limit"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter monthly turnover limit"
                    onChange={(e) => {
                      field.onChange(+e.target.value);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Year Turnover Limit"
              name="year_limit"
              validateStatus={errors.year_limit ? "error" : ""}
              help={errors.year_limit && errors.year_limit.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="year_limit"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter yearly turnover limit"
                    onChange={(e) => {
                      field.onChange(+e.target.value);
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>
        </Row>
        <Flex gap={10} style={{ marginTop: "1rem" }} justify="flex-end">
          <Button
            type="primary"
            htmlType="button"
            loading={isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Submit
          </Button>
        </Flex>
      </Modal>
    </>
  );
};
