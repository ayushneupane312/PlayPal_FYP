import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture a DOM node and save as a multi-page PDF (landscape A4).
 */
export async function exportSchedulePdf(element, fileName = 'tournament-schedule.pdf') {
  if (!element) {
    throw new Error('Nothing to export');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const printableW = pageW - margin * 2;
  const printableH = pageH - margin * 2;

  const imgPxW = canvas.width;
  const imgPxH = canvas.height;
  const scaledH = (imgPxH * printableW) / imgPxW;

  if (scaledH <= printableH) {
    pdf.addImage(imgData, 'JPEG', margin, margin, printableW, scaledH);
  } else {
    let offsetY = 0;
    let pageIndex = 0;
    while (offsetY < scaledH) {
      if (pageIndex > 0) {
        pdf.addPage('a4', 'landscape');
      }
      pdf.addImage(imgData, 'JPEG', margin, margin - offsetY, printableW, scaledH);
      offsetY += printableH;
      pageIndex += 1;
    }
  }

  const safeName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  pdf.save(safeName);
}

export function slugifyFileName(name) {
  return (name || 'tournament-schedule')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}
