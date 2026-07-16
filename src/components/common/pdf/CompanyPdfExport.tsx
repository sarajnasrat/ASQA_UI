import React from "react";
import { useTranslation } from "react-i18next";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { IslamicDateFormatter } from "../datepicker/IslamicDateFormatter";

export interface CompanyPdfExportHandle {
  downloadPdf: () => Promise<void>;
}

interface CompanyPdfExportProps {
  company: any;
  contactPersons: any[];
  certificationRequests: any[];
  certifications: any[];
  assetUrl: (path?: string) => string;
  filename?: string;
  authorityLogoSrc?: string;
  fallbackLogoSrc?: string;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

type PdfSection = {
  title: string;
  rows: [string, string, string, string][];
};

const CompanyPdfExport = React.forwardRef<
  CompanyPdfExportHandle,
  CompanyPdfExportProps
>(
  (
    {
      company,
      contactPersons,
      certificationRequests,
      certifications,
      assetUrl,
      filename,
      authorityLogoSrc,
      fallbackLogoSrc,
      onSuccess,
      onError,
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const pdfTemplateRef = React.useRef<HTMLDivElement>(null);

    const formatDate = React.useCallback((value?: string) => {
      if (!value) return "-";
      return IslamicDateFormatter.formatQamari(value);
    }, []);

    const formatDateTime = React.useCallback((value?: string) => {
      if (!value) return "-";
      return IslamicDateFormatter.formatQamari(value, true);
    }, []);

    const labelize = React.useCallback((value?: string) => {
      return value
        ? value
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())
        : "-";
    }, []);

    const formatContactAddress = React.useCallback(
      (address: any) =>
        [address?.district?.districtName, address?.details]
          .filter(Boolean)
          .join(" - ") || t("common.notSpecified"),
      [t],
    );

    const sortedContactPersons = React.useMemo(
      () =>
        [...contactPersons].sort(
          (a: any, b: any) =>
            new Date(b?.createdDate || b?.createdAt || 0).getTime() -
            new Date(a?.createdDate || a?.createdAt || 0).getTime(),
        ),
      [contactPersons],
    );

    const sortedCertifications = React.useMemo(
      () =>
        [...certifications].sort(
          (a: any, b: any) =>
            new Date(b?.createdDate || b?.issueDate || 0).getTime() -
            new Date(a?.createdDate || a?.issueDate || 0).getTime(),
        ),
      [certifications],
    );

    const primaryContact = sortedContactPersons[0];

    const companyCategoriesText =
      company?.categories
        ?.map((category: any) => category.categoryName)
        .filter(Boolean)
        .join(", ") || t("common.notSpecified");

    const pdfCompanyRows: [string, string, string, string][] = [
      [
        t("company.labels.companyOwnerNameDr"),
        company?.companyOwnerNameDr || t("common.notSpecified"),
        t("company.labels.email"),
        company?.email || t("common.notSpecified"),
      ],
      [
        t("company.labels.companyOwnerNameEn"),
        company?.companyOwnerNameEn || t("common.notSpecified"),
        t("company.labels.phoneNumber"),
        company?.phoneNumber || t("common.notSpecified"),
      ],
      [
        t("company.labels.ownerNameDr"),
        company?.companyOwnerNameDr || t("common.notSpecified"),
        t("company.labels.jawazIssueDate"),
        formatDate(company?.jawazIssueDate),
      ],
      [
        t("company.labels.companyNamePS"),
        company?.companyNamePS || t("common.notSpecified"),
        t("company.labels.jawazExpiryDate"),
        formatDate(company?.jawazExpiryDate),
      ],
      [
        t("company.labels.mainBranchAddress"),
        company?.mainBranchAddress || t("common.notSpecified"),
        t("company.labels.tinNumber"),
        company?.tinNumber || t("common.notSpecified"),
      ],
      [
        t("company.labels.activityPlace"),
        company?.activityPlace || t("common.notSpecified"),
        t("company.labels.businessLogo"),
        company?.bussinessLogoUrl ? t("common.yes") : t("common.no"),
      ],
      [
        t("company.labels.activityType"),
        company?.activityType || t("common.notSpecified"),
        t("company.labels.categories"),
        companyCategoriesText,
      ],
      [
        t("company.labels.establishYear"),
        formatDate(company?.establishYear),
        t("company.table.createdAt"),
        formatDateTime(company?.createdDate),
      ],
      [
        t("company.labels.address"),
        company?.address || t("common.notSpecified"),
        "",
        "",
      ],
    ];

    const pdfContactRows: [string, string, string, string][] = [
      [
        t("common.name"),
        primaryContact
          ? [primaryContact.firstName, primaryContact.lastName]
              .filter(Boolean)
              .join(" ")
          : t("common.notSpecified"),
        t("company.labels.phoneNumber"),
        primaryContact?.phoneNumber || t("common.notSpecified"),
      ],
      [
        t("contactPerson.position"),
        primaryContact?.position || t("common.notSpecified"),
        t("company.labels.email"),
        primaryContact?.email || t("common.notSpecified"),
      ],
      [
        t("company.labels.address"),
        primaryContact?.addresses
          ?.map((address: any) => formatContactAddress(address))
          .join(", ") || t("common.notSpecified"),
        "",
        "",
      ],
    ];

    const pdfRequestSections: PdfSection[] =
      certificationRequests.length > 0
        ? certificationRequests.map((request: any, index: number) => ({
            title:
              certificationRequests.length > 1
                ? `${t("company.pdf.requestInfo")} ${index + 1}`
                : t("company.pdf.requestInfo"),
            rows: [
              [
                t("certificationRequest.labels.requestType"),
                t(
                  `certificationRequest.typeOptions.${request.requestType}`,
                  labelize(request.requestType),
                ),
                t("certificationRequest.labels.certificationType"),
                t(
                  `certificationRequest.certificationTypeOptions.${request.certificationType}`,
                  labelize(request.certificationType),
                ),
              ],
              [
                t("certificationRequest.labels.serialNumber"),
                request?.serialNumber || t("common.notSpecified"),
                t("certificationRequest.labels.createdDate"),
                formatDateTime(request?.createdDate),
              ],
              [
                t("certificationRequest.labels.trackingNumber"),
                request?.trackingNumber || t("common.notSpecified"),
                t("certificationRequest.labels.requestStatus"),
                t(
                  `certificationRequest.statusOptions.${request.requestStatus}`,
                  labelize(request.requestStatus),
                ),
              ],
            ],
          }))
        : [
            {
              title: t("company.pdf.requestInfo"),
              rows: [[t("common.details"), t("company.messages.noData"), "", ""]],
            },
          ];

    const pdfCertificationSections: PdfSection[] =
      sortedCertifications.length > 0
        ? sortedCertifications.map((certification: any, index: number) => ({
            title:
              sortedCertifications.length > 1
                ? `${t("company.pdf.certificationInfo")} ${index + 1}`
                : t("company.pdf.certificationInfo"),
            rows: [
              [
                t("certification.certificateNumber"),
                certification?.certificateNumber || t("common.notSpecified"),
                t("certification.certificateStatus"),
                t(
                  `certification.statusOptions.${certification.certificationStatus}`,
                  labelize(certification.certificationStatus),
                ),
              ],
              [
                t("certification.issueDate"),
                formatDateTime(certification?.issueDate),
                t("certification.expiryDate"),
                formatDateTime(certification?.expiryDate),
              ],
            ],
          }))
        : [
            {
              title: t("company.pdf.certificationInfo"),
              rows: [[t("common.details"), t("company.messages.noData"), "", ""]],
            },
          ];

    const pdfExportSections = React.useMemo<PdfSection[]>(
      () => [
        { title: t("company.pdf.companyInfo"), rows: pdfCompanyRows },
        { title: t("company.pdf.contactInfo"), rows: pdfContactRows },
        ...pdfRequestSections,
        ...pdfCertificationSections,
      ],
      [pdfCertificationSections, pdfCompanyRows, pdfContactRows, pdfRequestSections, t],
    );

    const pdfPages = React.useMemo(() => {
      const pages: PdfSection[][] = [];
      const firstPageSections = pdfExportSections.slice(0, 2);
      const remainingSections = pdfExportSections.slice(2);

      if (firstPageSections.length > 0) {
        pages.push(firstPageSections);
      }

      let currentPage: PdfSection[] = [];
      let currentWeight = 0;

      remainingSections.forEach((section) => {
        const sectionWeight = section.rows.length + 2;
        const maxWeight = 18;

        if (currentPage.length > 0 && currentWeight + sectionWeight > maxWeight) {
          pages.push(currentPage);
          currentPage = [];
          currentWeight = 0;
        }

        currentPage.push(section);
        currentWeight += sectionWeight;
      });

      if (currentPage.length > 0) {
        pages.push(currentPage);
      }

      if (pages.length === 0) {
        pages.push(pdfExportSections);
      }

      return pages;
    }, [pdfExportSections]);

    const handleDownloadPdf = React.useCallback(async () => {
      try {
        if (!company || !pdfTemplateRef.current) {
          throw new Error("PDF template not ready");
        }

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageNodes = Array.from(
          pdfTemplateRef.current.querySelectorAll("[data-pdf-page='true']"),
        );

        for (let index = 0; index < pageNodes.length; index += 1) {
          const canvas = await html2canvas(pageNodes[index] as HTMLElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          });

          const imgData = canvas.toDataURL("image/png", 1.0);
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (index > 0) {
            pdf.addPage();
          }

          pdf.addImage(
            imgData,
            "PNG",
            0,
            0,
            imgWidth,
            Math.min(imgHeight, pageHeight),
          );
        }

        pdf.save(filename || `company-details-${company.id || "export"}.pdf`);
        onSuccess?.();
      } catch (error) {
        onError?.(error);
      }
    }, [company, filename, onError, onSuccess]);

    React.useImperativeHandle(ref, () => ({
      downloadPdf: handleDownloadPdf,
    }));

    return (
      <div
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "794px",
          background: "#ffffff",
          zIndex: -1,
        }}
      >
        <div
          ref={pdfTemplateRef}
          style={{
            width: "794px",
            color: "#111827",
            fontFamily: "Arial, sans-serif",
            background: "#ffffff",
            direction: "rtl",
          }}
        >
          {pdfPages.map((pageSections, pageIndex) => (
            <div
              key={`pdf-page-${pageIndex}`}
              data-pdf-page="true"
              style={{
                width: "794px",
                minHeight: "1122px",
                padding: "18px",
                boxSizing: "border-box",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  border: "2px solid #111827",
                  minHeight: "1086px",
                  padding: "54px 52px 48px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 120px",
                    alignItems: "center",
                    columnGap: "24px",
                    marginBottom: "34px",
                    direction: "ltr",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <img
                      src={authorityLogoSrc || `${window.location.origin}/asqanew.png`}
                      alt="ASQA"
                      style={{ width: "86px", height: "54px", objectFit: "contain" }}
                    />
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      direction: "rtl",
                      color: "#111827",
                      lineHeight: 1.8,
                    }}
                  >
                    <div style={{ fontSize: "18px", fontWeight: 700 }}>
                      {t("company.pdf.emirate")}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>
                      {t("company.pdf.authority")}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 700 }}>
                      {t("company.pdf.directorate")}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <img
                      src={
                        assetUrl(company?.bussinessLogoUrl || company?.logoUrl) ||
                        fallbackLogoSrc ||
                        `${window.location.origin}/MOLSA-LOGO.png`
                      }
                      alt="Company Logo"
                      style={{ width: "86px", height: "54px", objectFit: "contain" }}
                    />
                  </div>
                </div>

                {pageSections.map((section, sectionIndex) => (
                  <div
                    key={section.title}
                    style={{
                      marginBottom:
                        sectionIndex === pageSections.length - 1 ? "0" : "26px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        textAlign: "right",
                        marginBottom: "10px",
                      }}
                    >
                      {section.title}
                    </div>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                        fontSize: "12px",
                        direction: "rtl",
                      }}
                    >
                      <tbody>
                        {section.rows.map((row, rowIndex) => (
                          <tr key={`${section.title}-${rowIndex}`}>
                            {row[2] === "" && row[3] === "" ? (
                              <>
                                <td
                                  style={{
                                    width: "18%",
                                    borderRight: "0.5px solid #111827",
                                    borderBottom: "0.5px solid #111827",
                                    borderTop:
                                      rowIndex === 0
                                        ? "0.5px solid #111827"
                                        : undefined,
                                    padding: "10px 10px",
                                    fontWeight: 700,
                                    textAlign: "right",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {row[0]}
                                </td>
                                <td
                                  colSpan={3}
                                  style={{
                                    borderRight: "0.5px solid #111827",
                                    borderLeft: "0.5px solid #111827",
                                    borderBottom: "0.5px solid #111827",
                                    borderTop:
                                      rowIndex === 0
                                        ? "0.5px solid #111827"
                                        : undefined,
                                    padding: "10px 10px",
                                    wordBreak: "break-word",
                                    textAlign: "right",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {row[1]}
                                </td>
                              </>
                            ) : (
                              <>
                                <td
                                  style={{
                                    width: "18%",
                                    borderRight: "0.5px solid #111827",
                                    borderBottom: "0.5px solid #111827",
                                    borderTop:
                                      rowIndex === 0
                                        ? "0.5px solid #111827"
                                        : undefined,
                                    padding: "10px 10px",
                                    fontWeight: 700,
                                    textAlign: "right",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {row[0]}
                                </td>
                                <td
                                  style={{
                                    width: "32%",
                                    borderRight: "0.5px solid #111827",
                                    borderBottom: "0.5px solid #111827",
                                    borderTop:
                                      rowIndex === 0
                                        ? "0.5px solid #111827"
                                        : undefined,
                                    padding: "10px 10px",
                                    wordBreak: "break-word",
                                    textAlign: "right",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {row[1]}
                                </td>
                                <td
                                  style={{
                                    width: "18%",
                                    borderRight: "0.5px solid #111827",
                                    borderBottom: "0.5px solid #111827",
                                    borderTop:
                                      rowIndex === 0
                                        ? "0.5px solid #111827"
                                        : undefined,
                                    padding: "10px 10px",
                                    fontWeight: 700,
                                    textAlign: "right",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {row[2]}
                                </td>
                                <td
                                  style={{
                                    width: "32%",
                                    borderRight: "0.5px solid #111827",
                                    borderLeft: "0.5px solid #111827",
                                    borderBottom: "0.5px solid #111827",
                                    borderTop:
                                      rowIndex === 0
                                        ? "0.5px solid #111827"
                                        : undefined,
                                    padding: "10px 10px",
                                    wordBreak: "break-word",
                                    textAlign: "right",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  {row[3]}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
);

CompanyPdfExport.displayName = "CompanyPdfExport";

export default CompanyPdfExport;
