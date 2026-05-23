import React from "react";
import { Award, Clock, Tag, TrendingUp, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";
import type { CertificationRequest, Tracker } from "./CertificationRequestView.types";

type DetailsSection = "timeline" | "requestInfo" | "quickStats";

interface Props {
  request: CertificationRequest;
  tracker: Tracker[];
  expandedSections: Record<DetailsSection, boolean>;
  toggleSection: (section: DetailsSection) => void;
  getStatusConfig: (status: string) => {
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    label: string;
  };
  formatDate: (dateString: string) => string;
  getRequestTypeLabel: (type: string) => string;
  getCertificationTypeLabel: (type: string) => string;
  hasAttachments: boolean;
  t: any;
}

const CertificationRequestViewDetails: React.FC<Props> = ({
  request,
  tracker,
  expandedSections,
  toggleSection,
  getStatusConfig,
  formatDate,
  getRequestTypeLabel,
  getCertificationTypeLabel,
  hasAttachments,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection("timeline")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Timeline
            </h3>
            {expandedSections.timeline ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.timeline && (
            <div className="px-6 pb-6">
              <div className="space-y-4">
                {tracker && tracker.length > 0 ? (
                  tracker.map((item: Tracker, index: number) => {
                    const statusConfig = getStatusConfig(item.status);
                    const isLastItem = index === tracker.length - 1;

                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="relative">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.bgColor || "bg-gray-100"}`}
                          >
                            {statusConfig.icon || <Clock className="h-4 w-4" />}
                          </div>
                          {!isLastItem && (
                            <div className="absolute top-8 left-4 w-0.5 h-12 bg-gray-200"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{statusConfig.label || item.status}</p>
                          <p className="text-sm text-gray-500">{formatDate(item.changedAt)}</p>
                          {item.changedBy && (
                            <p className="text-xs text-gray-400 mt-1">By: {item.changedBy}</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {t("certificationRequest.statusOptions.SUBMITTED")}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(request.createdDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection("requestInfo")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              {t("certificationRequest.labels.requestInfo")}
            </h3>
            {expandedSections.requestInfo ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.requestInfo && (
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("certificationRequest.labels.requestType")}</p>
                  <p className="font-medium text-gray-900">{getRequestTypeLabel(request.requestType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t("certificationRequest.labels.certificationType")}</p>
                  <p className="font-medium text-gray-900">{getCertificationTypeLabel(request.certificationType)}</p>
                </div>
                {request.startDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t("common.startDate")}</p>
                    <p className="font-medium text-gray-900">{formatDate(request.startDate)}</p>
                  </div>
                )}
                {request.endDate && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t("common.endDate")}</p>
                    <p className="font-medium text-gray-900">{formatDate(request.endDate)}</p>
                  </div>
                )}
                {request.deadline && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t("certificationRequest.labels.deadline")}</p>
                    <p className="font-medium text-gray-900">{formatDate(request.deadline)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
          <Award className="h-12 w-12 mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">{t("certificationRequest.progress")}</h3>
          <p className="text-blue-100 mb-4">{t("certificationRequest.reviewMessage")}</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{t("common.completion")}</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: "45%" }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => toggleSection("quickStats")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t("common.quickStats")}
            </h3>
            {expandedSections.quickStats ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </button>

          {expandedSections.quickStats && (
            <div className="px-6 pb-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("certificationRequest.labels.totalDocuments")}</span>
                  <span className="font-semibold text-gray-900">
                    {hasAttachments ? (request.attachments?.length || 0) + (request.company?.attachments?.length || 0) : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("common.processingTime")}</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(request?.startDate)} - {formatDate(request?.endDate)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CertificationRequestViewDetails;
