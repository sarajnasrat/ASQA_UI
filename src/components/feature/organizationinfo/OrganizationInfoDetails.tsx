import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import OrganizationInfoService from "../../../services/organizationinfo.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

const getDisplayValue = (...values: any[]) => {
  const candidate = values.find(
    (value) =>
      value !== undefined && value !== null && `${value}`.trim() !== "",
  );
  return candidate === undefined || candidate === null
    ? "-"
    : `${candidate}`.trim();
};

interface Props {
  visible?: boolean;
  organizationInfoId?: number | null;
  onHide?: () => void;
}

export const OrganizationInfoDetails: React.FC<Props> = ({
  visible: visibleProp,
  organizationInfoId: selectedOrganizationInfoId,
  onHide,
}) => {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const organizationInfoId =
    selectedOrganizationInfoId ?? (routeId ? Number(routeId) : null);
  const visible = visibleProp ?? Boolean(routeId);

  useEffect(() => {
    if (!visible || !organizationInfoId) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const response = await handleApi(
        () =>
          OrganizationInfoService.getOrganizationInfoById(organizationInfoId),
        () => {},
        showError,
        t,
      );

      if (response) {
        setData(response.data?.data || response.data);
      }

      setLoading(false);
    };

    loadData();
  }, [visible, organizationInfoId, showError, t]);

  const handleHide = () => {
    if (onHide) {
      onHide();
      return;
    }

    navigate("/organization-info");
  };

  if (!visible) {
    return null;
  }

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      style={{ width: "95vw", maxWidth: "950px" }}
      modal
      draggable={false}
      resizable={false}
    >
      {loading ? (
        <div className="py-8 text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p>{t("common.loading")}</p>
        </div>
      ) : !data ? (
        <div className="p-6 text-red-500 text-center">
          <p>{t("organizationInfo.notFound")}</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getDisplayValue(data.organizationName)}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {t("organizationInfo.detailsHeader")}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {t("organizationInfo.organizationName")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {getDisplayValue(data.organizationName)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {t("organizationInfo.phoneNumber")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {getDisplayValue(data.phoneNumber)}
                  </p>
                </div>
                <div className="md:col-span-2 bg-linear-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {t("organizationInfo.address")}
                  </p>
                  <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {getDisplayValue(data.address)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {t("organizationInfo.satelliteHorizontal")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {getDisplayValue(data.satelliteHorizontal)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {t("organizationInfo.satelliteVertical")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {getDisplayValue(data.satelliteVertical)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {t("organizationInfo.emailAddress")}
                  </p>
                  <p className="text-base font-semibold text-gray-900 break-all">
                    {getDisplayValue(data.emailAddress)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {data.createdAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">
                        {t("organizationInfo.createdAt")}:
                      </span>
                      <span className="font-medium text-gray-900">
                        {IslamicDateFormatter.formatQamari(data.createdAt, true)}
                      </span>
                    </div>
                  )}
                  {data.updatedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">
                        {t("organizationInfo.updatedAt")}:
                      </span>
                      <span className="font-medium text-gray-900">
                        {IslamicDateFormatter.formatQamari(data.updatedAt, true)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default OrganizationInfoDetails;
