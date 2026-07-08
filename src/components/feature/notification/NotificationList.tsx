import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import NotificationService from "../../../services/notification.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";
import {
  translateNotificationMessage,
  translateNotificationTitle,
} from "../../../utils/notificationTranslation";

type NotificationItem = {
  id: number;
  title?: string;
  message?: string;
  titleKey?: string;
  messageKey?: string;
  messageParams?: string | null;
  notificationType?: string;
  priority?: string;
  recipientType?: string;
  recipientUserId?: number | null;
  recipientEmail?: string | null;
  companyId?: number | null;
  certificationRequestId?: number | null;
  certificationId?: number | null;
  trackingNumber?: string | null;
  actionUrl?: string | null;
  read?: boolean;
  isRead?: boolean;
  readAt?: string | null;
  createdDate?: string | null;
};

const NOTIFICATION_EVENT = "notifications-updated";

const NotificationList: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast, showToast } = useAppToast();
  const { showError } = useToast();

  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);

  const emitNotificationUpdate = () => {
    window.dispatchEvent(new Event(NOTIFICATION_EVENT));
  };

  const getIsRead = (item: NotificationItem) =>
    Boolean(item.isRead ?? item.read);

  const resolveActionUrl = (item: NotificationItem) => {
    if (item.certificationRequestId) {
      return `/certification-request/view/${item.certificationRequestId}`;
    }

    if (item.actionUrl?.startsWith("/certification-requests/")) {
      const id = item.actionUrl.split("/").filter(Boolean).pop();
      return id ? `/certification-request/view/${id}` : null;
    }

    if (item.actionUrl?.startsWith("/certifications/")) {
      const id = item.actionUrl.split("/").filter(Boolean).pop();
      return id ? `/certification-details/${id}` : null;
    }

    return null;
  };

  const loadData = async () => {
    setLoading(true);

    const params = {
      page: first / rows,
      size: rows,
      sort: "createdDate,desc",
      ...(selectedType ? { notificationType: selectedType } : {}),
      ...(selectedPriority ? { priority: selectedPriority } : {}),
    };

    const response = await handleApi(
      () =>
        selectedType || selectedPriority
          ? NotificationService.filterNotifications(params)
          : NotificationService.getPaginatedNotifications(params),
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
  }, [first, rows, selectedType, selectedPriority]);

  const unreadCount = useMemo(
    () => list.filter((item) => !getIsRead(item)).length,
    [list],
  );

  const notificationTypeOptions = useMemo(
    () => [
      { label: t("notification.filters.allTypes"), value: null },
      {
        label: t("notification.types.REQUEST_SUBMITTED"),
        value: "REQUEST_SUBMITTED",
      },
      {
        label: t("notification.types.REQUEST_STATUS_CHANGED"),
        value: "REQUEST_STATUS_CHANGED",
      },
      {
        label: t("notification.types.CERTIFICATE_ISSUED"),
        value: "CERTIFICATE_ISSUED",
      },
      {
        label: t("notification.types.CERTIFICATE_EXPIRING_SOON"),
        value: "CERTIFICATE_EXPIRING_SOON",
      },
      {
        label: t("notification.types.CERTIFICATE_EXPIRED"),
        value: "CERTIFICATE_EXPIRED",
      },
      {
        label: t("notification.types.INSPECTION_DEADLINE_REACHED"),
        value: "INSPECTION_DEADLINE_REACHED",
      },
      {
        label: t("notification.types.INSPECTION_OVERDUE"),
        value: "INSPECTION_OVERDUE",
      },
    ],
    [t],
  );

  const priorityOptions = useMemo(
    () => [
      { label: t("notification.filters.allPriorities"), value: null },
      { label: t("notification.priorities.INFO"), value: "INFO" },
      { label: t("notification.priorities.WARNING"), value: "WARNING" },
      { label: t("notification.priorities.URGENT"), value: "URGENT" },
    ],
    [t],
  );

  const handleMarkAsRead = async (id: number) => {
    const response = await handleApi(
      () => NotificationService.markAsRead(id),
      () =>
        showToast(
          "success",
          t("common.success"),
          t("notification.markAsReadSuccess"),
        ),
      showError,
      t,
    );

    if (response) {
      await loadData();
      emitNotificationUpdate();
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    const response = await handleApi(
      () => NotificationService.markAllAsRead(),
      () =>
        showToast(
          "success",
          t("common.success"),
          t("notification.markAllAsReadSuccess"),
        ),
      showError,
      t,
    );

    if (response) {
      await loadData();
      emitNotificationUpdate();
    }
    setMarkingAll(false);
  };

  const handleOpenRelated = async (item: NotificationItem) => {
    if (!getIsRead(item)) {
      const response = await handleApi(
        () => NotificationService.markAsRead(item.id),
        () => {},
        showError,
        t,
      );

      if (!response) return;

      emitNotificationUpdate();
    }

    const destination = resolveActionUrl(item);
    if (destination) {
      navigate(destination);
      return;
    }

    showError(t("common.error"), t("notification.relatedPageUnavailable"));
    loadData();
  };

  const actionTemplate = (row: NotificationItem) => {
    const menu = React.useRef<TieredMenu>(null);

    const items: MenuItem[] = [
      ...(!getIsRead(row)
        ? [
            {
              label: t("notification.markAsRead"),
              icon: "pi pi-check",
              command: () => handleMarkAsRead(row.id),
            },
          ]
        : []),
      {
        label: t("notification.open"),
        icon: "pi pi-arrow-right",
        command: () => handleOpenRelated(row),
      },
    ];

    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-text p-button-sm"
          onClick={(e) => menu.current?.toggle(e)}
          tooltip={t("common.action")}
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  const columns = [
    { field: "id", header: t("common.id") },
    {
      field: "title",
      header: t("notification.columns.title"),
      body: (row: NotificationItem) => (
        <div className="min-w-[180px]">
          <div className="font-semibold text-gray-800">
            {translateNotificationTitle(row, t)}
          </div>
          {row.trackingNumber ? (
            <div className="text-xs text-gray-500 mt-1">
              {t("notification.columns.trackingNumber")}: {row.trackingNumber}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      field: "message",
      header: t("notification.columns.message"),
      body: (row: NotificationItem) => (
        <div className="max-w-xl text-sm text-gray-700 whitespace-normal">
          {translateNotificationMessage(row, t)}
        </div>
      ),
    },
    {
      field: "notificationType",
      header: t("notification.notificationType"),
      body: (row: NotificationItem) =>
        row.notificationType
          ? t(
              `notification.types.${row.notificationType}`,
              row.notificationType,
            )
          : t("common.notSpecified"),
    },
    // {
    //   field: "priority",
    //   header: t("notification.columns.priority"),
    //   body: (row: NotificationItem) => {
    //     const priority = row.priority || "INFO";
    //     const severity =
    //       priority === "URGENT"
    //         ? "danger"
    //         : priority === "WARNING"
    //           ? "warning"
    //           : "info";

    //     return (
    //       <Tag
    //         value={t(`notification.priorities.${priority}`)}
    //         severity={severity}
    //       />
    //     );
    //   },
    // },
    {
      field: "isRead",
      header: t("notification.columns.status"),
      body: (row: NotificationItem) => (
        <Tag
          value={
            getIsRead(row)
              ? t("notification.status.read")
              : t("notification.status.unread")
          }
          severity={getIsRead(row) ? "success" : "warning"}
        />
      ),
    },
    {
      field: "createdDate",
      header: t("notification.columns.createdDate"),
      body: (row: NotificationItem) =>
        row.createdDate
          ? IslamicDateFormatter.formatQamari(row.createdDate, true)
          : t("common.notSpecified"),
    },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "120px" },
    },
  ];

  const header = (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/70 p-4 md:p-6 shadow-sm">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
              <i className="pi pi-bell text-xs" />
              <span>{t("notification.title")}</span>
            </div>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              {t("notification.title")}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t("notification.manageDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-90">
            <div className="rounded-2xl border border-blue-200 bg-white/90 p-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {t("notification.status.unread")}
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <i className="pi pi-envelope text-sm" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-700">
                {unreadCount}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white/90 p-2">
              <div className="flex items-center justify-between gap-3">
                <div className=" font-medium uppercase tracking-wide text-slate-500">
                  {t("common.total")}
                </div>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <i className="pi pi-inbox text-sm" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-700">
                {totalRecords}
              </div>
              {/* <div className="mt-1 text-xs text-slate-500">
                {t("notification.title")}
              </div> */}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("notification.filterByType")}
                </label>
                <Dropdown
                  value={selectedType}
                  options={notificationTypeOptions}
                  onChange={(e) => {
                    setFirst(0);
                    setSelectedType(e.value ?? null);
                  }}
                  optionLabel="label"
                  optionValue="value"
                  placeholder={t("notification.filterByType")}
                  className="w-full"
                  showClear
                />
              </div>
{/* 
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t("notification.filterByPriority")}
                </label>
                <Dropdown
                  value={selectedPriority}
                  options={priorityOptions}
                  onChange={(e) => {
                    setFirst(0);
                    setSelectedPriority(e.value ?? null);
                  }}
                  optionLabel="label"
                  optionValue="value"
                  placeholder={t("notification.filterByPriority")}
                  className="w-full"
                  showClear
                />
              </div> */}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
              <Button
                icon="pi pi-check-circle"
                label={t("notification.markAllAsRead")}
                loading={markingAll}
                disabled={loading || unreadCount === 0}
                onClick={handleMarkAllAsRead}
                className="sm:min-w-47.5"
                text
                raised
              />
              <Button
                icon="pi pi-refresh"
                label={t("common.refresh")}
                outlined
                onClick={() => {
                  setSelectedType(null);
                  setSelectedPriority(null);
                  setFirst(0);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Toast ref={toast} />
      <div>
        <DynamicBreadcrumb
          items={[{ label: t("notification.title"), url: "/notifications" }]}
        />
        <DynamicTable
          title={t("notification.title")}
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
      </div>
    </>
  );
};

export default NotificationList;
