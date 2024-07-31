import { EyeOutlined, UndoOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  message,
  Modal,
  Row,
  Typography,
} from "antd";
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { useRef, useContext, useEffect } from "react";
// import ReactToPrint from "react-to-print";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { createSaleChallanReturnRequest } from "../../../../api/requests/sale/challan/challan";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";

const { Text } = Typography;

const ViewChallan = ({ details, companyId }) => {
  const [isModelOpen, setIsModalOpen] = useState(false);
  const componentRef = useRef();

  var rows = [], i = 0, len = 12;
  while (++i <= len) rows.push(i);

  // const pageStyle = `
  //       @media print {
  //            .print-instructions {
  //               display: none;
  //           }
  //           .printable-content {
  //               padding: 20px; /* Add padding for print */
  //               width: 100%;
  //           }
  //   `;



  // const submitHandler = async () => {
  //   const payload = {
  //     sale_challan_id: details.id,
  //     sale_challan_detail_ids: selectedSaleChallan,
  //     createdAt: dayjs(returnDate).format("YYYY-MM-DD"),
  //     supplier_name: details.supplier.supplier_name,
  //     quality_id: details.quality_id,
  //   };
  //   await AddSaleChallanReturn(payload);
  // };

  return (
    <>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <EyeOutlined />
      </Button>

      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className=" font-medium text-white">
            Sale Challan
          </Typography.Text>
        }
        open={isModelOpen}
        footer={() => {
          return (
            <>
              {/* <ReactToPrint
                trigger={() => (
                  <Flex>
                    <Button
                      type="primary"
                      style={{ marginLeft: "auto", marginTop: 15 }}
                    >
                      PRINT
                    </Button>
                  </Flex>
                )}
                content={() => componentRef.current}
                pageStyle={pageStyle}
              /> */}
            </>
          );
        }}
        onCancel={() => {
          setIsModalOpen(false);
          setSelectedSaleChallan([]);
        }}
        centered={true}
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
            maxHeight: "75vh",
            overflowY: "auto",
          },
          footer: {
            paddingBottom: 10,
            paddingRight: 10,
            backgroundColor: "#efefef",
          },
        }}
        width={"70vw"}
      >
        <div class="bg-white shadow-md rounded p-6">
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="text-left" colspan="4">
                  <h1 class="text-2xl font-bold">SONU TEXTILES</h1>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colspan="4" class="py-2">
                  <p>PLOT NO. 78,, JAYVEER INDU. ESTATE,, GUJARAT HOUSING BOARD ROAD, PANDESARA,, SURAT, GUJARAT, 394221 - 394221 AT: SURAT DIST-SURAT</p>
                </td>
              </tr>
              <tr>
                <td colspan="1" class="py-2 border-b border-gray-300">
                  <p>PHONE NO: 6353207671</p>
                </td>
                <td colspan="1" class="py-2 border-b border-gray-300">
                  <p>PAYMENT: 6353207671</p>
                </td>
                <td colspan="1" class="py-2 border-b border-gray-300">
                  <p>GST NO: 24ABHPP6021C1Z4</p>
                </td>
                <td colspan="1" class="py-2 border-b border-gray-300">
                  <p>PAN NO: ABHPP6021C</p>
                </td>
              </tr>
              <tr class="bg-gray-200">
                <th colspan="4" class="py-2 text-center">DELIVERY CHALLAN</th>
              </tr>
              <tr>
                <td colspan="2" class="py-2 border-b border-gray-300">
                  <p>M/S: BABAJI SILK FABRIC / H M SILK FABRIC</p>
                  <p>DELIVERY AT: GALA NO 16, B PART, BHAWANI C. H. S. LTD, GARRAGE GALLI, DADAR, MAHARASHTRA,400028</p>
                  <p>GST: 27ANJPD1966G1ZZ</p>
                  <p>E-WAY BILL NO:</p>
                  <p>VEHICLE NO: GJ 05 NW 2334</p>
                </td>
                <td colspan="2" class="py-2 border-b border-gray-300">
                  <p>CHALLAN NO: 1230025</p>
                  <p>ORDER NO: 33</p>
                  <p>PARTY ORDER NO: 22</p>
                  <p>DATE: 24-07-2024</p>
                  <p>BROKER: NIK BROKER</p>
                  <p>DESCRIPTION OF GOODS: 33P PALLU PATTERN (SDFSDFSDFSDFSDFSD)</p>
                </td>
              </tr>
              <tr>
                <td colSpan={1} className="p-4 w-1/4">
                  <Row justify={"space-between"} className="w-full bg-gray-200">
                    <Col className="p-1">No</Col>
                    <Col className="p-1">Taka No</Col>
                    <Col className="p-1">Meter</Col>
                  </Row>
                  {Array(10).fill(1).map((el, i) =>
                      <Row justify={"space-between"} className="w-full">
                      <Col className="p-1">{i+1}</Col>
                      <Col className="p-1">{1+i*2}</Col>
                      <Col className="p-1">{0}</Col>
                    </Row>
                  )}
                </td>
                <td colSpan={1} className="p-4 w-1/4">
                  <Row justify={"space-between"} className="w-full bg-gray-200">
                    <Col className="p-1">No</Col>
                    <Col className="p-1">Taka No</Col>
                    <Col className="p-1">Meter</Col>
                  </Row>
                  {Array(10).fill(1).map((el, i) =>
                      <Row justify={"space-between"} className="w-full">
                      <Col className="p-1">{i+1}</Col>
                      <Col className="p-1">{1+i*2}</Col>
                      <Col className="p-1">{0}</Col>
                    </Row>
                  )}
                </td>
                <td colSpan={1} className="p-4 w-1/4">
                  <Row justify={"space-between"} className="w-full bg-gray-200">
                    <Col className="p-1">No</Col>
                    <Col className="p-1">Taka No</Col>
                    <Col className="p-1">Meter</Col>
                  </Row>
                  {Array(10).fill(1).map((el, i) =>
                      <Row justify={"space-between"} className="w-full">
                      <Col className="p-1">{i+1}</Col>
                      <Col className="p-1">{1+i*2}</Col>
                      <Col className="p-1">{0}</Col>
                    </Row>
                  )}
                </td>
                <td colSpan={1} className="p-4 w-1/4">
                  <Row justify={"space-between"} className="w-full bg-gray-200">
                    <Col className="p-1">No</Col>
                    <Col className="p-1">Taka No</Col>
                    <Col className="p-1">Meter</Col>
                  </Row>
                  {Array(10).fill(1).map((el, i) =>
                      <Row justify={"space-between"} className="w-full">
                      <Col className="p-1">{i+1}</Col>
                      <Col className="p-1">{1+i*2}</Col>
                      <Col className="p-1">{0}</Col>
                    </Row>
                  )}
                </td>
              </tr>


              <tr>
                <td colSpan={4}>
                  <Row className="w-full bg-gray-200 p-1">
                    <Col span={12}><strong>Total Taka:1</strong> 1</Col>
                    <Col span={12}><strong>Total Meter:23</strong></Col>
                  </Row>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <Row className="w-ful p-1">
                    <Col span={12} className="text-left">
                      <strong> TERMS OF SALES:</strong>
                      <ol>
                        <li>Interest at 2% per month will be charged reaming unpaid from date of bill.
                        </li>
                        <li>
                          Complaint if any regarding this invoice must be settled within 24 hours.
                        </li>
                        <li>
                          Subject to Surat jurisdiction.
                        </li>
                        <li>
                          We are not responsible for processed good &width.
                        </li>
                      </ol>
                    </Col>
                    <Col span={12}>
                      <div className="text-right w-full h-1/2">
                        <strong>FOR, SONU TEXTILES</strong>
                      </div>
                      <Row className="h-1/2" justify={"end"} align={"bottom"}>
                        <Col span={12} className="text-right w-full" >SUPERVISOR CHECK BY</Col>
                        <Col span={12} className="text-right w-full">AUTHORIZED SIGNATORY</Col>
                      </Row>
                    </Col>
                  </Row>
                </td>
              </tr>
              <tr>

              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
};

export default ViewChallan;
