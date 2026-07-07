import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import ContactUsService from "../../../services/contactus.service";
import ContactUsFormDialog from "./ContactUsFormDialog";
import ContactUsDetails from "./ContactUsDetails";
import { useAuth } from "../../../context/AuthContext";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

export const ContactUsList: React.FC = () => {
  const { t } = useTranslation();
  const { toast, showToast } = useAppToast();
  const { showError } = useToast();

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedViewId, setSelectedViewId] = useState<number | null>(null);
  const { hasPermission, withPermission } = useAuth();

  const loadData = async () => {
    setLoading(true);
    const response = await handleApi(
      () =>
        ContactUsService.getPaginatedContactUs({
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
      () => ContactUsService.deleteContactUs(id),
      () =>
        showToast("success", t("common.success"), t("contactUs.deleteSuccess")),
      showError,
      t,
    );
    if (response) loadData();
  };

  const confirmDelete = (row: any) => {
    confirmDialog({
      message: t("contactUs.deleteConfirm", {
        name: `${row.name || "-"} ${row.lastName || ""}`,
      }),
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
      ...withPermission("VIEW_CONTACTUS", {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => {
          setSelectedViewId(rowData.id);
          setShowDetails(true);
        },
      }),
      ...withPermission("UPDATE_CONTACTUS", {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: () => {
          setSelectedId(rowData.id);
          setShowForm(true);
        },
      }),
      ...withPermission("DELETE_CONTACTUS", {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      }),
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
    { field: "id", header: t("contactUs.columns.id") },
    { field: "name", header: t("contactUs.columns.name") },
    { field: "lastName", header: t("contactUs.columns.lastName") },
    { field: "phoneNumber", header: t("contactUs.columns.phoneNumber") },
    { field: "email", header: t("contactUs.columns.email") },
    { field: "organization", header: t("contactUs.columns.organization") },
    {
      field: "createdAt",
      header: t("contactUs.columns.createdAt"),
      body: (row: any) =>
        row.createdAt
          ? IslamicDateFormatter.formatQamari(row.createdAt, true)
          : "-",
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
        <h2 className="text-xl font-semibold text-gray-800">
          {t("contactUs.title")}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {t("contactUs.manageDescription")}
        </p>
      </div>
      <div className="flex gap-2">
        {hasPermission("ADD_CONTACTUS") && (
          <Button
            icon="pi pi-plus"
            label={t("contactUs.create")}
            text
            raised
            onClick={() => {
              setSelectedId(null);
              setShowForm(true);
            }}
          />
        )}
        <Button
          icon="pi pi-refresh"
          label={t("common.refresh")}
          text
          raised
          onClick={loadData}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="">
        <DynamicBreadcrumb items={[{ label: t("contactUs.title"), url: "" }]} />
        <DynamicTable
          title={t("contactUs.title")}
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
          <ContactUsFormDialog
            visible={showForm}
            contactUsId={selectedId}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadData();
            }}
          />
        )}

        {showDetails && selectedViewId !== null && (
          <ContactUsDetails
            visible={showDetails}
            contactUsId={selectedViewId}
            onHide={() => setShowDetails(false)}
          />
        )}
      </div>
    </>
  );
};

export default ContactUsList;
