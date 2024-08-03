import { DeleteOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Select, Table, message } from "antd";
import { Controller, useFieldArray } from "react-hook-form";
import { useState } from "react";
import { useForm } from "react-hook-form";
// import { initialOrderDetail } from "../../../constants/orderMaster";

function SizeBeamOrderDetail({ control, errors }) {

  const [noOfAdd, setNoOfAdd] = useState(1);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "order_details",
  });

  const columns = [
    {
      title: "Sr no",
      key: "sr_no",
      render: (text, record, index) => {
        return index + 1;
      },
      textWrap: "word-break",
      ellipsis: true,
      width: 70,
      className: "align-top",
    },
    {
      title: "Ends/Tars*",
      key: "ends_or_tars",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`order_details.${index}.ends_or_tars`}
            validateStatus={
              errors.order_details?.[index]?.ends_or_tars ? "error" : ""
            }
            help={
              errors.order_details?.[index]?.ends_or_tars &&
              errors.order_details?.[index]?.ends_or_tars.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`order_details.${index}.ends_or_tars`}
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
            name={`order_details.${index}.tpm`}
            validateStatus={errors.order_details?.[index]?.tpm ? "error" : ""}
            help={
              errors.order_details?.[index]?.tpm &&
              errors.order_details?.[index]?.tpm.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`order_details.${index}.tpm`}
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
      title: "Grade*",
      key: "grade",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`order_details.${index}.grade`}
            validateStatus={errors.order_details?.[index]?.grade ? "error" : ""}
            help={
              errors.order_details?.[index]?.grade &&
              errors.order_details?.[index]?.grade.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`order_details.${index}.grade`}
              render={({ field }) => (
                <Select
                  {...field}
                  options={[
                    {
                      label: "A",
                      value: "A",
                    },
                    {
                      label: "B",
                      value: "B",
                    },
                    {
                      label: "C",
                      value: "C",
                    },
                  ]}

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
            name={`order_details.${index}.meters`}
            validateStatus={
              errors.order_details?.[index]?.meters ? "error" : ""
            }
            help={
              errors.order_details?.[index]?.meters &&
              errors.order_details?.[index]?.meters.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`order_details.${index}.meters`}
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
            name={`order_details.${index}.pano`}
            validateStatus={errors.order_details?.[index]?.pano ? "error" : ""}
            help={
              errors.order_details?.[index]?.pano &&
              errors.order_details?.[index]?.pano.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`order_details.${index}.pano`}
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
      title: "Remark*",
      key: "remark",
      render: (text, record, index) => {
        return (
          <Form.Item
            key={text?.id}
            name={`order_details.${index}.remark`}
            validateStatus={
              errors.order_details?.[index]?.remark ? "error" : ""
            }
            help={
              errors.order_details?.[index]?.remark &&
              errors.order_details?.[index]?.remark.message
            }
            required={true}
            className="mb-0"
          >
            <Controller
              control={control}
              name={`order_details.${index}.remark`}
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
      title: "Actions",
      key: "actions",
      render: (text, record, index) => {
        return (
          <Button
            danger
            key={text?.id}
            onClick={() => {
              if (fields.length == 1) {
                message.warning("At least required one beam in order")
              } else {
                remove(index)
              }
            }}
          >
            <DeleteOutlined />
          </Button>
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
        <Flex justify="flex-end" gap={10}>
          <div className="w-28">
            <Input
              type="number"
              min={1}
              step={1}
              value={noOfAdd}
              onChange={(e) => setNoOfAdd(e.target.value)}
            />
          </div>
          <Button
            htmlType="button"
            onClick={() => {
              append(
                Array.from({ length: noOfAdd }, () => ({
                  ...fields[fields.length - 1],
                  id: undefined,
                }))
              );
              setNoOfAdd(1);
            }}
          >
            Add
          </Button>
        </Flex>
      )}
      rowKey={"id"}
    />
  );
}

export default SizeBeamOrderDetail;
