import { useContext, useState } from "react";
import {
  Button,
  Radio,
  Table,
  Input,
  Select,
  DatePicker,
  Flex,
  Space,
  Spin,
  Typography,
  Tag,
  Checkbox,
  message,
  Badge,
} from "antd";
import {
  BarcodeOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeFilled,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import {
  deleteProductionRequest,
  getProductionListRequest,
} from "../../api/requests/production/inhouseProduction";
import { usePagination } from "../../hooks/usePagination";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
// import { ORDER_TYPE } from "../../constants/orderMaster";
import ViewProductionDetailModal from "../../components/production/ViewProductionDetailModal";
import DeleteProduction from "../../components/production/DeleteProduction";
import ProductionQrModal from "../../components/production/ProductionQrModal";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";
import useDebounce from "../../hooks/useDebounce";
import { disabledFutureDate } from "../../utils/date";
import { getCurrentFinancialYearDates } from "../../utils/date";
import dayjs from "dayjs";
import { getLoadedMachineListRequest } from "../../api/requests/beamCard";

const InhouseProduction = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { companyId } = useContext(GlobalContext);
  // const { data: user } = useCurrentUser();
  const financialYearData = getCurrentFinancialYearDates();

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const showQrModal = () => {
    setIsQrModalOpen(true);
  };
  const [qrDetails, setQrDetails] = useState([]);

  const [quality, setQuality] = useState(null);
  const [fromDate, setFromDate] = useState(
    dayjs(financialYearData?.startFinanceYear)
  );
  const [toDate, setToDate] = useState(dayjs(financialYearData?.currentDate));
  const [radioSelection, setRadioSelection] = useState("stock");
  const [fromTakaNo, setFromTakaNo] = useState(null);
  const [toTakaNo, setToTakaNo] = useState(null);
  const [fromMachineNo, setFromMachineNo] = useState(null);
  const [toMachineNo, setToMachineNo] = useState(null);
  const [beamNo, setBeamNo] = useState(null);
  const [challanNo, setChallanNo] = useState(null);
  const [grade, setGrade] = useState(null);
  const [foldingUser, setFoldingUser] = useState(null);

  const debounceQuality = useDebounce(quality, 500);
  const debounceFromDate = useDebounce(
    dayjs(fromDate).format("YYYY-MM-DD"),
    500
  );
  const debounceToDate = useDebounce(dayjs(toDate).format("YYYY-MM-DD"), 500);
  const debounceType = useDebounce(radioSelection, 500);
  const debounceFromTakaNo = useDebounce(fromTakaNo, 500);
  const debounceToTakaNo = useDebounce(toTakaNo, 500);
  const debounceFromMachineNo = useDebounce(fromMachineNo, 500);
  const debounceToMachineNo = useDebounce(toMachineNo, 500);
  const debounceBeamNo = useDebounce(beamNo, 500);
  const debounceChallanNo = useDebounce(challanNo, 500);
  const debounceGrade = useDebounce(grade, 500);
  const debounceFoldingUser = useDebounce(foldingUser, 500);

  const { mutateAsync: deleteProduction, isPending: deleteProductionPending } =
    useMutation({
      mutationFn: async ({ data }) => {
        const res = await deleteProductionRequest({
          data,
          params: {
            company_id: companyId,
          },
        });
        return res?.data;
      },
      mutationKey: ["production", "delete"],
      onSuccess: (res) => {
        const successMessage = res?.message;
        if (successMessage) {
          message.success("In-House Production taka deleted successfully");
        }
        setSelectedRecords([]);
        queryClient.invalidateQueries(["production", "list", companyId]);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message;
        if (errorMessage && typeof errorMessage === "string") {
          message.error(errorMessage);
        }
      },
    });

  // Quality list dropdown request
  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 99999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  // Production taka list request
  const { data: productionList, isLoading } = useQuery({
    queryKey: [
      "production",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        quality_id: debounceQuality,
        fromDate: debounceFromDate,
        toDate: debounceToDate,
        beam_no: debounceBeamNo,
        grade: debounceGrade,
        fromMachine: debounceFromMachineNo,
        toMachine: debounceToMachineNo,
        challanNo: debounceChallanNo,
        type: debounceType,
        // folding_user_id: debounceFoldingUser,
        fromTaka: debounceFromTakaNo,
        toTaka: debounceToTakaNo,
      },
    ],
    queryFn: async () => {
      let requestPaylaod = {
        company_id: companyId,
        page,
        pageSize,
        quality_id: debounceQuality,
        fromDate: debounceFromDate,
        toDate: debounceToDate,
        beam_no: debounceBeamNo,
        grade: debounceGrade,
        fromMachine: debounceFromMachineNo,
        toMachine: debounceToMachineNo,
        challanNo: debounceChallanNo,
        fromTaka: debounceFromTakaNo,
        toTaka: debounceToTakaNo,
      };

      if (radioSelection == "sold") {
        requestPaylaod["is_stock"] = "0";
      } else if (radioSelection == "stock") {
        requestPaylaod["is_stock"] = "1";
      } else if (radioSelection == "tp") {
        requestPaylaod["is_tp"] = "1";
      } else if (radioSelection == "re-work") {
        requestPaylaod["is_rework"] = "1";
      }

      const res = await getProductionListRequest({
        params: requestPaylaod,
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function navigateToAdd() {
    navigate("/production/add-new-production");
  }

  function navigateToUpdate(id) {
    navigate(`/production/update-production/${id}`);
  }

  async function handleDelete() {
    const data = {
      ids: selectedRecords,
    };
    await deleteProduction({ data });
  }

  const printQrHandler = () => {
    setQrDetails(() => {
      let data = [];
      productionList.rows.forEach((details) => {
        if (selectedRecords.includes(details.id)) {
          data.push({
            taka_no: details?.taka_no,
            meter: details?.meter,
            machine_no: details?.machine_no,
            quality_name: `${details?.inhouse_quality?.quality_name}`,
          });
        }
      });
      return data;
    });
    showQrModal();
  };

  const downloadPdf = () => {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    let body = [];
    productionList?.rows?.forEach((item, index) => {
      const {
        taka_no,
        meter,
        weight,
        machine_no,
        average,
        status,
        beam_no,
        inhouse_quality,
        sale_challan,
      } = item;

      if (status?.toLowerCase() === "instock") {
        body.push([
          index + 1,
          taka_no || "-",
          meter,
          weight,
          machine_no,
          average,
          status,
          beam_no,
          `${inhouse_quality.quality_name} (${inhouse_quality.quality_weight}KG)`,
          sale_challan?.challan_no || "-",
          sale_challan?.party?.party?.checker_name || "-",
        ]);
      }
    });

    const tableTitle = [
      "ID",
      "Taka No",
      "Meter",
      "Weight",
      "Machine No",
      "Average",
      "Status",
      "Beam",
      "Quality",
      "Challan No",
      "Party",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Inhouse Production List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    // downloadUserPdf({
    //   body,
    //   head: [
    //     [
    //       "ID",
    //       "Taka No",
    //       "Meter",
    //       "Weight",
    //       "Machine No",
    //       "Average",
    //       "Status",
    //       "Beam",
    //       "Quality",
    //       "Challan No",
    //       "Party",
    //     ],
    //   ],
    //   leftContent,
    //   rightContent,
    //   title: "Inhouse Production List",
    // });

    window.open("/print");
  };

  const columns = [
    {
      title: (
        <Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              const data = productionList?.rows.map((record) => {
                if (
                  record?.status?.toLowerCase() === "instock" &&
                  !record.is_tp
                )
                  return record.id;
                else return null;
              });
              setSelectedRecords(data);
            } else {
              setSelectedRecords([]);
            }
          }}
        />
      ),
      render: (record) => {
        return (
          record?.status?.toLowerCase() === "instock" &&
          !record.is_tp && (
            <Checkbox
              checked={selectedRecords.includes(record.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRecords((prev) => [...prev, record.id]);
                } else {
                  setSelectedRecords((prev) =>
                    prev.filter((id) => id !== record.id)
                  );
                }
              }}
            />
          )
        );
      },
    },
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Taka No.",
      dataIndex: "taka_no",
      key: "taka_no",
      render: (text, record) => {
        return (
          <Badge
            color={record.is_tp ? "blue" : "green"} // Custom color based on is_tp
            text={
              record.taka_no
                ? `${record.taka_no} ${record.is_tp ? "(TP)" : ""}`
                : "-"
            }
          />
        );
      },
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "to tot",
    },
    {
      title: "Machine No",
      dataIndex: "machine_no",
      key: "machine_no",
    },
    {
      title: "Average",
      dataIndex: "average",
      key: "average",
      render: (text, record) => {
        let meter = record?.meter;
        let weight = record?.weight;
        let average = (Number(weight) * 100) / Number(meter);
        return <div>{average.toFixed(2)}</div>;
      },
    },
    {
      title: "Meter",
      dataIndex: "meter",
      key: "meter",
    },
    {
      title: "Status",
      render: (record) => {
        if (record?.status?.toLowerCase() === "rework") {
          if (record?.is_stock) {
            return <Tag color="green">Re-work (In-Stock)</Tag>;
          }
          return <Tag color="red">Re-work</Tag>;
        } else if (record?.status?.toLowerCase() === "instock") {
          return <Tag color="green">In-Stock</Tag>;
        }
      },
    },
    {
      title: "Quality",
      dataIndex: ["inhouse_quality"],
      key: "quality",
      render: (text, record) =>
        `${text.quality_name} (${text.quality_weight}KG) (${record?.machine_name})`,
    },
    {
      title: "Action",
      render: (details) => {
        return (
          <Space>
            <ViewProductionDetailModal
              title="Production Details"
              details={details}
            />

            {details?.status?.toLowerCase() === "instock" && (
              <Button
                onClick={() => {
                  navigateToUpdate(details.id);
                }}
              >
                <EditOutlined />
              </Button>
            )}

            {details?.status?.toLowerCase() === "instock" && !details.is_tp && (
              <DeleteProduction details={details} />
            )}

            <Button
              onClick={() => {
                setQrDetails([
                  {
                    taka_no: details?.taka_no,
                    meter: details?.meter,
                    machine_no: details?.machine_no,
                    quality_name: `${details?.inhouse_quality?.quality_name}`,
                  },
                ]);
                showQrModal();
              }}
            >
              <BarcodeOutlined />
            </Button>
          </Space>
        );
      },
    },
  ];

  function renderTable() {
    if (isLoading) {
      return (
        <Spin tip="Loading" size="large">
          <div className="p-14" />
        </Spin>
      );
    }

    return (
      <Table
        dataSource={productionList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          total: productionList?.count,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        style={{ textAlign: "left" }}
        summary={(tableData) => {
          let totalMeter = 0;
          let totalWeight = 0;
          let totalAvg = 0;

          tableData.forEach(({ meter, weight }) => {
            totalMeter += +meter;
            totalWeight += +weight;
          });

          totalAvg = (Number(totalWeight) * 100) / Number(totalMeter);

          return (
            <>
              {/* Page wise summary information  */}
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} align="left">
                  <b>Total</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{totalMeter.toFixed(2) || 0}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{totalWeight.toFixed(2) || 0}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{totalAvg.toFixed(2) || 0}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
              </Table.Summary.Row>

              {/* Total count information  */}
              <Table.Summary.Row className="font-semibold grand-total-div">
                <Table.Summary.Cell index={0} align="left">
                  <b>
                    Grand <br />
                    Total
                  </b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{productionList?.total_meters.toFixed(2)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left">
                  <b>{productionList?.total_weight?.toFixed(2)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0} align="left"></Table.Summary.Cell>
                <Table.Summary.Cell index={0}>
                  <b>{productionList?.net_average?.toFixed(2)}</b>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">In House Production</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Button
              type="primary"
              onClick={() => {
                navigate("/purchase/purchased-taka");
              }}
              icon = {<EyeFilled/>}
            >
              View Purchased Taka
            </Button>
          </Flex>
          <Flex
            align="center"
            gap={10}
            onClick={() => {
              navigate("/job/job-taka");
            }}
          >
            <Button type="primary" icon = {<EyeFilled/>}>View Job Taka</Button>
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Quality
            </Typography.Text>
            <Select
              allowClear
              placeholder="Select Quality"
              loading={dropDownQualityLoading}
              value={quality}
              onChange={setQuality}
              options={
                dropDownQualityListRes &&
                dropDownQualityListRes?.rows?.map((item) => ({
                  value: item.id,
                  label: item.quality_name,
                }))
              }
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Date
            </Typography.Text>
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              className="min-w-40"
              format={"DD-MM-YYYY"}
              disabledDate={disabledFutureDate}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <DatePicker
              value={toDate}
              onChange={setToDate}
              className="min-w-40"
              format={"DD-MM-YYYY"}
              // disabledDate={disabledFutureDate}
            />
          </Flex>

          <Flex align="center" gap={10}>
            <Select
              allowClear
              placeholder="Select Folding user"
              value={foldingUser}
              onChange={setFoldingUser}
              dropdownStyle={{
                textTransform: "capitalize",
              }}
              style={{
                textTransform: "capitalize",
              }}
              className="min-w-40"
            />
          </Flex>
        </Flex>
      </div>

      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <Flex
          align="center"
          gap={10}
          style={{
            border: "1px solid #efefef",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          <Radio.Group
            value={radioSelection}
            onChange={(e) => setRadioSelection(e.target.value)}
          >
            <Radio value={"sold"}> Sold</Radio>
            <Radio value={"stock"}> Stock </Radio>
            <Radio value={"tp"}> TP </Radio>
            <Radio value={"re-work"}> Re-Work </Radio>
            <Radio value={"all"}> All </Radio>
          </Radio.Group>
        </Flex>

        <Flex
          align="center"
          gap={10}
          style={{
            border: "1px solid #efefef",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <Input
              placeholder="Taka No"
              value={fromTakaNo}
              type="number"
              onChange={(e) => {
                setFromTakaNo(e.target.value);
              }}
              style={{ width: "150px", marginLeft: "7px" }}
            />
          </Flex>
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <Input
              placeholder="Taka No"
              value={toTakaNo}
              type="number"
              onChange={(e) => {
                setToTakaNo(e.target.value);
              }}
              style={{ width: "150px", marginLeft: "7px" }}
            />
          </Flex>
        </Flex>

        <Flex
          align="center"
          gap={10}
          style={{
            border: "1px solid #efefef",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">
              From
            </Typography.Text>
            <Input
              placeholder="Machine No"
              value={fromMachineNo}
              type="number"
              onChange={(e) => {
                setFromMachineNo(e.target.value);
              }}
              style={{ width: "150px", marginLeft: "7px" }}
            />
          </Flex>
          <Flex align="center" gap={1}>
            <Typography.Text className="whitespace-nowrap">To</Typography.Text>
            <Input
              placeholder="Machine No"
              value={toMachineNo}
              type="number"
              onChange={(e) => {
                setToMachineNo(e.target.value);
              }}
              style={{ width: "150px", marginLeft: "7px" }}
            />
          </Flex>
        </Flex>

        <Flex align="center" gap={10}>
          <Typography.Text className="whitespace-nowrap">
            Grade:
          </Typography.Text>
          <Select
            allowClear
            placeholder="Select Grade"
            value={grade}
            onChange={(value) => setGrade(value)}
            options={[
              { value: "A", label: "A" },
              { value: "B", label: "B" },
              { value: "C", label: "C" },
              { value: "D", label: "D" },
            ]}
            dropdownStyle={{
              textTransform: "capitalize",
            }}
            style={{
              textTransform: "capitalize",
            }}
            className="min-w-40"
          />
        </Flex>
      </div>

      <div
        className={`flex items-center ${
          selectedRecords.length ? "justify-between" : "justify-end"
        } gap-5 mx-3 mb-3`}
      >
        {selectedRecords.length ? (
          <Flex gap={12} justify="space-between">
            <Button
              danger
              onClick={handleDelete}
              style={{ width: "50px" }}
              loading={deleteProductionPending}
            >
              <DeleteOutlined />
            </Button>
            <Button
              type="default"
              disabled={!selectedRecords.length}
              className="flex-none"
              style={{ backgroundColor: "#247840", color: "#fff" }}
              onClick={printQrHandler}
            >
              PRINT QR
            </Button>
          </Flex>
        ) : null}

        <Flex gap={12}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Challan No:
            </Typography.Text>
            <Input
              value={challanNo}
              onChange={(e) => {
                setChallanNo(e.target.value);
              }}
              placeholder="Challan No"
            />
          </Flex>

          <Flex
            align="center"
            gap={10}
            style={{
              border: "1px solid #efefef",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            <Flex align="center" gap={1}>
              <Typography.Text className="whitespace-nowrap">
                Beam No
              </Typography.Text>
              <Input
                placeholder="Beam No"
                value={beamNo}
                onChange={(e) => {
                  setBeamNo(e.target.value);
                }}
                style={{ width: "150px", marginLeft: "10px" }}
              />
            </Flex>
          </Flex>

          <Flex align="center" gap={10}>
            <Button
              icon={<FilePdfOutlined />}
              type="primary"
              disabled={!productionList?.rows?.length}
              onClick={downloadPdf}
              className="flex-none"
            />
            {/* <Button
            icon={<PrinterFilled />}
            type="primary"
            disabled={!productionList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          /> */}
            <Button
              type="primary"
              disabled={!productionList?.rows?.length}
              className="flex-none"
            >
              Summary
            </Button>
          </Flex>
        </Flex>
      </div>

      {renderTable()}

      {isQrModalOpen && (
        <ProductionQrModal
          open={isQrModalOpen}
          handleClose={() => setIsQrModalOpen(false)}
          details={qrDetails}
        />
      )}
    </div>
  );
};

export default InhouseProduction;
