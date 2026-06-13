import React, { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import InternationalPartyService from "../../../services/internationalparty.service";
import InternationalPartyFormDialog from "./InternationalPartyFormDialog";
import InternationalPartyDetails from "./InternationalPartyDetails";

export const InternationalPartyList: React.FC = () => {
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

  const loadData = async () => {
    setLoading(true);
    const response = await handleApi(
      () =>
        InternationalPartyService.getPaginatedInternationalParties({
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
      () => InternationalPartyService.deleteInternationalParty(id),
      () =>
        showToast(
          "success",
          t("common.success"),
          t("internationalParty.deleteSuccess"),
        ),
      showError,
      t,
    );
    if (response) {
      loadData();
    }
  };

  const confirmDelete = (row: any) => {
    confirmDialog({
      message: t("internationalParty.deleteConfirm", { name: row.name || "-" }),
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
    { field: "id", header: t("common.id") },
    { field: "name", header: t("internationalParty.fields.name") },
    {
      field: "shortName",
      header: t("internationalParty.fields.shortName"),
      body: (row: any) => row.shortName || t("common.notSpecified"),
    },
    { field: "location", header: t("internationalParty.fields.location") },
    {
      field: "organizationType",
      header: t("internationalParty.fields.organizationType"),
      body: (row: any) => row.organizationType || t("common.notSpecified"),
    },
    {
      field: "email",
      header: t("internationalParty.fields.email"),
      body: (row: any) => row.email || t("common.notSpecified"),
    },
    {
      header: t("internationalParty.fields.status"),
      body: (row: any) => (
        <Tag
          value={row.isActive ? t("internationalParty.active") : t("internationalParty.inactive")}
          severity={row.isActive ? "success" : "danger"}
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
        <h2 className="text-xl font-semibold text-gray-800">
          {t("internationalParty.title")}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {t("internationalParty.manageDescription")}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          icon="pi pi-plus"
          label={t("internationalParty.create")}
          text
          raised
          onClick={() => {
            setSelectedId(null);
            setShowForm(true);
          }}
        />
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
      <div>
        <DynamicBreadcrumb items={[{ label: t("internationalParty.title"), url: "" }]} />
        <DynamicTable
          title={t("internationalParty.title")}
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
          <InternationalPartyFormDialog
            visible={showForm}
            internationalPartyId={selectedId}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadData();
            }}
          />
        )}

        {showDetails && (
          <InternationalPartyDetails
            visible={showDetails}
            internationalPartyId={selectedViewId}
            onHide={() => setShowDetails(false)}
          />
        )}
      </div>
    </>
  );
};

export default InternationalPartyList;
