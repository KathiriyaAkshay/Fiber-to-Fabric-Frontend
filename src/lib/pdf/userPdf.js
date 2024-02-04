import jsPDF from "jspdf";
// eslint-disable-next-line no-unused-vars
import autoPDF from "jspdf-autotable";
import dayjs from "dayjs";

export function downloadUserPdf({
  title = "",
  leftContent = "",
  rightContent = "",
  head = [],
  body = [],
}) {
  // Create a jsPDF instance
  const pdf = new jsPDF();

  // Set font size and style for the title
  pdf.setFontSize(16);
  pdf.setFont("bold");

  // Center align the title
  const titleWidth =
    (pdf.getStringUnitWidth(title) * pdf.internal.getFontSize()) /
    pdf.internal.scaleFactor;
  const titleX = (pdf.internal.pageSize.width - titleWidth) / 2;
  pdf.text(titleX, 16, title);

  // Set font size and style for the left content
  pdf.setFontSize(12);
  pdf.setFont("normal");

  pdf.text(10, 26, leftContent);
  pdf.text(195, 26, rightContent, {
    align: "right",
  });

  pdf.autoTable({
    head: head,
    body: body,
    margin: {
      top: 50,
    },
  });

  // Save the PDF
  pdf.save(title + " " + dayjs().format("DD-MM-YYYY HH-mm-ss") + ".pdf");
}
