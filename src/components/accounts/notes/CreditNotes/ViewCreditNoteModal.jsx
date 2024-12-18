import { Button, Flex, Modal, Typography } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import "./_style.css";
import { CloseOutlined, EyeOutlined, FileTextFilled } from "@ant-design/icons";
import { useContext, useMemo, useState } from "react";
import dayjs from "dayjs";
import { ToWords } from "to-words";

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

const ViewCreditNoteModal = ({ details, type }) => {
  const { companyListRes } = useContext(GlobalContext);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const company = useMemo(() => {
    if (details && Object.keys(details).length && companyListRes) {
      const data = companyListRes?.rows?.find(
        (item) => item.id === details.company_id
      );
      return data;
    }
  }, [companyListRes, details]);

  return (
    <>
      <Button type="primary" onClick={() => setIsAddModalOpen(true)}>
        <FileTextFilled />
      </Button>

      <Modal
        open={isAddModalOpen}
        width={"75%"}
        onCancel={() => {
          setIsAddModalOpen(false);
        }}
        footer={false}
        closeIcon={<CloseOutlined className="text-white" />}
        title="Credit Note"
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
                  <div className="year-toggle" style={{textAlign: "left"}}>
                    <Typography.Text style={{ fontSize: 20, fontWeight: 400 }}>
                      Credit Note No.
                    </Typography.Text>
                    <div>{details.credit_note_number || ""}</div>
                  </div>
                </td>
                <td colSpan={3} width={"33.33%"}>
                  <div className="year-toggle" style={{textAlign: "left"}}>
                    <Typography.Text style={{
                      fontWeight: 400
                    }}>Date.</Typography.Text>
                    <div>{dayjs(details.createdAt).format("DD-M-YYYY")}</div>
                  </div>
                </td>
                <td colSpan={3} width={"33.33%"}>
                  <div className="year-toggle" style={{textAlign: "left"}}>
                    <div style={{fontWeight: 400}}>Bill No.</div>
                    <div>
                      {details?.credit_note_details
                        .map((item) => item.bill_no || item?.invoice_no)
                        .join(", ")}
                    </div>
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
                        <span>Email:</span>{" "}
                        {details?.party?.user?.email || "-"}
                      </div>
                    </>
                  )}

                  {details?.supplier !== null && (
                    <>
                      <strong>{String(details?.supplier?.supplier_company).toUpperCase()}</strong>
                      <div className="credit-note-info-title">
                        <span>Supplier:</span>
                        {details?.supplier?.supplier_name || "-"}
                        <br />
                        {details?.supplier?.user?.address || ""}
                      </div>
                      <div className="credit-note-info-title">
                        <span>GSTIN/UIN:</span>{" "}
                        {details?.supplier?.user?.gst_no || "-"}
                      </div>
                      <div className="credit-note-info-title">
                        <span>PAN/IT No: </span>
                        {details?.suupplier?.user?.pancard_no || "-"}
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
                <td>{type == "other"?"HSN Code":"Quantity"}</td>
                <td>Rate</td>
                <td>Per</td>
                <td style={{ width: "100px" }}>Amount</td>
              </tr>
            </thead>
            <tbody>
              {/* <tr style={{ height: "50px" }}>
                <td></td>
                <td colSpan={2}></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr> */}
              <tr>
                <td>1.</td>
                <td colSpan={2}>{details?.particular_name || details?.credit_note_details[0]?.particular_name || ""}</td>
                <td>{type == "other"?details?.hsn_no:details?.quantity || ""}</td>
                <td>{details?.rate || ""}</td>
                <td></td>
                <td>{details?.amount || details?.credit_note_details[0]?.amount || ""}</td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={2} style={{ textAlign: "right" }}>
                  <div>SGST @ {details?.SGST_value || 0} %</div>
                  <div>CGST @ {details.CGST_value || 0} %</div>
                  <div>IGST @ {details.IGST_value || 0}%</div>
                  <div>Round Off</div>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <div>{details.SGST_amount || 0}</div>
                  <div>{details.CGST_amount || 0}</div>
                  <div>{details.IGST_amount || 0}</div>
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
                <td colSpan={2}>
                  {details?.extra_tex_name || ""}{" "}
                  {details?.extra_tex_value || ""}
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>{details?.extra_tex_amount || ""}</td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={2}>
                  <b>Total</b>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>{details?.net_amount || "-"}</td>
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

export default ViewCreditNoteModal;
