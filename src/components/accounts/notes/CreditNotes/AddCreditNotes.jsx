import React, { useState } from "react";
import { Button, DatePicker, Input, Modal, Select } from "antd";
import "./_style.css";
const AddCreditNotes = (props) => {
  const showModal = () => {
    props.setIsAddModalOpen(true);
  };
  const handleOk = () => {
    props.setIsAddModalOpen(false);
  };
  const handleCancel = () => {
    props.setIsAddModalOpen(false);
  };
  return (
    <>
      <Modal
        open={props.isAddModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={"70%"}
      >
        <div className="credit-note-container">
          <h2>Credit Note</h2>

          <table className="credit-note-table">
            <tbody>
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
                      <input type="radio" name="year" defaultChecked /> Previous
                      Year
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
              <tr width="50%">
                <td colSpan={3}>
                  <div>GSTIN/UIN:</div>
                  <div>State Name:</div>
                  <div>PinCode:</div>
                  <div>Contact:</div>
                  <div>Email:</div>
                </td>
                <td colSpan={3}>
                  <div>Party:</div>
                  <div>GSTIN/UIN:</div>
                  <div>Order No:</div>
                  <div>Quality Name:</div>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="total-summary">
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
          </div>
        </div>
      </Modal>
    </>
  );
};
export default AddCreditNotes;
