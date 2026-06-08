import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";

import { useTranslation } from "react-i18next";

import ZoneCreate from "./ZoneCreate";
import { ZoneEdit } from "./ZoneEdit";
import ZoneService from "../../../services/zone.service";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { useAppToast } from "../../../hooks/useToast";

const ZoneList = () => {
  /* =======================
     Translation
  ======================= */
  const { t } = useTranslation();

  /* =======================
     State
  ======================= */
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editZoneId, setEditZoneId] = useState<any>("");

  const { toast, showToast } = useAppToast();

  /* =======================
     Pagination
  ======================= */
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  /* =======================
     Load Zones
  ======================= */
  const getZones = async () => {
    try {
      setLoading(true);

      const response = await ZoneService.getPaginatedZones({
        page: first / rows,
        size: rows,
        sort: "id,desc",
      });

      setZones(response.data.data);
      setTotalRecords(response.data.totalElements);
    } catch (error) {
      console.error(error);
      showToast("error", t("common.error"), t("zone.servererror"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getZones();
  }, [first, rows]);

  /* =======================
     Edit
  ======================= */
  const handleEdit = (zone: any) => {
    setEditZoneId(zone.id);
    setShowEditDialog(true);
  };

  /* =======================
     Delete
  ======================= */
  const confirmDelete = (zone: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-3 p-4">
          <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <i className="pi pi-trash text-white text-xl" />
          </div>

          <span className="text-lg font-semibold">
            {t("zone.delete")}
          </span>

          <p className="text-gray-600 text-center">
            {t("zone.deleteConfirm", { name: zone.name })}
          </p>
        </div>
      ),
      header: "",
      acceptClassName: "hidden",
      rejectClassName: "hidden",
      accept: () => handleDelete(zone.id),
    });
  };

  const handleDelete = async (id: any) => {
    try {
      await ZoneService.deleteZone(id);
      showToast("success", t("common.success"), t("zone.deleted"));
      getZones();
    } catch {
      showToast("error", t("common.error"), t("zone.deleteFailed"));
    }
  };

  /* =======================
     Action Menu
  ======================= */
  const actionTemplate = (rowData: any) => {
    const menu = useRef<any>(null);

    const items: MenuItem[] = [
      {
        label: t("zone.edit"),
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      },
      {
        label: t("zone.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      },
    ];

    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon="pi pi-ellipsis-v"
          text
          size="small"
          onClick={(e) => menu.current.toggle(e)}
        />
      </div>
    );
  };

  /* =======================
     Header
  ======================= */
  const header = () => (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 px-2">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          {t("zone.list")}
        </h2>

        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
          {totalRecords} {t("common.total")}
        </span>
      </div>

      <div className="flex gap-2">
        <Button
          icon="pi pi-plus"
          label={t("zone.create")}
          severity="info"
          text
          raised
          onClick={() => setShowCreateDialog(true)}
        />

        <Button
          icon="pi pi-refresh"
          label={t("zone.refersh")}
          severity="info"
          text
          raised
          onClick={getZones}
        />
      </div>
    </div>
  );

  /* =======================
     Columns
  ======================= */
  const columns = [
    {
      field: "id",
      header: t("common.id"),
      style: { width: "80px" },
    },
    {
      header: t("zone.name.label"),
      sortable: true,
      body: (rowData: any) => rowData.name,
      sortField: "name",
    },
    {
      field: "location",
      header: t("zone.location"),
      sortable: true,
    },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "120px" },
    },
  ];

  /* =======================
     Breadcrumb
  ======================= */
  const breadcrumbItems = [
    { label: t("common.home"), url: "/" },
    { label: t("zone.list"), url: "/zones" },
  ];

  /* =======================
     Render
  ======================= */
  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog header={false} />

      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />

      <DynamicTable
        title={t("zone.list")}
        value={zones}
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

      {/* Create */}
      <ZoneCreate
        visible={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={getZones}
      />

      {/* Edit */}
      {showEditDialog && (
        <ZoneEdit
          zoneId={editZoneId}
          visible={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          onSuccess={getZones}
        />
      )}
    </>
  );
};

export default ZoneList;
