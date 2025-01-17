import { Button, Flex, Input, Modal, Spin, Typography, message } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import "./_style.css";
import { CloseOutlined, EyeOutlined, FileTextFilled } from "@ant-design/icons";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { ToWords } from "to-words";
import {
  getDebitNoteByIdRequest,
  getLastDebitNoteNumberRequest,
} from "../../../../api/requests/accounts/notes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { createDebitNoteRequest } from "../../../../api/requests/accounts/notes";
import { useMutation } from "@tanstack/react-query";
import { DEBIT_NOTE_BILL_MODEL } from "../../../../constants/bill.model";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreDecimal: false,
    ignoreZeroCurrency: false,
    doNotAddOnly: false,
    currencyOptions: {
      // can be used to override defaults for the selected locale
      name: "Rupee",
      plural: "Rupees",
      symbol: "₹",
      fractionalUnit: {
        name: "Paisa",
        plural: "Paise",
        symbol: "",
      },
    },
  },
});

function calculateDaysDifference(dueDate) {
  const today = new Date(); // Get today's date
  const [day, month, year] = dueDate.split("-");
  const due = new Date(year, month - 1, day);
  const timeDifference = today - due; // Difference in milliseconds
  const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  return dayDifference;
}

const CalculateInterest = (due_days, bill_amount) => {
  console.log(due_days, bill_amount);

  const INTEREST_RATE = 0.12; // Annual interest rate of 12%
  if (due_days <= 0 || bill_amount <= 0) {
    return 0; // Return 0 if inputs are invalid
  }
  // Calculate interest
  const interestAmount = (+bill_amount * INTEREST_RATE * due_days) / 365;
  return interestAmount.toFixed(2); // Return the interest amount rounded to 2 decimal places
};

const SundaryDebitNoteGenerate = ({
  bill_details,
  open,
  setOpen,
  debiteNoteData,
  setDebitNoteSelection,
}) => {
  const queryClient = useQueryClient();
  const { companyId, companyListRes } = useContext(GlobalContext);
  const [debitNote, setDebitNote] = useState(undefined);

  // Selected company information ========================================================
  const selectedCompany = useMemo(() => {
    if (companyId) {
      return companyListRes?.rows?.find(({ id }) => id === companyId);
    }
  }, [companyId, companyListRes]);

  // Get last debite note last number information request =================================
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

  useEffect(() => {
    if (debitNoteLastNumber?.debitNoteNumber) {
      let temp_debit_note = String(debitNoteLastNumber?.debitNoteNumber).split(
        "-"
      )[1];
      let debit_note = `DNP-${+temp_debit_note + 1}`;
      setDebitNote(`${debit_note}`);
    }
  }, [debitNoteLastNumber]);

  // Get Debit note by id related information
  const [genratedDebiteNoteInfo, setGeneratedDebiteNoteInfo] =
    useState(undefined);
  const [isGenerated, setIsGenerated] = useState(false);
  const [debitNoteDetailsLoading, setDebitNoteDetailsLoading] = useState(false) ; 
  const manuallyFetchDebitNoteInformation = async () => {
    setIsGenerated(true);
    const params = {
      company_id: companyId,
    };

    const debit_note_id = bill_details[0]?.debit_note_id;

    if (!debit_note_id) {
      console.error("No debit note ID found.");
      return;
    }

    try {
      setDebitNoteDetailsLoading(true) ; 
      // Manually call the queryFn
      const response = await getDebitNoteByIdRequest({
        id: debit_note_id,
        params: params,
      });

      // Handle the response data
      const data = response?.data?.data;
      
      setGeneratedDebiteNoteInfo(data?.debitNotes);
      setDebitNoteDetailsLoading(false) ; 
    } catch (error) {
      setDebitNoteDetailsLoading(false) ;  
      console.error("Error fetching debit note:", error);
    }
  };

  useEffect(() => {
    if (bill_details?.length == 1) {
      if (bill_details[0]?.debit_note_id != null) {
        manuallyFetchDebitNoteInformation();
      }
    }
  }, [bill_details]);

  // Total Amount calculation related functionality ========================================
  const [totalInterestAmount, setTotalInterestAmount] = useState(0);
  const [taxAmoumt, setTaxAmount] = useState({});
  const [roundOffAmoumt, setRoundOffAmount] = useState(undefined);
  const [netAmount, setNetAmount] = useState(undefined);
  const [taxName, setTaxName] = useState("TDS");
  const [taxValue, setTaxValue] = useState(0);

  useEffect(() => {
    if (bill_details?.length > 0) {
      let totalAmount = 0;
      bill_details?.map((bill) => {
        let dueDate = moment(bill?.due_days).format("DD-MM-YYYY");
        let dueDays = isNaN(calculateDaysDifference(dueDate))
          ? 0
          : calculateDaysDifference(dueDate);
        let interestAmount = CalculateInterest(dueDays, +bill?.amount);
        totalAmount += +interestAmount;
      });
      setTotalInterestAmount(totalAmount);

      let CGST = (+totalAmount * 2.5) / 100;

      let net_amount = +totalAmount + +CGST * 2;
      let round_off_amount = Math.round(net_amount);
      setRoundOffAmount(net_amount - round_off_amount);
      setTaxAmount({ CGST: CGST });
      setNetAmount(round_off_amount);
    }
  }, [bill_details]);

  useEffect(() => {
    if (taxValue > 0) {
      let TDSAmount = (+netAmount * +taxValue) / 100;
      setTaxAmount((prev) => {
        return {
          ...prev,
          TDS: Math.round(TDSAmount),
        };
      });

      let net_amount = netAmount - +Math.round(TDSAmount);
      setNetAmount(net_amount);
    }
  }, [taxValue]);

  const { mutateAsync: addDebitOtherNOte, isPending } = useMutation({
    mutationFn: async ({ data }) => {
      const res = await createDebitNoteRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "debit", "other-note"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["sundry", "debtor", "data"]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      setDebitNoteSelection([]);
      setOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const handleSubmit = async () => {
    let bill_details_temp = [];
    bill_details?.map((element) => {
      let dueDate = moment(element?.due_days).format("DD-MM-YYYY");
      let dueDays = isNaN(calculateDaysDifference(dueDate))
        ? 0
        : calculateDaysDifference(dueDate);
      let interestAmount = CalculateInterest(dueDays, +element?.amount);
      bill_details_temp?.push({
        bill_id: element.bill_id,
        model: element?.model,
        rate: 0,
        per: 1.0,
        invoice_no: element?.bill_no,
        particular_name: "Late Payment Income",
        // quality: billData?.inhouse_quality?.quality_weight,
        amount: +interestAmount,
      });
    });
    const payload = {
      party_id: bill_details[0]?.party_id,
      supplier_id: bill_details[0]?.supplier_id,
      debit_note_number: debitNote,
      debit_note_type: "other",
      SGST_value: 2.5,
      SGST_amount: +taxAmoumt?.CGST,
      CGST_value: 2.5,
      CGST_amount: +taxAmoumt?.CGST,
      IGST_value: 0,
      IGST_amount: 0,
      round_off_amount: roundOffAmoumt,
      net_amount: netAmount,
      extra_tex_name: taxName,
      extra_tex_value: +taxValue,
      extra_tex_amount: +taxAmoumt?.TDS || 0,
      createdAt: dayjs(new Date()).format("YYYY-MM-DD"),
      debit_note_details: bill_details_temp,
    };
    await addDebitOtherNOte({ data: payload });
  };

  return (
    <>
      <Modal
        open={open}
        width={"75%"}
        onCancel={() => {
          setOpen(false);
        }}
        footer={false}
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <div
            style={{
              fontSize: 20,
            }}
          >
            Debit Note
          </div>
        }
        centered
        className={{
          header: "text-center",
        }}
        classNames={{
          header: "text-center",
        }}
        styles={{
          content: {
            padding: 0,
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "16px 32px",
          },
        }}
      >
        <Spin spinning = {debitNoteDetailsLoading}>
          <div className="credit-note-container">
            <table className="credit-note-table">
              <tbody>
                <tr>
                  <td colSpan={3} width={"33.33%"}>
                    <div className="year-toggle" style={{ textAlign: "left" }}>
                      <Typography.Text style={{ fontSize: 20, fontWeight: 400 }}>
                        Debit Note No.
                      </Typography.Text>
                      {isGenerated ? (
                        <>
                          <div>{genratedDebiteNoteInfo?.debit_note_number}</div>
                        </>
                      ) : (
                        <>
                          <div>{debitNote || "DNP-1"}</div>
                        </>
                      )}
                    </div>
                  </td>
                  <td colSpan={3} width={"33.33%"}>
                    <div className="year-toggle" style={{ textAlign: "left" }}>
                      <Typography.Text style={{ fontWeight: 400 }}>
                        Date.
                      </Typography.Text>
                      <div>{moment(new Date()).format("DD-MM-YYYY")}</div>
                    </div>
                  </td>
                  <td colSpan={3} width={"33.33%"}>
                    <div className="year-toggle" style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 400 }}>Bill No.</div>
                      {isGenerated ? (
                        <>
                          {genratedDebiteNoteInfo?.debit_note_details
                            ?.map((element) => element?.invoice_no || element?.bill_no || "N/A")
                            .join(",")}
                        </>
                      ) : (
                        <>
                          <div>
                            {bill_details
                              ?.map((element) => element?.bill_no)
                              .join(",")}
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                <tr width="50%">
                  <td colSpan={4}>
                    <div style={{fontSize: 16, fontWeight: 600}}>
                      {selectedCompany?.company_name}
                    </div>
                    <div>
                      {selectedCompany?.address_line_1}
                    </div>
                    <div className="credit-note-info-title">
                      <span>GSTIN/UIN:</span> {selectedCompany?.gst_no}
                    </div>
                    <div className="credit-note-info-title">
                      <span>State Name:</span> {String(selectedCompany?.state).toUpperCase()}
                    </div>
                    <div className="credit-note-info-title">
                      <span>PinCode:</span> {selectedCompany?.pincode}
                    </div>
                    <div className="credit-note-info-title">
                      <span>Contact:</span> {selectedCompany?.owner_mobile}
                    </div>
                    <div className="credit-note-info-title">
                      <span>Email:</span> {selectedCompany?.company_email}
                    </div>
                  </td>
                  
                  {/* Supplier information  */}
                  {debiteNoteData?.supplier?.id !== undefined && (
                    <td colSpan={4}>
                      <div className="credit-note-info-title">
                        <span style={{ fontWeight: 400, fontSize: 16, color: "blue" }}>Supplier</span>
                        <br></br>
                        <span>
                          {String(
                            debiteNoteData?.supplier?.supplier_company
                          ).toUpperCase()}
                        </span>
                        <br />
                        <span>{debiteNoteData?.supplier?.supplier_name}</span>
                        <br />
                        {debiteNoteData?.address}
                      </div>
                      <div className="credit-note-info-title">
                        <span>GSTIN/UIN:</span> {debiteNoteData?.gst_no}
                      </div>
                      <div className="credit-note-info-title">
                        <span>PAN/IT No:</span> {debiteNoteData?.pancard_no}
                      </div>
                      <div className="credit-note-info-title">
                        <span>Email:</span> {debiteNoteData?.email}
                      </div>
                    </td>
                  )}

                  {/* Party information  */}
                  {debiteNoteData?.supplier?.id == undefined && (
                    <td colSpan={4}>
                      <div className="credit-note-info-title">
                        <span style={{ fontWeight: 400, fontSize: 16, color: "blue" }}>Party</span>
                        <br></br>
                        <span>
                          {String("Party Company STATIC").toUpperCase()}
                        </span>
                        <br />
                        <span>{`${debiteNoteData?.first_name}`}</span>
                        <br />
                        {debiteNoteData?.address}
                      </div>
                      <div className="credit-note-info-title">
                        <span>GSTIN/UIN:</span> {debiteNoteData?.gst_no}
                      </div>
                      <div className="credit-note-info-title">
                        <span>PAN/IT No:</span> {debiteNoteData?.pancard_no}
                      </div>
                      <div className="credit-note-info-title">
                        <span>Email:</span> {debiteNoteData?.email}
                      </div>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
            <table className="credit-note-table">
              <thead style={{ fontWeight: 600 }}>
                <tr>
                  <td style={{ width: "50px" }}>SL No.</td>
                  <td colSpan={2}>Particulars</td>
                  <td>Quantity</td>
                  <td>Rate</td>
                  <td>Per</td>
                  <td style={{ width: "100px" }}>Amount</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1.</td>
                  <td style={{ fontWeight: 600 }} colSpan={2}>
                    {isGenerated?<>
                      {genratedDebiteNoteInfo?.debit_note_details[0]?.particular_name}
                    </>:<>
                      <span>
                        Late Payment Income
                      </span>
                    </>}
                  </td>
                  <td></td>
                  <td></td>
                  <td>-</td>
                  {isGenerated ? (
                    <>
                      <td>
                        {genratedDebiteNoteInfo?.debit_note_details?.reduce(
                          (total, element) => {
                            return total + (+element?.amount || 0); // Safely handle missing or invalid values
                          },
                          0
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{parseFloat(totalInterestAmount).toFixed(2)}</td>
                    </>
                  )}
                </tr>
                <tr>
                  <td></td>
                  <td colSpan={2} style={{ textAlign: "right" }}>
                    
                    {/* SGST amount related information  */}
                    {isGenerated?<>
                      <div style={{ fontWeight: 600, marginTop: 8 }}>SGST @ {genratedDebiteNoteInfo?.SGST_value}%</div>
                    </>:<>
                      <div style={{ fontWeight: 600, marginTop: 8 }}>SGST @ 2.5%</div>
                    </>}
                    
                    {/* CGST amount related information  */}
                    {isGenerated?<>
                      <div style={{ fontWeight: 600, marginTop : 8  }}>CGST @ {genratedDebiteNoteInfo?.CGST_value}%</div>
                    </>:<>
                      <div style={{ fontWeight: 600, marginTop : 8  }}>CGST @ 2.5%</div>
                    </>}
                    
                    {/* IGST amount information  */}
                    {isGenerated?<>
                      <div style={{ fontWeight: 600, marginTop: 8 }}>IGST @ {genratedDebiteNoteInfo?.IGST_value}%</div>
                    </>:<>
                      <div style={{ fontWeight: 600, marginTop: 8 }}>IGST @ 0%</div>
                    </>}
                    
                    <div style={{marginTop: 8}}>Round Off</div>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  {isGenerated ? (
                    <>
                      <td>
                        <div>{genratedDebiteNoteInfo?.SGST_amount}</div>
                        <div>{genratedDebiteNoteInfo?.CGST_amount}</div>
                        <div>0.0</div>
                        <div>{genratedDebiteNoteInfo?.round_off_amount}</div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <div>{parseFloat(taxAmoumt?.CGST || 0).toFixed(2)}</div>
                        <div>{parseFloat(taxAmoumt?.CGST || 0).toFixed(2)}</div>
                        <div>0.0</div>
                        <div>{parseFloat(roundOffAmoumt || 0).toFixed(2)}</div>
                      </td>
                    </>
                  )}
                </tr>
                <tr style={{ height: "50px" }}>
                  <td></td>
                  <td colSpan={2}></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr style={{ height: "50px" }}>
                  <td></td>
                  <td colSpan={2}></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
                <tr style={{ height: "50px" }}>
                  <td></td>
                  <td colSpan={2}>
                    <span style={{ fontWeight: 600 }}>Extra Tax </span>
                    <Flex style={{ gap: 5 }}>
                      {isGenerated?
                        <>
                          <Flex>
                              <span style={{fontWeight: 600}}>{genratedDebiteNoteInfo?.extra_tex_name || "TDS"}</span>
                              <span style={{marginLeft: 10}}>{genratedDebiteNoteInfo?.extra_tex_value || "0"}%</span>
                          </Flex>
                        </>
                      :<>
                        <Input
                          readOnly={isGenerated ? true : false}
                          value={
                            isGenerated
                              ? genratedDebiteNoteInfo?.extra_tex_name
                              : taxName
                          }
                          onChange={(event) => {
                            setTaxName(event.target.value);
                          }}
                          placeholder="Tax Name"
                          style={{ width: "25%" }}
                        />
                        <Input
                          readOnly={isGenerated ? true : false}
                          value={
                            isGenerated
                              ? genratedDebiteNoteInfo?.extra_tex_value
                              : taxValue
                          }
                          type="number"
                          onChange={(event) => {
                            setTaxValue(event.target.value);
                          }}
                          placeholder="Tax Value"
                          style={{ width: "15%" }}
                        />
                        %
                      </>}
                    </Flex>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  {isGenerated ? (
                    <>
                      <td style={{fontWeight: 600, color: "blue"}}>{genratedDebiteNoteInfo?.extra_tex_amount || 0}</td>
                    </>
                  ) : (
                    <>
                      <td style={{fontWeight: 600, color: "blue"}}>{parseFloat(taxAmoumt?.TDS || 0).toFixed(2)}</td>
                    </>
                  )}
                </tr>
                <tr>
                  <td></td>
                  <td colSpan={2}>
                    <b>Total</b>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  {isGenerated ? (
                    <>
                      <td>{genratedDebiteNoteInfo?.net_amount}</td>
                    </>
                  ) : (
                    <>
                      <td>{parseFloat(netAmount || 0).toFixed(2)}</td>
                    </>
                  )}
                </tr>
                <tr>
                  <td colSpan={8}>
                    <Flex
                      justify="space-between"
                      style={{ width: "100%" }}
                      className="mt-3"
                    >
                      <div>
                        <div>
                          <span style={{ fontWeight: 600 }}>
                            Amount Chargable(in words):
                          </span>
                          {toWords.convert(netAmount || 0)}
                        </div>
                        <div>
                          <span style={{ fontWeight: "500" }}>Remarks:</span> None
                        </div>
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

            <Flex
              gap={12}
              justify="flex-end"
              style={{
                marginTop: "1rem",
                alignItems: "center",
                width: "100%",
                justifyContent: "flex-end",
                gap: "1rem",
                marginBottom: 10,
              }}
            >

              {/* Debit note generate option  */}
              {bill_details[0]?.debit_note_id == null &&
                bill_details?.length == 1 && 
                bill_details[0]?.debit_note_id !== undefined && 
                bill_details[0]?.model !== DEBIT_NOTE_BILL_MODEL && (
                  <Button
                    type="primary"
                    loading={isPending}
                    onClick={handleSubmit}
                  >
                    Generate
                  </Button>
              )}

              {/* Debit note print option  */}
              { bill_details[0]?.debit_note_id != null && 
                bill_details[0]?.debit_note_id !== undefined &&(
                <Button type="primary">PRINT</Button>
              )}

              { bill_details[0]?.model == DEBIT_NOTE_BILL_MODEL &&(
                <Button type="primary">PRINT</Button>
              )}
              <Button onClick={() => setOpen(false)}>Close</Button>
            </Flex>
          </div>
        </Spin>
      </Modal>
    </>
  );
};

export default SundaryDebitNoteGenerate;
