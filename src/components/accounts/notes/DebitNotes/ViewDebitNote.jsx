import { Button, Flex, Modal, Typography } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import "./_style.css";
import { CloseOutlined, EyeOutlined, FileTextFilled } from "@ant-design/icons";
import { useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { ToWords } from "to-words";
import { DEBIT_NOTE_PURCHASE_RETURN, DEBIT_NOTE_SIZE_BEAM_RETURN, DEBIT_NOTE_YARN_RETURN } from "../../../../constants/bill.model";

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

const ViewDebitNote = ({ details, type, isEyeButton, isModelOpen, handleClose }) => {
    console.log(details);
    
    const { companyListRes } = useContext(GlobalContext);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0) ;
    const [invoiceNo, setInvoiceNo] = useState(undefined) ; 

    const company = useMemo(() => {
        if (details && Object.keys(details).length && companyListRes) {
            const data = companyListRes?.rows?.find(
                (item) => item.id === details.company_id
            );
            return data;
        }
    }, [companyListRes, details]);

    useEffect(() => {
        if (details){
            let debit_note_type = details?.debit_note_type ; 

            if ([DEBIT_NOTE_PURCHASE_RETURN, DEBIT_NOTE_SIZE_BEAM_RETURN, DEBIT_NOTE_YARN_RETURN, "other"]?.includes(debit_note_type)){
                setTotalAmount(details?.amount) ;
                setInvoiceNo(details?.invoice_no) ;
            }   else {
                let total_amount = 0; 
                details?.debit_note_details?.map((element) => {
                    total_amount += +element?.amount || 0 ;
                })
                setTotalAmount(total_amount) ;
                setInvoiceNo(details?.debit_note_details?.map((element) => {
                    
                }))

            }

        }
    }, [details]) ; 

    return (
        <>
            {isEyeButton == undefined && (
                <Button type="primary" onClick={() => setIsAddModalOpen(true)}>
                    <FileTextFilled />
                </Button>
            )}

            <Modal
                open={isModelOpen == undefined?isAddModalOpen:isModelOpen}
                width={"75%"}
                onCancel={() => {
                    if (handleClose == undefined){
                        setIsAddModalOpen(false);
                    }   else {
                        handleClose() ;
                    }
                }}
                footer={false}
                closeIcon={<CloseOutlined className="text-white" />}
                title="Debit Note"
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
                                        <div>{details.debit_note_number || "DNP-1"}</div>
                                    </div>
                                </td>
                                <td colSpan={3} width={"33.33%"}>
                                    <div className="year-toggle" style={{ textAlign: "left" }}>
                                        <Typography.Text style={{
                                            fontWeight: 400
                                        }}>Date.</Typography.Text>
                                        <div>{dayjs(details.createdAt).format("DD-M-YYYY")}</div>
                                    </div>
                                </td>
                                <td colSpan={3} width={"33.33%"}>
                                    <div className="year-toggle" style={{ textAlign: "left" }}>
                                        <div style={{ fontWeight: 400 }}>Bill No.</div>

                                        {type == "purchase_return"?<>
                                            <div>
                                                {   
                                                    details?.yarn_receive_challan?.challan_no || 
                                                    details?.purchase_taka_challan?.challan_no || 
                                                    "CH-1"
                                                }
                                            </div>
                                        </>:<>
                                            <div>
                                            {details?.debit_note_details
                                                ?.map((element) => element?.bill_no || element?.invoice_no || "N/A")  // Map through to get bill_no or "N/A" if it's null
                                                .join(", ")}
                                            </div>
                                        </>}
                                    </div>
                                </td>
                            </tr>
                            <tr width="50%">
                                <td colSpan={4}>
                                    <div className="credit-note-info-title">
                                        <span>GSTIN/UIN:</span> {company?.gst_no || ""}
                                    </div>
                                    <div className="credit-note-info-title">
                                        <span>State Name:</span> {company?.state || ""}
                                    </div>
                                    <div className="credit-note-info-title">
                                        <span>PinCode:</span> {company?.pincode || ""}
                                    </div>
                                    <div className="credit-note-info-title">
                                        <span>Contact:</span> {company?.company_contact || ""}
                                    </div>
                                    <div className="credit-note-info-title">
                                        <span>Email:</span> {company?.company_email || ""}
                                    </div>
                                </td>
                                <td colSpan={4}>
                                    {details?.party !== null && (
                                        <>
                                            <div className="credit-note-info-title">
                                                <span>Party:</span>
                                                {details?.party?.company_name || "-"}
                                                <br />
                                                {details?.address || ""}
                                            </div>
                                            <div className="credit-note-info-title">
                                                <span>GSTIN/UIN:</span>{" "}
                                                {details?.party?.user?.gst_no || "-"}
                                            </div>
                                            <div className="credit-note-info-title">
                                                <span>PAN/IT No: </span>
                                                {details?.party?.user?.pancard_no || "-"}
                                            </div>
                                            <div className="credit-note-info-title">
                                                <span>State Name:</span>{" "}
                                                {details?.party?.user?.state || "-"}
                                            </div>
                                        </>
                                    )}

                                    {details?.supplier !== null && (
                                        <>
                                            <div style={{
                                                fontSize: 16,
                                                color: "#000", 
                                                fontWeight: 600
                                            }}>{String(details?.supplier?.supplier_company).toUpperCase()}</div>
                                            <div className="credit-note-info-title">
                                                <span>Supplier:</span>
                                                {details?.supplier?.supplier_name || "-"}
                                                <br />
                                                {details?.address || ""}
                                            </div>
                                            <div className="credit-note-info-title">
                                                <span>GSTIN/UIN:</span>{" "}
                                                {details?.supplier?.user?.gst_no || "-"}
                                            </div>
                                            <div className="credit-note-info-title">
                                                <span>PAN/IT No: </span>
                                                {details?.supplier?.user?.pancard_no || "-"}
                                            </div>
                                            <div className="credit-note-info-title">
                                                <span>Email:</span>{" "}
                                                {details?.supplier?.user?.email || "-"}
                                            </div>
                                        </>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table className="credit-note-table">
                        <thead style={{ fontWeight: 600 }}>
                            <tr>
                                <td style={{ width: "50px" }}>SL No.</td>
                                <td colSpan={2}>Particulars</td>
                                <td>{type == "other" ? "HSN Code" : details?.purchase_taka_challan?"Meter":"Quantity"}</td>
                                <td>Rate</td>
                                <td>Per</td>
                                <td style={{ width: "100px" }}>Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1.</td>
                                
                                
                                {type == "purchase_return"?<>
                                    <td colSpan={2}>
                                        {details?.purchase_taka_challan !== null?
                                        "Purchase Return":"Yarn Return"}
                                    </td>
                                </>:<>
                                    <td colSpan={2}>{details?.particular_name || details?.debit_note_details[0]?.particular_name || ""}</td>
                                </>}
                                
                                {/* Quantity information  */}
                                <td>{type == "other" ? details?.hsn_no : 
                                    type == "purchase_return"?
                                        details?.purchase_taka_challan !== null?details?.total_meter:details?.total_meter:details?.quantity || "-"}</td>
                                
                                {/* Rate amount information  */}
                                <td>{details?.net_rate || "0.0"}</td>
                                
                                <td>{"-"}</td>
                                
                                <td>
                                    {type === "other"
                                        ? details?.debit_note_details?.[0]?.amount || ""
                                        : type === "purchase_return"
                                        ? parseFloat((+details?.total_meter || 0) * (+details?.net_rate || 0)).toFixed(2)
                                        : type === "claim_note"
                                        ? details?.debit_note_details?.[0]?.amount || "":
                                        details?.debit_note_details?.map((element) => +element?.amount || 0)}
                                </td>

                            </tr>
                            <tr>
                                <td></td>
                                <td colSpan={2} style={{ textAlign: "right" }}>
                                    <div><span style={{fontWeight: 600}}>SGST @</span> {details?.SGST_value || 0} %</div>
                                    <div><span style={{fontWeight: 600}}>CGST @ </span>{details.CGST_value || 0} %</div>
                                    <div><span style={{fontWeight: 600}}>IGST @</span> {details.IGST_value || 0}%</div>
                                    <div><span style={{fontWeight: 600}}>TCS @</span> {details.tcs_value || 0}%</div>
                                    <div>Round Off</div>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>
                                    <div>{details.SGST_amount || 0}</div>
                                    <div>{details.CGST_amount || 0}</div>
                                    <div>{details.IGST_amount || 0}</div>
                                    <div>{details.tcs_amount || 0}</div>
                                    <div>{details.round_off_amount || 0}</div>
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
                                <td colSpan={2} style={{
                                    fontWeight: 600, 
                                    color: "blue"
                                }}>
                                    {details?.extra_tex_name || "TDS"}{" "}
                                    {details?.extra_tex_value || ""}
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td style={{
                                    fontWeight: 600, 
                                    color: "blue"
                                }}>{details?.extra_tex_amount || ""}</td>
                            </tr>
                            <tr>
                                <td></td>
                                <td colSpan={2}>
                                    <b>Total</b>
                                </td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td style={{
                                    fontWeight: 600
                                }}>{details?.net_amount || "-"}</td>
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
                                                </span>{" "}
                                                {toWords.convert(details?.net_amount || 0)}
                                            </div>
                                            <div>
                                                <span style={{ fontWeight: "500" }}>Remarks:</span>{" "}
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

export default ViewDebitNote;
