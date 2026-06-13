import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import OrganizationServicesService from "../../../services/organizationservices.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

interface Props {
  visible?: boolean;
  organizationId?: number | null;
  onHide?: () => void;
}

export const OrganizationServicesDetails: React.FC<Props> = ({
  visible: visibleProp,
  organizationId: selectedOrganizationId,
  onHide,
}) => {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const isRtl = i18n.language === "ps" || i18n.language === "dr";

  const organizationId = selectedOrganizationId ?? (routeId ? Number(routeId) : null);
  const visible = visibleProp ?? Boolean(routeId);

  useEffect(() => {
    if (!visible || !organizationId) return;

    const loadData = async () => {
      setLoading(true);
      const response = await handleApi(
        () => OrganizationServicesService.getOrganizationById(organizationId),
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
  }, [visible, organizationId, showError, t]);

  if (!visible) return null;

  const breadcrumbItems = [
    { label: t("organizationServices.title"), url: "/organization-services" },
    {
      label: t("organizationServices.details"),
      url: `/organization-services/view/${organizationId}`,
    },
  ];

  const handleHide = () => {
    if (onHide) {
      onHide();
      return;
    }
    navigate("/organization-services");
  };

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={
        <div className="flex items-center justify-between w-full gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("organizationServices.detailsTitle")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("organizationServices.detailsDescription")}
            </p>
          </div>
        </div>
      }
      style={{ width: "95vw", maxWidth: "1000px" }}
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
          <p>{t("organizationServices.notFound")}</p>
        </div>
      ) : (
        <div className="space-y-5">

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("organizationServices.fields.name")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {data.name || t("common.notSpecified")}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("organizationServices.fields.status")}
                  </p>
                  <Tag
                    value={
                      data.isActive
                        ? t("organizationServices.active")
                        : t("organizationServices.inactive")
                    }
                    severity={data.isActive ? "success" : "danger"}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {t("organizationServices.fields.service")}
                </p>
                {data.service ? (
                  <div
                    dir={isRtl ? "rtl" : "ltr"}
                    className="text-base text-gray-900 leading-7 [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:list-disc [&_ul]:ps-6"
                    dangerouslySetInnerHTML={{ __html: data.service }}
                  />
                ) : (
                  <p className="text-base text-gray-900">{t("common.notSpecified")}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t("common.createdDate")}:</span>
                  <span className="font-medium text-gray-900">
                    {data.createdAt
                      ? IslamicDateFormatter.formatQamari(data.createdAt, true)
                      : t("common.notSpecified")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t("common.update")}:</span>
                  <span className="font-medium text-gray-900">
                    {data.updatedAt
                      ? IslamicDateFormatter.formatQamari(data.updatedAt, true)
                      : t("common.notSpecified")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default OrganizationServicesDetails;
