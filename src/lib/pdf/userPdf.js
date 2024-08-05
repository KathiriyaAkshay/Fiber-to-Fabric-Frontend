import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";

export function downloadUserPdf({
  title = "",
  leftContent = "",
  rightContent = "",
  head = [],
  body = [],
}) {
  // Create a jsPDF instance
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [300, 297], // width: 300mm, height: 297mm
  });

  // Set font size and style for the title
  pdf.setFontSize(8);
  pdf.setFont("helvetica");

  // Center align the title
  const titleWidth =
    (pdf.getStringUnitWidth(title) * pdf.internal.getFontSize()) / pdf.internal.scaleFactor;
  const titleX = (pdf.internal.pageSize.width - titleWidth) / 2;
  pdf.text(titleX, 15, title);

  // Set font size and style for the left content
  pdf.setFontSize(8);
  pdf.setFont("helvetica");

  // Parse the left content
  const leftContentLines = leftContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  pdf.setTextColor(0, 0, 255); // Set text color to blue
  pdf.setFont("helvetica", "bold"); // Set font to bold

  let yPosition = 8; // Initial Y position
  leftContentLines.forEach(line => {
    pdf.text(line, 8, yPosition);
    yPosition += 7; // Move to the next line
  });

  pdf.text(rightContent, 290, 8, { align: "right" });

  pdf.autoTable({
    head: head,
    body: body,
    margin: {
      top: 35,
    },
  });

  // Save the PDF
  pdf.save(title + " " + dayjs().format("DD-MM-YYYY HH-mm-ss") + ".pdf");

  // Open the saved PDF in a new tab
  const pdfBlob = pdf.output("blob");
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, "_blank");

  // Clean up the URL object after opening
  URL.revokeObjectURL(url);
}

export function getPDFTitleContent({ user, company }) {
  const { first_name, last_name, address } = user;
  const leftContent = `
  Name:- ${first_name || "-"} ${last_name || "-"}
  Address:- ${address || "-"}
  Created Date:- ${dayjs().format("DD-MM-YYYY")}
  `;

  const { company_name, company_contact, gst_no } = company;
  const rightContent = `
  Company Name:- ${company_name || "-"}
  Company Contact:- ${company_contact || "-"}
  GST No.:- ${gst_no || "-"}
  `;
  return { leftContent, rightContent };
}
