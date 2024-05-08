import {
  Button,
  Flex,
  Input,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Typography,
  message,
} from "antd";
import {
  EditOutlined,
  FilePdfOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../api/hooks/auth";
import { downloadUserPdf, getPDFTitleContent } from "../../lib/pdf/userPdf";
// import dayjs from "dayjs";
// import ViewDetailModal from "../../../components/common/modal/ViewDetailModal";
import { usePagination } from "../../hooks/usePagination";
import { useContext, useState } from "react";
import { GlobalContext } from "../../contexts/GlobalContext";
import useDebounce from "../../hooks/useDebounce";
import {
  getTradingQualityListRequest,
  updateTradingQualityRequest,
} from "../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../api/requests/machine";

const GatePassList = () => {
  const [search, setSearch] = useState();
  const [machine, setMachine] = useState();
  // const [status, setStatus] = useState(1);
  const debouncedSearch = useDebounce(search, 500);
  const debouncedMachine = useDebounce(machine, 500);
  // const debouncedStatus = useDebounce(status, 500);
  const { company, companyId } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { page, pageSize, onPageChange, onShowSizeChange } = usePagination();
  const { data: user } = useCurrentUser();

  function navigateToAdd() {
    navigate("/gate-pass/add");
  }

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-primary">Gate Pass List</h3>
          <Button
            onClick={navigateToAdd}
            icon={<PlusCircleOutlined />}
            type="text"
          />
        </div>

        {/* <Flex align="center" gap={10}>
          <Flex align="center" gap={10}>
            <Typography.Text className="whitespace-nowrap">
              Machine
            </Typography.Text>
            <Select
              allowClear
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
            />
          </Flex>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            icon={<FilePdfOutlined />}
            type="primary"
            disabled={!tradingQualityList?.row?.length}
            onClick={downloadPdf}
            className="flex-none"
          />
        </Flex> */}
      </div>
      {/* {renderTable()} */}
    </div>
  );
};

export default GatePassList;
