import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    triggerDownload(new Blob(["No data for selected filters"], { type: "text/csv" }), filename);
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ];
  triggerDownload(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" }), filename);
}

export function downloadPdf(
  title: string,
  subtitle: string,
  rows: Record<string, unknown>[],
  filename: string
) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.setTextColor(26, 60, 110);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(subtitle, 14, 25);

  const headers = rows.length ? Object.keys(rows[0]) : ["No data"];
  const body = rows.length ? rows.map((row) => headers.map((h) => String(row[h] ?? ""))) : [[]];

  autoTable(doc, {
    startY: 32,
    head: [headers],
    body,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [26, 60, 110] },
  });

  doc.save(filename);
}
