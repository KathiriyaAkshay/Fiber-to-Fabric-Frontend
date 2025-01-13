import {
  Button,
  Flex,
  Form,
  Select,
  Input,
  Typography,
  message,
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import { Controller, useForm } from "react-hook-form";
import {
  addOpeningProductionStockRequest,
  getOpeningProductionStockListRequest,
} from "../../api/requests/production/openingProduction";
import _ from "lodash";

const OpeningProductionStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);

  const [machine, setMachine] = useState(null);
  const [numOfField, setNumOfField] = useState(null);

  // Message provider ===========================================
  const [messageApi, contextHolder] = message.useMessage();

  // Opening Production related handler ==========================
  const { mutateAsync: addNewOpeningProductionStock, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await addOpeningProductionStockRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["add", "opening", "production", "stock"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "opening-production-stock",
        "list",
        { company_id: companyId, machine_name: machine },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        messageApi.success("Opening production stocked updated successfully");
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = (data) => {
    const array = Array.from({ length: numOfField });
    let hasError = false; 
    
    array?.map((_, index) => {
      if ((data[`taka_${index}`] == "")){
        hasError = true;  
        messageApi.warning("Please enter taka number") ; 
        return ; 
      }

      if ((data[`meter_${index}`] == "")){
        hasError = true ; 
        messageApi.warning("Please enter meter information") ; 
        return ; 
      }
    })

    const payload = array.map((_, index) => {
      return {
        quality_id: data[`quality_id_${index}`],
        total_taka: data[`taka_${index}`],
        total_meter: data[`meter_${index}`],
        machine_name: machine,
      };
    });

    if (!hasError){
      addNewOpeningProductionStock(payload);
    } 
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {},
  });

  // Load machine dropdown list dropdown api ====================================
  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  // Load machine dropdown list api =======================================
  const { data: openingProductionStockList, isLoading } = useQuery({
    queryKey: [
      "opening-production-stock",
      "list",
      { company_id: companyId, machine_name: machine },
    ],
    queryFn: async () => {
      const res = await getOpeningProductionStockListRequest({
        params: { company_id: companyId, machine_name: machine },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId && machine),
  });

  useEffect(() => {
    if (!_.isEmpty(openingProductionStockList)) {
      setNumOfField(openingProductionStockList.length);
    } else {
      setNumOfField(null);
    }
  }, [openingProductionStockList]);

  return (
    <>
      {contextHolder}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-5">
            <Button onClick={() => navigate(-1)}>
              <ArrowLeftOutlined />
            </Button>
            <h3 className="m-0 text-primary">Opening Production Stock</h3>
          </div>
          <div className="flex items-center justify-end gap-5 mx-3 mb-3">
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Machine
              </Typography.Text>
              <Select
                placeholder="Select Machine"
                loading={isLoadingMachineList}
                value={machine}
                options={machineListRes?.rows?.map((machine) => ({
                  label: machine?.machine_name,
                  value: machine?.machine_name,
                }))}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                onChange={setMachine}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                allowClear
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Button
                type="primary"
                onClick={handleSubmit(onSubmit)}
                loading={isPending}
              >
                Save
              </Button>
            </Flex>
          </div>
        </div>

        {/* {renderTable()} */}
        {isLoading ? (
          <Flex justify="center">
            <Spin />
          </Flex>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>No.</th>
                <th style={{ minWidth: "250px" }}>Quality Name</th>
                <th>Total Taka</th>
                <th>Total Meter</th>
                <th>Sold Taka</th>
                <th>Sold Meter</th>
                <th>Pending Taka</th>
                <th>Pending Meter</th>
              </tr>
            </thead>
            <tbody>
              {openingProductionStockList && openingProductionStockList.length ? (
                openingProductionStockList.map((row, index) => {
                  return (
                    <TableRow
                      key={index}
                      index={index}
                      row={row}
                      errors={errors}
                      control={control}
                      setValue={setValue}
                    />
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default OpeningProductionStock;

const TableRow = ({ index, row, errors, control, setValue }) => {
  useEffect(() => {
    if (row) {
      setValue(`quality_id_${index}`, row?.id);
      setValue(`taka_${index}`, row?.opening_production_stock?.total_taka || 0);
      setValue(
        `meter_${index}`,
        row?.opening_production_stock?.total_meter || 0
      );
      setValue(
        `sold_taka_${index}`,
        row?.opening_production_stock?.sold_taka || 0
      );
      setValue(
        `sold_meter_${index}`,
        row?.opening_production_stock?.sold_meter || 0
      );

      const pendingTaka =
        (row?.opening_production_stock?.total_taka || 0) -
        (row?.opening_production_stock?.sold_taka || 0);

      const pendingMeter =
        (row?.opening_production_stock?.total_meter || 0) -
        (row?.opening_production_stock?.sold_meter || 0);

      setValue(`pending_taka_${index}`, pendingTaka);
      setValue(`pending_meter_${index}`, pendingMeter);
    }
  }, [index, row, setValue]);

  const calculatePendingTaka = (e) => {
    const totalTaka = +e.target.value;
    const pendingTaka =
      totalTaka - (row?.opening_production_stock?.sold_taka || 0);
    setValue(`pending_taka_${index}`, pendingTaka);
  };

  const calculatePendingMeter = (e) => {
    const totalMeter = +e.target.value;
    const pendingMeter =
      totalMeter - (row?.opening_production_stock?.sold_meter || 0);
    setValue(`pending_meter_${index}`, pendingMeter);
  };

  return (
    <tr>
      <td style={{
        textAlign: "center"
      }}>{index + 1}</td>
      <td>
        <div style={{
          fontSize: 14, 
          paddingLeft: 5,
          paddingRight: 5,
          paddingTop: 4,
          paddingBottom: 4, 
          fontWeight: 450
        }}>
          {`${row.quality_name} (${row?.design_no}) -${row.quality_weight}KG`}
        </div>
      </td>
      <td>
        <Form.Item
          name={`taka_${index}`}
          validateStatus={errors[`taka_${index}`] ? "error" : ""}
          help={errors[`taka_${index}`] && errors[`taka_${index}`].message}
          required={true}
          wrapperCol={{ sm: 24 }}
          style={{ margin: 0 }}
        >
          <Controller
            control={control}
            name={`taka_${index}`}
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                placeholder="12"
                onChange={(e) => {
                  field.onChange(e);
                  calculatePendingTaka(e);
                }}
              />
            )}
          />
        </Form.Item>
      </td>
      <td>
        <Form.Item
          name={`meter_${index}`}
          validateStatus={errors[`meter_${index}`] ? "error" : ""}
          help={errors[`meter_${index}`] && errors[`meter_${index}`].message}
          required={true}
          wrapperCol={{ sm: 24 }}
          style={{ margin: 0 }}
        >
          <Controller
            control={control}
            name={`meter_${index}`}
            render={({ field }) => (
              <Input
                type="number"
                {...field}
                placeholder="12"
                onChange={(e) => {
                  field.onChange(e);
                  calculatePendingMeter(e);
                }}
              />
            )}
          />
        </Form.Item>
      </td>
      <td>
        <Controller
          control={control}
          name={`sold_taka_${index}`}
          render={({ field }) => (
            <Input {...field} className="remove-input-box" readOnly />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`sold_meter_${index}`}
          render={({ field }) => (
            <Input {...field} className="remove-input-box" readOnly />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`pending_taka_${index}`}
          render={({ field }) => (
            <Input {...field} className="remove-input-box" readOnly />
          )}
        />
      </td>
      <td>
        <Controller
          control={control}
          name={`pending_meter_${index}`}
          render={({ field }) => (
            <Input {...field} className="remove-input-box" readOnly />
          )}
        />

        <Controller
          control={control}
          name={`quality_id_${index}`}
          render={({ field }) => (
            <Input
              {...field}
              type="hidden"
              className="remove-input-box"
              readOnly
            />
          )}
        />
      </td>
    </tr>
  );
};
