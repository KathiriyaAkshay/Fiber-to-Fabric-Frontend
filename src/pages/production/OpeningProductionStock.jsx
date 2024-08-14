import { Button, Flex, Form, Select, Input, Typography, Table } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import { getCompanyMachineListRequest } from "../../api/requests/machine";
import useDebounce from "../../hooks/useDebounce";
import { Controller, useForm } from "react-hook-form";
import { getInHouseQualityListRequest } from "../../api/requests/qualityMaster";

const OpeningProductionStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { companyId } = useContext(GlobalContext);
  const [tableData, setTableData] = useState([]);
  const [machine, setMachine] = useState(null);
  const debouncedMachine = useDebounce(machine, 500);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {},
  });

  // Load machine dropdown list
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

  // Load inhouse quality dropdown list request
  const { data: inHouseQualityList, isLoading: isLoadingInHouseQualityList } =
    useQuery({
      queryKey: [
        "inhouse-quality",
        "list",
        {
          company_id: companyId,
          machine_name: debouncedMachine,
          page: 0,
          pageSize: 9999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        if (debouncedMachine) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              machine_name: debouncedMachine,
              page: 0,
              pageSize: 9999,
              is_active: 1,
            },
          });
          return res.data?.data;
        }
      },
      enabled: Boolean(companyId && debouncedMachine),
    });

  useEffect(() => {
    let temp = [];
    inHouseQualityList?.rows?.map((element, index) => {
      console.log("Run this function");

      temp.push({
        id: index + 1,
        quality_name: `${element?.quality_name} - (${element?.quality_weight})`,
      });
    });
    setTableData(temp);
  }, [inHouseQualityList, isLoadingInHouseQualityList]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Quality Name",
      dataIndex: "quality_name",
    },
    {
      title: "Total Taka",
      dataIndex: "total_taka",
      render: (text, record) => {
        return (
          <Form.Item
            // label="Taka"
            name="taka"
            validateStatus={errors.taka ? "error" : ""}
            help={errors.taka && errors.taka.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="taka"
              render={({ field }) => (
                <Input type="number" {...field} placeholder="12" />
              )}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Total Meter",
      dataIndex: "total_meter",
      render: (text, record) => {
        return (
          <Form.Item
            // label="Taka"
            name="taka"
            validateStatus={errors.taka ? "error" : ""}
            help={errors.taka && errors.taka.message}
            required={true}
            wrapperCol={{ sm: 24 }}
          >
            <Controller
              control={control}
              name="taka"
              render={({ field }) => (
                <Input type="number" {...field} placeholder="12" />
              )}
            />
          </Form.Item>
        );
      },
    },
    {
      title: "Sold Taka",
      dataIndex: "sold_taka",
    },
    {
      title: "Sold Meter",
      dataIndex: "sold_meter",
    },
    {
      title: "Pending Taka",
      dataIndex: "pending_taka",
    },
    {
      title: "Pending Meter",
      dataIndex: "pending_meter",
    },
  ];

  function renderTable() {
    return (
      <Table
        dataSource={tableData}
        columns={columns}
        rowKey={"id"}
        pagination={false}
      />
    );
  }

  return (
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
            <Button type="primary">Save</Button>
          </Flex>
        </div>
      </div>

      {renderTable()}
    </div>
  );
};

export default OpeningProductionStock;
