import { UndoOutlined } from "@ant-design/icons";
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
import { disabledFutureDate } from "../../../../utils/date";
const { Text } = Typography;

const ViewSaleChallan = ({ details, companyId }) => {
  const queryClient = useQueryClient();
  const [isModelOpen, setIsModalOpen] = useState(false);
  const componentRef = useRef();
  const { companyListRes, company } = useContext(GlobalContext);
  const [companyInfo, setCompanyInfo] = useState({});
  const TakaArray = Array(12).fill(0);

  const [totalTaka1, setTotalTaka1] = useState(0);
  const [totalTaka2, setTotalTaka2] = useState(0);
  const [totalMeter, setTotalMeter] = useState(0);

  const [selectedSaleChallan, setSelectedSaleChallan] = useState([]);
  const [totalReturnMeter, setTotalReturnMeter] = useState(0);
  const [returnDate, setReturnDate] = useState(dayjs());

  const handleAllSelectSaleChallan = (event) => {
    if (event.target.checked) {
      setSelectedSaleChallan(() => {
        return details?.sale_challan_details.map(({ id }) => id);
      });
    } else {
      setSelectedSaleChallan([]);
    }
  };

  const handleSelectSaleChallan = (event, index) => {
    if (event.target.checked) {
      setSelectedSaleChallan((prev) => {
        return [...prev, details?.sale_challan_details[index]?.id];
      });
      setTotalReturnMeter(
        (prev) => prev + +details?.sale_challan_details[index]?.meter
      );
    } else {
      setSelectedSaleChallan((prev) => {
        return prev.filter(
          (i) => i !== details?.sale_challan_details[index]?.id
        );
      });
      setTotalReturnMeter(
        (prev) => prev - +details?.sale_challan_details[index]?.meter
      );
    }
  };

  useEffect(() => {
    let tempTotal1 = 0;
    let tempTotal2 = 0;

    TakaArray?.map((element, index) => {
      tempTotal1 =
        Number(tempTotal1) +
        Number(details?.sale_challan_details[index]?.meter || 0);
      tempTotal2 =
        Number(tempTotal2) +
        Number(details?.sale_challan_details[index + 12]?.meter || 0);
    });

    let total = Number(tempTotal1) + Number(tempTotal2);

    setTotalMeter(total);
    setTotalTaka1(tempTotal1);
    setTotalTaka2(tempTotal2);
  }, [TakaArray, details]);

  useEffect(() => {
    companyListRes?.rows?.map((element) => {
      if (element?.id == details?.company_id) {
        setCompanyInfo(element);
      }
    });
  }, [details, companyListRes]);

  const { mutateAsync: AddSaleChallanReturn, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await createSaleChallanReturnRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["sale", "challan", "return", "add"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["saleChallan", "list", companyId]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success("Sale taka return successfully");
      }
      setIsModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const submitHandler = async () => {
    const payload = {
      sale_challan_id: details.id,
      sale_challan_detail_ids: selectedSaleChallan,
      createdAt: dayjs(returnDate).format("YYYY-MM-DD"),
      supplier_name: details?.supplier?.supplier_name,
      quality_id: details.quality_id,
    };
    await AddSaleChallanReturn(payload);
  };


  return (
    <>
      <Button
        onClick={() => {
          setIsModalOpen(true);
        }}
      >
        <UndoOutlined />
      </Button>

      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            Sale Return
          </Typography.Text>
        }
        open={isModelOpen}
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
              <Button type="primary" onClick={submitHandler} loading = {isPending}>
                Sales Return
              </Button>
              <Button
                type="default"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedSaleChallan([]);
                }}
              >
                Close
              </Button>
            </Flex>
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
            paddingTop: 2
          },
        }}
        width={"70vw"}
      >
        <Flex
          className="flex-col border border-b-0 border-solid"
          ref={componentRef}
        >
          <table>
            <thead>
              <tr className="p-2">
                <th className="text-center" colspan="4" style={{ borderBottom: "1px solid" }}>
                  <h1 className="text-2xl font-bold">{company?.company_name}</h1>
                </th>
              </tr>
            </thead>
            <tbody className="text-center">
              <tr style={{ borderBottom: "1px solid" }} >
                <td colspan="4" class="pt-2 pb-2 text-center sale-challan-font" style={{ borderBottom: "1px solid" }}>
                  {company?.address_line_1} {company?.address_line_2} , {company?.city}
                </td>
              </tr>

              <tr className="pt-2 pb-2">
                <td colspan="1" class="sale-challan-font" style={{ borderBottom: "1px solid" }}>
                  PHONE NO: {company?.company_contact}
                </td>
                <td colspan="1" class="sale-challan-font" style={{ borderBottom: "1px solid" }}>
                  PAYMENT: -
                </td>
                <td colspan="1" class="sale-challan-font" style={{ borderBottom: "1px solid" }}>
                  GST NO: {company?.gst_no}
                </td>
                <td colspan="1" class="sale-challan-font" style={{ borderBottom: "1px solid" }}>
                  PAN NO: {company?.pancard_no}
                </td>
              </tr>
            </tbody>
          </table>
          <Row
            className="border pl-4 pr-4 border-b ,0border-solid !m-0"
            style={{
              borderTop: 0,
              borderLeft: 0,
              borderRight: 0,
              borderBottom: 0,
            }}
          >
            <Col span={12}>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={4}>
                  <Text className="font-bold">M/S.</Text>
                </Col>
                <Col span={12}>
                  <Text className="block">
                    {details?.party?.party?.company_name}(
                    {`${details?.party?.first_name}${details?.party?.last_name}`}
                    )
                  </Text>
                  <Text className="block">{details?.party?.address}</Text>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={4}>
                  <Text className="font-bold">GST:</Text>
                </Col>
                <Col span={12}>
                  <Text className="block">
                    {details?.supplier?.user?.gst_no}
                  </Text>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={24}>
                  <Text className="font-bold">E-Way bill no:</Text>
                  <Text className="block">
                  </Text>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={8}>
                  <Text className="font-bold">CHALLAN NO:</Text>
                </Col>
                <Col span={16}>
                  <Text className="block">{details?.challan_no}</Text>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={8}>
                  <Text className="font-bold">ORDER NO:</Text>
                </Col>
                <Col span={16}>
                  <Text className="block">{details?.gray_order?.order_no}</Text>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={8}>
                  <Text className="font-bold">DATE:</Text>
                </Col>
                <Col span={16}>
                  {dayjs(details?.createdAt).format("DD-MM-YYYY")}
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={8}>
                  <Text className="font-bold">BROKER:</Text>
                </Col>
                <Col span={16}>
                  <Text className="block">
                    {details?.broker?.first_name} {details?.broker?.last_name}
                  </Text>
                </Col>
                <Col span={24}>
                </Col>
              </Row>
              <Row style={{ padding: "6px 0px" }}>
                <Col span={8}>
                  <Text className="font-bold">VEHICLE NO:</Text>
                </Col>
                <Col span={16}>
                  <Text className="block">{companyInfo?.gst_no}</Text>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row
            className="p-4 border-0 border-b border-solid !m-0"
            style={{ borderTop: "1px dashed" }}
          >
            <Col span={6}>
              <Text className="font-bold">DESCRIPTION OF GOODS :</Text>
            </Col>
            <Col span={6}>
              {details?.inhouse_quality?.quality_name} (
              {details?.inhouse_quality?.quality_weight}
              KG)
            </Col>
            <Col span={12}>
              <Checkbox
                style={{ color: "blue" }}
                onChange={handleAllSelectSaleChallan}
              >
                All Taka Return
              </Checkbox>
            </Col>
            {/* <Col span={6}>{dayjs(details?.createdAt).format("DD-MM-YYYY")}</Col> */}
          </Row>
          <Row
            className="p-4 border-0 border-b border-solid !m-0"
            style={{ borderBottom: 0 }}
          >
            <Col span={1} style={{ textAlign: "center" }}>
              <strong></strong>
            </Col>
            <Col span={1} style={{ textAlign: "center" }}>
              <strong>No</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>TAKA NO</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>Meter</strong>
            </Col>
            <Col span={1} style={{ textAlign: "center" }}>
              <strong></strong>
            </Col>
            <Col span={1} style={{ textAlign: "center" }}>
              <strong>No</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>TAKA NO</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>Meter</strong>
            </Col>
          </Row>

          {TakaArray?.map((element, index) => {
            return (
              <Row
                key={index}
                className="p-3 border-0"
                style={{ borderTop: 0 }}
              >
                <Col span={1} style={{ textAlign: "center" }}>
                  {details?.sale_challan_details[index]?.is_returned ===
                    false && (
                      <Checkbox
                        checked={selectedSaleChallan.includes(
                          details?.sale_challan_details[index]?.id
                        )}
                        onChange={(e) => handleSelectSaleChallan(e, index)}
                      />
                    )}
                </Col>
                <Col span={1} style={{ textAlign: "center", fontWeight: 600 }}>
                  {index + 1}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.sale_challan_details[index]?.taka_no}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.sale_challan_details[index]?.meter}
                </Col>
                <Col span={1} style={{ textAlign: "center" }}>
                  {details?.sale_challan_details[index + 12]?.is_returned ===
                    false && (
                      <Checkbox
                        checked={selectedSaleChallan.includes(
                          details?.sale_challan_details[index + 12]?.id
                        )}
                        onChange={(e) => handleSelectSaleChallan(e, index + 12)}
                      />
                    )}
                </Col>
                <Col span={1} style={{ textAlign: "center", fontWeight: 600 }}>
                  {index + 13}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.sale_challan_details[index + 12]?.taka_no}
                </Col>
                <Col span={5} style={{ textAlign: "center" }}>
                  {details?.sale_challan_details[index + 12]?.meter}
                </Col>
              </Row>
            );
          })}

          <Row className="p-3 border-0" style={{ borderTop: 0 }}>
            <Col span={1} style={{ textAlign: "center" }}></Col>
            <Col span={5} style={{ textAlign: "center" }}></Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>{totalTaka1}</strong>
            </Col>

            <Col span={1} style={{ textAlign: "center" }}></Col>
            <Col span={5} style={{ textAlign: "center" }}></Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <strong>{totalTaka2}</strong>
            </Col>
          </Row>

          <Row
            className="p-3 border-0"
            style={{ borderTop: "1px dashed", borderBottom: "1px dashed" }}
          >
            <Col span={3} style={{ textAlign: "center" }}>
              <strong>Total Taka:</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              {details?.sale_challan_details?.length}
            </Col>
            <Col span={3} style={{ textAlign: "center" }}>
              <strong>Total Meter:</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              {totalMeter}
            </Col>
            <Col span={3} style={{ textAlign: "center" }}>
              <strong>Return Date:</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              <DatePicker value={returnDate} disabledDate={disabledFutureDate} onChange={setReturnDate} />
            </Col>
          </Row>

          <Row className="p-3 border-0" style={{ borderBottom: "1px dashed" }}>
            <Col span={3} style={{ textAlign: "center" }}>
              <strong>RETURN TAKA:</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              {selectedSaleChallan?.length}
            </Col>
            <Col span={3} style={{ textAlign: "right" }}>
              <strong>RETURN METER::</strong>
            </Col>
            <Col span={5} style={{ textAlign: "center" }}>
              {totalReturnMeter}
            </Col>
          </Row>
        </Flex>

      </Modal>
    </>
  );
};

export default ViewSaleChallan;
