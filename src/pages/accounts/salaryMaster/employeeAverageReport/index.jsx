import { Button, DatePicker, Flex, Select } from "antd";
import dayjs from "dayjs";
import { useContext, useMemo, useState } from "react";
import { disabledFutureDate } from "../../../../utils/date";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import { useQuery } from "@tanstack/react-query";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import MachineNoWiseTable from "./machineNoWiseTable";
import { SearchOutlined } from "@ant-design/icons";
import EmployeeWiseTable from "./employeeWiseTable";
import { getEmployeeListRequest } from "../../../../api/requests/users";

const EmployeeAverageReport = () => {
  const { companyId } = useContext(GlobalContext);

  const [machineName, setMachineName] = useState(null);
  const [machineNo, setMachineNo] = useState(null);
  const [employee, setEmployee] = useState([]);
  const [month, setMonth] = useState(dayjs());
  const [clickedAction, setClickedAction] = useState(null);

  // Load machine name dropdown list
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

  const { data: employeeListRes, isLoading: isLoadingEmployeeList } = useQuery({
    queryKey: [
      "employee/list",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const res = await getEmployeeListRequest({
        params: {
          company_id: companyId,
          salary_type: "Work basis",
        },
      });
      return res.data?.data?.empoloyeeList;
    },
    enabled: Boolean(companyId),
  });

  const machineNoOption = useMemo(() => {
    if (machineName) {
      const selectedMachine = machineListRes?.rows?.find(
        (machine) => machine?.machine_name === machineName
      );
      return Array.from({ length: selectedMachine?.no_of_machines }).map(
        (_, index) => index + 1
      );
    } else {
      return [];
    }
  }, [machineListRes?.rows, machineName]);

  const renderTable = useMemo(() => {
    if (machineNo && clickedAction === "machine") {
      return (
        <MachineNoWiseTable
          key={"machine_no_table"}
          month={month}
          machineNo={machineNo}
          machineName={machineName}
        />
      );
    } else if (
      employee &&
      employee.length > 0 &&
      clickedAction === "employee"
    ) {
      return (
        <EmployeeWiseTable
          key={"employee_table"}
          month={month}
          employee={employee}
          machineName={machineName}
        />
      );
    } else {
      return (
        <Flex style={{ flexDirection: "column" }} align="center">
          <h3>Please select appropriate data or filters from above</h3>
          <i>
            Please select machine name, machine no, employee, and month to view
            the report.
          </i>
        </Flex>
      );
    }
  }, [clickedAction, employee, machineName, machineNo, month]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Employee Average Report</h3>
        </div>
        <Flex align="center" justify="space-between">
          <Flex gap={12}>
            <Flex align="center" gap={10}>
              <DatePicker
                picker="month"
                value={month}
                onChange={setMonth}
                disabledDate={disabledFutureDate}
                maxDate={dayjs()}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Select
                allowClear
                placeholder="Select Machine Name"
                value={machineName}
                onChange={setMachineName}
                loading={isLoadingMachineList}
                options={machineListRes?.rows?.map((machine) => ({
                  label: machine?.machine_name,
                  value: machine?.machine_name,
                }))}
                style={{
                  textTransform: "capitalize",
                  minWidth: "180px",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Select
                allowClear
                placeholder="Select Machine No"
                value={machineNo}
                onChange={setMachineNo}
                options={machineNoOption.map((item) => ({
                  label: item,
                  value: item,
                }))}
                style={{
                  textTransform: "capitalize",
                  minWidth: "180px",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setClickedAction("machine")}
              />
            </Flex>
            <Flex align="center" gap={10}>
              <Select
                allowClear
                placeholder="Select Employee"
                mode="multiple"
                value={employee}
                onChange={setEmployee}
                loading={isLoadingEmployeeList}
                options={employeeListRes?.rows?.map(
                  ({ id = 0, first_name = "" }) => ({
                    label: first_name,
                    value: id,
                  })
                )}
                style={{
                  textTransform: "capitalize",
                  minWidth: "180px",
                }}
                dropdownStyle={{
                  textTransform: "capitalize",
                }}
              />
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={() => setClickedAction("employee")}
              />
            </Flex>
          </Flex>
        </Flex>
      </div>

      {renderTable}
    </div>
  );
};

export default EmployeeAverageReport;
