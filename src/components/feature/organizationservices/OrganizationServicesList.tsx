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
import OrganizationServicesService from "../../../services/organizationservices.service";
import OrganizationServicesFormDialog from "./OrganizationServicesFormDialog";
import OrganizationServicesDetails from "./OrganizationServicesDetails";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

export const OrganizationServicesList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { toast, showToast } = useAppToast();
  const { showError } = useToast();
  const isRtl = i18n.language === "ps" || i18n.language === "dr";

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
        OrganizationServicesService.getPaginatedOrganizations({
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
      () => OrganizationServicesService.deleteOrganization(id),
      () =>
        showToast(
          "success",
          t("common.success"),
          t("organizationServices.deleteSuccess"),
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
      message: t("organizationServices.deleteConfirm", { name: row.name || "-" }),
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
    { field: "name", header: t("organizationServices.fields.name") },
    {
      field: "service",
      header: t("organizationServices.fields.service"),
      body: (row: any) =>
        row.service ? (
          <div
            dir={isRtl ? "rtl" : "ltr"}
            className="line-clamp-2 max-w-md text-sm text-gray-700 [&_p]:m-0"
            dangerouslySetInnerHTML={{ __html: row.service }}
          />
        ) : (
          <span>{t("common.notSpecified")}</span>
        ),
    },
    {
      header: t("organizationServices.fields.status"),
      body: (row: any) => (
        <Tag
          value={row.isActive ? t("organizationServices.active") : t("organizationServices.inactive")}
          severity={row.isActive ? "success" : "danger"}
        />
      ),
    },
    {
      field: "createdAt",
      header: t("common.createdDate"),
      body: (row: any) =>
        row.createdAt
          ? IslamicDateFormatter.formatQamari(row.createdAt, true)
          : t("common.notSpecified"),
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
          {t("organizationServices.title")}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {t("organizationServices.manageDescription")}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          icon="pi pi-plus"
          label={t("organizationServices.create")}
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
        <DynamicBreadcrumb items={[{ label: t("organizationServices.title"), url: "" }]} />
        <DynamicTable
          title={t("organizationServices.title")}
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
          <OrganizationServicesFormDialog
            visible={showForm}
            organizationId={selectedId}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadData();
            }}
          />
        )}

        {showDetails && (
          <OrganizationServicesDetails
            visible={showDetails}
            organizationId={selectedViewId}
            onHide={() => setShowDetails(false)}
          />
        )}
      </div>
    </>
  );
};

export default OrganizationServicesList;
