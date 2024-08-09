import { Button, Form, Input, Space, Table, message } from "antd";
import { Controller, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";

// function UpdateSizeBeamDetail({
//   control,
//   errors,
//   appendBeamType,
//   appendLastBeamNumber,
//   setAppendLastBeamNumber,
//   sizeBeamOrderListRes,
//   totalMeter,
//   setPendingMeter,
//   getValues,
//   setValue
// }) {


//   const [noOfAdd, setNoOfAdd] = useState(1);
//   const { fields, append, remove, update } = useFieldArray({
//     control,
//     name: "beam_details",
//   });

//   useEffect(() => {
//     setNoOfAdd(fields?.length);

//     let tempTotalMeter = 0;
//     fields?.map((element) => {
//       tempTotalMeter = tempTotalMeter + Number(element?.meters);
//     });

//     setPendingMeter(Number(totalMeter) - Number(tempTotalMeter));
//   }, [fields])

//   const columns = [
//     {
//       title: "Beam No",
//       key: "beam_no",
//       dataIndex: "beam_no",
//       className: "align-top",
//       width: 100,
//     },
//     {
//       title: "Supplier Beam No*",
//       key: "supplier_beam_no",
//       render: (text, record, index) => {
//         return (
//           <Form.Item
//             key={text?.id}
//             name={`beam_details.${index}.supplier_beam_no`}
//             validateStatus={
//               errors.beam_details?.[index]?.supplier_beam_no ? "error" : ""
//             }
//             help={
//               errors.beam_details?.[index]?.supplier_beam_no &&
//               errors.beam_details?.[index]?.supplier_beam_no.message
//             }
//             required={true}
//             className="mb-0"
//           >
//             <Controller
//               control={control}
//               name={`beam_details.${index}.supplier_beam_no`}
//               render={({ field }) => <Input  {...field} placeholder="10" />}
//             />
//           </Form.Item>
//         );
//       },
//       className: "align-top",
//     },
//     {
//       title: "Ends/Tars*",
//       key: "ends_or_tars",
//       render: (text, record, index) => {
//         return (
//           <Form.Item
//             key={text?.id}
//             name={`beam_details.${index}.ends_or_tars`}
//             validateStatus={
//               errors.beam_details?.[index]?.ends_or_tars ? "error" : ""
//             }
//             help={
//               errors.beam_details?.[index]?.ends_or_tars &&
//               errors.beam_details?.[index]?.ends_or_tars.message
//             }
//             required={true}
//             className="mb-0"
//           >
//             <Controller
//               control={control}
//               name={`beam_details.${index}.ends_or_tars`}
//               render={({ field }) => (
//                 <Input {...field} type="number" min={0} step={0.01} />
//               )}
//             />
//           </Form.Item>
//         );
//       },
//       className: "align-top",
//     },
//     {
//       title: "TPM*",
//       key: "tpm",
//       render: (text, record, index) => {
//         return (
//           <Form.Item
//             key={text?.id}
//             name={`beam_details.${index}.tpm`}
//             validateStatus={errors.beam_details?.[index]?.tpm ? "error" : ""}
//             help={
//               errors.beam_details?.[index]?.tpm &&
//               errors.beam_details?.[index]?.tpm.message
//             }
//             required={true}
//             className="mb-0"
//           >
//             <Controller
//               control={control}
//               name={`beam_details.${index}.tpm`}
//               render={({ field }) => (
//                 <Input {...field} type="number" min={0} step={0.01} />
//               )}
//             />
//           </Form.Item>
//         );
//       },
//       className: "align-top",
//     },
//     {
//       title: "Pano*",
//       key: "pano",
//       render: (text, record, index) => {
//         return (
//           <Form.Item
//             key={text?.id}
//             name={`beam_details.${index}.pano`}
//             validateStatus={errors.beam_details?.[index]?.pano ? "error" : ""}
//             help={
//               errors.beam_details?.[index]?.pano &&
//               errors.beam_details?.[index]?.pano.message
//             }
//             required={true}
//             className="mb-0"
//           >
//             <Controller
//               control={control}
//               name={`beam_details.${index}.pano`}
//               render={({ field }) => (
//                 <Input {...field} type="number" min={0} step={0.01} />
//               )}
//             />
//           </Form.Item>
//         );
//       },
//       className: "align-top",
//     },
//     {
//       title: "Taka*",
//       key: "taka",
//       render: (text, record, index) => {
//         return (
//           <Form.Item
//             key={text?.id}
//             name={`beam_details.${index}.taka`}
//             validateStatus={errors.beam_details?.[index]?.taka ? "error" : ""}
//             help={
//               errors.beam_details?.[index]?.taka &&
//               errors.beam_details?.[index]?.taka.message
//             }
//             required={true}
//             className="mb-0"
//           >
//             <Controller
//               control={control}
//               name={`beam_details.${index}.taka`}
//               render={({ field }) => (
//                 <Input
//                   {...field}
//                   type="number"
//                   min={0}
//                   step={0.01}
//                   placeholder="10"
//                 />
//               )}
//             />
//           </Form.Item>
//         );
//       },
//       className: "align-top",
//     },
//     {
//       title: "Mtrs*",
//       key: "meters",
//       render: (text, record, index) => {
//         return (
//           <Form.Item
//             key={text?.id}
//             name={`beam_details.${index}.meters`}
//             validateStatus={errors.beam_details?.[index]?.meters ? "error" : ""}
//             help={
//               errors.beam_details?.[index]?.meters &&
//               errors.beam_details?.[index]?.meters.message
//             }
//             required={true}
//             className="mb-0"
//           >
//             <Controller
//               control={control}
//               name={`beam_details.${index}.meters`}
//               render={({ field }) => (
//                 <Input
//                   {...field}
//                   type="number"
//                   min={0}
//                   step={0.01}
//                   onChange={(e) => {
//                     setValue(`beam_details.${index}.meters`, e.target.value);
//                     let tempTotalMeter = 0;
//                     fields?.map((element, i) => {
//                       let tempValue = getValues(`beam_details.${i}.meters`);
//                       if (tempValue != "" && tempValue != undefined) {
//                         tempTotalMeter = tempTotalMeter + Number(tempValue);
//                       }
//                     })
//                     setPendingMeter(Number(totalMeter) - Number(tempTotalMeter));

//                   }}
//                 />
//               )}
//             />
//           </Form.Item>
//         );
//       },
//       className: "align-top",
//     },
//     {
//       title: "NET. WGT.*",
//       key: "net_weight",
//       render: (text, record, index) => {
//         return (
//           <Form.Item
//             key={text?.id}
//             name={`beam_details.${index}.net_weight`}
//             validateStatus={
//               errors.beam_details?.[index]?.net_weight ? "error" : ""
//             }
//             help={
//               errors.beam_details?.[index]?.net_weight &&
//               errors.beam_details?.[index]?.net_weight.message
//             }
//             required={true}
//             className="mb-0"
//           >
//             <Controller
//               control={control}
//               name={`beam_details.${index}.net_weight`}
//               render={({ field }) => (
//                 <Input
//                   {...field}
//                   type="number"
//                   min={0}
//                   step={0.01}
//                   placeholder="10"
//                 />
//               )}
//             />
//           </Form.Item>
//         );
//       },
//       className: "align-top",
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (text, record, index) => {
//         return (
//           <Space>

//             <Button
//               key={text?.id}
//               type="primary"
//               onClick={() => {
//                 console.log("Total beam", noOfAdd);
//                 console.log("BEam", sizeBeamOrderListRes);

//                 if (noOfAdd < sizeBeamOrderListRes) {

//                   let data = Array.from({ length: 1 }, () => ({
//                     ...fields[fields.length - 1],
//                     id: undefined,
//                     beam_no: `${appendBeamType}-${Number(appendLastBeamNumber) + 1}`
//                   }));
//                   setAppendLastBeamNumber(Number(appendLastBeamNumber) + 1);
//                   append(data);
//                   setNoOfAdd((prev) => prev + 1);
//                 } else {
//                   message.warning(`You have only ${sizeBeamOrderListRes} beam in this order`);
//                 }
//               }}
//             >
//               <PlusOutlined />
//             </Button>

//             {fields?.length !== 1 && (
//               <Button
//                 danger
//                 key={text?.id}
//                 onClick={() => {
//                   remove(index);
//                   setAppendLastBeamNumber((prev) => prev - 1);
//                 }}
//               >
//                 <DeleteOutlined />
//               </Button>
//             )}
//           </Space>
//         );
//       },
//       className: "align-top",
//     },
//   ];

  import { DeleteOutlined, PlusCircleFilled } from "@ant-design/icons";
  import { Controller, useFieldArray } from "react-hook-form";

  function UpdateSizeBeamDetail({
    control,
    errors,
    orderData,
    deletedRecords,
    setDeletedRecords,
  }) {
    const { fields, append, remove } = useFieldArray({
      control,
      name: "beam_details",
    });

    const addNewRowHandler = () => {
      const selectedOrder = orderData;
      if (fields.length === selectedOrder.size_beam_order_details.length) {
        message.error("Your Order is Finished.");
      } else {
        if (deletedRecords.length) {
          append(deletedRecords[0]);
          setDeletedRecords((prev) => prev.filter((_, index) => index !== 0));
        } else {
          const remainingOrder = selectedOrder.size_beam_order_details.filter(
            (order) => {
              let temp = false;
              fields.forEach(({ size_beam_order_detail_id }) => {
                if (size_beam_order_detail_id === order.id) {
                  temp = true;
                  return;
                }
              });
              if (!temp) {
                return order;
              }
            }
          );
          append(remainingOrder[0]);
        }
      }
    };

    const removeRowHandler = (index) => {
      if (fields?.length == 1) {
        message.warning("At least required one beam in receive size beam");
      } else {
        remove(index);
        setDeletedRecords((prev) => [...prev, fields[index]]);
      }
    };

    const columns = [
      {
        title: "Beam No",
        key: "beam_no",
        dataIndex: "beam_no",
        className: "align-top",
        width: 100,
        render: (text, record, index) => {
          return (
            <>
              {text}
              <Form.Item
                key={text?.id}
                name={`beam_details.${index}.size_beam_order_detail_id`}
                validateStatus={
                  errors.beam_details?.[index]?.size_beam_order_detail_id
                    ? "error"
                    : ""
                }
                help={
                  errors.beam_details?.[index]?.size_beam_order_detail_id &&
                  errors.beam_details?.[index]?.size_beam_order_detail_id.message
                }
                required={true}
                className="mb-0"
              >
                <Controller
                  control={control}
                  name={`beam_details.${index}.size_beam_order_detail_id`}
                  render={({ field }) => (
                    <Input {...field} type="hidden" placeholder="10" />
                  )}
                />
              </Form.Item>
              {/* <Form.Item
              key={text?.id}
              name={`beam_details.${index}.id`}
              validateStatus={errors.beam_details?.[index]?.id ? "error" : ""}
              help={
                errors.beam_details?.[index]?.id &&
                errors.beam_details?.[index]?.id.message
              }
              required={true}
              className="mb-0"
            >
              <Controller
                control={control}
                name={`beam_details.${index}.id`}
                render={({ field }) => (
                  <Input {...field} type="hidden" placeholder="10" />
                )}
              />
            </Form.Item> */}
            </>
          );
        },
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
                render={({ field }) => (
                  <Input readOnly {...field} placeholder="10" />
                )}
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
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step={0.01}
                    readOnly={fields[index].is_running}
                  />
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
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step={0.01}
                    readOnly={fields[index].is_running}
                  />
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
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    step={0.01}
                    readOnly={fields[index].is_running}
                  />
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
                    readOnly
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
                  <Input {...field} readOnly type="number" min={0} step={0.01} />
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
                    readOnly
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
              {fields[index].is_running ? (
                <>
                  <Button
                    danger
                    key={text?.id}
                    onClick={() => removeRowHandler(index)}
                  >
                    <DeleteOutlined />
                  </Button>
                </>
              ) : null}
              {index === fields.length - 1 && (
                <Button type="primary" onClick={addNewRowHandler}>
                  <PlusCircleFilled />
                </Button>
              )}
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
        footer={() => <></>}
        rowKey={"id"}
      />
    );
  }

  export default UpdateSizeBeamDetail;
