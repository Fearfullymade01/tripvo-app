import jsPDF from "jspdf";

export function exportExpensesToPDF(expenses, planId) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Tripvo Shared Expenses - ${planId}`, 10, 10);
    doc.setFontSize(12);
    let y = 20;
    expenses.forEach((exp, idx) => {
        doc.text(
            `${idx + 1}. ${exp.description} - ${exp.amount} (${exp.category})`,
            10,
            y,
        );
        y += 6;
        doc.text(
            `Paid by: ${exp.paid_by_info?.username || exp.paid_by} | Split: ${exp.split_method}`,
            10,
            y,
        );
        y += 6;
        if (exp.shares && exp.shares.length > 0) {
            exp.shares.forEach((s) => {
                doc.text(
                    `  ${s.member_name}: ${s.amount} ${s.is_settled ? "(Settled)" : ""}`,
                    10,
                    y,
                );
                y += 6;
            });
        }
        y += 4;
        if (y > 270) {
            doc.addPage();
            y = 10;
        }
    });
    doc.save(`expenses_${planId}.pdf`);
}
