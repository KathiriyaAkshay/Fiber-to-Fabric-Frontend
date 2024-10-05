import { Button, DatePicker, Flex, Input, Modal, Radio, Select } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import "./_style.css";
import { useContext, useState } from "react";
import dayjs from "dayjs";
import { getLastCreditNoteNumberRequest } from "../../../../api/requests/accounts/notes";
import { useQuery } from "@tanstack/react-query";
import { getSaleBillListRequest } from "../../../../api/requests/sale/bill/saleBill";

const AddClaimNoteType = ({ setIsAddModalOpen, isAddModalOpen }) => {
  const { companyId } = useContext(GlobalContext);
  console.log({ companyId });
  const [returnDate, setReturnDate] = useState(dayjs());
  const [yearValue, setYearValue] = useState("previous");

  const { data: creditNoteLastNumber } = useQuery({
    queryKey: [
      "get",
      "credit-notes",
      "last-number",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getLastCreditNoteNumberRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: saleBillList, isLoadingSaleBillList } = useQuery({
    queryKey: [
      "saleBill",
      "list",
      {
        company_id: companyId,
        end:
          yearValue === "previous"
            ? dayjs().get("year") - 1
            : dayjs().get("year"),
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page: 0,
        pageSize: 99999,
        end:
          yearValue === "previous"
            ? dayjs().get("year") - 1
            : dayjs().get("year"),
      };
      const res = await getSaleBillListRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });
  console.log({ saleBillList });

  return (
    <>
      <Modal
        open={isAddModalOpen}
        width={"70%"}
        onCancel={() => {
          setIsAddModalOpen(false);
        }}
        footer={() => {
          return (
            <Flex
              style={{
                marginTop: "1rem",
                alignItems: "center",
                width: "100%",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <Button
                type="primary"
                // onClick={submitHandler}
                // loading={isPending}
              >
                Sales Return
              </Button>
              <Button
                type="default"
                onClick={() => {
                  setIsAddModalOpen(false);
                }}
              >
                Close
              </Button>
            </Flex>
          );
        }}
      >
        <div className="credit-note-container">
          <h2>Claim Note</h2>

          <table className="credit-note-table">
            <tbody>
              <tr>
                <td colSpan={2} width={"33.33%"}>
                  <div className="year-toggle" style={{ textAlign: "left" }}>
                    Credit Note No.
                    <div>{creditNoteLastNumber?.debitNoteNumber || ""}</div>
                  </div>
                </td>
                <td colSpan={2} width={"33.33%"}>
                  <div className="year-toggle" style={{ textAlign: "left" }}>
                    <label>Date:</label>
                    <DatePicker
                      value={returnDate}
                      onChange={(selectedDate) => setReturnDate(selectedDate)}
                      className="width-100"
                    />
                  </div>
                </td>
                <td colSpan={2} width={"33.33%"}>
                  <div className="year-toggle" style={{ textAlign: "left" }}>
                    <Radio.Group
                      value={yearValue}
                      onChange={(e) => setYearValue(e.target.value)}
                    >
                      <Flex>
                        <Radio style={{ fontSize: "12px" }} value={"previous"}>
                          Previous Year
                        </Radio>
                        <Radio style={{ fontSize: "12px" }} value={"current"}>
                          Current Year
                        </Radio>
                      </Flex>
                    </Radio.Group>
                    <Select
                      className="width-100 mt-2"
                      placeholder="Select Sale Challan No"
                      loading={isLoadingSaleBillList}
                      // options={
                      //   saleChallanList &&
                      //   saleChallanList?.row?.map((challan) => ({
                      //     label: challan.challan_no,
                      //     value: challan.id,
                      //   }))
                      // }
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                    />
                  </div>
                </td>
              </tr>
              <tr width="50%">
                <td colSpan={4}>
                  <div>GSTIN/UIN:</div>
                  <div>State Name:</div>
                  <div>Code:</div>
                  <div>Contact:</div>
                  <div>Email:</div>
                </td>
                <td colSpan={4}>
                  <div>Party:</div>
                  <div>GSTIN/UIN :</div>
                  <div>PAN/IT No:</div>
                  <div>State Name:</div>
                </td>
              </tr>
              <tr>
                <td style={{ width: "100px" }}>SL No.</td>
                <td colSpan={1}>Particulars</td>
                <td>Quantity</td>
                <td>Rate</td>
                <td>Per</td>
                <td>Amount</td>
              </tr>
              <tr>
                <td style={{ width: "100px" }}></td>
                <td colSpan={1}></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={1}>Discount On Purchase</td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <Input />
                </td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={1}>
                  <div>SGST @ 0 %</div>
                  <div>CGST @ 0 %</div>
                  <div>CGST @ 0%</div>
                  <div>Round Off</div>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <div>0</div>
                  <div>0</div>
                  <div>0</div>
                  <div>0</div>
                </td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={1}>Total</td>
                <td></td>
                <td></td>
                <td></td>
                <td>00.00</td>
              </tr>
              <tr>
                <td colSpan={8}>
                  <Flex
                    justify="space-between"
                    style={{ width: "100%" }}
                    className="mt-3"
                  >
                    <div>
                      <div>Amount Chargable(in words)</div>
                      <div>Xero Only</div>
                      <div>Remarks:</div>
                    </div>
                    <div>E & O.E</div>
                  </Flex>
                  <Flex
                    justify="space-between"
                    style={{ width: "100%" }}
                    className="mt-3"
                  >
                    <div></div>
                    <div>
                      <div>For,</div>
                      <div>
                        .................................................
                      </div>
                      <div>Authorized Signatory</div>
                    </div>
                  </Flex>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};

export default AddClaimNoteType;
