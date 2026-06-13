import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import InternationalPartyService from "../../../services/internationalparty.service";
import { IslamicDateFormatter } from "../../common/datepicker/IslamicDateFormatter";

interface Props {
  visible?: boolean;
  internationalPartyId?: number | null;
  onHide?: () => void;
}

export const InternationalPartyDetails: React.FC<Props> = ({
  visible: visibleProp,
  internationalPartyId: selectedInternationalPartyId,
  onHide,
}) => {
  const { id: routeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const internationalPartyId =
    selectedInternationalPartyId ?? (routeId ? Number(routeId) : null);
  const visible = visibleProp ?? Boolean(routeId);

  useEffect(() => {
    if (!visible || !internationalPartyId) {
      return;
    }

    const loadData = async () => {
      setLoading(true);
      const response = await handleApi(
        () => InternationalPartyService.getInternationalPartyById(internationalPartyId),
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
  }, [visible, internationalPartyId, showError, t]);

  if (!visible) return null;

  const breadcrumbItems = [
    { label: t("internationalParty.title"), url: "/international-party" },
    {
      label: t("internationalParty.details"),
      url: `/international-party/view/${internationalPartyId}`,
    },
  ];

  const handleHide = () => {
    if (onHide) {
      onHide();
      return;
    }
    navigate("/international-party");
  };

  const renderValue = (value: any) => value || t("common.notSpecified");

  return (
    <Dialog
      visible={visible}
      onHide={handleHide}
      header={
        <div className="flex items-center justify-between w-full gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("internationalParty.detailsTitle")}
            </h2>
            <p className="text-sm text-gray-500">
              {t("internationalParty.detailsDescription")}
            </p>
          </div>
          {/* <Button icon="pi pi-times" className="p-button-text" onClick={handleHide} /> */}
        </div>
      }
      style={{ width: "95vw", maxWidth: "840px" }}
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
          <p>{t("internationalParty.notFound")}</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* <DynamicBreadcrumb items={breadcrumbItems} /> */}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("internationalParty.fields.name")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">{renderValue(data.name)}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("internationalParty.fields.location")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {renderValue(data.location)}
                  </p>
                </div>
                {/* <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("internationalParty.fields.organizationType")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {renderValue(data.organizationType)}
                  </p>
                </div> */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("internationalParty.fields.email")}
                  </p>
                  <p className="text-base font-semibold text-gray-900 break-all">
                    {renderValue(data.email)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("internationalParty.fields.phoneNumber")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {renderValue(data.phoneNumber)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("internationalParty.fields.websiteUrl")}
                  </p>
                  <p className="text-base font-semibold text-gray-900 break-all">
                    {renderValue(data.websiteUrl)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("internationalParty.fields.status")}
                  </p>
                  <Tag
                    value={
                      data.isActive
                        ? t("internationalParty.active")
                        : t("internationalParty.inactive")
                    }
                    severity={data.isActive ? "success" : "danger"}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  {t("internationalParty.fields.about")}
                </p>
                <p className="text-base text-gray-900 whitespace-pre-line">
                  {renderValue(data.about)}
                </p>
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
                {/* <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t("common.update")}:</span>
                  <span className="font-medium text-gray-900">
                    {data.updatedAt
                      ? IslamicDateFormatter.formatQamari(data.updatedAt, true)
                      : t("common.notSpecified")}
                  </span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default InternationalPartyDetails;
