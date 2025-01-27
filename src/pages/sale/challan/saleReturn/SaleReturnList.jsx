import {
  Button,
  DatePicker,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import dayjs from "dayjs";
import useDebounce from "../../../../hooks/useDebounce";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getSaleChallanReturnListRequest } from "../../../../api/requests/sale/challan/challan";
import { getPartyListRequest } from "../../../../api/requests/users";
import ViewSaleReturn from "../../../../components/sale/challan/saleReturn/ViewSaleReturn";
import SaleReturnBill from "../../../../components/sale/challan/saleReturn/SaleReturnBill";
import moment from "moment";
import { getDisplayQualityName } from "../../../../constants/nameHandler";
import ViewParticularSaleReturn from "../../../../components/sale/challan/saleReturn/ViewParticularSaleReturn";

const SaleReturnInformation = ({item}) => {
  const makeUniqueList = (itemsInfo) => {
    
    try {
      const filteredItems = itemsInfo?.filter(
        (item) => item.sale_challan_return_id !== null
      );
      
      const grouped = filteredItems.reduce((acc, item) => {
        const key = item.sale_challan_return_id;
        if (!acc[key]) {
          acc[key] = [];
      }
        acc[key].push(item);
        return acc;
      }, {});
  
      // Convert grouped object back into an array
      return Object.values(grouped);
    } catch (error) {
      return [] ;   
    }
  };

  const uniqueList = makeUniqueList(
    item?.sale_challan?.sale_challan_details
  );

  const columns = [
    {
      title: "ID", 
      render: (text, record, index) => {
        return(
          <div style={{fontWeight: 600}}>
            {index + 1}
          </div>
        )
      }
    }, 
    {
      title: "Return Taka",
      render: (text, record) => {
        return <div>{record?.length}</div>;
      },
    },
    {
      title: "Return Meter",
      render: (text, record) => {
        let total_return_meter = 0;
        record?.map((element) => {
          total_return_meter += +element?.meters || +element?.meter;
        });
        return (
          <div
            style={{
              fontWeight: 600,
              color: "red",
            }}
          >
            {total_return_meter}
          </div>
        );
      },
    },
    {
      title: "Action",
      render: (record) => {
        let return_taka_id_array = [] ; 
        record?.map((item) => {
          return_taka_id_array.push(item?.id) ; 
        })
        
        return(
          <Space>
            <ViewParticularSaleReturn
              details={item}
              taka_array = {return_taka_id_array}
            />
            <SaleReturnBill
              details={item}
            />
            {/* <ParticularPurchaseReturnInfo
              details={{ ...item, new_challan_details: record }}
            /> */}
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div
        style={{
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <Table
          dataSource={uniqueList}
          columns={columns}
          pagination = {false}
          className="return-taka-info-table"
          style={{
            width: "30%"
          }}
        />
      </div>
    </>
  )
}

const SaleReturnList = () => {
  const { companyId } = useContext(GlobalContext);

  const [fromDate, setFromDate] = useState();
  const [toDate, setToDate] = useState();
  const [quality, setQuality] = useState();
  const [saleReturnNo, setSaleReturnNo] = useState();
  const [party, setParty] = useState();

  const debouncedFromDate = useDebounce(fromDate, 500);
  const debouncedToDate = useDebounce(toDate, 500);
  const debouncedQuality = useDebounce(quality, 500);
  const debouncedSaleReturnNo = useDebounce(saleReturnNo, 500);
  const debouncedParty = useDebounce(party, 500);

  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: partyUserListRes, isLoading: isLoadingPartyList } = useQuery({
    queryKey: ["party", "list", { company_id: companyId }],
    queryFn: async () => {
    const res = await getPartyListRequest({
        params: { company_id: companyId },
    });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        const res = await getInHouseQualityListRequest({
          params: {
            company_id: companyId,
            page: 0,
            pageSize: 9999,
            is_active: 1,
          },
        });
        return res.data?.data;
      },
      enabled: Boolean(companyId),
    });

  const { data: saleChallanReturnList, isLoading } = useQuery({
    queryKey: [
      "saleChallanReturn",
      "list",
      {
        company_id: companyId,
        page,
        pageSize,
        from_date: debouncedFromDate,
        to_date: debouncedToDate,
        quality_id: debouncedQuality,
        party_id: debouncedParty,
        sale_return_no: debouncedSaleReturnNo,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
        page,
        pageSize,
        from_date: debouncedFromDate,
        to_date: debouncedToDate,
        quality_id: debouncedQuality,
        party_id: debouncedParty,
        sale_return_no: debouncedSaleReturnNo,
      };

      if (debouncedFromDate) {
        params.from = dayjs(debouncedFromDate).format("YYYY-MM-DD");
      }
      if (debouncedToDate) {
        params.to = dayjs(debouncedToDate).format("YYYY-MM-DD");
      }
      const res = await getSaleChallanReturnListRequest({ params });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  function downloadPdf() {
    // const { leftContent, rightContent } = getPDFTitleContent({ user, company });
    const body = saleChallanReturnList?.rows?.map((item, index) => {
      const { createdAt, due_days, sale_challan, return_date } = item;

      let dueDate = new Date(createdAt);
      dueDate.setDate(dueDate.getDate() + due_days);

      let totalMeter = 0;
      sale_challan.sale_challan_details.forEach(({ meter }) => {
        totalMeter += +meter;
      });

      return [
        index + 1,
        dueDate,
        sale_challan.challan_no,
        `${sale_challan?.inhouse_quality?.quality_name} (${sale_challan?.inhouse_quality?.quality_weight}KG)`,
        `${sale_challan?.party?.first_name} ${sale_challan?.party?.last_name}`,
        sale_challan.total_sale,
        totalMeter,
        sale_challan.total_taka,
        dayjs(return_date).format("DD-MM-YYYY"),
      ];
    });

    const tableTitle = [
      "ID",
      "Due Date",
      "Challan/Bill",
      "Quality",
      "Party Name",
      "Total Sale",
      "Return Meter",
      "Total Taka",
      "Return Date",
    ];

    // Set localstorage item information
    localStorage.setItem("print-array", JSON.stringify(body));
    localStorage.setItem("print-title", "Sale return List");
    localStorage.setItem("print-head", JSON.stringify(tableTitle));
    localStorage.setItem("total-count", "0");

    window.open("/print");
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1,
      sorter: {
        compare: (a, b) => {
          return a.id - b.id;
        },
      },
    },
    {
      title: "Challan Date",
      render: (text, record) => {
        // let result = new Date(record?.return_date);
        // result.setDate(result.getDate() + record?.due_days);
        // return <div>{dayjs(result).format("DD-MM-YYYY")}</div>;
        return(
          <div>
            {dayjs(record?.sale_challan?.createdAt).format("DD-MM-YYYY")}
          </div>
        )
      },
    },
    {
      title: "Challan/Bill",
      dataIndex: ["sale_challan", "challan_no"],
      key: "challan_no",
      sorter: {
        compare: (a, b) => {
          return a.sale_challan.challan_no - b.sale_challan.challan_no;
        },
      },
    },
    {
      title: "Quality Name",
      render: (details) => {
        return(
          <div style={{
            fontSize: 13
          }}>
            {getDisplayQualityName(details?.sale_challan?.inhouse_quality)}
          </div>
        )
      },
      sorter: {
        compare: (a, b) => {
          return (
            a?.sale_challan?.inhouse_quality?.quality_name -
            b?.sale_challan?.inhouse_quality?.quality_name
          );
        },
      },
    },
    {
      title: "Party Name",
      dataIndex: ["sale_challan", "party"],
      key: "party_name",
      render: (text) => {
        return(
          <div>
            <div style={{
              fontWeight: 600
            }}>
              {String(`${text?.first_name} ${text?.last_name}`).toUpperCase()}
            </div>
            <div>
              {text?.party?.company_name}
            </div>
          </div>
        )
      },
      sorter: {
        compare: (a, b) => {
          return (
            a?.sale_challan?.party?.first_name -
            b?.sale_challan?.party?.first_name
          );
        },
      },
    },
    {
      title: "Total Sale",
      dataIndex: ["sale_challan", "total_sale"],
      key: "total_sale",
      render: (text, record) => {
        return( 
          <div>
            {record?.sale_challan?.total_meter}
          </div>
        )
      }
      // sorter: {
      //   compare: (a, b) => {
      //     return a?.sale_challan?.total_sale - b?.sale_challan?.total_sale;
      //   },
      // },
    },
    {
      title: "Total Taka",
      dataIndex: ["sale_challan", "total_taka"],
      key: "total_taka",
      sorter: {
        compare: (a, b) => {
          return a?.sale_challan?.total_taka - b?.sale_challan?.total_taka;
        },
      },
    },
    {
      title: "Return Meter",
      render: (text, record) => {
        let sale_return_id = record?.id ;  
        let total_return_meter = 0 ; 
        record?.sale_challan?.sale_challan_details?.map((element) => {
          if (+element?.sale_challan_return_id === +sale_return_id){
            total_return_meter += +element?.meter ; 
          }
        })

        return(
          <div style={{
            fontWeight: 600, 
            color: "red"
          }}>
            {parseFloat(total_return_meter).toFixed(2)}
          </div>
        )
      },
    },
    {
      title: "Return Taka", 
      render: (text, record) => {
        let sale_return_id = record?.id ; 
        let total_return_taka = 0 ; 
        record?.sale_challan?.sale_challan_details?.map((element) => {
          if (+element?.sale_challan_return_id === +sale_return_id){
            total_return_taka += 1; 
          }
        })

        return (
          <div style={{
            fontWeight: 600, 
            color: "red"
          }}>
            {parseFloat(total_return_taka).toFixed(2)}
          </div>
        )
      }
    }, 
    {
      title: "Action", 
      render: (text, record) => {
        let sale_return_id = record?.id ; 
        let sale_return_taka_id = [] ; 
        record?.sale_challan?.sale_challan_details?.map((element) => {
          if (+element?.sale_challan_return_id == +sale_return_id){
            sale_return_taka_id.push(element?.id) ; 
          }
        })
        return(
          <Space>

            <SaleReturnBill
              details={record}
            />
            
            <ViewParticularSaleReturn
              details={record}
              taka_array  = {sale_return_taka_id}
            />
          </Space>
        )
      }
    }
  ];

  function disabledFutureDate(current) {
    return current && current > moment().endOf("day");
  }

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
        dataSource={saleChallanReturnList?.rows || []}
        columns={columns}
        rowKey={"id"}
        pagination={{
          current: page + 1,
          pageSize: pageSize,
          total: saleChallanReturnList?.count || 0,
          showSizeChanger: true,
          onShowSizeChange: onShowSizeChange,
          onChange: onPageChange,
        }}
        // expandable={{
        //   expandedRowRender: (record) => {
        //     return (
        //       <SaleReturnInformation
        //         item = {record}
        //       />
        //     )
        //   }, 
        //   expandedRowKeys: 
        //     saleChallanReturnList?.rows?.map((element) => element?.id) || [] 
        // }}
        summary={(pageData) => {
          // let totalTaka = 0;
          // pageData.forEach((row) => {
          //   totalTaka += +row.sale_challan.total_taka || 0;
          // });
          return (
            <>
              <Table.Summary.Row className="font-semibold">
                <Table.Summary.Cell>Total</Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <Typography.Text>
                    {parseFloat(saleChallanReturnList?.total_sale).toFixed(2)}
                  </Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <Typography.Text>{parseFloat(saleChallanReturnList?.retrun_meter).toFixed(2)}</Typography.Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>
            </>
          );
        }}
      />
    );
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Sales Return </h3>
        </div>
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Party
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Party"
                value={party}
                loading={isLoadingPartyList}
                options={partyUserListRes?.partyList?.rows?.map((party) => ({
                  label:
                    party.first_name +
                    " " +
                    party.last_name +
                    " " +
                    `| ( ${party?.username})`,
                  value: party.id,
                }))}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setParty}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
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
                options={
                  dropDownQualityListRes &&
                  dropDownQualityListRes?.rows?.map((item) => ({
                    value: item.id,
                    label: getDisplayQualityName(item),
                  }))
                }
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setQuality}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
              />
            </Flex>
          </Flex>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              From
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
              disabledDate={disabledFutureDate}
            />
          </Flex>
        </Flex>
      </div>

      <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
        <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Sales Return No
            </Typography.Text>
            <Input
              value={saleReturnNo}
              onChange={(e) => setSaleReturnNo(e.target.value)}
              style={{ width: "200px" }}
            />
          </Flex>
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!saleChallanReturnList?.rows?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex>
      </div>
      {renderTable()}
    </div>
  );
};

export default SaleReturnList;
