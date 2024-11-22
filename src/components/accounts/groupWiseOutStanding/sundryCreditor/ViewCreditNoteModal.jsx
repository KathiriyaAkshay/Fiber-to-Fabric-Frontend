import { Button, Flex, Modal, Tooltip } from "antd";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import "../../notes/CreditNotes/_style.css";
import { TabletFilled } from "@ant-design/icons";
import { useContext, useMemo, useState } from "react";
import dayjs from "dayjs";

const ViewCreditNoteModal = ({ details = null }) => {
  const { companyListRes } = useContext(GlobalContext);
  console.log("ViewCreditNoteModal", details);

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
      <Tooltip title="View Credit Note">
        <Button type="default" onClick={() => setIsAddModalOpen(true)}>
          <TabletFilled style={{ color: "blue" }} />
        </Button>
      </Tooltip>
      <Modal
        open={isAddModalOpen}
        width={"75%"}
        onCancel={() => {
          setIsAddModalOpen(false);
        }}
        footer={false}
      >
        <div className="credit-note-container">
          <table className="credit-note-table">
            <tbody>
              <tr>
                <td colSpan={8} className="text-center">
                  <h2>Credit Note</h2>
                </td>
              </tr>
              <tr>
                <td colSpan={3} width={"33.33%"}>
                  <div className="p-2">
                    Credit Note No.
                    <div>{details?.credit_note_number || "-"}</div>
                  </div>
                </td>
                <td colSpan={3} width={"33.33%"}>
                  <div className="p-2">
                    <div>
                      Date: {dayjs(details?.createdAt).format("DD-M-YYYY")}
                    </div>
                  </div>
                </td>
                <td colSpan={3} width={"33.33%"}>
                  <div className="p-2">Bill</div>
                  <div>
                    {details?.credit_note_details
                      .map((item) => item.bill_no)
                      .join(", ")}
                  </div>
                </td>
              </tr>
              <tr width="50%">
                <td colSpan={4}>
                  <div>GSTIN/UIN: {company?.gst_no || ""}</div>
                  <div>State Name: {company?.state || ""}</div>
                  <div>PinCode: {company?.pincode || ""}</div>
                  <div>Contact: {company?.company_contact || ""}</div>
                  <div>Email: {company?.company_email || ""}</div>
                </td>
                <td colSpan={4}>
                  <div>
                    Party:
                    <b>{details?.party?.company_name || "-"}</b>
                    <br />
                    {details?.address || ""}
                  </div>
                  <div>GSTIN/UIN: {details?.party?.user?.gst_no || "-"}</div>
                  <div>
                    PAN/IT No : {details?.party?.user?.pancard_no || "-"}
                  </div>
                  <div>State Name: {details?.party?.user?.state || "-"}</div>
                </td>
              </tr>
            </tbody>
          </table>
          <table className="credit-note-table">
            <thead>
              <tr>
                <th style={{ width: "50px" }}>SL No.</th>
                <th colSpan={2}>Particulars</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Per</th>
                <th style={{ width: "100px" }}>Amount</th>
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
                <td></td>
                <td colSpan={2}>{details?.particular_name || ""}</td>
                <td></td>
                <td></td>
                <td></td>
                <td>{details?.amount || "-"}</td>
              </tr>
              <tr>
                <td></td>
                <td colSpan={2}>
                  <div>SGST @ {details?.SGST_value || "-"} %</div>
                  <div>CGST @ {details?.CGST_value || "-"} %</div>
                  <div>IGST @ {details?.IGST_value || "-"}%</div>
                  <div>Round Off</div>
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <div>{details?.SGST_amount || "-"}</div>
                  <div>{details?.CGST_amount || "-"}</div>
                  <div>{details?.IGST_amount || "-"}</div>
                  <div>{details?.round_off_amount || "-"}</div>
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

          <Flex gap={12} justify="flex-end">
            <Button type="primary">Print</Button>
            <Button onClick={() => setIsAddModalOpen(false)}>Close</Button>
          </Flex>
        </div>
      </Modal>
    </>
  );
};

export default ViewCreditNoteModal;
