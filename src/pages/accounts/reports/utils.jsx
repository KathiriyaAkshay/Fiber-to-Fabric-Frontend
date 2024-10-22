export const gstr1_dialog_columns = [
    { title: 'No', dataIndex: 'no', key: 'no' },
    { title: 'Bill No.', dataIndex: 'billNo', key: 'billNo' },
    { title: 'Bill Date', dataIndex: 'billDate', key: 'billDate' },
    { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Party Company', dataIndex: 'partyCompany', key: 'partyCompany' },
    { title: 'No of GSTIN (7)', dataIndex: 'gstin', key: 'gstin' },
    { title: 'Place of Supply', dataIndex: 'placeOfSupply', key: 'placeOfSupply' },
    { title: 'Meter', dataIndex: 'meter', key: 'meter' },
    { title: 'HSN', dataIndex: 'hsn', key: 'hsn' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'SGST', dataIndex: 'sgst', key: 'sgst' },
    { title: 'CGST', dataIndex: 'cgst', key: 'cgst' },
    { title: 'IGST', dataIndex: 'igst', key: 'igst' },
    { title: 'Net Amount', dataIndex: 'netAmount', key: 'netAmount' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status' }
  ];
  
  export const gstr2_dialog_columns = [
    { title: 'No', dataIndex: 'no', key: 'no' },
    { title: 'Bill No.', dataIndex: 'billNo', key: 'billNo' },
    { title: 'Bill Date', dataIndex: 'billDate', key: 'billDate' },
    { title: 'Company Name', dataIndex: 'companyName', key: 'companyName' },
    { title: 'Party Company', dataIndex: 'partyCompany', key: 'partyCompany' },
    { title: 'GST In', dataIndex: 'gstIn', key: 'gstIn' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'SGST', dataIndex: 'sgst', key: 'sgst' },
    { title: 'CGST', dataIndex: 'cgst', key: 'cgst' },
    { title: 'IGST', dataIndex: 'igst', key: 'igst' },
    { title: 'Net Amount', dataIndex: 'netAmount', key: 'netAmount' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status' }
  ];
  

  export const gstr1_dialog_data = [
    {
      key: '1',
      no: 1,
      billNo: 'INV001',
      billDate: '2024-10-01',
      companyName: 'ABC Pvt Ltd',
      partyCompany: 'XYZ Corp',
      gstin: '22AAAAA0000A1Z5',
      placeOfSupply: 'Maharashtra',
      meter: 100,
      hsn: '9985',
      amount: 5000,
      sgst: 450,
      cgst: 450,
      igst: 0,
      netAmount: 5900,
      type: 'Goods',
      status: 'Paid'
    },
    {
      key: '2',
      no: 2,
      billNo: 'INV002',
      billDate: '2024-10-02',
      companyName: 'LMN Pvt Ltd',
      partyCompany: 'PQR Corp',
      gstin: '22AAAAA0000A1Z6',
      placeOfSupply: 'Karnataka',
      meter: 200,
      hsn: '9986',
      amount: 10000,
      sgst: 900,
      cgst: 900,
      igst: 0,
      netAmount: 11800,
      type: 'Services',
      status: 'Pending'
    },
    {
      key: '3',
      no: 3,
      billNo: 'INV003',
      billDate: '2024-10-03',
      companyName: 'DEF Pvt Ltd',
      partyCompany: 'STU Corp',
      gstin: '22AAAAA0000A1Z7',
      placeOfSupply: 'Tamil Nadu',
      meter: 150,
      hsn: '9987',
      amount: 7500,
      sgst: 675,
      cgst: 675,
      igst: 0,
      netAmount: 8850,
      type: 'Goods',
      status: 'Paid'
    }
  ];

  export const gstr2_dialog_data = [
    {
      key: '1',
      no: 1,
      billNo: 'INV101',
      billDate: '2024-10-01',
      companyName: 'XYZ Pvt Ltd',
      partyCompany: 'DEF Corp',
      gstIn: '27BBBBB1111B2Z8',
      amount: 12000,
      sgst: 540,
      cgst: 540,
      igst: 0,
      netAmount: 13140,
      type: 'Goods',
      status: 'Paid'
    },
    {
      key: '2',
      no: 2,
      billNo: 'INV102',
      billDate: '2024-10-02',
      companyName: 'GHI Pvt Ltd',
      partyCompany: 'JKL Corp',
      gstIn: '29BBBBB1111B2Z9',
      amount: 8000,
      sgst: 360,
      cgst: 360,
      igst: 0,
      netAmount: 8720,
      type: 'Services',
      status: 'Pending'
    },
    {
      key: '3',
      no: 3,
      billNo: 'INV103',
      billDate: '2024-10-03',
      companyName: 'MNO Pvt Ltd',
      partyCompany: 'PQR Corp',
      gstIn: '33BBBBB1111B2Z0',
      amount: 15000,
      sgst: 675,
      cgst: 675,
      igst: 0,
      netAmount: 16350,
      type: 'Goods',
      status: 'Paid'
    }
  ];
  
  