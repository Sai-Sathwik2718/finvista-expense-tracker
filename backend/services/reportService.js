const transactionRepository = require('../repositories/transactionRepository');
const userRepository = require('../repositories/userRepository');
const categoryRepository = require('../repositories/categoryRepository');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class ReportService {
  async getReportData(userId, filters) {
    const transactions = await transactionRepository.getAllFiltered(userId, filters);
    const user = await userRepository.findById(userId);

    let totalIncome = 0;
    let totalExpense = 0;
    let highestExpense = 0;
    let lowestExpense = Infinity;

    transactions.forEach(t => {
      const amt = parseFloat(t.amount);
      if (t.type === 'income') {
        totalIncome += amt;
      } else {
        totalExpense += amt;
        if (amt > highestExpense) highestExpense = amt;
        if (amt < lowestExpense) lowestExpense = amt;
      }
    });

    if (lowestExpense === Infinity) lowestExpense = 0;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    const avgExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;

    return {
      user,
      summary: {
        totalTransactions: transactions.length,
        totalIncome,
        totalExpense,
        avgExpense,
        highestExpense,
        lowestExpense,
        netSavings: totalIncome - totalExpense
      },
      transactions
    };
  }

  getReportFilename(prefix, extension) {
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'Long' });
    const year = now.getFullYear();
    return `${prefix}_Report_${month}_${year}.${extension}`;
  }

  async generateExcelReport(userId, filters, res) {
    const { user, transactions, summary } = await this.getReportData(userId, filters);
    const filename = this.getReportFilename('FinVista', 'xlsx');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FinVista Operating System';
    workbook.created = new Date();

    const inrFormat = '"₹"#,##0.00';

    // 1. Transactions Worksheet
    const wsTx = workbook.addWorksheet('Transactions');
    wsTx.addRow(['FinVista Financial Statement - Detailed Transactions']);
    wsTx.getRow(1).font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    wsTx.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    wsTx.addRow([`Generated for: ${user?.name || 'User'} (${user?.email || ''})`, `Date: ${new Date().toLocaleDateString()}`]);
    wsTx.addRow([]);

    const txHeaders = ['ID', 'Date', 'Type', 'Category', 'Amount (₹)', 'Payment Mode', 'Description', 'Notes'];
    const txHeaderRow = wsTx.addRow(txHeaders);
    txHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    txHeaderRow.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } });

    transactions.forEach(t => {
      wsTx.addRow([
        t.id,
        t.date,
        t.type.toUpperCase(),
        t.Category?.name || 'Uncategorized',
        parseFloat(t.amount),
        t.payment_mode.toUpperCase(),
        t.description,
        t.notes || ''
      ]);
    });

    wsTx.getColumn(5).numFmt = inrFormat;
    wsTx.columns.forEach(col => col.width = 22);

    // 2. Category Summary Worksheet
    const wsCat = workbook.addWorksheet('Category Summary');
    wsCat.addRow(['FinVista Category Expenditure Summary']);
    wsCat.getRow(1).font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    wsCat.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    wsCat.addRow([]);
    const catHeaderRow = wsCat.addRow(['Category Name', 'Type', 'Total Amount (₹)', 'Budget Limit (₹)']);
    catHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    catHeaderRow.eachCell(c => c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } });

    const categories = await categoryRepository.findAllByUser(userId);
    for (const c of categories) {
      const catTx = transactions.filter(t => t.category_id === c.id);
      const total = catTx.reduce((sum, t) => sum + parseFloat(t.amount), 0);
      wsCat.addRow([c.name, c.type.toUpperCase(), total, parseFloat(c.budget_limit || 0)]);
    }
    wsCat.getColumn(3).numFmt = inrFormat;
    wsCat.getColumn(4).numFmt = inrFormat;
    wsCat.columns.forEach(col => col.width = 22);

    // 3. Monthly Summary Worksheet
    const wsMonth = workbook.addWorksheet('Monthly Summary');
    wsMonth.addRow(['FinVista Executive Monthly Summary']);
    wsMonth.getRow(1).font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    wsMonth.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    wsMonth.addRow([]);
    wsMonth.addRow(['Total Transactions', summary.totalTransactions]);
    wsMonth.addRow(['Total Inflow (Income)', summary.totalIncome]);
    wsMonth.addRow(['Total Outflow (Expense)', summary.totalExpense]);
    wsMonth.addRow(['Net Financial Differential', summary.netSavings]);
    wsMonth.getColumn(2).numFmt = inrFormat;
    wsMonth.columns.forEach(col => col.width = 28);

    // 4. Analytics Worksheet
    const wsAnalytics = workbook.addWorksheet('Analytics');
    wsAnalytics.addRow(['FinVista Core Analytics Benchmarks']);
    wsAnalytics.getRow(1).font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    wsAnalytics.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
    wsAnalytics.addRow([]);
    wsAnalytics.addRow(['Average Expense', summary.avgExpense]);
    wsAnalytics.addRow(['Highest Expense Item', summary.highestExpense]);
    wsAnalytics.addRow(['Lowest Expense Item', summary.lowestExpense]);
    wsAnalytics.getColumn(2).numFmt = inrFormat;
    wsAnalytics.columns.forEach(col => col.width = 28);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    await workbook.xlsx.write(res);
    res.end();
  }

  async generatePdfReport(userId, filters, res) {
    const { user, transactions, summary } = await this.getReportData(userId, filters);
    const filename = this.getReportFilename('FinVista', 'pdf');

    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    doc.pipe(res);

    // Header Banner
    doc.rect(0, 0, 595, 60).fill('#0F172A');
    doc.fillColor('#FFFFFF').fontSize(20).text('FinVista Financial Intelligence Statement', 30, 20);
    doc.fontSize(10).fillColor('#94A3B8').text(`Generated for: ${user?.name || 'User'} • ${new Date().toLocaleDateString()}`, 30, 42);

    doc.moveDown(3);

    // Summary Box
    let y = 85;
    doc.rect(30, y, 535, 70).fillAndStroke('#F8FAFC', '#E2E8F0');
    doc.fillColor('#0F172A').fontSize(10).text(`Total Records: ${summary.totalTransactions}`, 45, y + 15);
    doc.fillColor('#22C55E').text(`Total Income: Rupee ${summary.totalIncome.toFixed(2)}`, 180, y + 15);
    doc.fillColor('#EF4444').text(`Total Expense: Rupee ${summary.totalExpense.toFixed(2)}`, 340, y + 15);

    doc.fillColor('#475569').text(`Avg Expense: Rupee ${summary.avgExpense.toFixed(2)}`, 45, y + 40);
    doc.text(`Highest: Rupee ${summary.highestExpense.toFixed(2)}`, 180, y + 40);
    doc.text(`Lowest: Rupee ${summary.lowestExpense.toFixed(2)}`, 340, y + 40);

    y += 90;

    // Table Header
    doc.fillColor('#0F172A').fontSize(11).text('Transaction Ledger', 30, y, { bold: true });
    y += 20;

    doc.rect(30, y, 535, 20).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(9).text('Date', 35, y + 5);
    doc.text('Category', 110, y + 5);
    doc.text('Description', 220, y + 5);
    doc.text('Type', 410, y + 5);
    doc.text('Amount (Rupee)', 480, y + 5, { align: 'right' });

    y += 25;

    // Table Rows
    transactions.forEach(t => {
      if (y > 770) {
        doc.addPage();
        y = 40;
      }
      doc.fillColor('#334155').fontSize(8.5).text(t.date, 35, y);
      doc.text(t.Category?.name || 'Uncategorized', 110, y, { width: 100, height: 12, ellipsis: true });
      doc.text(t.description, 220, y, { width: 180, height: 12, ellipsis: true });
      doc.fillColor(t.type === 'income' ? '#22C55E' : '#EF4444').text(t.type.toUpperCase(), 410, y);
      doc.fillColor('#0F172A').text(`Rupee ${parseFloat(t.amount).toFixed(2)}`, 480, y, { align: 'right' });
      y += 18;
    });

    // Footer
    doc.fontSize(8).fillColor('#94A3B8').text('FinVista Autonomous Financial OS • Confidential Executive Report', 30, 810, { align: 'center' });

    doc.end();
  }
}

module.exports = new ReportService();
