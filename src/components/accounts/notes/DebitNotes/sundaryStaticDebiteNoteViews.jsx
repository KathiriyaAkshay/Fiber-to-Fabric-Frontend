import { Button, Flex, Modal, Typography } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import "./_style.css";
import { CloseOutlined, EyeOutlined, FileTextFilled } from "@ant-design/icons";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { ToWords } from "to-words";
import { getLastDebitNoteNumberRequest } from "../../../../api/requests/accounts/notes";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

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

const SundaryStaticDebiteNoteViews = ({ details, bill_details, type, data }) => {
    const { companyId, companyListRes } = useContext(GlobalContext);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [debitNote, setDebitNote] = useState(undefined) ; 

    const company = useMemo(() => {
        if (companyListRes?.length > 0) {
            const data = companyListRes?.rows?.find(
                (item) => +item.id == +companyId
            );
            console.log(data);
            
            return data;
        }
    }, [companyListRes]);

    // Get last debite note last number information request ==================
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
        if (debitNoteLastNumber?.debitNoteNumber){
            let temp_debit_note = String(debitNoteLastNumber?.debitNoteNumber).split("-")[1] ; 
            let debit_note = `DNP-${+temp_debit_note + 1}` ; 
            setDebitNote(`${debit_note}`) ; 
        }
    }, [debitNoteLastNumber]);
    
    

    // useEffect(() => {
    //     if (details) {
    //         let total_amount = 0;
    //         details?.debit_note_details?.map((element) => {
    //             total_amount += +element?.amount || 0;
    //         })
    //         setTotalAmount(total_amount);
    //     }
    // }, [details]);

    return (
        <>
            <FileTextFilled style={{fontSize: 18}} />

            <Modal
                open={isAddModalOpen}
                width={"75%"}
                onCancel={() => {
                    setIsAddModalOpen(false);
                }}
                footer={false}
                closeIcon={<CloseOutlined className="text-white" />}
                title={
                    <div style={{
                        fontSize: 20
                    }}>
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
                <div className="credit-note-container">
                    <table className="credit-note-table">
                        <tbody>
                            <tr>
                                <td colSpan={3} width={"33.33%"}>
                                    <div className="year-toggle" style={{ textAlign: "left" }}>
                                        <Typography.Text style={{ fontSize: 20, fontWeight: 400 }}>
                                            Debit Note No.
                                        </Typography.Text>
                                        <div>{debitNote || "DNP-1"}</div>
                                    </div>
                                </td>
                                <td colSpan={3} width={"33.33%"}>
                                    <div className="year-toggle" style={{ textAlign: "left" }}>
                                        <Typography.Text style={{ fontWeight: 400 }}>Date.</Typography.Text>
                                        <div>{moment(new Date()).format("DD-MM-YYYY")}</div>
                                    </div>
                                </td>
                                <td colSpan={3} width={"33.33%"}>
                                    <div className="year-toggle" style={{ textAlign: "left" }}>
                                        <div style={{ fontWeight: 400 }}>Bill No.</div>
                                        <div>{bill_details?.bill_no}</div>
                                    </div>
                                </td>
                            </tr>
                            <tr width="50%">
                                <td colSpan={4}>
                                    <div className="credit-note-info-title">
                                        <span>GSTIN/UIN:</span> 1234567890ABCDE
                                    </div>
                                    <div className="credit-note-info-title">
                                        <span>State Name:</span> Gujarat
                                    </div>
                                    <div className="credit-note-info-title">
                                        <span>PinCode:</span> 123456
                                    </div>
                                    <div className="credit-note-info-title">
                                        <span>Contact:</span> 9876543210
                                    </div>
                                    <div className="credit-note-info-title">
                                        <span>Email:</span> company@example.com
                                    </div>
                                </td>
                                {data?.supplier?.id !== undefined && (
                                    <td colSpan={4}>
                                        <div className="credit-note-info-title">
                                            <span style={{fontWeight: 400}}>Supplier</span><br></br>
                                            <span>{String(data?.supplier?.supplier_company).toUpperCase()}</span>
                                            <br />
                                            <span>{data?.supplier?.supplier_name}</span><br/>
                                            {data?.address}
                                        </div>
                                        <div className="credit-note-info-title">
                                            <span>GSTIN/UIN:</span> {data?.gst_no}
                                        </div>
                                        <div className="credit-note-info-title">
                                            <span>PAN/IT No:</span> {data?.pancard_no}
                                        </div>
                                        <div className="credit-note-info-title">
                                            <span>Email:</span> {data?.email}
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
                                <td colSpan={2} style={{
                                    fontWeight: 600, 
                                    color: "#000"
                                }}>Late Payment Income</td>
                                <td></td>
                                <td></td>
                                <td>-</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td></td>
                                <td colSpan={2} style={{ textAlign: "right" }}>
                                    <div>SGST @ 9%</div>
                                    <div>CGST @ 9%</div>
                                    <div>IGST @ 0%</div>
                                    <div>Round Off</div>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>
                                    <div>90.0</div>
                                    <div>90.0</div>
                                    <div>0.0</div>
                                    <div>0.0</div>
                                </td>
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
                                <td colSpan={2}>Extra Tax</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>50.0</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td colSpan={2}>
                                    <b>Total</b>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td style={{ fontWeight: 600 }}>1230.0</td>
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
                                                <span style={{ fontWeight: "500" }}>
                                                    Amount Chargable(in words):
                                                </span>
                                                One Thousand Two Hundred Thirty Only
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
                        <Button type="primary">Print</Button>
                        <Button onClick={() => setIsAddModalOpen(false)}>Close</Button>
                    </Flex>
                </div>
            </Modal>
        </>
    );
};

export default SundaryStaticDebiteNoteViews;
