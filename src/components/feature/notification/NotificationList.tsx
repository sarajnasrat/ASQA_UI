import React, { useEffect, useMemo, useRef, useState } from "react";
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

const notificationTypeOptions = [
  { value: null },
  { value: "REQUEST_SUBMITTED" },
  { value: "REQUEST_STATUS_CHANGED" },
  { value: "CERTIFICATE_ISSUED" },
  { value: "CERTIFICATE_EXPIRING_SOON" },
  { value: "CERTIFICATE_EXPIRED" },
  { value: "INSPECTION_DEADLINE_REACHED" },
  { value: "INSPECTION_OVERDUE" },
];

const priorityOptions = [{ value: null }, { value: "INFO" }, { value: "WARNING" }, { value: "URGENT" }];

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

  const mappedNotificationTypeOptions = useMemo(
    () =>
      notificationTypeOptions.map((option) => ({
        ...option,
        label: option.value
          ? t(`notification.types.${option.value}`)
          : t("notification.filters.allTypes"),
      })),
    [t],
  );

  const mappedPriorityOptions = useMemo(
    () =>
      priorityOptions.map((option) => ({
        ...option,
        label: option.value
          ? t(`notification.priorities.${option.value}`)
          : t("notification.filters.allPriorities"),
      })),
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
    const menu = useRef<any>(null);
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
          onClick={(e) => menu.current.toggle(e)}
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
      field: "priority",
      header: t("notification.columns.priority"),
      body: (row: NotificationItem) => {
        const priority = row.priority || "INFO";
        const severity =
          priority === "URGENT"
            ? "danger"
            : priority === "WARNING"
              ? "warning"
              : "info";

        return (
          <Tag
            value={t(`notification.priorities.${priority}`)}
            severity={severity}
          />
        );
      },
    },
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {t("notification.title")}
          </h2>
        </div>

        <div className="order-3 lg:order-2">
          <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {t("notification.unreadSummary", { count: unreadCount })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[460px]">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("notification.filterByType")}
            </label>
            <Dropdown
              value={selectedType}
              options={mappedNotificationTypeOptions}
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

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("notification.filterByPriority")}
            </label>
            <Dropdown
              value={selectedPriority}
              options={mappedPriorityOptions}
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
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            icon="pi pi-check-circle"
            label={t("notification.markAllAsRead")}
            text
            raised
            loading={markingAll}
            disabled={loading || unreadCount === 0}
            onClick={handleMarkAllAsRead}
          />
          <Button
            icon="pi pi-refresh"
            label={t("common.refresh")}
            text
            raised
            onClick={() => {
              setSelectedType(null);
              setSelectedPriority(null);
              setFirst(0);
            }}
          />
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
