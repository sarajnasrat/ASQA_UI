import React, { useEffect, useMemo, useRef, useState } from "react";

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
import CommentService from "../../../services/comment.service";
import CommentFormDialog from "./CommentFormDialog";
import CommentDetails from "./CommentDetails";

export const CommentList: React.FC = () => {
  const { t } = useTranslation();
  const { toast, showToast } = useAppToast();
  const { showError } = useToast();

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    const response = await handleApi(
      () =>
        CommentService.getPaginatedComments({
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

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return list;
    const term = searchTerm.toLowerCase();
    return list.filter(
      (item) =>
        item.fullName?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.subject?.toLowerCase().includes(term),
    );
  }, [list, searchTerm]);

  const handleDelete = async (id: number) => {
    const response = await handleApi(
      () => CommentService.deleteComment(id),
      () => showToast("success", t("common.success"), t("comment.deleteSuccess")),
      showError,
      t,
    );
    if (response) loadData();
  };

  const confirmDelete = (row: any) => {
    confirmDialog({
      message: t("comment.deleteConfirm", { subject: row.subject || "-" }),
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
          setDetailId(rowData.id);
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
          tooltip={t("common.action")}
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const columns = [
    { field: "id", header: t("comment.columns.id") },
    { field: "fullName", header: t("comment.columns.fullName") },
    { field: "email", header: t("comment.columns.email") },
    { field: "subject", header: t("comment.columns.subject") },
    {
      field: "body",
      header: t("comment.columns.body"),
      body: (row: any) =>
        row.body?.length > 60 ? `${String(row.body).slice(0, 60)}...` : row.body || "-",
    },
    {
      field: "createdAt",
      header: t("comment.columns.createdAt"),
      body: (row: any) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"),
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
        <h2 className="text-xl font-semibold text-gray-800">{t("comment.title")}</h2>
        <p className="text-sm text-gray-500 mt-0.5">{t("comment.manageDescription")}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button 
          icon="pi pi-refresh" 
          label={t("common.refresh")} 
          text 
          raised 
          onClick={loadData}
          tooltip={t("common.refreshList")}
        />
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />
      <div className="">
        <DynamicBreadcrumb items={[{ label: t("comment.title"), url: "" }]} />
        <DynamicTable
          title={t("comment.title")}
          value={filteredList}
          columns={columns}
          header={header}
          loading={loading}
          first={first}
          rows={rows}
          totalRecords={searchTerm ? filteredList.length : totalRecords}
          onPage={(e) => {
            setFirst(e.first);
            setRows(e.rows);
          }}
        />

        {showForm && (
          <CommentFormDialog
            visible={showForm}
            commentId={selectedId}
            onClose={() => setShowForm(false)}
            onSuccess={() => {
              setShowForm(false);
              loadData();
            }}
          />
        )}

        <CommentDetails
          visible={showDetails}
          commentId={detailId}
          onHide={() => setShowDetails(false)}
        />
      </div>
    </>
  );
};

export default CommentList;