import {
    Button,
    Col,
    DatePicker,
    Flex,
    Input,
    Modal,
    Radio,
    Row,
    Select,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
} from "antd";
import {
    CloseOutlined,
    EyeOutlined,
    FilePdfOutlined,
    PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../../api/hooks/auth";
import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import useDebounce from "../../../hooks/useDebounce";
import { usePagination } from "../../../hooks/usePagination";
import { getStockTakaListRequest } from "../../../api/requests/job/jobTaka";
import { render } from "react-dom";
import { getInHouseQualityListRequest } from "../../../api/requests/qualityMaster";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";

const StockTaka = () => {
    const { company, companyId } = useContext(GlobalContext);
    const { data: user } = useCurrentUser();
    const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
    const navigate = useNavigate();

    const [state, setState] = useState("current");
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [type, setType] = useState();
    const [quality, setQuality] = useState();
    const [takaNo, setTakaNo] = useState("");
    const [challanNo, setChallanNo] = useState("");
    const [supplier, setSupplier] = useState();
    const [supplierCompany, setSupplierCompany] = useState();

    const debouncedFromDate = useDebounce(fromDate, 500);
    const debouncedToDate = useDebounce(toDate, 500);
    const debouncedType = useDebounce(type, 500);
    const debouncedQuality = useDebounce(quality, 500);
    const debouncedState = useDebounce(state, 500);
    const debouncedTakaNo = useDebounce(takaNo, 500);
    const debouncedChallanNo = useDebounce(challanNo, 500);
    const debouncedSupplier = useDebounce(supplier, 500);
    const debouncedSupplierCompany = useDebounce(supplierCompany, 500);

    const { data: jobTakaList, isLoading } = useQuery({
        queryKey: [
            "jobTaka",
            "list",
            {
                company_id: companyId,
                page,
                pageSize,
                from: debouncedFromDate,
                to: debouncedToDate,
                quality_id: debouncedQuality,
                challan_no: debouncedChallanNo,
                supplier_id: debouncedSupplierCompany,
                in_stock: debouncedType === "in_stock" ? true : false,
            },
        ],
        queryFn: async () => {
            const res = await getStockTakaListRequest({
                params: {
                    company_id: companyId,
                    page,
                    pageSize,
                    from: debouncedFromDate,
                    to: debouncedToDate,
                    quality_id: debouncedQuality,
                    challan_no: debouncedChallanNo,
                    supplier_id: debouncedSupplierCompany,
                    in_stock: debouncedType === "in_stock" ? true : false,
                },
            });
            return res.data?.data;
        },
        enabled: Boolean(companyId),
    });

    const { data: dropDownQualityListRes, dropDownQualityLoading } = useQuery({
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

    const {
        data: dropdownSupplierListRes,
        isLoading: isLoadingDropdownSupplierList,
    } = useQuery({
        queryKey: ["dropdown/supplier/list", { company_id: companyId }],
        queryFn: async () => {
            const res = await getDropdownSupplierListRequest({
                params: { company_id: companyId },
            });
            return res.data?.data?.supplierList;
        },
        enabled: Boolean(companyId),
    });

    const dropDownSupplierCompanyOption = useMemo(() => {
        if (
            debouncedSupplier &&
            dropdownSupplierListRes &&
            dropdownSupplierListRes.length
        ) {
            const obj = dropdownSupplierListRes.filter((item) => {
                return item.supplier_name === debouncedSupplier;
            })[0];

            return obj?.supplier_company?.map((item) => {
                return { label: item.supplier_company, value: item.supplier_id };
            });
        } else {
            return [];
        }
    }, [debouncedSupplier, dropdownSupplierListRes]);

    const columns = [
        {
            title: "No",
            dataIndex: "id",
            key: "id",
            render: (text, record, index) => index + 1,
        },
        {
            title: "Quality",
            dataIndex: ["job_taka_challan", "inhouse_quality"],
            render: (text, record) => (
                `${text?.quality_name} ${text?.quality_weight}KG`
            )
        },
        {
            title: "Purchase Challan No",
            dataIndex: ["job_taka_challan", "challan_no"]
        },
        {
            title: "Taka No",
            dataIndex: "taka_no"
        },
        {
            title: "Meter",
            dataIndex: "meter"
        },
        {
            title: "Weight",
            dataIndex: "weight"
        },
        {
            title: "Average",
            dataIndex: "average"
        },
        {
            title: "Sale Ch. No.",
            dataIndex: "-",
            render: (text, record) => (
                `-`
            )
        },
        {
            title: "Status",
            dataIndex: "in_stock",
            render: (text, record) => (
                text == true ? <>
                    <Tag color="green">In Stock</Tag>
                </> : <>
                    <Tag color="red">Sale</Tag>
                </>
            )
        }
    ]

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
                dataSource={jobTakaList?.rows || []}
                columns={columns}
                rowKey={"id"}
                pagination={{
                    total: jobTakaList?.rows?.count || 0,
                    showSizeChanger: true,
                    onShowSizeChange: onShowSizeChange,
                    onChange: onPageChange,
                }}
            />
        );
    }

    return (
        <>
            <div className="flex flex-col p-4">
                <div className="flex items-center justify-between gap-5 mx-3 mb-3">

                    <div className="flex items-center gap-2">
                        <h3 className="m-0 text-primary">Job Production List</h3>
                    </div>
                    <Flex align="center" gap={10}>
                        <Flex align="center" gap={10}>
                            <Typography.Text className="whitespace-nowrap">
                                Type
                            </Typography.Text>
                            <Select
                                allowClear
                                placeholder="Select Type"
                                value={type}
                                options={[
                                    { label: "In Stock", value: "in_stock" },
                                    { label: "Sold", value: "sold" },
                                ]}
                                dropdownStyle={{
                                    textTransform: "capitalize",
                                }}
                                onChange={setType}
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
                                        label: item.quality_name,
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
                        <Flex align="center" gap={10}>
                            <Typography.Text className="whitespace-nowrap">
                                From
                            </Typography.Text>
                            <DatePicker
                                value={fromDate}
                                onChange={setFromDate}
                                className="min-w-40"
                                format={"DD-MM-YYYY"}
                            />
                        </Flex>

                        <Flex align="center" gap={10}>
                            <Typography.Text className="whitespace-nowrap">
                                To
                            </Typography.Text>
                            <DatePicker
                                value={toDate}
                                onChange={setToDate}
                                className="min-w-40"
                                format={"DD-MM-YYYY"}
                            />
                        </Flex>
                    </Flex>
                </div>


                <div className="flex items-center justify-end gap-5 mx-3 mb-3 mt-2">
                    <Flex align="center" gap={10}>
                        <Flex align="center" gap={10}>
                            <Typography.Text className="whitespace-nowrap">
                                Supplier
                            </Typography.Text>
                            <Select
                                placeholder="Select supplier"
                                loading={isLoadingDropdownSupplierList}
                                options={dropdownSupplierListRes?.map((supervisor) => ({
                                    label: supervisor?.supplier_name,
                                    value: supervisor?.supplier_name,
                                }))}
                                dropdownStyle={{
                                    textTransform: "capitalize",
                                }}
                                value={supplier}
                                onChange={setSupplier}
                                style={{
                                    textTransform: "capitalize",
                                }}
                                className="min-w-40"
                            />
                        </Flex>
                        <Flex align="center" gap={10}>
                            <Typography.Text className="whitespace-nowrap">
                                Supplier Company
                            </Typography.Text>
                            <Select
                                placeholder="Select Company"
                                options={dropDownSupplierCompanyOption}
                                dropdownStyle={{
                                    textTransform: "capitalize",
                                }}
                                value={supplierCompany}
                                onChange={setSupplierCompany}
                                style={{
                                    textTransform: "capitalize",
                                }}
                                className="min-w-40"
                            />
                        </Flex>
                        <Flex align="center" gap={10}>
                            <Typography.Text className="whitespace-nowrap">
                                Taka No
                            </Typography.Text>
                            <Input
                                placeholder="Taka No"
                                value={takaNo}
                                onChange={(e) => setTakaNo(e.target.value)}
                                style={{ width: "200px" }}
                            />
                        </Flex>
                        <Flex align="center" gap={10}>
                            <Typography.Text className="whitespace-nowrap">
                                J. Challan No
                            </Typography.Text>
                            <Input
                                placeholder="J. Challan NO"
                                value={challanNo}
                                onChange={(e) => setChallanNo(e.target.value)}
                                style={{ width: "200px" }}
                            />
                        </Flex>
                    </Flex>
                </div>

                {renderTable()}
            </div>
        </>
    )
}

export default StockTaka; 