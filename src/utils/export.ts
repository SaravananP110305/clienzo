// CSV Export utility for ClienZo CRM Reports

export function exportToCSV(data: any[], headers: string[], filename: string): void {
  if (!data || data.length === 0) {
    return;
  }

  try {
    const csvRows: string[] = [];

    // 1. Add header row
    csvRows.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","));

    // 2. Add data rows
    for (const item of data) {
      const rowValues = Object.keys(item).map(key => {
        const value = item[key];
        const stringVal = value === null || value === undefined ? "" : String(value);
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      csvRows.push(rowValues.join(","));
    }

    // 3. Create download trigger
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error generating CSV export:", error);
  }
}
