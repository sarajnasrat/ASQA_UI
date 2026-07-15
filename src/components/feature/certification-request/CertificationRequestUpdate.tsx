import React, { useMemo, useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import CertificationRequestService from "../../../services/CertificationReques.service";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import { useTranslation } from "react-i18next";
import CommiteeService from "../../../services/comitee.service";
import FileUploadField from "../../common/FileUploadField";
import { SmartDatePicker } from "../../common/datepicker/SmartDatePicker";
import { useNavigate } from "react-router-dom";

interface Props {
  requestId: number | null;
  currentStatus: string;
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
  /* ================= WORKFLOW ================= */

  const transitionMap: Record<string, string[]> = {
    DRAFT: ["SUBMITTED"],

    SUBMITTED: ["UNDER_REVIEW", "REJECTED"],

    STANDARDS_PROVIDED: ["DEADLINE_REQUIRED"],

    /* DEADLINE STEP */
    DEADLINE_REQUIRED: ["DEADLINE_ASSIGNED"],
    DEADLINE_ASSIGNED: ["INSPECTION_IN_PROGRESS"],

    INSPECTION_IN_PROGRESS: ["REPORTED_TO_COMMITTEE"],

    REPORTED_TO_COMMITTEE: ["REPORT_APPROVED", "REJECTED"],

    REPORT_APPROVED: ["PAYMENT_PENDING"],
    PAYMENT_PENDING: ["PAYMENT_COMPLETED"],
    PAYMENT_COMPLETED: ["CERTIFICATE_ISSUED"],
  };

  const finalStates = ["UNDER_SUPERVISION", "REJECTED", "CANCELLED"];

  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [standardRequired, setStandardRequired] = useState<boolean>(false);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [committees, setCommittees] = useState<any[]>([]);
  const [loadingCommittees, setLoadingCommittees] = useState(false);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<number | null>(
    null,
  );

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [calendarType, setCalendarType] = useState<
    "gregorian" | "persian" | "arabic"
  >("gregorian");

  /* ================= STATUS OPTIONS ================= */

  const statusOptions = useMemo(() => {
    const allowed =
      currentStatus === "UNDER_REVIEW"
        ? ["DEADLINE_REQUIRED"]
        : transitionMap[currentStatus] || [];
    return allowed.map((s) => ({
      label: t(`certificationRequest.statusOptions.${s}`),
      value: s,
    }));
  }, [currentStatus, standardRequired, t]);

  useEffect(() => {
    setStatus(statusOptions[0]?.value || null);
  }, [statusOptions]);

  useEffect(() => {
    const loadRequest = async () => {
      if (!visible || !requestId) return;
      try {
        const response = await CertificationRequestService.getById(requestId);
        const request = response?.data?.data || response?.data;
        setStandardRequired(Boolean(request?.standardRequired));
      } catch {
        setStandardRequired(false);
      }
    };

    loadRequest();
  }, [requestId, visible]);

  /* ================= LOAD COMMITTEES ================= */

  useEffect(() => {
    const loadCommittees = async () => {
      try {
        setLoadingCommittees(true);
        const res = await CommiteeService.getAll();
        setCommittees(res?.data?.data || res?.data || []);
      } catch {
        showError("Error", "Failed to load committees");
      } finally {
        setLoadingCommittees(false);
      }
    };

    loadCommittees();
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!status || !requestId) return;
    try {
      setLoading(true);

      let response;

      /* PREVENT STEP SKIPPING */
      if (
        currentStatus === "DEADLINE_REQUIRED" &&
        status !== "DEADLINE_ASSIGNED"
      ) {
        showError(t("deadline.mustAssign"));
        return;
      }

      if (currentStatus === "UNDER_REVIEW" && standardRequired) {
        if (!selectedFile) {
          showError(t("attachment.STANDARD") || "Please upload standard file");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        response = await handleApi(
          () => CertificationRequestService.standardProvided(requestId, formData),
          showSuccess,
          showError,
          t,
        );
      } else if (status === "DEADLINE_ASSIGNED") {
        if (!startDate || !endDate) {
          showError(t("deadline.required"));
          return;
        }

        if (endDate < startDate) {
          showError("End date must be after start date");
          return;
        }

        response = await handleApi(
          () =>
            CertificationRequestService.setDeadline(
              requestId,
              startDate.toISOString(),
              endDate.toISOString(),
            ),
          showSuccess,
          showError,
          t,
        );
      } else if (status === "INSPECTION_IN_PROGRESS") {

      /* ===== COMMITTEE ===== */
        if (!selectedCommitteeId) {
          showError(t("committee.required"));
          return;
        }

        response = await handleApi(
          () =>
            CertificationRequestService.assignCommittee(
              requestId,
              selectedCommitteeId,
            ),
          showSuccess,
          showError,
          t,
        );
      } else if (status === "STANDARDS_PROVIDED") {

      /* ===== NORMAL STATUS ===== */
        const formData = new FormData();
        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        response = await handleApi(
          () =>
            CertificationRequestService.standardProvided(requestId, formData),
          showSuccess,
          showError,
          t,
        );
      } else {
        response = await handleApi(
          () =>
            CertificationRequestService.updateStatus(
              requestId,
              currentStatus === "UNDER_REVIEW"
                ? standardRequired
                  ? "STANDARDS_PROVIDED"
                  : "DEADLINE_REQUIRED"
                : status,
            ),
          showSuccess,
          showError,
          t,
        );
      }

      if (response?.status === 200) {
        onSuccess?.();
        onHide();
        navigateAfterStatusUpdate(
          currentStatus === "UNDER_REVIEW" && standardRequired
            ? "STANDARDS_PROVIDED"
            : status,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateAfterStatusUpdate = (nextStatus: string) => {
    switch (nextStatus) {
      case "UNDER_REVIEW":
      case "REJECTED":
      case "REPORT_APPROVED":
      case "CERTIFICATE_ISSUED":
        navigate("/certification-request");
        break;
      case "PAYMENT_PENDING":
      case "PAYMENT_COMPLETED":
        navigate("/payment-management");
        break;
      case "STANDARDS_PROVIDED":
        navigate("/standard-management");
        break;
      case "DEADLINE_REQUIRED":
        navigate("/certification-request-deadline");
        break;
      case "DEADLINE_ASSIGNED":
        navigate("/certification-request-deadline");
        break;
      case "INSPECTION_IN_PROGRESS":
        navigate("/certification-request-deadline");
        break;
      default:
        navigate("/certification-request");
        break;
    }
  };

  if (finalStates.includes(currentStatus)) return null;

  const getCommitteeLabel = (committee: any) => {
    if (!committee) return "";
    return (
      committee.name ||
      committee.committeeName ||
      committee.title ||
      committee.committeeNameEN ||
      committee.committeeNameDR ||
      committee.committeeNamePS ||
      `#${committee.id ?? ""}`
    );
  };

  const committeeOptions = committees
    .map((committee) => ({
      label: getCommitteeLabel(committee),
      value:
        committee?.id !== null && committee?.id !== undefined
          ? Number(committee.id)
          : null,
    }))
    .filter((option) => option.value !== null && option.label);

  /* ================= HEADER ================= */

  const header = () => {
    switch (currentStatus) {
      case "SUBMITTED":
        return t("certificationRequest.underReview");

      case "UNDER_REVIEW":
        return t("certificationRequest.updateStatus");

      case "STANDARDS_PROVIDED":
        return t("certificationRequest.deadlineRequired");

      case "DEADLINE_REQUIRED":
        return t("certificationRequest.assignDeadline");

      case "DEADLINE_ASSIGNED":
        return t("certificationRequest.inspectionInProgress");

      case "INSPECTION_IN_PROGRESS":
        return t("certificationRequest.inspectionInProgress");

      case "REPORTED_TO_COMMITTEE":
        return t("certificationRequest.reportToCommittee");

      default:
        return t("certificationRequest.updateStatus");
    }
  };

  /* ================= UI ================= */

  return (
    <Dialog
      header={header()}
      visible={visible}
      style={{ width: "800px" }}
      modal
      onHide={onHide}
    >
      {/* STATUS */}
      <Dropdown
        value={status}
        options={statusOptions}
        onChange={(e) => setStatus(e.value)}
        className="w-full"
      />

      {currentStatus === "UNDER_REVIEW" && (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={standardRequired}
              onChange={(e) => {
                setStandardRequired(e.target.checked);
                if (!e.target.checked) {
                  setSelectedFile(null);
                }
              }}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-800">
                {t("certificationRequest.standardsRequired") ||
                  "Standard is required for this request"}
              </div>
              <div className="text-sm text-gray-500">
                {standardRequired
                  ? t("certificationRequest.standardsProvided") ||
                    "Upload the standard file before continuing."
                  : t("certificationRequest.deadlineRequired") ||
                    "Continue without standard and move to the next step."}
              </div>
            </div>
          </label>
        </div>
      )}

      {/* STANDARD UPLOAD */}
      {(status === "STANDARDS_PROVIDED" ||
        (currentStatus === "UNDER_REVIEW" && standardRequired)) && (
        <div className="mt-3">
          <FileUploadField
            label={t("attachment.STANDARD")}
            accept=".pdf,.jpg,.png"
            maxFileSize={5000000}
            required
            onFileSelect={(file) => setSelectedFile(file)}
          />
        </div>
      )}

      {/* DEADLINE */}
      {status === "DEADLINE_ASSIGNED" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("common.selectDateType")} *
            </label>
            <Dropdown
              className="w-full mb-3"
              value={calendarType}
              options={[
                { label: t("common.gregorian"), value: "gregorian" },
                { label: t("common.arabic"), value: "arabic" },
                { label: t("common.persian"), value: "persian" },
              ]}
              onChange={(e) => setCalendarType(e.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <SmartDatePicker
              label={t("deadline.startDate")}
              value={startDate ?? undefined}
              calendarType={calendarType}
              onChange={(d: any) =>
                setStartDate(d ? new Date(d?.date || d) : null)
              }
            />

            <SmartDatePicker
              label={t("deadline.endDate")}
              value={endDate ?? undefined}
              calendarType={calendarType}
              onChange={(d: any) =>
                setEndDate(d ? new Date(d?.date || d) : null)
              }
            />
          </div>
        </>
      )}

      {/* COMMITTEE */}
      {status === "INSPECTION_IN_PROGRESS" && (
        <Dropdown
          className="w-full mt-3"
          value={selectedCommitteeId}
          options={committeeOptions}
          onChange={(e) => setSelectedCommitteeId(e.value ?? null)}
          loading={loadingCommittees}
          disabled={loadingCommittees || committeeOptions.length === 0}
          showClear
          placeholder={t("commitee.selectCommittee")}
        />
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 mt-4">
        <Button label={t("common.cancel")} outlined onClick={onHide} />

        <Button
          label={t("common.update")}
          loading={loading}
          disabled={
            !status ||
            (status === "INSPECTION_IN_PROGRESS" && !selectedCommitteeId) ||
            (status === "DEADLINE_ASSIGNED" && (!startDate || !endDate))
          }
          onClick={handleSubmit}
        />
      </div>
    </Dialog>
  );
};
