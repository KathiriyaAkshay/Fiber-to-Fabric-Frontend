import { EyeOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Modal, Row, Typography, Select } from "antd";
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { useRef, useContext } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import ReactToPrint from "react-to-print";
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from "@ant-design/icons";
import moment from "moment";

// const { Text } = Typography;

const ViewChallan = ({ details, isMutliple }) => {
  const [isModelOpen, setIsModalOpen] = useState(
    isMutliple == undefined ? false : true
  );
  const ComponentRef = useRef();
  const [optionSelection, setOptionSelection] = useState("MET");
  const { company } = useContext(GlobalContext);
  function splitArrayIntoChunks(arr, chunkSize) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }

  const pageStyle = `
    @media print {
      .print-instructions {
        display: none;
    }

    .sale-challan-table{
      page-break-after: always;
    }

    .page-break{
      display: none;
    }

    .printable-content {
      padding: 20px; /* Add padding for print */
      width: 100%;
    }

    .print-div{
      height: auto; 
      overflow: hidden; 
      page-break-inside: avoid;
    }
    
    .final-total-count{
      border-top: 1px solid ;
    }

    .sorting-option{
      display: none !important; 
    }
  `;

  return (
    <>
      <Button
        type="primary"
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
              <ReactToPrint
                trigger={() => (
                  <Flex align="center" justify="end">
                    <Button type="primary" style={{ marginTop: 15 }}>
                      PRINT
                    </Button>
                    <Button
                      type="primary"
                      style={{ marginLeft: 5, marginTop: 15 }}
                    >
                      PRINT MICRO CHALLAN
                    </Button>
                  </Flex>
                )}
                content={() => ComponentRef.current}
                pageStyle={pageStyle}
              />
            </>
          );
        }}
        onCancel={() => {
          setIsModalOpen(false);
          // setSelectedSaleChallan([]);
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
        width={"85vw"}
      >
        <div
          className="print-div bg-white"
          ref={ComponentRef}
          style={{ marginLeft: 1, marginRight: 1 }}
        >
          {details?.map((element) => {
            let taka_details = splitArrayIntoChunks(
              element?.sale_challan_details,
              12
            );
            taka_details = [...taka_details, ...taka_details];
            let total_information = {};

            let final_total_taka = 0;
            let final_total_meter = 0;

            taka_details?.map((takaInfo, index) => {
              let total_taka = 0;
              let total_meter = 0;
              let total_weight = 0;

              takaInfo?.map((taka) => {
                total_taka = total_taka + 1;
                total_meter = total_meter + Number(taka?.meter);
                total_weight = total_weight + Number(taka?.weight);
              });
              final_total_meter = final_total_meter + total_meter;
              final_total_taka = final_total_taka + total_taka;
              total_information[index] = {
                total_taka: total_taka,
                total_meter: total_meter,
                total_weight: total_weight,
              };
            });

            return (
              <div
                key={element.id + "_sale_challan"}
                className="sale-challan-table"
              >
                <table
                  className="w-full border-collapse"
                  style={{ border: "1px solid", marginTop: 40 }}
                >
                  <thead>
                    <tr
                      className="p-2"
                      style={{ borderBottom: "1px solid #000000" }}
                    >
                      <th className="text-center" colSpan={4}>
                        <h1 className="text-2xl font-bold">
                          {company?.company_name}
                        </h1>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    <tr style={{ borderBottom: "1px solid" }}>
                      <td
                        colSpan="4"
                        className="pt-2 pb-2 text-center sale-challan-font"
                      >
                        {company?.address_line_1} {company?.address_line_2} ,{" "}
                        {company?.city}
                      </td>
                    </tr>

                    <tr
                      className="pt-2 pb-2"
                      style={{ borderBottom: "1px solid" }}
                    >
                      <td
                        colSpan="1"
                        className="py-2 border-b border-gray-300 sale-challan-font"
                      >
                        PHONE NO: {company?.company_contact}
                      </td>
                      <td
                        colSpan="1"
                        className="py-2 border-b border-gray-300 sale-challan-font"
                      >
                        PAYMENT: -
                      </td>
                      <td
                        colSpan="1"
                        className="py-2 border-b border-gray-300 sale-challan-font"
                      >
                        GST NO: {company?.gst_no}
                      </td>
                      <td
                        colSpan="1"
                        className="py-2 border-b border-gray-300 sale-challan-font"
                      >
                        PAN NO: {company?.pancard_no}
                      </td>
                    </tr>

                    <tr
                      className="bg-gray-100"
                      style={{ borderBottom: "1px solid" }}
                    >
                      <th colSpan="4" className="py-2 text-center">
                        {" "}
                        ❖ DELIVERY CHALLAN ❖{" "}
                      </th>
                    </tr>

                    <tr style={{ borderBottom: "1px solid" }}>
                      <td
                        colSpan="2"
                        className="py-2 border-b border-gray-300 sale-challan-font sale-challan-data"
                      >
                        <p>M/S: BABAJI SILK FABRIC / H M SILK FABRIC</p>
                        <p>
                          <span style={{ fontWeight: 600 }}>DELIVERY AT</span>:{" "}
                          {element?.supplier?.user?.address}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}>GST</span>:{" "}
                          {element?.supplier?.user?.gst_no}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}>E-WAY BILL NO</span>
                          :
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}>VEHICLE NO</span>::
                          GJ 05 NW 2334
                        </p>
                      </td>
                      <td
                        colSpan="2"
                        style={{ borderLeft: "1px solid" }}
                        className="py-2 border-b border-gray-300 sale-challan-font sale-challan-data"
                      >
                        <p>
                          <span style={{ fontWeight: 600 }}>CHALLAN NO</span>:{" "}
                          {element?.challan_no}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}>ORDER NO</span>:{" "}
                          {element?.gray_order?.order_no}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}>
                            PARTY ORDER NO
                          </span>
                          :{" "}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}>DATE</span>:{" "}
                          {moment(element?.createdAt).format("DD-MM-YYYY")}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}>BROKER</span>:{" "}
                          {`${element?.borker?.first_name} ${element?.broker?.last_name}`}
                        </p>
                        <p>
                          <span style={{ fontWeight: 600 }}>
                            DESCRIPTION OF GOODS
                          </span>
                          : {element?.inhouse_quality?.quality_name}
                        </p>
                      </td>
                    </tr>

                    <tr
                      className="bg-gray-100"
                      style={{ borderBottom: "1px solid" }}
                    >
                      <th colSpan="4" className="py-2 pl-2 text-left">
                        {" "}
                        ❖ DELIVERY NOTES : {element?.delivery_note}
                      </th>
                    </tr>

                    <tr
                      style={{ borderBottom: "1px solid" }}
                      className="sorting-option"
                    >
                      <th
                        colSpan="4"
                        className="py-2 pl-2 text-right sorting-option"
                      >
                        <div>
                          <Button
                            style={{ marginRight: 10 }}
                            type="primary"
                            icon={<SortAscendingOutlined />}
                          />
                          <Button
                            style={{ marginRight: 10 }}
                            type="primary"
                            icon={<SortDescendingOutlined />}
                          />
                        </div>
                      </th>
                    </tr>

                    <tr className="sale-challan-taka-info">
                      <td colSpan={1} className="">
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100"
                          style={{ borderBottom: "1px solid" }}
                        >
                          <Col span={4} className="p-1 pl-2 sale-challan-font">
                            No
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            Taka No
                          </Col>
                          <Col
                            span={10}
                            className="p-1 sale-challan-font sale-challan-option-selection"
                          >
                            <Select
                              placeholder="Select Meter"
                              style={{ width: "100%" }}
                              value={optionSelection}
                              onChange={setOptionSelection}
                              options={[
                                { label: "MET", value: "MET" },
                                { label: "KG", value: "KG" },
                                { label: "PIS", value: "PIS" },
                              ]}
                            >
                              {/* <Option value="MET">Option 1</Option>
                              <Option value="KG">Option 2</Option>
                              <Option value="PIS">Option 3</Option> */}
                            </Select>
                          </Col>
                        </Row>
                        {Array(12)
                          .fill(1)
                          .map((el, i) => {
                            return (
                              <Row
                                key={i + "_table_row_1"}
                                justify={"space-between"}
                                className="w-full"
                              >
                                <Col
                                  span={4}
                                  className="p-1 pl-2  sale-challan-font"
                                >
                                  {i + 1}
                                </Col>
                                <Col
                                  span={10}
                                  className="p-1 sale-challan-font"
                                >
                                  {taka_details?.[0]?.[i]?.taka_no}
                                </Col>
                                <Col
                                  span={10}
                                  className="p-1 sale-challan-font"
                                >
                                  {taka_details?.[0]?.[i]?.meter}
                                </Col>
                              </Row>
                            );
                          })}
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100"
                          style={{
                            borderBottom: "1px solid",
                            borderTop: "1px solid",
                          }}
                        >
                          <Col
                            span={4}
                            className="p-1 pl-2 sale-challan-font"
                          ></Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[0]?.total_taka || 0}
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[0]?.total_meter || 0}
                          </Col>
                        </Row>
                      </td>

                      <td colSpan={1} className="">
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{ borderBottom: "1px solid" }}
                        >
                          <Col span={4} className="p-1 pl-2  sale-challan-font">
                            No
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font ">
                            Taka No
                          </Col>
                          <Col
                            span={10}
                            className="p-1 sale-challan-font sale-challan-option-selection"
                          >
                            <Select
                              placeholder="Select Meter"
                              style={{ width: "100%" }}
                              value={optionSelection}
                              onChange={setOptionSelection}
                              options={[
                                { label: "MET", value: "MET" },
                                { label: "KG", value: "KG" },
                                { label: "PIS", value: "PIS" },
                              ]}
                            >
                              {/* <Option value="MET">Option 1</Option>
                              <Option value="KG">Option 2</Option>
                              <Option value="PIS">Option 3</Option> */}
                            </Select>
                          </Col>
                        </Row>
                        {Array(12)
                          .fill(1)
                          .map((el, i) => (
                            <Row
                              key={i + "_table_row_2"}
                              justify={"space-between"}
                              className="w-full"
                            >
                              <Col
                                span={4}
                                className="p-1 pl-2 sale-challan-font sale-challan-taka-info-table-border"
                              >
                                {i + 1}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[1]?.[i]?.taka_no}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[1]?.[i]?.meter}
                              </Col>
                            </Row>
                          ))}
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{
                            borderBottom: "1px solid",
                            borderTop: "1px solid",
                          }}
                        >
                          <Col
                            span={4}
                            className="p-1 pl-2 sale-challan-font "
                          ></Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[1]?.total_taka || 0}
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[1]?.total_meter || 0}
                          </Col>
                        </Row>
                      </td>

                      <td colSpan={1} className="">
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{ borderBottom: "1px solid" }}
                        >
                          <Col span={4} className="p-1 pl-2  sale-challan-font">
                            No
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            Taka No
                          </Col>
                          <Col
                            span={10}
                            className="p-1 sale-challan-font sale-challan-option-selection"
                          >
                            <Select
                              placeholder="Select Meter"
                              style={{ width: "100%" }}
                              value={optionSelection}
                              onChange={setOptionSelection}
                              options={[
                                { label: "MET", value: "MET" },
                                { label: "KG", value: "KG" },
                                { label: "PIS", value: "PIS" },
                              ]}
                            >
                              {/* <Option value="MET">Option 1</Option>
                              <Option value="KG">Option 2</Option>
                              <Option value="PIS">Option 3</Option> */}
                            </Select>
                          </Col>
                        </Row>
                        {Array(12)
                          .fill(1)
                          .map((el, i) => (
                            <Row
                              key={i + "_table_row_3"}
                              justify={"space-between"}
                              className="w-full"
                            >
                              <Col
                                span={4}
                                className="p-1 pl-2  sale-challan-font sale-challan-taka-info-table-border"
                              >
                                {i + 1}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[2]?.[i]?.taka_no}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[2]?.[i]?.meter}
                              </Col>
                            </Row>
                          ))}
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{
                            borderBottom: "1px solid",
                            borderTop: "1px solid",
                          }}
                        >
                          <Col
                            span={4}
                            className="p-1 pl-2 sale-challan-font "
                          ></Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[2]?.total_taka || 0}
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[2]?.total_meter || 0}
                          </Col>
                        </Row>
                      </td>

                      <td colSpan={1} className="">
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{ borderBottom: "1px solid" }}
                        >
                          <Col span={4} className="p-1 pl-2  sale-challan-font">
                            No
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            Taka No
                          </Col>
                          <Col
                            span={10}
                            className="p-1 sale-challan-font sale-challan-option-selection"
                          >
                            <Select
                              placeholder="Select Meter"
                              style={{ width: "100%" }}
                              value={optionSelection}
                              onChange={setOptionSelection}
                              options={[
                                { label: "MET", value: "MET" },
                                { label: "KG", value: "KG" },
                                { label: "PIS", value: "PIS" },
                              ]}
                            >
                              {/* <Option value="MET">Option 1</Option>
                              <Option value="KG">Option 2</Option>
                              <Option value="PIS">Option 3</Option> */}
                            </Select>
                          </Col>
                        </Row>
                        {Array(12)
                          .fill(1)
                          .map((el, i) => (
                            <Row
                              key={i + "_table_row_4"}
                              justify={"space-between"}
                              className="w-full"
                            >
                              <Col
                                span={4}
                                className="p-1 pl-2  sale-challan-font sale-challan-taka-info-table-border"
                              >
                                {i + 1}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[3]?.[i]?.taka_no}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[3]?.[i]?.meter}
                              </Col>
                            </Row>
                          ))}
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{
                            borderBottom: "1px solid",
                            borderTop: "1px solid",
                          }}
                        >
                          <Col
                            span={4}
                            className="p-1 pl-2 sale-challan-font"
                          ></Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[3]?.total_taka || 0}
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[3]?.total_meter || 0}
                          </Col>
                        </Row>
                      </td>
                    </tr>

                    <tr className="sale-challan-taka-info final-total-count">
                      <td colSpan={1} className="">
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100"
                          style={{ borderBottom: "1px solid" }}
                        >
                          <Col span={4} className="p-1 pl-2 sale-challan-font">
                            No
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            Taka No
                          </Col>
                          <Col
                            span={10}
                            className="p-1 sale-challan-font sale-challan-option-selection"
                          >
                            <Select
                              placeholder="Select Meter"
                              style={{ width: "100%" }}
                              value={optionSelection}
                              onChange={setOptionSelection}
                              options={[
                                { label: "MET", value: "MET" },
                                { label: "KG", value: "KG" },
                                { label: "PIS", value: "PIS" },
                              ]}
                            >
                              {/* <Option value="MET">Option 1</Option>
                              <Option value="KG">Option 2</Option>
                              <Option value="PIS">Option 3</Option> */}
                            </Select>
                          </Col>
                        </Row>
                        {Array(12)
                          .fill(1)
                          .map((el, i) => (
                            <Row
                              key={i + "_table_row_5"}
                              justify={"space-between"}
                              className="w-full"
                            >
                              <Col
                                span={4}
                                className="p-1 pl-2  sale-challan-font"
                              >
                                {i + 1}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[4]?.[i]?.taka_no}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[4]?.[i]?.meter}
                              </Col>
                            </Row>
                          ))}
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100"
                          style={{
                            borderBottom: "1px solid",
                            borderTop: "1px solid",
                          }}
                        >
                          <Col
                            span={4}
                            className="p-1 pl-2 sale-challan-font"
                          ></Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[4]?.total_taka || 0}
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[4]?.total_meter || 0}
                          </Col>
                        </Row>
                      </td>

                      <td colSpan={1} className="">
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{ borderBottom: "1px solid" }}
                        >
                          <Col span={4} className="p-1 pl-2  sale-challan-font">
                            No
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font ">
                            Taka No
                          </Col>
                          <Col
                            span={10}
                            className="p-1 sale-challan-font sale-challan-option-selection"
                          >
                            <Select
                              placeholder="Select Meter"
                              style={{ width: "100%" }}
                              value={optionSelection}
                              onChange={setOptionSelection}
                              options={[
                                { label: "MET", value: "MET" },
                                { label: "KG", value: "KG" },
                                { label: "PIS", value: "PIS" },
                              ]}
                            >
                              {/* <Option value="MET">Option 1</Option>
                              <Option value="KG">Option 2</Option>
                              <Option value="PIS">Option 3</Option> */}
                            </Select>
                          </Col>
                        </Row>
                        {Array(12)
                          .fill(1)
                          .map((el, i) => (
                            <Row
                              key={i + "_table_row_6"}
                              justify={"space-between"}
                              className="w-full"
                            >
                              <Col
                                span={4}
                                className="p-1 pl-2   sale-challan-font sale-challan-taka-info-table-border"
                              >
                                {i + 1}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[5]?.[i]?.taka_no}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[5]?.[i]?.meter}
                              </Col>
                            </Row>
                          ))}
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{
                            borderBottom: "1px solid",
                            borderTop: "1px solid",
                          }}
                        >
                          <Col
                            span={4}
                            className="p-1 pl-2 sale-challan-font "
                          ></Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[5]?.total_taka || 0}
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[5]?.total_meter || 0}
                          </Col>
                        </Row>
                      </td>

                      <td colSpan={1} className="">
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{ borderBottom: "1px solid" }}
                        >
                          <Col span={4} className="p-1 pl-2  sale-challan-font">
                            No
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            Taka No
                          </Col>
                          <Col
                            span={10}
                            className="p-1 sale-challan-font sale-challan-option-selection"
                          >
                            <Select
                              placeholder="Select Meter"
                              style={{ width: "100%" }}
                              value={optionSelection}
                              onChange={setOptionSelection}
                              options={[
                                { label: "MET", value: "MET" },
                                { label: "KG", value: "KG" },
                                { label: "PIS", value: "PIS" },
                              ]}
                            >
                              {/* <Option value="MET">Option 1</Option>
                              <Option value="KG">Option 2</Option>
                              <Option value="PIS">Option 3</Option> */}
                            </Select>
                          </Col>
                        </Row>
                        {Array(12)
                          .fill(1)
                          .map((el, i) => (
                            <Row
                              key={i + "_table_row_7"}
                              justify={"space-between"}
                              className="w-full"
                            >
                              <Col
                                span={4}
                                className="p-1 pl-2  sale-challan-font sale-challan-taka-info-table-border"
                              >
                                {i + 1}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[6]?.[i]?.taka_no}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[6]?.[i]?.meter}
                              </Col>
                            </Row>
                          ))}
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{
                            borderBottom: "1px solid",
                            borderTop: "1px solid",
                          }}
                        >
                          <Col
                            span={4}
                            className="p-1 pl-2 sale-challan-font "
                          ></Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[6]?.total_taka || 0}
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[6]?.total_meter || 0}
                          </Col>
                        </Row>
                      </td>

                      <td colSpan={1} className="">
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{ borderBottom: "1px solid" }}
                        >
                          <Col span={4} className="p-1 pl-2  sale-challan-font">
                            No
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            Taka No
                          </Col>
                          <Col
                            span={10}
                            className="p-1 sale-challan-font sale-challan-option-selection"
                          >
                            <Select
                              placeholder="Select Meter"
                              style={{ width: "100%" }}
                              value={optionSelection}
                              onChange={setOptionSelection}
                              options={[
                                { label: "MET", value: "MET" },
                                { label: "KG", value: "KG" },
                                { label: "PIS", value: "PIS" },
                              ]}
                            >
                              {/* <Option value="MET">Option 1</Option>
                              <Option value="KG">Option 2</Option>
                              <Option value="PIS">Option 3</Option> */}
                            </Select>
                          </Col>
                        </Row>
                        {Array(12)
                          .fill(1)
                          .map((el, i) => (
                            <Row
                              key={i + "_table_row_8"}
                              justify={"space-between"}
                              className="w-full"
                            >
                              <Col
                                span={4}
                                className="p-1 pl-2  sale-challan-font sale-challan-taka-info-table-border"
                              >
                                {i + 1}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[7]?.[i]?.taka_no}
                              </Col>
                              <Col span={10} className="p-1 sale-challan-font">
                                {taka_details?.[7]?.[i]?.meter}
                              </Col>
                            </Row>
                          ))}
                        <Row
                          justify={"space-between"}
                          className="w-full bg-gray-100 sale-challan-taka-info-table-border"
                          style={{
                            borderBottom: "1px solid",
                            borderTop: "1px solid",
                          }}
                        >
                          <Col
                            span={4}
                            className="p-1 pl-2 sale-challan-font"
                          ></Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[7]?.total_taka || 0}
                          </Col>
                          <Col span={10} className="p-1 sale-challan-font">
                            {total_information?.[7]?.total_meter || 0}
                          </Col>
                        </Row>
                      </td>
                    </tr>

                    <tr
                      className="bg-gray-100 final-total-count"
                      style={{ borderBottom: "1px solid" }}
                    >
                      <td colSpan={4}>
                        <Row className="w-ful">
                          <Col span={12}>
                            <strong>Total Taka:1</strong>&nbsp;{" "}
                            {final_total_taka}
                          </Col>
                          <Col span={12}>
                            <strong>Total Meter:</strong>&nbsp;
                            {final_total_meter}
                          </Col>
                        </Row>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4}>
                        <Row className="w-ful p-1">
                          <Col span={12} className="text-left">
                            <strong> TERMS OF SALES:</strong>
                            <ol>
                              <li>
                                Interest at 2% per month will be charged reaming
                                unpaid from date of bill.
                              </li>
                              <li>
                                Complaint if any regarding this invoice must be
                                settled within 24 hours.
                              </li>
                              <li>Subject to Surat jurisdiction.</li>
                              <li>
                                We are not responsible for processed good
                                &width.
                              </li>
                            </ol>
                          </Col>
                          <Col span={12}>
                            <div className="text-right w-full h-1/2">
                              <strong>FOR, {company?.company_name}</strong>
                            </div>
                            <Row
                              className="h-1/2"
                              justify={"end"}
                              align={"bottom"}
                            >
                              <Col span={12} className="text-right w-full">
                                SUPERVISOR CHECK BY
                              </Col>
                              <Col span={12} className="text-right w-full">
                                AUTHORIZED SIGNATORY
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </td>
                    </tr>
                    <tr></tr>
                  </tbody>
                </table>
                <div className="page-break"></div>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default ViewChallan;
