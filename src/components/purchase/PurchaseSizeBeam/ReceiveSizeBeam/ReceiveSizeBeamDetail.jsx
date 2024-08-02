import { DeleteOutlined, PlusCircleFilled } from "@ant-design/icons";
import { Button, Flex, Form, Input, Space, Table, message } from "antd";
import { Controller, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";

function ReceiveSizeBeamDetail({ control, errors, setPendingMeter, setValue }) {

  const { fields, append, remove } = useFieldArray({
    control,
    name: "beam_details",
  });
  const [totalInitalTotalBeam, setInitalTotalBeam] = useState(fields?.length) ; 


  useEffect(() => {
    if (fields?.length > totalInitalTotalBeam){
      setInitalTotalBeam(fields?.length) ; 
    }
  }, [fields]) ; 

  const columns = [
    {
      title: "Beam No",
      key: "beam_no",
      dataIndex: "beam_no",
      className: "align-top",
      width: 100,
    },
    {
      title: "Supplier Beam No*",
      key: "supplier_beam_no",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`beam_details.${index}.supplier_beam_no`}
            validateStatus={
              errors.beam_details?.[index]?.supplier_beam_no ? "error" : ""
            }
            help={
              errors.beam_details?.[index]?.supplier_beam_no &&
              errors.beam_details?.[index]?.supplier_beam_no.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`beam_details.${index}.supplier_beam_no`}
              render={({ field }) => <Input {...field} placeholder="10" />}
            />
          </Form.Item>
        );
      },
      className: "align-top",
    },
    {
      title: "Ends/Tars*",
      key: "ends_or_tars",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`beam_details.${index}.ends_or_tars`}
            validateStatus={
              errors.beam_details?.[index]?.ends_or_tars ? "error" : ""
            }
            help={
              errors.beam_details?.[index]?.ends_or_tars &&
              errors.beam_details?.[index]?.ends_or_tars.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`beam_details.${index}.ends_or_tars`}
              render={({ field }) => (
                <Input {...field} type="number" min={0} step={0.01} />
              )}
            />
          </Form.Item>
        );
      },
      className: "align-top",
    },
    {
      title: "TPM*",
      key: "tpm",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`beam_details.${index}.tpm`}
            validateStatus={errors.beam_details?.[index]?.tpm ? "error" : ""}
            help={
              errors.beam_details?.[index]?.tpm &&
              errors.beam_details?.[index]?.tpm.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`beam_details.${index}.tpm`}
              render={({ field }) => (
                <Input {...field} type="number" min={0} step={0.01} />
              )}
            />
          </Form.Item>
        );
      },
      className: "align-top",
    },
    {
      title: "Pano*",
      key: "pano",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`beam_details.${index}.pano`}
            validateStatus={errors.beam_details?.[index]?.pano ? "error" : ""}
            help={
              errors.beam_details?.[index]?.pano &&
              errors.beam_details?.[index]?.pano.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`beam_details.${index}.pano`}
              render={({ field }) => (
                <Input {...field} type="number" min={0} step={0.01} />
              )}
            />
          </Form.Item>
        );
      },
      className: "align-top",
    },
    {
      title: "Taka*",
      key: "taka",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`beam_details.${index}.taka`}
            validateStatus={errors.beam_details?.[index]?.taka ? "error" : ""}
            help={
              errors.beam_details?.[index]?.taka &&
              errors.beam_details?.[index]?.taka.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`beam_details.${index}.taka`}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="10"
                />
              )}
            />
          </Form.Item>
        );
      },
      className: "align-top",
    },
    {
      title: "Mtrs*",
      key: "meters",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`beam_details.${index}.meters`}
            validateStatus={errors.beam_details?.[index]?.meters ? "error" : ""}
            help={
              errors.beam_details?.[index]?.meters &&
              errors.beam_details?.[index]?.meters.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`beam_details.${index}.meters`}
              render={({ field }) => (
                <Input 
                  {...field} 
                  type="number" 
                  min={0} 
                  step={0.01} 
                  onChange={(e) => {
                    setValue(`beam_details.${index}.meters`, e.target.value) ; 
                    console.log("Run this function");
                  }}
                />
              )}
            />
          </Form.Item>
        );
      },
      className: "align-top",
    },
    {
      title: "NET. WGT.*",
      key: "net_weight",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`beam_details.${index}.net_weight`}
            validateStatus={
              errors.beam_details?.[index]?.net_weight ? "error" : ""
            }
            help={
              errors.beam_details?.[index]?.net_weight &&
              errors.beam_details?.[index]?.net_weight.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`beam_details.${index}.net_weight`}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="10"
                />
              )}
            />
          </Form.Item>
        );
      },
      className: "align-top",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record, index) => {
        return (
          <Space>
            <Button
              danger
              key={text?.id}
              onClick={() => {
                if (fields?.length == 1){
                  message.warning("At least required one beam in receive size beam") ; 
                } else{
                  remove(index);
                }
              }}
            >
              <DeleteOutlined />
            </Button>
            {/* <Button onClick={() => {
              if (fields?.length < totalInitalTotalBeam){
                append({})
              } else {
                message.warning(`You only have ${fields?.length} size beam in this order`) ; 
              }

            }}>
              <PlusCircleFilled/>
            </Button> */}
          </Space>
        );
      },
      className: "align-top",
    },
  ];

  return (
    <Table
      dataSource={fields}
      columns={columns}
      pagination={false}
      footer={() => (
        <></>
      )}
      rowKey={"id"}
    />
  );
}

export default ReceiveSizeBeamDetail;
