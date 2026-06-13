import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { useTranslation } from "react-i18next";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import AboutUsService from "../../../services/aboutus.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

interface Props {
  visible: boolean;
  aboutUsId: number | null;
  onHide: () => void;
}

const getString = (...values: any[]) => {
  const candidate = values.find(
    (value) => value !== undefined && value !== null && `${value}`.trim() !== "",
  );
  return candidate === undefined || candidate === null ? "" : `${candidate}`.trim();
};

const getDisplayValue = (...values: any[]) => {
  const value = getString(...values);
  return value || "-";
};

export const AboutUsDetails: React.FC<Props> = ({ visible, aboutUsId, onHide }) => {
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!visible || !aboutUsId) {
        setData(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      const response = await handleApi(
        () => AboutUsService.getAboutUsById(aboutUsId),
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
  }, [aboutUsId, showError, t, visible]);

  if (loading) {
    return (
      <div className="p-6 text-gray-500 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-red-500 text-center">
        <p>{t("aboutUs.notFound")}</p>
      </div>
    );
  }


  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={t("aboutUs.details")}
      style={{ width: "95vw", maxWidth: "900px" }}
      modal
      draggable={false}
      resizable={false}
    
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getDisplayValue(data.subject, data.title)}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{t("aboutUs.pageDetails")}</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Subject Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
              {t("aboutUs.subject")}
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="text-base font-semibold text-gray-900">
                {getDisplayValue(data.subject, data.title)}
              </p>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-green-500 rounded-full"></div>
              {t("aboutUs.about")}
            </h3>
            <div className="bg-linear-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
              <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {getDisplayValue(data.about, data.description)}
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">{t("aboutUs.status")}:</span>
              <Tag
                value={Boolean(data.isActive ?? data.active) ? t("aboutUs.active") : t("aboutUs.inactive")}
                severity={Boolean(data.isActive ?? data.active) ? "success" : "danger"}
              />
            </div>
          </div>

          {/* Meta Information */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {data.createdAt && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t("aboutUs.createdAt")}:</span>
                  <span className="font-medium text-gray-900">
                    {IslamicDateFormatter.formatQamari(data.createdAt, true)}
                  </span>
                </div>
              )}
              {data.updatedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t("aboutUs.updatedAt")}:</span>
                  <span className="font-medium text-gray-900">
                    {IslamicDateFormatter.formatQamari(data.updatedAt, true)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AboutUsDetails;
