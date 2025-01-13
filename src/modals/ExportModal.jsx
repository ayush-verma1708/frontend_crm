import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const ExportModal = ({ open, data, closeModal }) => {
  const [isExporting, setIsExporting] = useState(false); // To show exporting state

  const handleExport = () => {
    setIsExporting(true);

    // Convert the data to a format suitable for Excel (an array of objects)
    const exportData = data.map((customer) => ({
      Name: customer.Full_Name,
      Magazine: customer.Magazine,
      Amount: customer.Amount,
      Country_Code: customer.Country_Code,
      Email: customer.Email,
      Address: customer.Address,
      Order_id: customer.Order_id,
      Model_Type: customer.user_info?.Model_Type,
      Insta_Link: customer.user_info?.Model_Insta_Link,
      Product: customer.Product,
      Notes: customer.Notes,
      Follow_Up_Date: new Date(customer.NoteDate).toLocaleDateString('en-US'),
    }));

    // Create a new worksheet from the data
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Customers');

    // Write the workbook to a blob and trigger a download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      bookType: 'xlsx',
      type: 'application/octet-stream',
    });

    saveAs(blob, 'customers.xlsx');
    setIsExporting(false); // Reset the exporting state after the export
  };

  if (!open) return null;

  return (
    <div className='modal-overlay'>
      <div className='export-modal'>
        <h3>Export Data</h3>
        <p>Do you want to export the data displayed to Excel?</p>
        <div className='modal-actions'>
          <button
            onClick={handleExport}
            className='export-btn'
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </button>
          <button onClick={closeModal} className='cancel-btn'>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
