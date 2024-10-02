import { Button, DatePicker, Flex, Form, Radio, Select } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getDebitNoteChallanNoDropDownRequest,
  getLastDebitNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const validationSchema = yup.object().shape({
  challan_no: yup.string().required("Please select challan no."),
  return_date: yup.string().required("Please enter date"),
});

const PurchaseReturnForm = () => {
  const { companyId } = useContext(GlobalContext);

  const onSubmit = (data) => {
    console.log("on submit", data);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      is_current: 1,
      return_date: dayjs(),
      challan_no: null,
    },
    resolver: yupResolver(validationSchema),
  });
  const currentValue = watch();
  console.log({ currentValue });

  const { data: debitNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "debit-notes",
      "last-number",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getLastDebitNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: debitNoteChallanNo } = useQuery({
    queryKey: [
      "debit-note",
      "challan-no",
      "list",
      {
        company_id: companyId,
        end: currentValue.is_current
          ? dayjs().get("year")
          : dayjs().get("year") - 1,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        end: currentValue.is_current
          ? dayjs().get("year")
          : dayjs().get("year") - 1,
      };
      const response = await getDebitNoteChallanNoDropDownRequest({ params });
      return response?.data?.data || [];
    },
    enabled: Boolean(companyId),
  });

  return (
    <>
      <table className="credit-note-table">
        <tbody>
          <tr>
            <td colSpan={8}>
              <h2>Debit Note</h2>
            </td>
          </tr>
          <tr>
            <td colSpan={2} width={"33.33%"}>
              <div className="">
                Debit Note No.
                <div>{debitNoteLastNumber?.debitNoteNumber || "-"}</div>
              </div>
            </td>
            <td colSpan={2} width={"33.33%"}>
              <div className="">
                <div>Return Date:</div>
                <Form.Item
                  label=""
                  name="return_date"
                  validateStatus={errors.return_date ? "error" : ""}
                  help={errors.return_date && errors.return_date.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="return_date"
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        name="date"
                        className="width-100"
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
            <td colSpan={2} width={"33.33%"}>
              <div className="">
                <Form.Item label="" name="is_current">
                  <Controller
                    control={control}
                    name="is_current"
                    render={({ field }) => (
                      <Radio.Group {...field}>
                        <Radio value={1}>Current Year</Radio>
                        <Radio value={0}>Previous Year</Radio>
                      </Radio.Group>
                    )}
                  />
                </Form.Item>

                <Form.Item
                  label=""
                  name="challan_no"
                  validateStatus={errors.challan_no ? "error" : ""}
                  help={errors.challan_no && errors.challan_no.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="challan_no"
                    render={({ field }) => (
                      <Select
                        {...field}
                        className="width-100"
                        placeholder="Select Purchase Challan no."
                        style={{
                          textTransform: "capitalize",
                        }}
                        dropdownStyle={{
                          textTransform: "capitalize",
                        }}
                        options={
                          debitNoteChallanNo &&
                          debitNoteChallanNo?.result?.length
                            ? debitNoteChallanNo?.result.map((item) => {
                                return {
                                  label: item.challan_number,
                                  value: item.challan_id,
                                };
                              })
                            : []
                        }
                      />
                    )}
                  />
                </Form.Item>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <Flex gap={12} justify="flex-end">
        <Button type="primary" onClick={handleSubmit(onSubmit)}>
          Generate
        </Button>
        <Button>Close</Button>
      </Flex>
    </>
  );
};

export default PurchaseReturnForm;
