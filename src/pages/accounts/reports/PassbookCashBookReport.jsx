import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPassbookCashbookReportService } from "../../../api/requests/accounts/reports";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { Spin } from "antd";
import dayjs from "dayjs";

const PassbookCashBookReport = () => {
  const { companyId } = useContext(GlobalContext);

  const { data: passbookCashBookData, isLoading } = useQuery({
    queryKey: ["get", "passbook-cashbook-report", { company_id: companyId }],
    queryFn: async () => {
      const res = await getPassbookCashbookReportService({
        params: {
          company_id: companyId,
        },
      });
      return res?.data?.data;
    },
    enabled: !!companyId,
  });

  const getOpeningReportData = (companyId) => {
    if (
      passbookCashBookData &&
      passbookCashBookData?.cashbook_opening_report?.length
    ) {
      const data = passbookCashBookData?.cashbook_opening_report?.filter(
        ({ company_id }) => company_id === companyId
      );
      return data;
    }
  };

  let totalCCOD = 0;
  let totalBL = 0;
  let totalCBBL = 0;

  return (
    <>
      <div className="flex flex-col p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Passbook/Cashbook Balance</h3>
          </div>
        </div>

        {isLoading ? (
          <Spin />
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Date</th>
                <th style={{ textAlign: "left" }}>Bank Name</th>
                <th style={{ textAlign: "left" }}>Entry</th>
                <th style={{ textAlign: "left" }}>CC/OD</th>
                <th style={{ textAlign: "left" }}>B/L</th>
                <th style={{ textAlign: "left" }}>CB B/L</th>
              </tr>
            </thead>
            <tbody>
              {passbookCashBookData?.cashbook_audit_report?.map(
                (item, index) => {
                  if (!item) return;

                  const openingReportData = getOpeningReportData(
                    item?.company_id
                  );
                  totalCBBL += item?.balance || 0;

                  return (
                    <>
                      {/* Company row 👇 */}
                      <tr
                        key={index + "_cashbook_audit_report"}
                        style={{ backgroundColor: "var(--secondary-color)" }}
                      >
                        <td colSpan={5}>
                          {item?.company?.company_name || "-"}
                        </td>
                        <td>{item?.balance || "-"}</td>
                      </tr>

                      {/* Company opening reports rows 👇 */}
                      {openingReportData?.map((record, index2) => {
                        totalBL += record?.balance || 0;
                        totalCCOD += record?.opening_balance_audit?.limit || 0;
                        return (
                          <tr key={index2 + "_opening_record"}>
                            <td>
                              {dayjs(
                                record?.opening_balance_audit?.createdAt
                              ).format("DD-MM-YYYY")}
                            </td>
                            <td>{record?.bank_name}</td>
                            <td>
                              {record?.opening_balance_audit?.is_add === false
                                ? "-"
                                : ""}
                              {record?.opening_balance_audit?.current_value}
                            </td>
                            {/* CC/OD 👇 */}
                            <td>{record?.opening_balance_audit?.limit}</td>
                            {/* B/L 👇 */}
                            <td>{record?.balance}</td>
                            <td>{""}</td>
                          </tr>
                        );
                      })}
                    </>
                  );
                }
              )}
              <tr>
                <td colSpan={3}>
                  <b>Total</b>
                </td>
                <td>{totalCCOD || 0}</td>
                <td>{totalBL || 0}</td>
                <td>{totalCBBL || 0}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default PassbookCashBookReport;
