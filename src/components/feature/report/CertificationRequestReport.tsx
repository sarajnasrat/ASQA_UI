import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import ReportService from "../../../services/report.service";

import ExcelJS from 'exceljs';

type ReportType = "yearly" | "monthly" | "range";

export enum ReportModule {
  USER = "USER",
  COMPANY = "COMPANY",
  COMMITTEE = "COMMITTEE",
  MENU = "MENU",
  CERTIFICATION = "CERTIFICATION",
  CERTIFICATION_REQUEST = "CERTIFICATION_REQUEST",
  ROLE = "ROLE",
  ATTACHMENT = "ATTACHMENT",
  COMPANY_CONTACT_PERSON = "COMPANY_CONTACT_PERSON",
  COMMITTEE_MEMBER = "COMMITTEE_MEMBER",
}

type ReportData = {
  totalRequests?: number;
  totalUsers?: number;
  activeUsers?: number;
  inActiveUsers?: number;
  totalCompanies?: number;
  totalCommitee?: number;
  activeCommitee?: number;
  inActiveCommitee?: number;
  totalMenu?: number;
  totalCertifications?: number;
  totalSubmittedRequest?: number;
  totalRejectedRequest?: number;
  inProgressRequest?: number;
  totalCompletedRequest?: number;
};

export const CertificationRequestReport = () => {
  const { t, i18n } = useTranslation();
  const currentDate = new Date();

  const [reportType, setReportType] = useState<ReportType>("yearly");
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedModules, setSelectedModules] = useState<ReportModule[]>([
    ReportModule.CERTIFICATION_REQUEST,
    ReportModule.USER,
    ReportModule.COMMITTEE,
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showModuleDropdown, setShowModuleDropdown] = useState<boolean>(false);

  useEffect(() => {
    generateReport();
  }, []);

  const toggleModule = (module: ReportModule) => {
    setSelectedModules(prev =>
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    );
  };

  const getModuleLabel = (module: ReportModule): string => {
    return t(`report.module.${module}`, { defaultValue: module });
  };

  const generateReport = async (
    customValues?: Partial<{
      reportType: ReportType;
      year: number;
      month: number;
      startDate: string;
      endDate: string;
      modules: ReportModule[];
    }>
  ) => {
    const selectedReportType = customValues?.reportType ?? reportType;
    const selectedYear = customValues?.year ?? year;
    const selectedMonth = customValues?.month ?? month;
    const selectedStartDate = customValues?.startDate ?? startDate;
    const selectedEndDate = customValues?.endDate ?? endDate;
    const selectedModulesList = customValues?.modules ?? selectedModules;

    if (
      selectedReportType === "range" &&
      (!selectedStartDate || !selectedEndDate)
    ) {
      return;
    }

    try {
      setLoading(true);

      const payload: any = {
        modules: selectedModulesList,
      };

      if (selectedReportType === "yearly") {
        const startDateTime = new Date(selectedYear, 0, 1, 0, 0, 0);
        const endDateTime = new Date(selectedYear, 11, 31, 23, 59, 59);
        payload.startDate = startDateTime.toISOString();
        payload.endDate = endDateTime.toISOString();
      } else if (selectedReportType === "monthly") {
        const startDateTime = new Date(
          selectedYear,
          selectedMonth - 1,
          1,
          0,
          0,
          0
        );
        const endDateTime = new Date(
          selectedYear,
          selectedMonth,
          0,
          23,
          59,
          59
        );
        payload.startDate = startDateTime.toISOString();
        payload.endDate = endDateTime.toISOString();
      } else if (selectedReportType === "range") {
        const startDateTime = new Date(selectedStartDate);
        startDateTime.setHours(0, 0, 0, 0);
        const endDateTime = new Date(selectedEndDate);
        endDateTime.setHours(23, 59, 59, 999);
        payload.startDate = startDateTime.toISOString();
        payload.endDate = endDateTime.toISOString();
      }

      const response = await ReportService.generateReport(payload);
      setReportData(response.data || response);
    } catch (error) {
      console.error("Failed to generate report:", error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;

    setExporting(true);
    
    try {
      const excelData = [
        { Category: t('report.summary'), Metric: "", Value: "" },
        { Category: t('report.requestStatistics'), Metric: t('report.totalRequests'), Value: reportData.totalRequests || 0 },
        { Category: t('report.requestStatistics'), Metric: t('report.submitted'), Value: reportData.totalSubmittedRequest || 0 },
        { Category: t('report.requestStatistics'), Metric: t('report.inProgress'), Value: reportData.inProgressRequest || 0 },
        { Category: t('report.requestStatistics'), Metric: t('report.completed'), Value: reportData.totalCompletedRequest || 0 },
        { Category: t('report.requestStatistics'), Metric: t('report.rejected'), Value: reportData.totalRejectedRequest || 0 },
        { Category: "", Metric: "", Value: "" },
        { Category: t('report.userStatistics'), Metric: t('report.totalUsers'), Value: reportData.totalUsers || 0 },
        { Category: t('report.userStatistics'), Metric: t('report.activeUsers'), Value: reportData.activeUsers || 0 },
        { Category: t('report.userStatistics'), Metric: t('report.inactiveUsers'), Value: reportData.inActiveUsers || 0 },
        { Category: "", Metric: "", Value: "" },
        { Category: t('report.committeeStatistics'), Metric: t('report.totalCommittee'), Value: reportData.totalCommitee || 0 },
        { Category: t('report.committeeStatistics'), Metric: t('report.activeCommittee'), Value: reportData.activeCommitee || 0 },
        { Category: t('report.committeeStatistics'), Metric: t('report.inactiveCommittee'), Value: reportData.inActiveCommitee || 0 },
        { Category: "", Metric: "", Value: "" },
        { Category: t('report.additionalStatistics'), Metric: t('report.totalCompanies'), Value: reportData.totalCompanies || 0 },
        { Category: t('report.additionalStatistics'), Metric: t('report.totalCertifications'), Value: reportData.totalCertifications || 0 },
        { Category: t('report.additionalStatistics'), Metric: t('report.totalMenuItems'), Value: reportData.totalMenu || 0 },
      ];

      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 15 }];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, t('report.systemReport'));

      const fileName = `${t('report.systemReport')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Failed to export report:", error);
    } finally {
      setExporting(false);
    }
  };

const exportDetailedToExcel = async () => {
  if (!reportData) return;

  setExporting(true);
  
  try {
    const workbook = new ExcelJS.Workbook();
    const isRTL = i18n.language === 'dr' || i18n.language === 'ps';
    
    // Set workbook properties
    workbook.properties.date1904 = true;
    
    // Create first worksheet
    const worksheet = workbook.addWorksheet(t('report.summary'));
    
    // Set RTL for the entire worksheet if needed
    if (isRTL) {
      worksheet.views = [{ rightToLeft: true, showGridLines: true }];
    }
    
    // Define columns - only 2 columns
    worksheet.columns = [
      { header: '', key: 'label', width: 35 },
      { header: '', key: 'value', width: 35 }
    ];
 
    
    // Merge cells from A1 to B2 (2 rows and 2 columns)
    worksheet.mergeCells('A1:B2');
    
    // Style the merged title cell
    const mergedCell = worksheet.getCell('A1');
    mergedCell.font = { size: 16, bold: true };
    mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
    mergedCell.value = t('report.systemReports');
    
    
    // Add data rows
    worksheet.addRow([t('report.generatedOn'), new Date().toLocaleString()]);
    worksheet.addRow([t('report.reportType'), 
      reportType === "yearly" ? t('report.yearlyReport') : 
      reportType === "monthly" ? t('report.monthlyReport') : 
      t('report.customRange')
    ]);
    worksheet.addRow([t('report.selectedModules'), selectedModules.map(m => getModuleLabel(m)).join(", ")]);
    
    
    // Request Statistics Section Header - Merged across both columns
    const reqSectionRow = worksheet.addRow([t('report.requestStatistics'), '']);
    worksheet.mergeCells(`A${reqSectionRow.number}:B${reqSectionRow.number}`);
    reqSectionRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    reqSectionRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    reqSectionRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    worksheet.addRow([t('report.totalRequests'), reportData.totalRequests || 0]);
    worksheet.addRow([t('report.submitted'), reportData.totalSubmittedRequest || 0]);
    worksheet.addRow([t('report.inProgress'), reportData.inProgressRequest || 0]);
    worksheet.addRow([t('report.completed'), reportData.totalCompletedRequest || 0]);
    worksheet.addRow([t('report.rejected'), reportData.totalRejectedRequest || 0]);
    
  
    
    // User Statistics Section Header - Merged across both columns
    const userSectionRow = worksheet.addRow([t('report.userStatistics'), '']);
    worksheet.mergeCells(`A${userSectionRow.number}:B${userSectionRow.number}`);
    userSectionRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    userSectionRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    userSectionRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    worksheet.addRow([t('report.totalUsers'), reportData.totalUsers || 0]);
    worksheet.addRow([t('report.activeUsers'), reportData.activeUsers || 0]);
    worksheet.addRow([t('report.inactiveUsers'), reportData.inActiveUsers || 0]);

    // Committee Statistics Section Header - Merged across both columns
    const committeeSectionRow = worksheet.addRow([t('report.committeeStatistics'), '']);
    worksheet.mergeCells(`A${committeeSectionRow.number}:B${committeeSectionRow.number}`);
    committeeSectionRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    committeeSectionRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    committeeSectionRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    worksheet.addRow([t('report.totalCommittee'), reportData.totalCommitee || 0]);
    worksheet.addRow([t('report.activeCommittee'), reportData.activeCommitee || 0]);
    worksheet.addRow([t('report.inactiveCommittee'), reportData.inActiveCommitee || 0]);
    

    // Additional Statistics Section Header - Merged across both columns
    const additionalSectionRow = worksheet.addRow([t('report.additionalStatistics'), '']);
    worksheet.mergeCells(`A${additionalSectionRow.number}:B${additionalSectionRow.number}`);
    additionalSectionRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    additionalSectionRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    additionalSectionRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    
    worksheet.addRow([t('report.totalCompanies'), reportData.totalCompanies || 0]);
    worksheet.addRow([t('report.totalCertifications'), reportData.totalCertifications || 0]);
    worksheet.addRow([t('report.totalMenuItems'), reportData.totalMenu || 0]);
    
    // Apply borders to all cells and format the first column (labels) as bold
    worksheet.eachRow((row: any, rowNumber: number) => {
      row.eachCell((cell: any, colNumber: number) => {
        // Skip the merged title area (rows 1-2, cols 1-2)
        if (rowNumber <= 2 && colNumber <= 2) {
          return;
        }
        
        // Add borders
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Make the first column (labels) bold, but skip header rows
        if (colNumber === 1 && rowNumber > 4) {
          // Check if it's a section header (has fill color)
          const isSectionHeader = cell.fill && cell.fill.fgColor && cell.fill.fgColor.argb === 'FF4472C4';
          if (!isSectionHeader) {
            cell.font = { bold: true };
          }
        }
        
        // For RTL, set text alignment on first column
        if (isRTL && colNumber === 1) {
          if (cell.alignment) {
            cell.alignment.horizontal = 'right';
          } else {
            cell.alignment = { horizontal: 'right' };
          }
        }
        
        // For values (second column), align properly
        if (colNumber === 2) {
          if (typeof cell.value === 'number') {
            cell.alignment = { horizontal: 'center' };
          } else if (isRTL) {
            if (cell.alignment) {
              cell.alignment.horizontal = 'right';
            } else {
              cell.alignment = { horizontal: 'right' };
            }
          }
        }
      });
    });
    
    // Create second worksheet for metrics
    const metricsSheet = workbook.addWorksheet(t('report.allMetrics'));
    
    if (isRTL) {
      metricsSheet.views = [{ rightToLeft: true }];
    }
    
    metricsSheet.columns = [
      { header: t('report.metricType'), key: 'type', width: 25 },
      { header: t('report.metricName'), key: 'name', width: 30 },
      { header: t('report.value'), key: 'value', width: 15 }
    ];
    
    // Add header row with styling
    const headerRow = metricsSheet.addRow({
      type: t('report.metricType'),
      name: t('report.metricName'),
      value: t('report.value')
    });
    
    headerRow.eachCell((cell: any) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Add data
    const metricsRows = [
      { type: t('report.requestStatistics'), name: t('report.totalRequests'), value: reportData.totalRequests || 0 },
      { type: t('report.requestStatistics'), name: t('report.submitted'), value: reportData.totalSubmittedRequest || 0 },
      { type: t('report.requestStatistics'), name: t('report.inProgress'), value: reportData.inProgressRequest || 0 },
      { type: t('report.requestStatistics'), name: t('report.completed'), value: reportData.totalCompletedRequest || 0 },
      { type: t('report.requestStatistics'), name: t('report.rejected'), value: reportData.totalRejectedRequest || 0 },
      { type: t('report.userStatistics'), name: t('report.totalUsers'), value: reportData.totalUsers || 0 },
      { type: t('report.userStatistics'), name: t('report.activeUsers'), value: reportData.activeUsers || 0 },
      { type: t('report.userStatistics'), name: t('report.inactiveUsers'), value: reportData.inActiveUsers || 0 },
      { type: t('report.committeeStatistics'), name: t('report.totalCommittee'), value: reportData.totalCommitee || 0 },
      { type: t('report.committeeStatistics'), name: t('report.activeCommittee'), value: reportData.activeCommitee || 0 },
      { type: t('report.committeeStatistics'), name: t('report.inactiveCommittee'), value: reportData.inActiveCommitee || 0 },
      { type: t('report.additionalStatistics'), name: t('report.totalCompanies'), value: reportData.totalCompanies || 0 },
      { type: t('report.additionalStatistics'), name: t('report.totalCertifications'), value: reportData.totalCertifications || 0 },
      { type: t('report.additionalStatistics'), name: t('report.totalMenuItems'), value: reportData.totalMenu || 0 },
    ];
    
    metricsRows.forEach((rowData) => {
      const row = metricsSheet.addRow(rowData);
      
      // Add borders and styling to all cells
      row.eachCell((cell: any, colNumber: number) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // For RTL, align text properly
        if (isRTL) {
          if (colNumber === 1 || colNumber === 2) {
            cell.alignment = { horizontal: 'right' };
          }
        }
        
        // Center the value column
        if (colNumber === 3) {
          cell.alignment = { horizontal: 'center' };
        }
      });
    });
    
    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${t('report.systemReport')}_Detailed_${new Date().toISOString().split('T')[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error("Failed to export detailed report:", error);
  } finally {
    setExporting(false);
  }
};
  const handleReportTypeChange = (value: ReportType) => {
    setReportType(value);
    generateReport({ reportType: value });
  };

  const handleYearChange = (value: number) => {
    setYear(value);
    generateReport({ year: value });
  };

  const handleMonthChange = (value: number) => {
    setMonth(value);
    generateReport({ month: value });
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate) {
      generateReport({ startDate: value, endDate });
    }
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (startDate) {
      generateReport({ startDate, endDate: value });
    }
  };

  const handleModulesChange = (modules: ReportModule[]) => {
    setSelectedModules(modules);
    generateReport({ modules });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t("common.notSpecified");
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'fa' || i18n.language === 'ps' ? 'fa-IR' : 'en-US', {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getMonthName = (monthNumber: number) => {
    return new Intl.DateTimeFormat(
      i18n.language === "dr" ? "fa-IR" : i18n.language === "ps" ? "ps-AF" : "en-US",
      { month: "long" },
    ).format(new Date(2000, monthNumber - 1, 1));
  };

  const StatCard = ({ title, value, icon }: any) => (
    <div className="group rounded-xl bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value || 0}</p>
        </div>
        <div className="rounded-full bg-gray-100 p-3 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="border border-gray-200 bg-white p-4 shadow-sm sm:p-6 pl-5 pr-5 max-w-8xl mx-auto mt-3" >
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('report.dashboardTitle')}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {t('report.dashboardSubtitle')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            disabled={!reportData || exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {exporting ? t('report.exporting') : t('report.exportToExcel')}
          </button>
          <button
            onClick={exportDetailedToExcel}
            disabled={!reportData || exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4h4" />
            </svg>
            {t('report.detailedExport')}
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-xl bg-gray-50 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('report.reportType')}
            </label>
            <select
              value={reportType}
              onChange={(e) => handleReportTypeChange(e.target.value as ReportType)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="yearly">{t('report.yearlyReport')}</option>
              <option value="monthly">{t('report.monthlyReport')}</option>
              <option value="range">{t('report.customRange')}</option>
            </select>
          </div>

          {(reportType === "yearly" || reportType === "monthly") && (
            <div className="min-w-[150px] flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('report.year')}
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                min="2000"
                max="2100"
              />
            </div>
          )}

          {reportType === "monthly" && (
            <div className="min-w-[180px] flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('report.month')}
              </label>
              <select
                value={month}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === "range" && (
            <>
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('report.startDate')}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="min-w-[180px] flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('report.endDate')}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </>
          )}

          {/* Modules Dropdown */}
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t('report.modules')}
            </label>
            <div className="relative">
              <button
                onClick={() => setShowModuleDropdown(!showModuleDropdown)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <span className="text-gray-700">
                  {selectedModules.length} {t('report.modulesSelected')}
                </span>
                <svg className={`h-4 w-4 transition-transform ${showModuleDropdown ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showModuleDropdown && (
                <div className="absolute left-0 right-0 z-10 mt-2 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                  <div className="p-2">
                    <button
                      onClick={() => handleModulesChange(Object.values(ReportModule))}
                      className="mb-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      {t('report.selectAll')}
                    </button>
                    <div className="my-2 h-px bg-gray-200" />
                    {Object.values(ReportModule).map((module) => (
                      <label
                        key={module}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedModules.includes(module)}
                          onChange={() => toggleModule(module)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {getModuleLabel(module)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <button
              onClick={() => generateReport()}
              disabled={loading || (reportType === "range" && (!startDate || !endDate))}
              className="inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('report.generating')}
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('report.generateReport')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Results Section */}
      <div className="rounded-2xl bg-gray-50 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('report.reportResults')}</h3>
            {reportData && (
              <p className="mt-1 text-xs text-gray-500">
                {t('report.lastUpdated')}: {new Date().toLocaleString()}
              </p>
            )}
          </div>

          {reportData && (
            <div className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm">
              {reportType === "yearly" && <span>{t('report.year')}: {year}</span>}
              {reportType === "monthly" && (
                <span>{getMonthName(month)} {year}</span>
              )}
              {reportType === "range" && startDate && endDate && (
                <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="mt-4 text-sm text-gray-500">{t('report.generating')}</p>
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Request Statistics Section */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                {t('report.requestStatistics')}
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <StatCard
                  title={t('report.totalRequests')}
                  value={reportData.totalRequests}
                  icon={
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.submitted')}
                  value={reportData.totalSubmittedRequest}
                  icon={
                    <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.inProgress')}
                  value={reportData.inProgressRequest}
                  icon={
                    <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.completed')}
                  value={reportData.totalCompletedRequest}
                  icon={
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.rejected')}
                  value={reportData.totalRejectedRequest}
                  icon={
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* User Statistics Section */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="inline-block h-2 w-2 rounded-full bg-purple-500"></span>
                {t('report.userStatistics')}
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title={t('report.totalUsers')}
                  value={reportData.totalUsers}
                  icon={
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.activeUsers')}
                  value={reportData.activeUsers}
                  icon={
                    <svg className="h-6 w-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.inactiveUsers')}
                  value={reportData.inActiveUsers}
                  icon={
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Committee Statistics Section */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500"></span>
                {t('report.committeeStatistics')}
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title={t('report.totalCommittee')}
                  value={reportData.totalCommitee}
                  icon={
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.activeCommittee')}
                  value={reportData.activeCommitee}
                  icon={
                    <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.inactiveCommittee')}
                  value={reportData.inActiveCommitee}
                  icon={
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Additional Statistics Section */}
            <div>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="inline-block h-2 w-2 rounded-full bg-pink-500"></span>
                {t('report.additionalStatistics')}
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  title={t('report.totalCompanies')}
                  value={reportData.totalCompanies}
                  icon={
                    <svg className="h-6 w-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.totalCertifications')}
                  value={reportData.totalCertifications}
                  icon={
                    <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  }
                />
                <StatCard
                  title={t('report.totalMenuItems')}
                  value={reportData.totalMenu}
                  icon={
                    <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-sm text-gray-500">
              {t('report.noReportGenerated')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
