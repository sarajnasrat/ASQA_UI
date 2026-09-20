import { useState } from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Message } from "primereact/message";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import BackupService from "../../../services/backup.service";

const BackupPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ severity: "success" | "error"; text: string } | null>(null);

  const downloadBackup = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await BackupService.download();
      const disposition = response.headers["content-disposition"] as string | undefined;
      const filename = disposition?.match(/filename="?([^";]+)"?/i)?.[1] || "asqamis-backup.zip";
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage({ severity: "success", text: t("backup.messages.success") });
    } catch {
      setMessage({ severity: "error", text: t("backup.messages.error") });
    } finally {
      setLoading(false);
    }
  };

  const restoreBackup = async () => {
    if (!restoreFile) return;
    setRestoreLoading(true);
    setMessage(null);
    try {
      await BackupService.restore(restoreFile);
      setMessage({ severity: "success", text: t("backup.messages.restoreSuccess") });
      setRestoreFile(null);
    } catch {
      setMessage({ severity: "error", text: t("backup.messages.restoreError") });
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div>
      <DynamicBreadcrumb items={[{ label: t("backup.title"), url: "/backup" }]} />
      <Card className="shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <i className="pi pi-database text-2xl" />
            </div>
            <div>
              <h1 className="m-0 text-2xl font-semibold text-slate-800">{t("backup.title")}</h1>
              <p className="mt-2 mb-0 max-w-2xl text-slate-500">
                {t("backup.description")}
              </p>
              <p className="mt-3 mb-0 text-sm text-slate-400">
                {t("backup.helper")}
              </p>
            </div>
          </div>
          <Button
            label={loading ? t("backup.creating") : t("backup.download")}
            icon={loading ? "pi pi-spin pi-spinner" : "pi pi-download"}
            loading={loading}
            disabled={loading}
            onClick={downloadBackup}
            className="shrink-0"
          />
        </div>
        {message && <Message severity={message.severity} text={message.text} className="mt-6 w-full" />}
      </Card>
      <Card className="mt-5 shadow-sm border border-slate-200">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <i className="pi pi-upload text-xl" />
          </div>
          <div className="w-full">
            <h2 className="m-0 text-xl font-semibold text-slate-800">{t("backup.restoreTitle")}</h2>
            <p className="mt-2 text-slate-500">{t("backup.restoreDescription")}</p>
            <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center">
              <input
                type="file"
                accept=".zip,application/zip"
                onChange={(event) => setRestoreFile(event.target.files?.[0] || null)}
                className="block w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-600"
              />
              <Button
                label={restoreLoading ? t("backup.restoring") : t("backup.restore")}
                icon={restoreLoading ? "pi pi-spin pi-spinner" : "pi pi-upload"}
                disabled={!restoreFile || restoreLoading}
                loading={restoreLoading}
                onClick={restoreBackup}
                severity="warning"
                className="shrink-0"
              />
            </div>
            <small className="mt-2 block text-slate-400">{t("backup.restoreWarning")}</small>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BackupPage;
