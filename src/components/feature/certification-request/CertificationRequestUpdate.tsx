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

    UNDER_REVIEW: ["STANDARDS_REQUIRED"],

    /* STANDARD STEP */
    STANDARDS_REQUIRED: ["STANDARDS_PROVIDED"],
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

  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [committees, setCommittees] = useState<any[]>([]);
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<number | null>(null);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [calendarType, setCalendarType] =
    useState<"gregorian" | "persian" | "arabic">("gregorian");

  /* ================= STATUS OPTIONS ================= */

  const statusOptions = useMemo(() => {
    const allowed = transitionMap[currentStatus] || [];
    return allowed.map((s) => ({
      label: t(`certificationRequest.statusOptions.${s}`),
      value: s,
    }));
  }, [currentStatus, t]);

  useEffect(() => {
    setStatus(statusOptions[0]?.value || null);
  }, [statusOptions]);

  /* ================= LOAD COMMITTEES ================= */

  useEffect(() => {
    const loadCommittees = async () => {
      try {
        const res = await CommiteeService.getAll();
        setCommittees(res?.data || res?.data?.data || []);
      } catch {
        showError("Error", "Failed to load committees");
      }
    };

    loadCommittees();
  }, []);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!status || !requestId) return;
console.log("Selected file:", selectedFile);
console.log("Current status:", currentStatus);
console.log("New status:", status);
    try {
      setLoading(true);

      let response;

      /* PREVENT STEP SKIPPING */
      if (
        currentStatus === "STANDARDS_REQUIRED" &&
        status !== "STANDARDS_PROVIDED"
      ) {
        showError(t("standard.mustProvide"));
        return;
      }

      if (
        currentStatus === "DEADLINE_REQUIRED" &&
        status !== "DEADLINE_ASSIGNED"
      ) {
        showError(t("deadline.mustAssign"));
        return;
      }
  
      /* ===== DEADLINE ===== */
      if (status === "DEADLINE_ASSIGNED") {

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
              endDate.toISOString()
            ),
          showSuccess,
          showError,
          t
        );
      }

      /* ===== COMMITTEE ===== */
      else if (status === "INSPECTION_IN_PROGRESS") {

        if (!selectedCommitteeId) {
          showError(t("committee.required"));
          return;
        }

        response = await handleApi(
          () =>
            CertificationRequestService.assignCommittee(
              requestId,
              selectedCommitteeId
            ),
          showSuccess,
          showError,
          t
        );
      }


      /* ===== NORMAL STATUS ===== */
      else if (status === "STANDARDS_PROVIDED") {

        const formData = new FormData();
        if (selectedFile) {
          formData.append("file", selectedFile);
        }

        response = await handleApi(
          () => CertificationRequestService.standardProvided(requestId, formData),
          showSuccess,
          showError,
          t
        );
      } else {
        response = await handleApi(
          () => CertificationRequestService.updateStatus(requestId, status),
          showSuccess,
          showError,
          t
        );
      }

      if (response?.status === 200) {
        onSuccess?.();
        onHide();
      }
    } finally {
      setLoading(false);
    }
  };

  if (finalStates.includes(currentStatus)) return null;

  /* ================= HEADER ================= */

  const header = () => {
    switch (currentStatus) {
      case "SUBMITTED":
        return t("certificationRequest.underReview");

      case "UNDER_REVIEW":
        return t("certificationRequest.standardRequired");

      case "STANDARDS_REQUIRED":
        return t("certificationRequest.standardsProvided");

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

      {/* STANDARD UPLOAD */}
      {status === "STANDARDS_PROVIDED" && (
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
          <Dropdown
            className="w-full mt-3"
            value={calendarType}
            options={[
              { label: "Gregorian", value: "gregorian" },
              { label: "Hijri", value: "arabic" },
              { label: "Shamsi", value: "persian" },
            ]}
            onChange={(e) => setCalendarType(e.value)}
          />

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
          options={committees.map((c) => ({
            label: c.name,
            value: c.id,
          }))}
          onChange={(e) => setSelectedCommitteeId(e.value)}
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