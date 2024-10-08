const PassbookCashbookBalance = () => {
  return (
    <>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-5 mx-3 mb-3">
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-primary">Passbook/Cashbook Balance</h3>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bank Name</th>
              <th>Entry</th>
              <th>CC/OD</th>
              <th>B/L</th>
              <th>CB B/L</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default PassbookCashbookBalance;
