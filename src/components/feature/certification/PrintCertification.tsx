import React, { useRef, useState } from "react";
import { Button } from "primereact/button";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import { useTranslation } from "react-i18next";
import CertificationService from "../../../services/certification.service";

interface Props {
  certification: any;
}

export const PrintCertification: React.FC<Props> = ({ certification }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();

  if (!certification) return null;

  const company = certification.certificationRequest?.company || {};
  const notSpecified = t("common.notSpecified");
  const printPage = {
    emirate: t("certification.printPage.emirate"),
    authority: t("certification.printPage.authority"),
    title: t("certification.printPage.title"),
    registrationNumber: t("certification.printPage.registrationNumber"),
    companyLicenseNumber: t("certification.printPage.companyLicenseNumber"),
    certificateType: t("certification.printPage.certificateType"),
    signature: t("certification.printPage.signature"),
    issueDate: t("certification.printPage.issueDate"),
    expiryDate: t("certification.printPage.expiryDate"),
    bodyPrefix: t("certification.printPage.bodyPrefix"),
    bodyMiddleLocation: t("certification.printPage.bodyMiddleLocation"),
    bodyMiddleCategory: t("certification.printPage.bodyMiddleCategory"),
    bodySuffix: t("certification.printPage.bodySuffix"),
  };

  const getCertificationType = (type: string) => {
    if (!type) return notSpecified;
    return t(`home.certificationTypes.${type}`);
  };

  const handlePrint = () => {
    CertificationService.updateCertificationStatus(
      Number(certification.id),
      "PRINTED",
    )
      .then(() => {})
      .catch((error) => {
        console.error("Error updating certification status:", error);
      });
  };

  const generatePDF = async (forPrint: boolean = false) => {
    if (!certificateRef.current) return;

    if (forPrint) {
      setIsPrinting(true);
    } else {
      setIsGenerating(true);
    }
    setProgress(10);

    try {
      const element = certificateRef.current;
      const originalWidth = element.style.width;
      const originalTransform = element.style.transform;

      element.style.width = "200mm";
      element.style.transform = "none";

      setProgress(30);

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      setProgress(70);

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      let imgWidth = pdfWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = (canvas.width * imgHeight) / canvas.height;
      }

      const xOffset = (pdfWidth - imgWidth) / 2;
      const yOffset = (pdfHeight - imgHeight) / 2;

      pdf.addImage(
        imgData,
        "PNG",
        xOffset,
        yOffset,
        imgWidth,
        imgHeight,
        undefined,
        "FAST",
      );

      setProgress(90);

      if (forPrint) {
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl, "_blank");

        if (printWindow) {
          printWindow.addEventListener("load", () => {
            printWindow.print();
            handlePrint();
          });
        }

        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 100);
      } else {
        pdf.save(
          `final-certificate-${certification.certificateNumber || "asqa"}.pdf`,
        );
        handlePrint();
      }

      setProgress(100);
      element.style.width = originalWidth;
      element.style.transform = originalTransform;
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(t("certification.printPage.pdfError"));
    } finally {
      if (forPrint) {
        setIsPrinting(false);
      } else {
        setIsGenerating(false);
      }
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const verifyUrl = `https://asqa.gov.af/verify/${certification.certificateNumber}`;
  const dates = IslamicDateFormatter.getDualDate(
    new Date(certification.issueDate),
  );
  const expiryDates = IslamicDateFormatter.getDualDate(
    new Date(certification.expiryDate),
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex justify-center items-center p-8">
      <div className="flex flex-col items-center gap-8">
        <div
          id="certificate-content"
          ref={certificateRef}
          className="certificate-container bg-white shadow-2xl relative"
          dir="rtl"
          style={{
            width: "1000px",
            minHeight: "565px",
            backgroundColor: "#ffffff",
            position: "relative",
            zIndex: 1,
            margin: "0 auto",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Decorative Border Frame - Outer */}
          <div
            style={{
              position: "absolute",
              inset: "15px",
              border: "3px solid #d4af37",
              borderRadius: "8px",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Decorative Border Frame - Inner */}
          <div
            style={{
              position: "absolute",
              inset: "22px",
              border: "1px solid #d4af37",
              borderRadius: "6px",
              pointerEvents: "none",
              zIndex: 2,
            }}
          />

          {/* Corner Decorations - Top Left */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              width: "40px",
              height: "40px",
              border: "3px solid #d4af37",
              borderRight: "none",
              borderBottom: "none",
              borderRadius: "6px 0 0 0",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Corner Decorations - Top Right */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: "40px",
              height: "40px",
              border: "3px solid #d4af37",
              borderLeft: "none",
              borderBottom: "none",
              borderRadius: "0 6px 0 0",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Corner Decorations - Bottom Left */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              width: "40px",
              height: "40px",
              border: "3px solid #d4af37",
              borderRight: "none",
              borderTop: "none",
              borderRadius: "0 0 0 6px",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Corner Decorations - Bottom Right */}
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              right: "12px",
              width: "40px",
              height: "40px",
              border: "3px solid #d4af37",
              borderLeft: "none",
              borderTop: "none",
              borderRadius: "0 0 6px 0",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Corner Accent Diamonds - Top Left */}
          <div
            style={{
              position: "absolute",
              top: "25px",
              left: "25px",
              width: "10px",
              height: "10px",
              backgroundColor: "#d4af37",
              transform: "rotate(45deg)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Corner Accent Diamonds - Top Right */}
          <div
            style={{
              position: "absolute",
              top: "25px",
              right: "25px",
              width: "10px",
              height: "10px",
              backgroundColor: "#d4af37",
              transform: "rotate(45deg)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Corner Accent Diamonds - Bottom Left */}
          <div
            style={{
              position: "absolute",
              bottom: "25px",
              left: "25px",
              width: "10px",
              height: "10px",
              backgroundColor: "#d4af37",
              transform: "rotate(45deg)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Corner Accent Diamonds - Bottom Right */}
          <div
            style={{
              position: "absolute",
              bottom: "25px",
              right: "25px",
              width: "10px",
              height: "10px",
              backgroundColor: "#d4af37",
              transform: "rotate(45deg)",
              zIndex: 3,
              pointerEvents: "none",
            }}
          />

          {/* Decorative Pattern - Top Bar */}
          <div
            style={{
              position: "absolute",
              top: "55px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "8px",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            {[...Array(7)].map((_, i) => (
              <div
                key={`top-${i}`}
                style={{
                  width: "4px",
                  height: "4px",
                  backgroundColor: "#d4af37",
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>

          {/* Background Pattern - Subtle Texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
              opacity: 0.03,
              backgroundImage: `
                radial-gradient(circle at 20% 50%, #d4af37 1px, transparent 1px),
                radial-gradient(circle at 80% 50%, #d4af37 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Watermark */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              opacity: 0.5,
            }}
          >
            <img
              src="/asqanew.png"
              alt={t("common.asqa")}
              style={{
                width: "300px",
                height: "auto",
                filter: "grayscale(100%) brightness(1.2)",
                opacity: 0.08,
              }}
            />
          </div>

          {/* Main Content */}
          <div style={{ position: "relative", zIndex: 10, padding: "30px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <div style={{ textAlign: "center", width: "100px" }}>
                <img
                  src="/imerate.png"
                  alt={t("certification.printPage.signature")}
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "contain",
                    margin: "0 auto",
                  }}
                />
              </div>

              <div style={{ textAlign: "center", flex: 1, padding: "0 20px" }}>
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: "5px",
                  }}
                >
                  {printPage.emirate}
                </h2>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    marginBottom: "5px",
                  }}
                >
                  {printPage.authority}
                </h3>
                <div />
                <h1
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#1f2937",
                    marginTop: "10px",
                  }}
                >
                  {printPage.title}
                </h1>
              </div>
              <div style={{ textAlign: "center", width: "100px" }}>
                <img
                  src="/asqanew.png"
                  alt={t("common.asqa")}
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "contain",
                    margin: "0 auto",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "30px",
                padding: "0 20px",
              }}
            >
              <div style={{ textAlign: "center", flex: 1 }}>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  {printPage.registrationNumber}
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#1e40af",
                  }}
                >
                  {certification.certificateNumber}
                </p>
              </div>

              <div style={{ textAlign: "center", flex: 1 }}>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginBottom: "5px",
                  }}
                >
                  {printPage.companyLicenseNumber}
                </p>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#111827",
                  }}
                >
                  {company.jawazNumber || notSpecified}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: "30px", marginTop: "40px" }}>
              <p
                style={{
                  fontSize: "20px",
                  lineHeight: "2",
                  textAlign: "center",
                  color: "#374151",
                }}
              >
                {printPage.bodyPrefix}{" "}
                <strong style={{ color: "#1e40af", fontWeight: "bold" }}>
                  {company.companyNamePS ||
                    company.companyNameEN ||
                    notSpecified}
                </strong>{" "}
                {printPage.bodyMiddleLocation}{" "}
                <strong style={{ color: "#1e40af", fontWeight: "bold" }}>
                  {company.activityPlace || notSpecified}
                </strong>{" "}
                {printPage.bodyMiddleCategory}{" "}
                <strong style={{ color: "#1e40af", fontWeight: "bold" }}>
                  {company.categories?.length > 0
                    ? company.categories
                        .map((cat: any) => cat.categoryName)
                        .join("، ")
                    : notSpecified}
                </strong>{" "}
                {printPage.bodySuffix}
              </p>
            </div>

            <div style={{ marginBottom: "50px" }}>
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.6",
                  textAlign: "right",
                  color: "#374151",
                }}
              >
                {printPage.certificateType}:{" "}
                <strong style={{ color: "#1e40af", fontWeight: "bold" }}>
                  {certification.certificationType
                    ? getCertificationType(certification.certificationType)
                    : notSpecified}
                </strong>
              </p>
            </div>

            <div
              style={{
                marginTop: "50px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "20px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ marginBottom: "10px" }}>
                    <p style={{ fontSize: "11px", fontWeight: "600" }}>
                      {printPage.issueDate}:
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#1f2937",
                        marginRight: "20px",
                      }}
                    >
                      {dates.hijri}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: "600" }}>
                      {printPage.expiryDate}:
                    </p>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "bold",
                        color: "#1f2937",
                        marginRight: "20px",
                      }}
                    >
                      {expiryDates?.hijri || notSpecified}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "center", flex: 6 }}>
                <p style={{ fontWeight: "600", fontSize: "12px" }}>
                  {printPage.signature}
                </p>
                <p
                  style={{
                    marginTop: "40px",
                    color: "#374151",
                    fontSize: "14px",
                    letterSpacing: "2px",
                  }}
                >
                  .......................................
                </p>
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    margin: "0 auto",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <QRCodeCanvas
                    value={verifyUrl}
                    size={75}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => generatePDF(true)}
            disabled={isGenerating || isPrinting}
            className="px-6 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:border-blue-500 hover:text-blue-600 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPrinting ? (
              <>
                <i className="pi pi-spin pi-spinner"></i>
                <span>{t("certification.printPage.preparing")}</span>
              </>
            ) : (
              <>
                <i className="pi pi-print"></i>
                <span>{t("certification.printPage.printDocument")}</span>
              </>
            )}
          </button>

          <button
            onClick={() => generatePDF(false)}
            disabled={isGenerating || isPrinting}
            className="px-6 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <i className="pi pi-spin pi-spinner"></i>
                <span>
                  {t("certification.printPage.progress", { progress })}
                </span>
              </>
            ) : (
              <>
                <i className="pi pi-download"></i>
                <span>{t("certification.printPage.downloadPdf")}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {(isGenerating || isPrinting) && progress > 0 && progress < 100 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg p-3 min-w-[280px] border border-gray-200">
          <div className="flex items-center gap-3">
            <i className="pi pi-spin pi-spinner text-blue-600"></i>
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {progress}%
            </span>
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">
            {progress < 30 && t("certification.printPage.collectingInfo")}
            {progress >= 30 &&
              progress < 70 &&
              t("certification.printPage.designingDocument")}
            {progress >= 70 &&
              progress < 100 &&
              t("certification.printPage.savingPdf")}
          </p>
        </div>
      )}

      <style>{`
        @media print {
          body {
            background: white;
            margin: 0;
            padding: 0;
          }

          .certificate-container {
            box-shadow: none;
            margin: 0;
            padding: 0;
            border-radius: 0 !important;
          }

          @page {
            size: landscape;
            margin: 0;
          }
        }

        [dir="rtl"] {
          direction: rtl;
        }

        .certificate-container {
          transition: all 0.3s ease;
        }

        .certificate-container:hover {
          box-shadow: 0 30px 80px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};