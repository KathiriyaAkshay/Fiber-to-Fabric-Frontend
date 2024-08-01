import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
    Col,
    DatePicker,
    Flex,
    Form,
    Input,
    Row,
    Select,
    message,
    Checkbox,
    Table,
    Radio,
    Descriptions,
    Divider
} from "antd";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import dayjs from "dayjs";
import GoBackButton from "../../../components/common/buttons/GoBackButton";
import { getDropdownSupplierListRequest } from "../../../api/requests/users";
import { getYSCDropdownList } from "../../../api/requests/reports/yarnStockReport";
import { PlusCircleOutlined } from "@ant-design/icons";
import { PlusOutlined } from "@ant-design/icons";
import { createGeneralPurchaseEntryRequest } from "../../../api/requests/purchase/purchaseSizeBeam";
import moment from "moment";

const AddGeneralPurchaseEntry = () => {
    const { companyId } = useContext(GlobalContext);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [isAddCashBillChecked, setAddCashBillChecked] = useState(false);
    const [isAddOpeningCurrentBillsChecked, setAddOpeningCurrentBillsChecked] = useState(true); // Assuming it is checked by default (as per your image)
    const [isUpdateStockChecked, setIsUpdateStockChecked] = useState(false) ; 

    const [is_millgine_bill, set_is_millgine_bill] = useState(false);
    const [supplierName, setSupplierName] = useState("");
    const [supplierCompanyOptions, setSupplierCompanyOptions] = useState([]);


    const handleAddCashBillChange = (e) => {
        setAddCashBillChecked(e.target.checked);

        if (e.target.checked) {
            setAddOpeningCurrentBillsChecked(false);
            setIsUpdateStockChecked(false) ; 
        }
    };

    const handleAddOpeningCurrentBillsChange = (e) => {
        setAddOpeningCurrentBillsChecked(e.target.checked);

        if (e.target.checked) {
            setAddCashBillChecked(false);
            setIsUpdateStockChecked(false) ; 
        }
    };

    const handleUpdateStockChange = (e) => {
        setIsUpdateStockChecked(e.target.checked) ; 

        if (e.target.checked){
            setAddCashBillChecked(false) ; 
            setAddOpeningCurrentBillsChecked(false) ; 
        }
    }

    const AddValidationSchema = yup.object().shape({
        supplier_name: yup.string().required("Please, Select supplier"),
        head: yup.string().required("Please, Select head type"), 
        supplier_id : yup.string().required("Please, Select supplier company"), 
        invoice_no: yup.string().required("Please, Enter invoice number"), 
        sub_head: yup.string().required("Please, Enter sub head"), 
        createdAt: yup.string().required("Please, Select invoice date"), 
        due_date: yup.string().required("Pease, Select due date"), 
        remark: yup.string(),
        tds_percent: yup.string().required("Please, Enter TDS amount"), 
        create_passbook_entry: yup.string().required()
    })

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        clearErrors,
        setError,
        getValues,
        watch,
        setValue
    } = useForm({
        resolver: yupResolver(AddValidationSchema),
        defaultValues: {
            createdAt: dayjs(), 
            due_date: dayjs(), 
            tds_percent: "0", 
            create_passbook_entry: "yes"
        },
    });

    const { yarn_company_name, supplier_name, head } = watch();

    const {
        data: dropdownSupplierListRes,
        isLoading: isLoadingDropdownSupplierList,
    } = useQuery({
        queryKey: [
            "dropdown/supplier/list",
            {
                company_id: companyId,
                supplier_name: supplierName,
                supplier_type: "yarn",
            },
        ],
        queryFn: async () => {
            const res = await getDropdownSupplierListRequest({
                params: {
                    company_id: companyId,
                    supplier_type: "yarn",
                },
            });
            return res.data?.data?.supplierList;
        },
        enabled: Boolean(companyId),
    });

    const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
        queryKey: ["dropdown", "yarn_company", "list", { company_id: companyId }],
        queryFn: async () => {
            const res = await getYSCDropdownList({
                params: { company_id: companyId },
            });
            return res.data?.data;
        },
        enabled: Boolean(companyId),
    });

    function goToAddSupplier() {
        navigate("/user-master/my-supplier/add");
    }


    useEffect(() => {
        dropdownSupplierListRes?.forEach((spl) => {
            const { supplier_name: name = "", supplier_company = [] } = spl;
            if (name === supplier_name) {
                const options = supplier_company?.map(
                    ({ supplier_id = 0, supplier_company = "" }) => {
                        return {
                            label: supplier_company,
                            value: supplier_id,
                        };
                    }
                );
                if (options?.length) {
                    setSupplierCompanyOptions(options);
                }
            }
        });
    }, [dropdownSupplierListRes, supplier_name]);

    // Millgine entry handle
    const [millgineOrderArray, setMillgineOrderArray] = useState([0]);

    const AddMillgineRow = (indexValue) => {
        let isValid = true;

        millgineOrderArray.forEach((item, index) => {
            clearErrors(`code_${index}`);
            clearErrors(`description_${index}`);
            clearErrors(`hsn_code_${index}`);
            clearErrors(`pis_${index}`);
            clearErrors(`quantity_${index}`);
            clearErrors(`rate_${index}`);
            clearErrors(`gst_${index}`);
        });

        millgineOrderArray.forEach((item, index) => {
            if (index == indexValue) {
                if (!getValues(`code_${index}`)) {
                    setError(`code_${index}`, {
                        type: "manual",
                        message: "Please, Enter Code",
                    });
                    isValid = false;
                }
                if (!getValues(`description_${index}`)) {
                    setError(`description_${index}`, {
                        type: "manual",
                        message: "Please, Enter description",
                    });
                    isValid = false;
                }
                if (!getValues(`hsn_code_${index}`)) {
                    setError(`hsn_code_${index}`, {
                        type: "manual",
                        message: "Please, Enter HSN Code",
                    });
                    isValid = false;
                }
                if (!getValues(`pis_${index}`)) {
                    setError(`pis_${index}`, {
                        type: "manual",
                        message: "Please, Enter Pis",
                    });
                    isValid = false;
                }
                if (!getValues(`quantity_${index}`)) {
                    setError(`quantity_${index}`, {
                        type: "manual",
                        message: "Please, Enter Quantity",
                    });
                    isValid = false;
                }
                if (!getValues(`rate_${index}`)) {
                    setError(`rate_${index}`, {
                        type: "manual",
                        message: "Please, Enter Rate",
                    });
                    isValid = false;
                }
                if (!getValues(`gst_${index}`)) {
                    setError(`gst_${index}`, {
                        type: "manual",
                        message: "Please, Enter GST",
                    });
                    isValid = false;
                }
                // if (!getValues(`amount_${index}`)) {
                //     setError(`amount_${index}`, {
                //         type: "manual",
                //         message: "Please, Enter Amount",
                //     });
                //     isValid = false;
                // }
            }
        })

        if (isValid) {
            const nextValue = millgineOrderArray.length;
            setMillgineOrderArray((prev) => {
                return [...prev, nextValue];
            })
        }

    }

    const [initialData, setInitialData] = useState([
        {
            key: '1',
            class: 'GST 5 %',
            total: 0,
            discount: 0,
            sgst: 0,
            cgst: 0,
            totalGst: 0,
            gst_amount: 5
        },
        {
            key: '2',
            class: 'GST 12 %',
            total: 0,
            discount: 0,
            sgst: 0,
            cgst: 0,
            totalGst: 0,
            gst_amount: 12
        },
        {
            key: '3',
            class: 'GST 18 %',
            total: 0,
            discount: 0,
            sgst: 0,
            cgst: 0,
            totalGst: 0,
            gst_amount: 18
        },
        {
            key: '4',
            class: 'GST 28 %',
            total: 0,
            discount: 0,
            sgst: 0,
            cgst: 0,
            totalGst: 0,
            gst_amount: 28
        },
        {
            key: '5',
            class: 'Other',
            total: 0,
            discount: 0,
            sgst: 0,
            cgst: 0,
            totalGst: 0,
            gst_amount: 0
        },
    ]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalDiscount, setTotalDiscount] = useState(0);
    const [totalSGST, setTotalSGST] = useState(0);
    const [totalCGST, setTotalCGST] = useState(0);
    const [totalGST, setTotalGST] = useState(0);
    const [roundOff, setRoundOff] = useState(0);
    const [finalAmount, setFinalAmount] = useState(0);
    const [afterTDSAmount, setAfterTDSAmount] = useState(0);

    const [totalPics, setTotalPics] = useState(0) ; 
    const [totalQuantity, setTotalQuantity] = useState(0) ; 
    const [miligineTotalAmount, setMilgineTotalAmount] = useState(0) ; 

    useEffect(() => {

        let tempTotal = 0;
        let tempDiscount = 0;
        let tempSGST = 0;
        let tempCGST = 0;
        let tempTotalGST = 0;

        initialData?.map((element) => {
            tempTotal = Number(tempTotal) + Number(element?.total);

            if (Number(element?.total) > Number(element?.discount)) {
                tempDiscount = Number(tempDiscount) + Number(element?.discount);
            }

            tempSGST = Number(tempSGST) + Number(element?.sgst);
            tempCGST = Number(tempCGST) + Number(element?.cgst);
            tempTotalGST = Number(tempTotalGST) + Number(element?.totalGst);
        })

        setTotalAmount(tempTotal);
        setTotalDiscount(tempDiscount);
        setTotalSGST(tempSGST);
        setTotalCGST(tempCGST);
        setTotalGST(tempTotalGST);

        let temp_final = (Number(tempTotal) - Number(tempDiscount)) + Number(totalSGST) + Number(totalCGST);
        let roundOff = Math.round(temp_final) - temp_final;

        setRoundOff(roundOff.toFixed(2));
        setFinalAmount(Math.round(temp_final).toFixed(2));
        setValue("final_amount", Math.round(temp_final).toFixed(2)) ; 
    
    }, [initialData]);

    const CalculateGstTotalAmount = () => {
        
        let temp = [
            {
                key: '1',
                class: 'GST 5 %',
                total: 0,
                discount: 0,
                sgst: 0,
                cgst: 0,
                totalGst: 0,
                gst_amount: 5
            },
            {
                key: '2',
                class: 'GST 12 %',
                total: 0,
                discount: 0,
                sgst: 0,
                cgst: 0,
                totalGst: 0,
                gst_amount: 12
            },
            {
                key: '3',
                class: 'GST 18 %',
                total: 0,
                discount: 0,
                sgst: 0,
                cgst: 0,
                totalGst: 0,
                gst_amount: 18
            },
            {
                key: '4',
                class: 'GST 28 %',
                total: 0,
                discount: 0,
                sgst: 0,
                cgst: 0,
                totalGst: 0,
                gst_amount: 28
            },
            {
                key: '5',
                class: 'Other',
                total: 0,
                discount: 0,
                sgst: 0,
                cgst: 0,
                totalGst: 0,
                gst_amount: 0
            },
        ];

        let gstCheckKey = ["5", "12", "18", "28"];
        
        let tempTotalPics = 0 ; 
        let tempTotalQuantity = 0 ;
        let tempTotalAmount = 0 ;  


        millgineOrderArray?.map((element, index) => {
            let amountInfo = null;
            let pics = getValues(`pis_${index}`);
            let quantity = getValues(`quantity_${index}`);
            let gstAmount = getValues(`gst_${index}`);
            let rate = getValues(`rate_${index}`)

            if (pics !== "" && pics != "0") {
                let amount = Number(pics) * Number(rate);
                amountInfo = amount;
                tempTotalPics = tempTotalPics + Number(pics) ;
                tempTotalAmount = tempTotalAmount = Number(amountInfo) ;  
            }

            if (quantity !== "" && quantity != "0") {
                let amount = Number(quantity) * Number(rate);
                amountInfo = amount;
                tempTotalQuantity = tempTotalQuantity +  Number(quantity) ; 
                tempTotalAmount = tempTotalAmount = Number(amountInfo) ;  
            }


            if (gstAmount !== "") {
                if (gstCheckKey?.includes(gstAmount)) {
                    temp?.map((item, i) => {
                        if (String(item?.gst_amount) == gstAmount) {

                            // Calculate totalAmount
                            let tempTotal = temp[i]["total"];
                            tempTotal = Number(tempTotal) + Number(amountInfo);
                            temp[i]["total"] = tempTotal;

                            // Calculate total GST
                            let totalGST = Number(tempTotal) * Number(item?.gst_amount) / 100;
                            let SGSTAmount = Number(totalGST) / 2;

                            temp[i]["totalGst"] = parseFloat(totalGST);
                            temp[i]["sgst"] = SGSTAmount;
                            temp[i]["cgst"] = SGSTAmount;
                        }
                    })
                }   else {

                    // Calculate totalAmount
                    let tempTotal = temp[4]["total"];
                    tempTotal = Number(tempTotal) + Number(amountInfo);
                    temp[4]["total"] = tempTotal;

                }
            }
        })

        setInitialData(temp);
        setTotalPics(tempTotalPics) ; 
        setTotalQuantity(tempTotalQuantity) ; 
        setMilgineTotalAmount(tempTotalAmount) ; 
    }

    // Handle discount amount change 
    const handleDiscountChange = (event, key) => {
        const updatedData = initialData.map((item) => {
            if (item.key === key) {
                let total = item?.total;
                let discount = event?.target?.value;

                if (discount > total) {

                    return {
                        ...item,
                        discount: parseFloat(event.target.value) || 0,
                        totalGst: 0,
                        sgst: 0,
                        cgst: 0,
                        is_highlight: true
                    };
                } else {

                    let totalGST = Number(total) - Number(discount);
                    totalGST = Number(totalGST) * (item?.gst_amount) / 100;

                    let SGSTAmount = Number(totalGST) / 2;

                    return {
                        ...item,
                        discount: parseFloat(event.target.value) || 0,
                        totalGst: parseFloat(totalGST),
                        sgst: SGSTAmount,
                        cgst: SGSTAmount
                    };
                }
            }
            return item;
        });
        setInitialData(updatedData);
    };

    // Handle total amount change 
    const handleTotalChange = (event, key) => {
        const updatedData = initialData.map((item) => {
            if (item.key === key) {
                let total = event?.target?.value;
                let discount = item?.discount;

                if (discount > total) {

                    return {
                        ...item,
                        total: parseFloat(event.target.value) || 0,
                        totalGst: 0,
                        sgst: 0,
                        cgst: 0,
                        is_highlight: true
                    };
                } else {

                    let totalGST = Number(total) - Number(discount);
                    totalGST = Number(totalGST) * (item?.gst_amount) / 100;

                    let SGSTAmount = Number(totalGST) / 2;

                    return {
                        ...item,
                        total: parseFloat(event.target.value) || 0,
                        totalGst: parseFloat(totalGST),
                        sgst: SGSTAmount,
                        cgst: SGSTAmount
                    };
                }

            }
            return item;
        });
        setInitialData(updatedData);
    }

    const columns = [
        {
            title: 'Class',
            dataIndex: 'class',
            key: 'class',
        },
        {
            title: 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (text, record) => (
                <Input
                    disabled={is_millgine_bill ? true : false}
                    type="number"
                    value={record.total}
                    onChange={(value) => handleTotalChange(value, record.key)}
                    placeholder="Enter total"
                />
            )
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            render: (text, record) => (
                <Input
                    type="number"
                    value={record.discount}
                    onChange={(value) => handleDiscountChange(value, record.key)}
                    placeholder="Enter Discount"
                    className={record?.is_highlight !== undefined || record?.is_highlight == true ? "red-input-field" : ""}
                />
            ),
        },
        {
            title: 'SGST ( % )',
            dataIndex: 'sgst',
            key: 'sgst',
            render: (text) => <span>{text.toFixed(2)}</span>,
        },
        {
            title: 'CGST ( % )',
            dataIndex: 'cgst',
            key: 'cgst',
            render: (text) => <span>{text.toFixed(2)}</span>,
        },
        {
            title: 'Total GST ( % )',
            dataIndex: 'totalGst',
            key: 'totalGst',
            render: (text) => <span>{text.toFixed(2)}</span>,
        },
    ];

    const { mutateAsync: createGeneralPurchase } = useMutation({
        mutationFn: async (data) => {
          const res = await createGeneralPurchaseEntryRequest({
            data,
            params: { company_id: companyId },
          });
          return res.data;
        },
        mutationKey: ["purchase/generalPurchase/create"],
        onSuccess: (res) => {
          queryClient.invalidateQueries([
            "purchase/generalPurchase/list",
            { company_id: companyId },
          ]);
          const successMessage = res?.message;
          if (successMessage) {
            message.success(successMessage);
          }
          navigate(-1);
        },
        onError: (error) => {
          mutationOnErrorHandler({ error, message });
        },
    });

    const onSubmit = async (values) => {

        is_millgine_bill && millgineOrderArray?.forEach((element, index) => {
            if (!getValues(`code_${index}`)) {
                setError(`code_${index}`, {
                    type: "manual",
                    message: "Please, Enter Code",
                });
                return
            }
            if (!getValues(`description_${index}`)) {
                setError(`description_${index}`, {
                    type: "manual",
                    message: "Please, Enter description",
                });
                return
            }
            if (!getValues(`hsn_code_${index}`)) {
                setError(`hsn_code_${index}`, {
                    type: "manual",
                    message: "Please, Enter HSN Code",
                });
                return
            }
            if (!getValues(`pis_${index}`)) {
                setError(`pis_${index}`, {
                    type: "manual",
                    message: "Please, Enter Pis",
                });
                return
            }
            if (!getValues(`quantity_${index}`)) {
                setError(`quantity_${index}`, {
                    type: "manual",
                    message: "Please, Enter Quantity",
                });
                return
            }
            if (!getValues(`rate_${index}`)) {
                setError(`rate_${index}`, {
                    type: "manual",
                    message: "Please, Enter Rate",
                });
                return
            }
            if (!getValues(`gst_${index}`)) {
                setError(`gst_${index}`, {
                    type: "manual",
                    message: "Please, Enter GST",
                });
                return
            }
        })

        if (!is_millgine_bill){
            if (totalAmount == 0){
                message.warning("Please, Provide GST details") ; 
                return
            }
        }

        let millginDetails = []; 
        let purchaseEntryDetails = [] ; 

        initialData?.map((element) => {
            purchaseEntryDetails.push(
                {
                    "class": element?.class,
                    "total": element?.total,
                    "discount": element?.discount,
                    "sgst": element?.sgst,
                    "cgst": element?.cgst,
                    "total_gst": element?.totalGst  
                }
            )
        })

        is_millgine_bill && millgineOrderArray?.map((element, index) => {

            let pics = getValues(`pis_${index}`);
            let quantity = getValues(`quantity_${index}`);
            let rate = getValues(`rate_${index}`)
            let amount = 0

            if (pics !== "" && pics != "0") {
                amount = Number(pics) * Number(rate);
            }

            if (quantity !== "" && quantity != "0") {
                amount = Number(quantity) * Number(rate);
            }

            millginDetails.push({
                "code": getValues(`code_${index}`),
                "description": getValues(`description_${index}`),
                "hsn_code": getValues(`hsn_code_${index}`),
                "pis": getValues(`pis_${index}`),
                "quantity": getValues(`quantity_${index}`),
                "rate": getValues(`rate_${index}`),
                "gst": getValues(`gst_${index}`),
                "amount": amount
            })
        })

        let requestPayload = {
            "supplier_id": values?.supplier_id,
            "invoice_no": values?.invoice_no,
            "head": values?.head,
            "sub_head": values?.sub_head,
            "createdAt": values?.createdAt,
            "due_date": values?.due_date,
            "remark": values?.remark == undefined?null:values?.remark,
            "is_millgine_bill": is_millgine_bill,
            "sub_total": totalAmount,
            "discount": totalDiscount,
            "sgst_payable": totalSGST,
            "cgst_payable": totalSGST,
            "tds_particular_type": "Sample TDS",
            "tds_percentable": values?.tds_percent,
            "round_off": roundOff,
            "grand_total": finalAmount,
            "after_tds_amount": afterTDSAmount,
            "is_passbook_added": values?.create_passbook_entry == "yes"?true:false,
            "main_total": totalAmount,
            "main_discount": totalDiscount,
            "main_sgst": totalSGST,
            "main_cgst": totalSGST,
            "main_gst":totalGST,
            "debit_note_date": dayjs(),
            "millgineDetails": millginDetails,
            "purchaseEntryDetails": purchaseEntryDetails
        }

        await createGeneralPurchase(requestPayload) ; z 


    }

    useEffect(() => {

        if (!is_millgine_bill) {
            setInitialData([
                {
                    key: '1',
                    class: 'GST 5 %',
                    total: 0,
                    discount: 0,
                    sgst: 0,
                    cgst: 0,
                    totalGst: 0,
                    gst_amount: 5
                },
                {
                    key: '2',
                    class: 'GST 12 %',
                    total: 0,
                    discount: 0,
                    sgst: 0,
                    cgst: 0,
                    totalGst: 0,
                    gst_amount: 12
                },
                {
                    key: '3',
                    class: 'GST 18 %',
                    total: 0,
                    discount: 0,
                    sgst: 0,
                    cgst: 0,
                    totalGst: 0,
                    gst_amount: 18
                },
                {
                    key: '4',
                    class: 'GST 28 %',
                    total: 0,
                    discount: 0,
                    sgst: 0,
                    cgst: 0,
                    totalGst: 0,
                    gst_amount: 28
                },
                {
                    key: '5',
                    class: 'Other',
                    total: 0,
                    discount: 0,
                    sgst: 0,
                    cgst: 0,
                    totalGst: 0,
                    gst_amount: 0
                },
            ])
        }
    }, [is_millgine_bill]); 

    const disableFutureDates = (current) => {
        return current && current > moment().endOf('day');
    };

    return (
        <div className="flex flex-col p-4">
            <div className="flex items-center gap-5">
                <GoBackButton />
                <h3 className="m-0 text-primary">Create New General Purchase Entry</h3>

                <Flex style={{ marginLeft: "auto" }} gap={10}>
                    <Checkbox
                        checked={isAddCashBillChecked}
                        onChange={handleAddCashBillChange}
                    >
                        Add cash bill
                    </Checkbox>

                    <Checkbox
                        checked={isAddOpeningCurrentBillsChecked}
                        onChange={handleAddOpeningCurrentBillsChange}
                    >
                        Add opening & current bills
                    </Checkbox>

                    <Checkbox
                        checked={isUpdateStockChecked}
                        onChange={handleUpdateStockChange}
                    >
                        Update Stock
                    </Checkbox>

                </Flex>

            </div>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>

                <Row gutter={24} style={{ padding: "12px", marginTop: "20px" }}>
                    <Col span={6} className="flex items-end gap-2">
                        <Form.Item
                            label="Supplier"
                            name="supplier_name"
                            validateStatus={errors.supplier_name ? "error" : ""}
                            help={errors.supplier_name && errors.supplier_name.message}
                            required={true}
                            wrapperCol={{ sm: 24 }}
                            className="flex-grow"
                        >
                            <Controller
                                control={control}
                                name="supplier_name"
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select supplier"
                                        loading={isLoadingDropdownSupplierList}
                                        options={dropdownSupplierListRes?.map((supervisor) => ({
                                            label: supervisor?.supplier_name,
                                            value: supervisor?.supplier_name,
                                        }))}
                                    />
                                )}
                            />
                        </Form.Item>
                        <Button
                            icon={<PlusCircleOutlined />}
                            onClick={goToAddSupplier}
                            className="flex-none mb-6"
                            type="primary"
                        />
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Supplier Company"
                            name="supplier_id"
                            validateStatus={errors.supplier_id ? "error" : ""}
                            help={errors.supplier_id && errors.supplier_id.message}
                            required={true}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="supplier_id"
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select supplier Company"
                                        loading={isLoadingDropdownSupplierList}
                                        options={supplierCompanyOptions}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Invoice No"
                            name="invoice_no"
                            validateStatus={errors.invoice_no ? "error" : ""}
                            help={errors.invoice_no && errors.invoice_no.message}
                            required={true}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="invoice_no"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="123"
                                        type="number"
                                        min={0}
                                        step={0.01}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Head"
                            name="head"
                            validateStatus={errors.head ? "error" : ""}
                            help={
                                errors.head &&
                                errors.head.message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="head"
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select Head Typeyy"
                                        allowClear
                                        options={[
                                            { label: "EXPENSS", value: "expenses" },
                                            { label: "FIXED ASSET", value: "fixed_asset" }
                                        ]}
                                        style={{
                                            textTransform: "capitalize",
                                        }}
                                        dropdownStyle={{
                                            textTransform: "capitalize",
                                        }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Sub Head"
                            name="sub_head"
                            validateStatus={errors.head ? "error" : ""}
                            help={
                                errors.sub_head &&
                                errors.sub_head.message
                            }
                            required={true}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="sub_head"
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        placeholder="Select Sub Head Type"
                                        allowClear
                                        options={head == "expenses" ? [
                                            { label: "Direct", value: "direct" },
                                            { label: "Indirect", value: "indirect" }
                                        ] : [
                                            { label: "Others", value: "other" }
                                        ]}
                                        style={{
                                            textTransform: "capitalize",
                                        }}
                                        dropdownStyle={{
                                            textTransform: "capitalize",
                                        }}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Invoice Date"
                            name="createdAt"
                            validateStatus={errors.createdAt ? "error" : ""}
                            help={errors.createdAt && errors.createdAt.message}
                            required={true}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="createdAt"
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        style={{
                                            width: "100%",
                                        }}
                                        format="DD/MM/YYYY"
                                        disabledDate={disableFutureDates}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Due Date"
                            name="due_date"
                            validateStatus={errors.due_date ? "error" : ""}
                            help={errors.due_date && errors.due_date.message}
                            required={true}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="due_date"
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        style={{
                                            width: "100%",
                                        }}
                                        format="DD/MM/YYYY"
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item
                            label="Remark"
                            name="remark"
                            validateStatus={errors.remark ? "error" : ""}
                            help={errors.remark && errors.remark.message}
                            wrapperCol={{ sm: 24 }}
                        >
                            <Controller
                                control={control}
                                name="remark"
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        placeholder="123"
                                        min={0}
                                        step={0.01}
                                    />
                                )}
                            />
                        </Form.Item>
                    </Col>

                    <Checkbox
                        style={{ marginBottom: 20 }}
                        checked={is_millgine_bill}
                        onChange={(e) => { set_is_millgine_bill(e.target.checked) }}
                    >
                        Add Millgine Bill with Material details
                    </Checkbox>

                </Row>

                <Divider style={{ marginTop: 0 }} />

                {millgineOrderArray?.length && is_millgine_bill ?
                    millgineOrderArray?.map((field, index) => {
                        return (
                            <>
                                <Row
                                    key={field + "_millgine"}
                                    gutter={18}
                                    style={{
                                        padding: "12px",
                                    }}
                                >
                                    <Col span={2}>
                                        <Flex style={{ justifyContent: "center", alignItems: "center", height: "100%" }}>
                                            <div style={{ marginTop: "auto", marginBottom: "auto" }}>
                                                <strong>{index + 1}</strong>
                                            </div>
                                        </Flex>
                                    </Col>

                                    <Col span={2}>
                                        <Form.Item
                                            label={"Code"}
                                            name={`code_${index}`}
                                            validateStatus={
                                                errors[`code_${index}`]
                                                    ? "error"
                                                    : ""
                                            }
                                            required={true}
                                            help={
                                                errors[`code_${index}`] &&
                                                errors[`code_${index}`].message
                                            }
                                            wrapperCol={{ sm: 24 }}
                                        >
                                            <Controller
                                                control={control}
                                                name={`code_${index}`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Code"
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={3}>
                                        <Form.Item
                                            label={"Description"}
                                            name={`description_${index}`}
                                            validateStatus={
                                                errors[`description_${index}`]
                                                    ? "error"
                                                    : ""
                                            }
                                            required={true}
                                            help={
                                                errors[`description_${index}`] &&
                                                errors[`description_${index}`].message
                                            }
                                            wrapperCol={{ sm: 24 }}
                                        >
                                            <Controller
                                                control={control}
                                                name={`description_${index}`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Description"
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={3}>
                                        <Form.Item
                                            label={"HSN Code"}
                                            name={`hsn_code_${index}`}
                                            validateStatus={
                                                errors[`hsn_code_${index}`]
                                                    ? "error"
                                                    : ""
                                            }
                                            required={true}
                                            help={
                                                errors[`hsn_code_${index}`] &&
                                                errors[`hsn_code_${index}`].message
                                            }
                                            wrapperCol={{ sm: 24 }}
                                        >
                                            <Controller
                                                control={control}
                                                name={`hsn_code_${index}`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="HSN Code"
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={3}>
                                        <Form.Item
                                            label={"PCS"}
                                            name={`pis_${index}`}
                                            validateStatus={
                                                errors[`pis_${index}`]
                                                    ? "error"
                                                    : ""
                                            }
                                            required={true}
                                            help={
                                                errors[`pis_${index}`] &&
                                                errors[`pis_${index}`].message
                                            }
                                            wrapperCol={{ sm: 24 }}
                                        >
                                            <Controller
                                                control={control}
                                                name={`pis_${index}`}
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        placeholder="Pis"
                                                        onChange={(e) => {
                                                            let rateInfo = getValues(`rate_${index}`);
                                                            if (rateInfo == "" || rateInfo == undefined) {
                                                                rateInfo = 0;
                                                            }
                                                            let pics = Number(e?.target?.value);
                                                            let totalAmount = rateInfo * pics;
                                                            setValue(`amount_${index}`, totalAmount);
                                                            setValue(`quantity_${index}`, "0");
                                                            setValue(`pis_${index}`, e.target.value);

                                                            CalculateGstTotalAmount();
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={3}>
                                        <Form.Item
                                            label={"Quantity"}
                                            name={`quantity_${index}`}
                                            validateStatus={
                                                errors[`quantity_${index}`]
                                                    ? "error"
                                                    : ""
                                            }
                                            required={true}
                                            help={
                                                errors[`quantity_${index}`] &&
                                                errors[`quantity_${index}`].message
                                            }
                                            wrapperCol={{ sm: 24 }}
                                        >
                                            <Controller
                                                // disabled = {getValues(`pis_${index}`) != undefined?true:false}
                                                control={control}
                                                name={`quantity_${index}`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        onChange={(e) => {
                                                            let rateInfo = getValues(`rate_${index}`);
                                                            if (rateInfo == "" || rateInfo == undefined) {
                                                                rateInfo = 0;
                                                            }
                                                            let pics = Number(e?.target?.value);
                                                            let totalAmount = rateInfo * pics;

                                                            setValue(`amount_${index}`, totalAmount);
                                                            setValue(`pis_${index}`, "0");
                                                            setValue(`quantity_${index}`, e.target.value);

                                                            CalculateGstTotalAmount();
                                                        }}
                                                        placeholder="Quantity"
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={2}>
                                        <Form.Item
                                            label={"Rate"}
                                            name={`rate_${index}`}
                                            validateStatus={
                                                errors[`rate_${index}`]
                                                    ? "error"
                                                    : ""
                                            }
                                            required={true}
                                            help={
                                                errors[`rate_${index}`] &&
                                                errors[`rate_${index}`].message
                                            }
                                            wrapperCol={{ sm: 24 }}
                                        >
                                            <Controller
                                                control={control}
                                                name={`rate_${index}`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Rate"
                                                        onChange={(e) => {

                                                            let pics = getValues(`pis_${index}`);
                                                            let quantity = getValues(`quantity_${index}`);

                                                            if (pics !== "" && pics != "0") {
                                                                let amount = Number(pics) * Number(e?.target?.value);
                                                                setValue(`amount_${index}`, amount);
                                                            }

                                                            if (quantity !== "" && quantity != "0") {
                                                                let amount = Number(quantity) * Number(e.target.value);
                                                                setValue(`amount_${index}`, amount);
                                                            }


                                                            setValue(`rate_${index}`, e.target?.value);
                                                            CalculateGstTotalAmount();
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    {/* Gst amount calculation  */}
                                    <Col span={3}>
                                        <Form.Item
                                            label={"GST"}
                                            name={`gst_${index}`}
                                            validateStatus={
                                                errors[`gst_${index}`]
                                                    ? "error"
                                                    : ""
                                            }
                                            required={true}
                                            help={
                                                errors[`gst_${index}`] &&
                                                errors[`gst_${index}`].message
                                            }
                                            wrapperCol={{ sm: 24 }}
                                        >
                                            <Controller
                                                control={control}
                                                name={`gst_${index}`}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        placeholder="Gst"
                                                        onChange={(e) => {
                                                            let pics = getValues(`pis_${index}`);
                                                            let quantity = getValues(`quantity_${index}`);
                                                            let rate = getValues(`rate_${index}`);

                                                            if (pics !== "" && pics !== "0") {
                                                                let amount = Number(pics) * Number(rate);
                                                                setValue(`amount_${index}`, amount);
                                                            }

                                                            if (quantity !== "" && quantity !== "0") {
                                                                let amount = Number(quantity) * Number(rate);
                                                                setValue(`amount_${index}`, amount);
                                                            }


                                                            setValue(`gst_${index}`, e.target?.value);
                                                            CalculateGstTotalAmount();
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    <Col span={2}>
                                        <Form.Item

                                            label={"Amount"}
                                            name={`amount_${index}`}
                                            validateStatus={
                                                errors[`amount_${index}`]
                                                    ? "error"
                                                    : ""
                                            }
                                            required={true}
                                            help={
                                                errors[`amount_${index}`] &&
                                                errors[`amount_${index}`].message
                                            }
                                            wrapperCol={{ sm: 24 }}
                                        >
                                            <Controller
                                                disabled
                                                control={control}
                                                name={`amount_${index}`}
                                                render={({ field }) => (
                                                    <Input
                                                        disabled
                                                        {...field}
                                                        placeholder="Amount"
                                                    />
                                                )}
                                            />
                                        </Form.Item>
                                    </Col>

                                    {index === millgineOrderArray.length - 1 && (
                                        <Col span={1}>
                                            <Button
                                                style={{ marginTop: "1.9rem" }}
                                                icon={<PlusOutlined />}
                                                type="primary"
                                                onClick={AddMillgineRow.bind(null, index)}
                                                className="flex-none"
                                            />
                                        </Col>
                                    )}
                                </Row>
                            </>
                        )
                    })
                : null}

                {is_millgine_bill && (
                    <Row gutter={18} style={{paddingBottom: 10}}>
                        <Col span={2}><strong>Total</strong></Col>
                        <Col span={2}></Col>
                        <Col span={3}></Col>
                        <Col span={3}></Col>
                        <Col span={3}><strong>{totalPics}</strong></Col>
                        <Col span={3}><strong>{totalQuantity}</strong></Col>
                        <Col span={2}></Col>
                        <Col span={3}></Col>
                        <Col span={2}><strong>{miligineTotalAmount}</strong></Col>
                    </Row>
                )}

                <Divider style={{ marginTop: 0 }} />

                {}

                <Flex gap={20} >

                    <div style={{ width: "70%" }}>
                        <Table
                            columns={columns}
                            dataSource={initialData}
                            pagination={false}
                            summary={() => (
                                <Table.Summary.Row>
                                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}>
                                        {totalAmount.toFixed(2)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={2}>
                                        {totalDiscount.toFixed(2)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={3}>
                                        {totalSGST.toFixed(2)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={4}>
                                        {totalCGST.toFixed(2)}
                                    </Table.Summary.Cell>
                                    <Table.Summary.Cell index={5}>
                                        {totalGST.toFixed(2)}
                                    </Table.Summary.Cell>
                                </Table.Summary.Row>
                            )}
                        />
                    </div>

                    <div style={{ width: "30%", marginLeft: 10 }}>
                        <Col span={24}>

                            <Descriptions>
                                <Descriptions.Item className="purchase-bill-description" label="Sub total">{totalAmount}</Descriptions.Item>
                            </Descriptions>

                            <Descriptions>
                                <Descriptions.Item className="purchase-bill-description highlight-text" label="Discount">{totalDiscount}</Descriptions.Item>
                            </Descriptions>

                            <Descriptions>
                                <Descriptions.Item className="purchase-bill-description" label="SGST Payable (% )">{totalSGST}</Descriptions.Item>
                            </Descriptions>

                            <Descriptions>
                                <Descriptions.Item className="purchase-bill-description" label="CGST Payable (% )">{totalSGST}</Descriptions.Item>
                            </Descriptions>

                        </Col>

                        <Divider style={{ marginTop: 10 }} />


                        <Row gutter={18}>
                            
                            <Col span={24}>

                                <Form.Item 
                                    label="TDS %" 
                                    name="tds_percent"
                                    validateStatus = {errors?.tds_percent?"error":""}
                                    help = {errors?.tds_percent && errors?.tds_percent?.message}
                                    required = {true}
                                    wrapperCol={{sm: 24}}
                                >
                                    <Controller
                                        control={control}
                                        name="tds_percent"
                                        render={({ field }) => (
                                            <Input {...field}
                                                placeholder="0.00"
                                                onChange={(e) => {

                                                    let tds_amount = e.target.value;
                                                    let final_amount = finalAmount;

                                                    let after_tds_amount = Number(final_amount) * Number(tds_amount) / 100;
                                                    after_tds_amount = final_amount - after_tds_amount;
                                                    setAfterTDSAmount(after_tds_amount);
                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            
                            </Col>
                        
                        </Row>

                        <Col span={24}>

                            <Descriptions>
                                <Descriptions.Item className="purchase-bill-description" label="Round Off">
                                    {roundOff}
                                </Descriptions.Item>
                            </Descriptions>
                        
                            <Descriptions>
                                <Descriptions.Item className="purchase-bill-description finalamount-text" label="Grand total">{finalAmount}</Descriptions.Item>
                            </Descriptions>
                        
                            <Descriptions>
                                <Descriptions.Item className="purchase-bill-description" label="After TDS amount">{afterTDSAmount}</Descriptions.Item>
                            </Descriptions>
                        
                            <Descriptions>
                                <Descriptions.Item className="purchase-bill-description highlight-text" label="Discount">{totalSGST}</Descriptions.Item>
                            </Descriptions>
                        
                        </Col>

                        <Row>
                            <Col span={24}>
                                <Form.Item label="Final Amount" name="final_amount">
                                    <Controller
                                        control={control}
                                        name="final_amount"
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                onChange={(e) => {
                                                    setValue("final_amount", e.target.value);

                                                }}
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item 
                                    label="Do you want to create Entry in Passbook Statement?"
                                    name = "create_passbook_entry"
                                >
                                    <Controller
                                        control={control}
                                        name="create_passbook_entry"
                                        render={({ field }) => (
                                            <Radio.Group {...field} defaultValue={"yes"}>
                                                <Radio value="yes">Yes</Radio>
                                                <Radio value="no">No</Radio>
                                            </Radio.Group>
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24} style={{ textAlign: 'left' }}>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                                {/* <Button type="danger" style={{ marginLeft: '10px' }} onClick={resetForm}>
              Reset
            </Button> */}
                            </Col>
                        </Row>
                    </div>
                </Flex>

            </Form>
        </div>
    )
}

export default AddGeneralPurchaseEntry; 