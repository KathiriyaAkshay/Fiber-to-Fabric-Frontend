import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Table, Select, Flex, Typography, Spin, message } from "antd";
import { useContext, useMemo, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  calculateEmiRequest,
  deleteEmiRequest,
  getCalculateEmiListRequest,
} from "../../../../api/requests/accounts/emi";
import dayjs from "dayjs";

const EmiList = () => {
  const navigate = useNavigate();
  const { companyListRes } = useContext(GlobalContext);

  const [companyId, setCompanyId] = useState(null);
  const [accountNumber, setAccountNumber] = useState(null);
  // const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();

  const { data: accountNumberList } = useQuery({
    queryKey: [
      "get",
      "calculate-emi",
      "list",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const params = {
        company_id: companyId,
      };
      const response = await getCalculateEmiListRequest({ params });
      return response.data.data;
    },
    enabled: Boolean(companyId),
  });

  const accountNumberOptions = useMemo(() => {
    if (accountNumberList && accountNumberList.length) {
      return accountNumberList.map((item) => {
        return { label: item.account_number, value: item.id };
      });
    }
  }, [accountNumberList]);

  const { data: calculatedData, isLoading } = useQuery({
    queryKey: [
      "get",
      "calculate-data",
      {
        account_number: accountNumber,
      },
    ],
    queryFn: async () => {
      const data = accountNumberList.find(({ id }) => id === accountNumber);
      const params = {
        company_id: companyId,
        pendingEMIs: data.pendingEMIs,
        loanAmount: data.loanAmount,
        emiRate: data.emiRate,
        dueDate: dayjs(data.dueDate).format("DD-MM-YYYY"),
        totalEMIs: data.totalEMIs,
        account_number: data.account_number,
      };
      const response = await calculateEmiRequest({ params });
      return response.data.data;
    },
    initialData: [],
    enabled: Boolean(accountNumber),
  });

  const navigateToAdd = () => {
    navigate("add");
  };

  const columns = [
    {
      title: "Pending Emi",
      dataIndex: "pendingEMI",
      key: "pendingEMI",
    },
    {
      title: "Emi Date",
      dataIndex: "emiDate",
      key: "emiDate",
      render: (text) => text || "-",
    },
    {
      title: "Emi Amount",
      dataIndex: "emiAmount",
      key: "emiAmount",
      render: (text) => text || "-",
    },
    {
      title: "Principal Amount",
      dataIndex: "principalAmount",
      key: "principalAmount",
      render: (text) => text || "-",
    },
    {
      title: "Interest Amount",
      dataIndex: "interestAmount",
      key: "interestAmount",
      render: (text) => text || "-",
    },
    {
      title: "Principal Balance",
      dataIndex: "principalBalance",
      key: "principalBalance",
      render: (text) => text || "-",
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
        dataSource={calculatedData || []}
        columns={columns}
        rowKey={"id"}
        scroll={{ y: 330 }}
        pagination={false}
      />
    );
  }

  const { mutateAsync: deleteEmiEntry, isPending: isPendingDeleteEmi } =
    useMutation({
      mutationKey: ["delete", "emi", { accountNumber }],
      mutationFn: async ({ id }) => {
        const res = await deleteEmiRequest({
          id,
          params: {
            company_id: companyId,
          },
        });
        return res.data;
      },
      onSuccess: (res) => {
        message.success(res.message);
        setCompanyId(null);
        setAccountNumber(null);
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || error.message;
        message.error(errorMessage);
      },
    });

  const deleteEmiHandler = async () => {
    await deleteEmiEntry({ id: accountNumber });
  };

  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">EMI Calculate</h3>
            <Button
              onClick={navigateToAdd}
              icon={<PlusCircleOutlined />}
              type="text"
            />
          </div>
          <Flex align="center" justify="flex-end" gap={10}>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Company
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select company"
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                options={
                  companyListRes &&
                  companyListRes?.rows?.map((company) => {
                    return { label: company.company_name, value: company.id };
                  })
                }
                value={companyId}
                onChange={(value) => setCompanyId(value)}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Typography.Text className="whitespace-nowrap">
                Loan A/C No.
              </Typography.Text>
              <Select
                allowClear
                placeholder="Select Loan A/C No."
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
                style={{
                  textTransform: "capitalize",
                }}
                className="min-w-40"
                options={accountNumberOptions || []}
                value={accountNumber}
                onChange={setAccountNumber}
              />
            </Flex>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={deleteEmiHandler}
              loading={isPendingDeleteEmi}
              className="flex-none"
              disabled={!calculatedData.length}
            />
          </Flex>
        </div>
        {renderTable()}
      </div>
    </>
  );
};

export default EmiList;
