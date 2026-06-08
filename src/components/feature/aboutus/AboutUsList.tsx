import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { Toast } from "primereact/toast";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { useTranslation } from "react-i18next";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import AboutUsService from "../../../services/aboutus.service";
import AboutUsFormDialog from "./AboutUsFormDialog";
import AboutUsDetails from "./AboutUsDetails";

export const AboutUsList: React.FC = () => {
  const { t } = useTranslation();
  const { toast, showToast } = useAppToast();
  const { showError } = useToast();

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedViewId, setSelectedViewId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    const response = await handleApi(
      () =>
        AboutUsService.getPaginatedAboutUs({
          page: first / rows,
          size: rows,
          sort: "id,desc",
        }),
      () => {},
      showError,
      t,
    );

    if (response) {
      setList(response.data?.data || []);
      setTotalRecords(response.data?.totalElements || 0);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [first, rows]);

  const handleDelete = async (id: number) => {
    const response = await handleApi(
      () => AboutUsService.deleteAboutUs(id),
      () => showToast("success", t("common.success"), t("aboutUs.deleteSuccess")),
      showError,
      t,
    );
    if (response) {
      loadData();
    }
  };

  const confirmDelete = (row: any) => {
    confirmDialog({
      message: t("aboutUs.deleteConfirm", { subject: row.subject || row.title || "-" }),
      header: t("common.delete"),
      icon: "pi pi-exclamation-triangle",
      acceptLabel: t("common.delete"),
      rejectLabel: t("common.cancel"),
      accept: () => handleDelete(row.id),
    });
  };

  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);
    const items: MenuItem[] = [
      {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => {
          setSelectedViewId(rowData.id);
          setShowDetails(true);
        },
      },
      {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: () => {
          setSelectedId(rowData.id);
          setShowForm(true);
        },
      },
      {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      },
    ];
    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-text p-button-sm"
          onClick={(e) => menu.current.toggle(e)}
        />
      </div>
    );
  };

  const columns = [
    { field: "id", header: t("aboutUs.columns.id") },
    { field: "subject", header: t("aboutUs.columns.subject") },
    {
      field: "about",
      header: t("aboutUs.columns.about"),
      body: (row: any) => row.about ?? row.description ?? row.desc ?? "-",
    },
    {
      header: t("aboutUs.columns.status"),
      body: (row: any) => (
        <Tag
          value={row.active ? t("aboutUs.active") : t("aboutUs.inactive")}
          severity={row.active ? "success" : "danger"}
        />
      ),
    },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "120px" },
    },
  ];

  const header = (
    <div className="flex flex-col md:flex-row justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{t("aboutUs.title")}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t("aboutUs.manageDescription")}</p>
      </div>
      <div className="flex gap-2">
        <Button
          icon="pi pi-plus"
          label={t("aboutUs.create")}
          text
          raised
          onClick={() => {
            setSelectedId(null);
            setShowForm(true);
          }}
        />
        <Button icon="pi pi-refresh" label={t("common.refresh")} text raised onClick={loadData} />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="">
        <DynamicBreadcrumb items={[{ label: t("aboutUs.title"), url: "" }]} />

        <DynamicTable
          title={t("aboutUs.title")}
          value={list}
          columns={columns}
          header={header}
          loading={loading}
          first={first}
          rows={rows}
          totalRecords={totalRecords}
          onPage={(e) => {
            setFirst(e.first);
            setRows(e.rows);
          }}
        />

        {showForm && (
          <AboutUsFormDialog
            visible={showForm}
            aboutUsId={selectedId}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadData();
            }}
          />
        )}

        {showDetails && (
          <AboutUsDetails
            visible={showDetails}
            aboutUsId={selectedViewId}
            onHide={() => setShowDetails(false)}
          />
        )}
      </div>
    </>
  );
};

export default AboutUsList;