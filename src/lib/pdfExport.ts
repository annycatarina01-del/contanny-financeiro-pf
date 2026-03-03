import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BillPayable } from '../modules/contas-pagar/contas-pagar.types';
import { BillReceivable } from '../modules/contas-receber/contas-receber.types';

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr: string) =>
    format(new Date(dateStr + 'T12:00:00'), 'dd/MM/yyyy', { locale: ptBR });

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    boleto: 'Boleto',
    pix: 'PIX',
    cash: 'Dinheiro',
    transfer: 'Transferência',
    installments: 'Parcelado',
    investment: 'Investimentos',
    investimentos: 'Investimentos',
    other: 'Outro',
};

const addPdfHeader = (doc: jsPDF, title: string, periodLabel: string) => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Background header bar
    doc.setFillColor(24, 24, 27); // zinc-900
    doc.rect(0, 0, pageWidth, 36, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 14, 14);

    // Subtitle
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(161, 161, 170); // zinc-400
    doc.text('CONT.ANNY Financeiro', 14, 22);

    // Period & date on right
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Período: ${periodLabel}`, pageWidth - 14, 14, { align: 'right' });
    doc.text(
        `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        pageWidth - 14, 22,
        { align: 'right' }
    );
};

const addPdfFooter = (doc: jsPDF, totalLabel: string, total: number, paidLabel: string, paid: number, pendingLabel: string, pending: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Footer separator
    doc.setDrawColor(228, 228, 231); // zinc-200
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 28, pageWidth - 14, pageHeight - 28);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 113, 122); // zinc-500

    // Totals
    const col1 = 14;
    const col2 = pageWidth / 3 + 10;
    const col3 = (pageWidth / 3) * 2 + 6;

    doc.text(totalLabel, col1, pageHeight - 20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(24, 24, 27);
    doc.text(formatCurrency(total), col1, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 113, 122);
    doc.text(paidLabel, col2, pageHeight - 20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(formatCurrency(paid), col2, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 113, 122);
    doc.text(pendingLabel, col3, pageHeight - 20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11); // amber-500
    doc.text(formatCurrency(pending), col3, pageHeight - 14);
};

export function exportContasPagarToPDF(
    bills: BillPayable[],
    periodLabel: string,
    getPaymentMethodLabel?: (method: string) => string,
    getCategoryLabel?: (value: string) => string
) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    addPdfHeader(doc, 'Contas a Pagar', periodLabel);

    const STATUS_LABELS: Record<string, string> = {
        paid: 'Pago',
        pending: 'Pendente',
    };

    const rows = bills.map((bill) => {
        const description = bill.total_installments && bill.total_installments > 1
            ? `${bill.description} (${bill.installment_number}/${bill.total_installments})`
            : bill.description;

        return [
            formatDate(bill.due_date),
            description + (bill.secondary_description ? `\n${bill.secondary_description}` : ''),
            getCategoryLabel ? getCategoryLabel(bill.category) : bill.category,
            getPaymentMethodLabel ? getPaymentMethodLabel(bill.payment_method) : (PAYMENT_METHOD_LABELS[bill.payment_method] || bill.payment_method),
            STATUS_LABELS[bill.status] || bill.status,
            formatCurrency(bill.amount),
        ];
    });

    autoTable(doc, {
        startY: 42,
        head: [['Vencimento', 'Descrição', 'Categoria', 'Forma de Pagamento', 'Status', 'Valor']],
        body: rows,
        headStyles: {
            fillColor: [39, 39, 42], // zinc-800
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [24, 24, 27], // zinc-900
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250], // zinc-50
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 70 },
            2: { cellWidth: 40 },
            3: { cellWidth: 45 },
            4: { cellWidth: 25, halign: 'center' },
            5: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: 14, right: 14, bottom: 36 },
        didParseCell: (data) => {
            // Color the status column
            if (data.section === 'body' && data.column.index === 4) {
                const val = data.cell.raw as string;
                if (val === 'Pago') {
                    data.cell.styles.textColor = [5, 150, 105]; // emerald
                    data.cell.styles.fontStyle = 'bold';
                } else if (val === 'Pendente') {
                    data.cell.styles.textColor = [245, 158, 11]; // amber
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [220, 38, 38]; // rose
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
    });

    const total = bills.reduce((acc, b) => acc + b.amount, 0);
    const paid = bills.filter((b) => b.status === 'paid').reduce((acc, b) => acc + b.amount, 0);
    const pending = bills.filter((b) => b.status !== 'paid').reduce((acc, b) => acc + b.amount, 0);

    addPdfFooter(doc, 'Total Geral', total, 'Total Pago', paid, 'Total Pendente', pending);

    doc.save(`contas-a-pagar_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

export function exportContasReceberToPDF(
    bills: BillReceivable[],
    periodLabel: string,
    getPaymentMethodLabel?: (method: string) => string,
    getCategoryLabel?: (value: string) => string
) {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    addPdfHeader(doc, 'Contas a Receber', periodLabel);

    const STATUS_LABELS: Record<string, string> = {
        received: 'Recebido',
        pending: 'Pendente',
    };

    const rows = bills.map((bill) => {
        const description = bill.total_installments && bill.total_installments > 1
            ? `${bill.description} (${bill.installment_number}/${bill.total_installments})`
            : bill.description;

        return [
            formatDate(bill.due_date),
            description,
            getCategoryLabel ? getCategoryLabel(bill.category) : bill.category,
            getPaymentMethodLabel ? getPaymentMethodLabel(bill.payment_method) : (PAYMENT_METHOD_LABELS[bill.payment_method] || bill.payment_method),
            formatCurrency(bill.amount),
            STATUS_LABELS[bill.status] || bill.status,
        ];
    });

    autoTable(doc, {
        startY: 42,
        head: [['Vencimento', 'Descrição', 'Categoria', 'Forma de Pagamento', 'Valor', 'Status']],
        body: rows,
        headStyles: {
            fillColor: [39, 39, 42],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [24, 24, 27],
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 80 },
            2: { cellWidth: 45 },
            3: { cellWidth: 45 },
            4: { cellWidth: 30, halign: 'right' },
            5: { cellWidth: 30, halign: 'center' },
        },
        margin: { left: 14, right: 14, bottom: 36 },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 5) {
                const val = data.cell.raw as string;
                if (val === 'Recebido') {
                    data.cell.styles.textColor = [5, 150, 105];
                    data.cell.styles.fontStyle = 'bold';
                } else {
                    data.cell.styles.textColor = [245, 158, 11];
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
    });

    const total = bills.reduce((acc, b) => acc + b.amount, 0);
    const received = bills.filter((b) => b.status === 'received').reduce((acc, b) => acc + b.amount, 0);
    const pending = bills.filter((b) => b.status !== 'received').reduce((acc, b) => acc + b.amount, 0);

    addPdfFooter(doc, 'Total Geral', total, 'Total Recebido', received, 'Total Pendente', pending);

    doc.save(`contas-a-receber_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}

// ─────────────────────────────────────────────────────────────
// RESUMO — Contas a Pagar
// ─────────────────────────────────────────────────────────────

const SUMMARY_SECTION_COLOR: [number, number, number] = [39, 39, 42];   // zinc-800

interface SummaryRow {
    label: string;
    total: number;
    paid: number;
    pending: number;
}

function buildSummaryRows(
    bills: BillPayable[],
    keyFn: (bill: BillPayable) => string,
    labelFn: (key: string) => string
): SummaryRow[] {
    const map = new Map<string, { total: number; paid: number; pending: number }>();
    for (const bill of bills) {
        const key = keyFn(bill);
        const existing = map.get(key) ?? { total: 0, paid: 0, pending: 0 };
        existing.total += bill.amount;
        if (bill.status === 'paid') {
            existing.paid += bill.amount;
        } else {
            existing.pending += bill.amount;
        }
        map.set(key, existing);
    }
    return Array.from(map.entries())
        .map(([key, values]) => ({ label: labelFn(key), ...values }))
        .sort((a, b) => b.total - a.total);
}

function addSummarySection(
    doc: jsPDF,
    title: string,
    rows: SummaryRow[],
    startY: number,
    totalGeral: number
): number {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Section title
    doc.setFillColor(...SUMMARY_SECTION_COLOR);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.rect(14, startY, pageWidth - 28, 8, 'F');
    doc.text(title, 18, startY + 5.5);

    const tableRows = rows.map((r) => {
        const pct = totalGeral > 0 ? ((r.total / totalGeral) * 100).toFixed(1) + '%' : '—';
        return [r.label, formatCurrency(r.total), formatCurrency(r.paid), formatCurrency(r.pending), pct];
    });

    // Totals row
    const totalRow = [
        'TOTAL',
        formatCurrency(rows.reduce((s, r) => s + r.total, 0)),
        formatCurrency(rows.reduce((s, r) => s + r.paid, 0)),
        formatCurrency(rows.reduce((s, r) => s + r.pending, 0)),
        '100%',
    ];

    autoTable(doc, {
        startY: startY + 9,
        head: [['Descrição', 'Total', 'Pago', 'Pendente', '% do Total']],
        body: [...tableRows, totalRow],
        headStyles: {
            fillColor: [63, 63, 70],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [24, 24, 27],
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250],
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 38, halign: 'right' },
            2: { cellWidth: 38, halign: 'right' },
            3: { cellWidth: 38, halign: 'right' },
            4: { cellWidth: 22, halign: 'center' },
        },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
            // Bold totals row (last body row)
            if (data.section === 'body' && data.row.index === tableRows.length) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [228, 228, 231]; // zinc-200
            }
            // Color paid column
            if (data.section === 'body' && data.column.index === 2 && data.row.index < tableRows.length) {
                data.cell.styles.textColor = [5, 150, 105];
            }
            // Color pending column
            if (data.section === 'body' && data.column.index === 3 && data.row.index < tableRows.length) {
                data.cell.styles.textColor = [245, 158, 11];
            }
        },
    });

    return (doc as any).lastAutoTable.finalY as number;
}

export function exportContasPagarResumoPDF(
    bills: BillPayable[],
    periodLabel: string,
    getPaymentMethodLabel: (method: string) => string,
    getCategoryLabel: (value: string) => string,
    getCardLabel: (value: string) => string,
    getFundingSourceLabel: (bill: BillPayable) => string
) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    addPdfHeader(doc, 'Contas a Pagar — Resumo', periodLabel);

    const totalGeral = bills.reduce((s, b) => s + b.amount, 0);
    const totalPago = bills.filter(b => b.status === 'paid').reduce((s, b) => s + b.amount, 0);
    const totalPendente = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);

    // ── Resumo rápido no topo ──────────────────────────────────
    const summaryY = 42;
    const boxW = (pageWidth - 28 - 8) / 3;
    const boxes = [
        { label: 'Total Geral', value: formatCurrency(totalGeral), color: [24, 24, 27] as [number, number, number], bg: [244, 244, 245] as [number, number, number] },
        { label: 'Total Pago', value: formatCurrency(totalPago), color: [5, 150, 105] as [number, number, number], bg: [209, 250, 229] as [number, number, number] },
        { label: 'Total Pendente', value: formatCurrency(totalPendente), color: [217, 119, 6] as [number, number, number], bg: [254, 243, 199] as [number, number, number] },
    ];
    boxes.forEach((box, i) => {
        const x = 14 + i * (boxW + 4);
        doc.setFillColor(...box.bg);
        doc.roundedRect(x, summaryY, boxW, 16, 2, 2, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(113, 113, 122);
        doc.text(box.label.toUpperCase(), x + boxW / 2, summaryY + 5.5, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...box.color);
        doc.text(box.value, x + boxW / 2, summaryY + 12, { align: 'center' });
    });

    let currentY = summaryY + 22;

    // ── Seção 1: Forma de Pagamento ────────────────────────────
    const paymentRows = buildSummaryRows(
        bills,
        (b) => b.payment_method,
        (key) => getPaymentMethodLabel(key)
    );
    currentY = addSummarySection(doc, 'Por Forma de Pagamento', paymentRows, currentY, totalGeral) + 8;

    // ── Seção 2: Fonte de Pagamento ────────────────────────────
    const fundingRowsLabeled = buildSummaryRows(
        bills,
        (b) => b.investment_id ? '__investment__' : '__balance__',
        (key) => getFundingSourceLabel(key === '__investment__'
            ? { investment_id: 'x' } as BillPayable
            : {} as BillPayable)
    );
    currentY = addSummarySection(doc, 'Por Fonte de Pagamento', fundingRowsLabeled, currentY, totalGeral) + 8;

    // ── Seção 3: Categoria ─────────────────────────────────────
    const categoryRows = buildSummaryRows(
        bills,
        (b) => b.category,
        (key) => getCategoryLabel(key)
    );
    currentY = addSummarySection(doc, 'Por Categoria', categoryRows, currentY, totalGeral) + 8;

    // ── Seção 4: Cartão de Crédito ─────────────────────────────
    const creditCardBills = bills.filter(b => b.payment_method === 'credit_card' && b.card_provider);
    if (creditCardBills.length > 0) {
        // New page if not enough space (need at least 60mm)
        if (currentY > pageHeight - 80) {
            doc.addPage();
            currentY = 20;
        }
        const cardRows = buildSummaryRows(
            creditCardBills,
            (b) => b.card_provider ?? 'outro',
            (key) => getCardLabel(key)
        );
        addSummarySection(doc, 'Por Cartão de Crédito', cardRows, currentY, totalGeral);
    }

    doc.save(`contas-a-pagar-resumo_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
}
