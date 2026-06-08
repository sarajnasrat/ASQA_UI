import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import CertificationService from "../../../services/certification.service";
import FileUploadField from "../../common/FileUploadField";
import { handleApi } from "../../../hooks/handleApi";
import { useTranslation } from "react-i18next";

interface CertificationUpdateProps {
  visible: boolean;
  certification: any;
  onHide: () => void;
  onUpdated: () => void;
  showToast: (
    severity: "success" | "info" | "warn" | "error",
    summary: string,
    detail: string,
    life?: number,
  ) => void;
}

export const CertificationUpdate: React.FC<CertificationUpdateProps> = ({
  visible,
  certification,
  onHide,
  onUpdated,
  showToast,
}) => {
  const { t } = useTranslation();

  const [serialNumber, setSerialNumber] = useState("");
  const [file, setFile] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const showSuccess = (summary: string, detail?: string) => {
    showToast("success", summary, detail || "");
  };

  const showError = (summary: string, detail?: string) => {
    showToast("error", summary, detail || "");
  };

  useEffect(() => {
    if (certification) {
      setSerialNumber(
        certification?.certificationRequest?.serialNumber ||
          certification?.serialNumber ||
          "",
      );
      setFile(undefined);
    }
  }, [certification]);
  const handlePrint = async () => {
   await handleApi(
      () =>
        CertificationService.updateCertificationStatus(
          Number(certification.id),
          "SCANNED",
        ),
      showSuccess,
      showError,
      t,
    );
  };
  const handleSubmit = async () => {
    if (!certification?.id) {
      showToast(
        "error",
        t("common.error"),
        t("certification.messages.notSelected"),
      );
      return;
    }

    if (!serialNumber.trim()) {
      showToast(
        "warn",
        t("common.warning"),
        t("certification.messages.serialNumberRequired"),
      );
      return;
    }

    setLoading(true);

    const result = await handleApi(
      () =>
        CertificationService.updateSerialNumber(
          certification.id,
          serialNumber.trim(),
          file,
        ),
      showSuccess,
      showError,
      t,
    );

    setLoading(false);
    handlePrint();

    if (result) {
      onUpdated();
      onHide();
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFile(undefined);
      onHide();
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label={t("common.cancel")}
        icon="pi pi-times"
        text
        onClick={handleClose}
        disabled={loading}
      />
      <Button
        label={t("common.update")}
        icon="pi pi-check"
        loading={loading}
        onClick={handleSubmit}
      />
    </div>
  );

  return (
    <Dialog
      header={t("certification.dialog.updateTitle")}
      visible={visible}
      modal
      style={{ width: "800px" }}
      footer={footer}
      onHide={handleClose}
      draggable={false}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="serialNumber" className="font-medium">
            {t("certification.serialNumber")}
          </label>

          <InputText
            id="serialNumber"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder={t("certification.placeholders.serialNumber")}
            className="w-full"
            disabled={loading}
          />
        </div>

        <div className="flex flex-col gap-2">
          <FileUploadField
            label={t("certification.dialog.scanOfCertification")}
            name="file"
            accept=".pdf,.jpg,.jpeg,.png"
            maxFileSize={1024 * 1024 * 5}
            helperText={t("certification.dialog.scanHelperText")}
            onFileSelect={(selectedFile) => {
              setFile(selectedFile || undefined);
            }}
          />
        </div>
      </div>
    </Dialog>
  );
};
