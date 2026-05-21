import React, { useEffect, useRef, useState } from "react";
import { useAppToast } from "../../../hooks/useToast";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DynamicTable } from "../../common/DynamicTable";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { Toast } from "primereact/toast";
import CertificationService from "../../../services/certification.service";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ExcelExport from "../../common/ExcelExport";
import { CertificationUpdate } from "./CertificationUpdate";

export const CertificationList = () => {
  // ================= STATE =================
  const [certifications, setCertifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const { t, i18n } = useTranslation();
  const { toast, showToast } = useAppToast();
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [selectedCertification, setSelectedCertification] = useState<any>(null);

  // ================= FETCH =================
  const getCertificates = async () => {
    try {
      setLoading(true);

      const response = await CertificationService.getPaginatedCertifications({
        page: first / rows,
        size: rows,
        sort: "id,desc",
      });

      setCertifications(response.data.data);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error("Failed loading certifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCertificates();
  }, [first, rows]);

  // ================= DELETE =================
  const confirmDelete = (row: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-2 p-4">
          <i className="pi pi-trash text-3xl text-red-500" />
          <span className="font-semibold text-lg">
            {t("certification.deleteConfirm", { name: row.certificateNumber })}
          </span>
          <p>
            {t("certification.deleteConfirmDesc")}{" "}
            <b>{row.certificateNumber}</b> ?
          </p>
        </div>
      ),
      acceptLabel: t("common.delete"),
      rejectLabel: t("common.cancel"),
      accept: () => handleDelete(row.id),
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await CertificationService.deleteCertification(id);

      showToast("success", "Success", "Certificate deleted");
      getCertificates();
    } catch {
      showToast("error", "Error", "Delete failed");
    }
  };

  // ================= ACTION MENU =================
  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () =>
          navigate(
            `/certification-details/${
              rowData.requestId || rowData.certificationRequest.id
            }`,
          ),
      },
      {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      },
      {
        label: t("certification.uploadscan"),
        icon: "pi pi-pencil",
        command: () => {
          setSelectedCertification(rowData);
          setUpdateDialogVisible(true);
        },
      },
      {
        label: t("certification.print"),
        icon: "pi pi-print",
        command: () => navigate(`/certifications/print/${rowData.id}`),
      },
    ];

    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon="pi pi-ellipsis-v"
          text
          onClick={(e) => menu.current.toggle(e)}
        />
      </div>
    );
  };

  // ================= HEADER =================
  const header = () => (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-blue-700">
          {t("certification.management")}
        </h2>

        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
          {totalRecords} {t("common.total")}
        </span>
      </div>
      <div>
        <Button
          icon="pi pi-sync"
          label="Refresh"
          text
          severity="info"
          raised
          onClick={getCertificates}
        />
        <ExcelExport
          data={certifications}
          totalElements={totalRecords}
          fileName="companies"
          sheetName="Companies"
          fetchAllData={async () => {
            const res = await CertificationService.getPaginatedCertifications({
              page: 0,
              size: totalRecords,
              sort: "id,desc",
            });

            return res.data.data;
          }}
        />
      </div>
    </div>
  );

  const issueDateBodyTemplate = (rowData: any) => {
    if (!rowData.issuedDate) return <span className="text-gray-400">—</span>;

    const date = new Date(rowData.issuedDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-700">{formattedDate}</span>
        <span className="text-xs text-gray-400">{formattedTime}</span>
      </div>
    );
  };
  const expireDateBodyTemplate = (rowData: any) => {
    if (!rowData.expiryDate) return <span className="text-gray-400">—</span>;

    const date = new Date(rowData.expiryDate);
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-700">{formattedDate}</span>
        <span className="text-xs text-gray-400">{formattedTime}</span>
      </div>
    );
  };

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      field: "id",
      header: t("certification.id"),
      style: { width: "80px" },
    },
    {
      field: "certificateNumber",
      header: t("certification.number"),
      sortable: true,
    },
    {
      field: "certificationType",
      header: t("certification.type"),
      sortable: true,
    },
    {
      field: "issuedDate",
      header: t("certification.issuedDate"),
      body: issueDateBodyTemplate,
      sortable: true,
    },
    {
      field: "expiryDate",
      header: t("certification.expiryDate"),
      body: expireDateBodyTemplate,
      sortable: true,
    },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "120px" },
    },
  ];

  // ================= BREADCRUMB =================
  const breadcrumbItems = [
    { label: t("certification.management"), url: "/certifications" },
  ];

  // ================= UI =================
  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />
      <CertificationUpdate
        showToast={showToast}
        visible={updateDialogVisible}
        certification={selectedCertification}
        onHide={() => setUpdateDialogVisible(false)}
        onUpdated={getCertificates}
      />
      <DynamicTable
        title="Certification Management"
        value={certifications}
        columns={columns}
        header={header()}
        loading={loading}
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
        }}
      />
    </>
  );
};
