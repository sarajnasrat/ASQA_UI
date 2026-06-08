import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import ContactUsService from "../../../services/contactus.service";

interface Props {
  visible?: boolean;
  contactUsId?: number | null;
  onHide?: () => void;
}

export const ContactUsDetails: React.FC<Props> = ({
  visible: visibleProp,
  contactUsId: selectedContactUsId,
  onHide,
}) => {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const contactUsId = selectedContactUsId ?? (routeId ? Number(routeId) : null);
  const visible = visibleProp ?? Boolean(routeId);

  useEffect(() => {
    if (!visible || !contactUsId) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const response = await handleApi(
        () => ContactUsService.getContactUsById(contactUsId),
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
  }, [visible, contactUsId, showError, t]);

  if (!visible) {
    return null;
  }

  const breadcrumbItems = [
    { label: t("contactUs.title"), url: "/contact-us" },
    { label: t("contactUs.details"), url: `/contact-us/view/${contactUsId}` },
  ];

  const handleHide = () => {
    if (onHide) {
      onHide();
      return;
    }
    navigate("/contact-us");
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={
        <div className="flex items-center justify-between w-full gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("contactUs.detailsTitle")}
            </h2>
            <p className="text-sm text-gray-500">{t("contactUs.contactDetails")}</p>
          </div>
          <Button icon="pi pi-times" className="p-button-text" onClick={handleHide} />
        </div>
      }
      style={{ width: "95vw", maxWidth: "700px" }}
      modal
      draggable={false}
      resizable={false}
    >
      {loading ? (
        <div className="p-6 text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p>{t("common.loading")}</p>
        </div>
      ) : !data ? (
        <div className="p-6 text-red-500 text-center">
          <p>{t("contactUs.notFound")}</p>
        </div>
      ) : (
        <div className="space-y-5">
          <DynamicBreadcrumb items={breadcrumbItems} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                  {t("contactUs.contactInformation")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t("contactUs.fullName")}
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {data.name} {data.lastName}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t("contactUs.phoneNumber")}
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {data.phoneNumber || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t("contactUs.email")}
                    </p>
                    <p className="text-base font-semibold text-gray-900 break-all">
                      {data.email || "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      {t("contactUs.organization")}
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      {data.organization || "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{t("contactUs.createdAt")}:</span>
                    <span className="font-medium text-gray-900">
                      {data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}
                    </span>
                  </div>
                  {data.updatedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{t("contactUs.updatedAt")}:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(data.updatedAt).toLocaleString()}
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

export default ContactUsDetails;
