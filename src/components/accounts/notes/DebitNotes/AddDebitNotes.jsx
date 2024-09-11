import React, { useState } from "react";
import { Button, DatePicker, Flex, Input, Modal, Radio, Select } from "antd";
import "./_style.css";
const AddDebitNotes = (props) => {
  const showModal = () => {
    props.setIsAddModalOpen(true);
  };
  const handleOk = () => {
    props.setIsAddModalOpen(false);
  };
  const handleCancel = () => {
    props.setIsAddModalOpen(false);
  };
  const [selectedOption, setSelectedOptions] = useState("purchase_return");
  return (
    <>
      <Modal
        open={props.isAddModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"70%"}
      >
        <div className="credit-note-container">
          <Flex style={{ marginLeft: "auto" }} justify="center">
            {/* <Controller
              control={control}
              name="production_filter"
              render={({ field }) => ( */}
            <Radio.Group
              // {...field}
              value={selectedOption}
              name="production_filter"
              onChange={(e) => {
                setSelectedOptions(e.target.value);
                // field.onChange(e);
                // changeProductionFilter(e.target.value);
              }}
            >
              <Radio value={"purchase_return"}>Purchase Return</Radio>
              <Radio value={"claim_note"}>Claim Note</Radio>
              <Radio value={"discount_note"}>Discount Note</Radio>
              <Radio value={"other"}>other</Radio>
              <Radio value={"all"}>all</Radio>
            </Radio.Group>
            {/* )} */}
            {/* /> */}
          </Flex>

          <table className="credit-note-table">
            {selectedOption === "purchase_return" && (
              <>
=                <tbody>
                  <tr>
                    <td colSpan={8}>
                      <h2>Debit Note</h2>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} width={"33.33%"}>
                      <div className="year-toggle">
                        Credit Note No.
                        <div>1</div>
                      </div>
                    </td>
                    <td colSpan={2} width={"33.33%"}>
                      <div className="year-toggle">
                        <div>Return Date:</div>
                        <DatePicker className="width-100" />
                      </div>
                    </td>
                    <td colSpan={2} width={"33.33%"}>
                      <div className="year-toggle">
                        <label>
                          <input type="radio" name="year" defaultChecked />{" "}
                          Previous Year
                        </label>
                        <label>
                          <input type="radio" name="year" /> Current Year
                        </label>
                        <Select
                          // {...field}
                          className="width-100"
                          placeholder="Select Company"
                          // loading={isLoadingMachineList}
                          // options={machineListRes?.rows?.map((machine) => ({
                          //   label: machine?.machine_name,
                          //   value: machine?.machine_name,
                          // }))}
                          options={[
                            {
                              label: "Company 1",
                              value: "Company_1",
                            },
                          ]}
                          style={{
                            textTransform: "capitalize",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                          onChange={(value) => {
                            // field.onChange(value);
                            // resetField("quality_id");
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </>
            )}
            {selectedOption === "claim_note" && (
              <>
                <tbody>
                  <tr>
                    <td colSpan={8} className="text-center">
                      <h2>Discount Note</h2>
                      <h5>Discount Note No. 12</h5>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} width={"25%"}>
                      <div className="year-toggle">
                        <div>Date:</div>
                        <DatePicker className="width-100" />
                      </div>
                    </td>
                    <td colSpan={2} width={"25%"}>
                      <div className="year-toggle">
                        <div>Return Date:</div>
                        <DatePicker className="width-100" />
                      </div>
                    </td>
                    <td colSpan={2} width={"25%"}>
                      <div className="year-toggle">
                        <div>Supplier Company</div>
                        <Select
                          // {...field}
                          className="width-100"
                          placeholder="Select Company"
                          // loading={isLoadingMachineList}
                          // options={machineListRes?.rows?.map((machine) => ({
                          //   label: machine?.machine_name,
                          //   value: machine?.machine_name,
                          // }))}
                          options={[
                            {
                              label: "Company 1",
                              value: "Company_1",
                            },
                          ]}
                          style={{
                            textTransform: "capitalize",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                          onChange={(value) => {
                            // field.onChange(value);
                            // resetField("quality_id");
                          }}
                        />
                      </div>
                    </td>
                    <td colSpan={2} width={"25%"}>
                      <div className="year-toggle">
                        <div>Bill</div>
                        <Select
                          // {...field}
                          className="width-100"
                          placeholder="Select Company"
                          // loading={isLoadingMachineList}
                          // options={machineListRes?.rows?.map((machine) => ({
                          //   label: machine?.machine_name,
                          //   value: machine?.machine_name,
                          // }))}
                          options={[
                            {
                              label: "Company 1",
                              value: "Company_1",
                            },
                          ]}
                          style={{
                            textTransform: "capitalize",
                          }}
                          dropdownStyle={{
                            textTransform: "capitalize",
                          }}
                          onChange={(value) => {
                            // field.onChange(value);
                            // resetField("quality_id");
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr width="50%">
                    <td colSpan={4}>
                      <div>GSTIN/UIN:</div>
                      <div>State Name:</div>
                      <div>PinCode:</div>
                      <div>Contact:</div>
                      <div>Email:</div>
                    </td>
                    <td colSpan={4}>
                      <div>Party:</div>
                      <div>GSTIN/UIN:</div>
                      <div>Order No:</div>
                      <div>Quality Name:</div>
                    </td>
                  </tr>
                  <tr>
                    <td>SL No.</td>
                    <td colSpan={3}>Particulars</td>
                    <td>Quantity</td>
                    <td>Rate</td>
                    <td>Per</td>
                    <td>Amount</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td colSpan={3}></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                  <tr>
                    <td></td>
                    <td colSpan={3}>Discount On Purchase</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                      <Input />
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td colSpan={3}>
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
                    <td colSpan={3}>Total</td>
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
              </>
            )}
          </table>

          {/* <div className="total-summary">
            <table className="summary-table">
              <tbody>
                <tr>
                  <td colSpan={2}>No taka found</td>
                </tr>
                <tr>
                  <td>Total Taka:</td>
                  <td>Total Meter:</td>
                </tr>

                <tr>
                  <td>Return Taka: 00</td>
                  <td>Return Meter: 00</td>
                </tr>
              </tbody>
            </table>
          </div> */}
        </div>
      </Modal>
    </>
  );
};
export default AddDebitNotes;
