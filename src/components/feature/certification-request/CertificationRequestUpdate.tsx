import React, { useMemo, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import CertificationRequestService from "../../../services/CertificationReques.service";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";

interface Props {
  requestId: number | null;
  currentStatus: string; // must be string
  visible: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

export const CertificationRequestUpdate: React.FC<Props> = ({
  requestId,
  currentStatus,
  visible,
  onHide,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();

  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Backend workflow map
  const transitionMap: Record<string, string[]> = {
    DRAFT: ["SUBMITTED", "CANCELLED"],
    SUBMITTED: ["REGISTERED", "REJECTED"],
    REGISTERED: ["STANDARDS_PROVIDED"],
    STANDARDS_PROVIDED: ["DEADLINE_ASSIGNED"],
    DEADLINE_ASSIGNED: ["INSPECTION_IN_PROGRESS"],
    INSPECTION_IN_PROGRESS: ["REPORTED_TO_COMMITTEE"],
    REPORTED_TO_COMMITTEE: ["REPORT_APPROVED", "REJECTED"],
    REPORT_APPROVED: ["PAYMENT_PENDING"],
    PAYMENT_PENDING: ["PAYMENT_COMPLETED"],
    PAYMENT_COMPLETED: ["CERTIFICATE_ISSUED"],
    CERTIFICATE_ISSUED: ["UNDER_SUPERVISION"],
  };

  const finalStates = ["UNDER_SUPERVISION", "REJECTED", "CANCELLED"];

  // Build dropdown options using i18n
  const statusOptions = useMemo(() => {
    const allowed = transitionMap[currentStatus] || [];
    return allowed.map((s) => ({
      label: t(`certificationRequest.statusOptions.${s}`),
      value: s,
    }));
  }, [currentStatus, t]);

  // Optionally set initial dropdown value to first allowed status
  useEffect(() => {
    if (statusOptions.length > 0) {
      setStatus(statusOptions[0].value);
    } else {
      setStatus(null);
    }
  }, [statusOptions]);

  const handleSubmit = async () => {
    if (!status || !requestId) return;

    try {
      setLoading(true);

      const response = await handleApi(
        () => CertificationRequestService.updateStatus(requestId, status),
        showSuccess,
        showError,
        t
      );

      if (response?.status === 200) {
        onSuccess?.();
        onHide();
      }
    } finally {
      setLoading(false);
    }
  };

  // Hide dialog if current status is final
  if (finalStates.includes(currentStatus)) return null;

  return (
    <Dialog
      header={t("certificationRequest.updateStatus")}
      visible={visible}
      style={{ width: "450px" }}
      modal
      onHide={onHide}
    >
      <div className="field">
        <label className="font-semibold mb-2 block">
          {t("certificationRequest.status")}
        </label>

        <Dropdown
          value={status}
          options={statusOptions}
          onChange={(e) => setStatus(e.value)}
          placeholder={t("common.select")}
          className="w-full"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button label={t("common.cancel")} outlined onClick={onHide} />
        <Button
          label={t("common.update")}
          loading={loading}
          disabled={!status}
          onClick={handleSubmit}
        />
      </div>
    </Dialog>
  );
};