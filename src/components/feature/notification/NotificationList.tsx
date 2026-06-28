import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Dropdown } from "primereact/dropdown";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { useAppToast } from "../../../hooks/useToast";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import NotificationService from "../../../services/notification.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

type NotificationItem = {
  id: number;
  title?: string;
  message?: string;
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
  { label: "All Types", value: null },
  { label: "Request Submitted", value: "REQUEST_SUBMITTED" },
  { label: "Request Status Changed", value: "REQUEST_STATUS_CHANGED" },
  { label: "Certificate Issued", value: "CERTIFICATE_ISSUED" },
  { label: "Certificate Expiring Soon", value: "CERTIFICATE_EXPIRING_SOON" },
  { label: "Certificate Expired", value: "CERTIFICATE_EXPIRED" },
  {
    label: "Inspection Deadline Reached",
    value: "INSPECTION_DEADLINE_REACHED",
  },
  { label: "Inspection Overdue", value: "INSPECTION_OVERDUE" },
];

const priorityOptions = [
  { label: "All Priorities", value: null },
  { label: "Info", value: "INFO" },
  { label: "Warning", value: "WARNING" },
  { label: "Urgent", value: "URGENT" },
];

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

  const columns = [
    { field: "id", header: t("common.id") },
    {
      field: "title",
      header: t("notification.columns.title"),
      body: (row: NotificationItem) => (
        <div className="min-w-[180px]">
          <div className="font-semibold text-gray-800">
            {row.title || t("common.notSpecified")}
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
          {row.message || t("common.notSpecified")}
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

        return <Tag value={priority} severity={severity} />;
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
      body: (row: NotificationItem) => (
        <div className="flex flex-wrap gap-2 justify-center">
          {!getIsRead(row) ? (
            <Button
              icon="pi pi-check"
              label={t("notification.markAsRead")}
              className="p-button-sm p-button-text"
              onClick={() => handleMarkAsRead(row.id)}
            />
          ) : null}
          <Button
            icon="pi pi-arrow-right"
            label={t("notification.open")}
            className="p-button-sm p-button-text"
            onClick={() => handleOpenRelated(row)}
          />
        </div>
      ),
      style: { width: "240px" },
    },
  ];

  const header = (
    <div>
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          {t("notification.title")}
        </h2>
        {/* <p className="text-sm text-gray-500 mt-0.5">
          {t("notification.manageDescription")}
        </p> */}
      </div>
      <div className="">
        <div className="flex gap-2 flex-wrap mt-3 justify-between">
          <div>
            <div className="flex justify-end gap-3">
              <div className="">
                <div className="pb-2">
                  <label className="">{t("notification.filterByType")}</label>
                </div>
                <Dropdown
                  value={selectedType}
                  options={notificationTypeOptions}
                  onChange={(e) => {
                    setFirst(0);
                    setSelectedType(e.value ?? null);
                  }}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Filter by type"
                  className="min-w-[220px]"
                  showClear
                />
              </div>
              <div>
                <div className="pb-2">
                  <label className="">
                    {t("notification.filterByPriority")}
                  </label>
                </div>
                <Dropdown
                  value={selectedPriority}
                  options={priorityOptions}
                  onChange={(e) => {
                    setFirst(0);
                    setSelectedPriority(e.value ?? null);
                  }}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Filter by priority"
                  className="min-w-[200px]"
                  showClear
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">
              {t("notification.unreadSummary", { count: unreadCount })}
            </div>
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
