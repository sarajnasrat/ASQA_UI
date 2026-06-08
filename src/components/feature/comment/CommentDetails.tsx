import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { handleApi } from "../../../hooks/handleApi";
import { useToast } from "../../../hooks/ToastContext";
import CommentService from "../../../services/comment.service";

interface CommentDetailsProps {
  commentId?: number | null;
  visible?: boolean;
  onHide?: () => void;
}

const CommentDetails: React.FC<CommentDetailsProps> = ({
  commentId: propCommentId,
  visible,
  onHide,
}) => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const commentId = propCommentId ?? (routeId ? Number(routeId) : null);
  const isDialog = typeof visible !== "undefined";

  useEffect(() => {
    const loadData = async () => {
      if (!commentId) return;
      setLoading(true);
      const response = await handleApi(
        () => CommentService.getCommentById(Number(commentId)),
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
  }, [commentId, showError, t]);

  const closeDialog = () => {
    if (isDialog) {
      onHide?.();
      return;
    }
    navigate("/comment");
  };

  const renderContent = () => {
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
          <p>{t("comment.notFound")}</p>
        </div>
      );
    }

    return (
      <div className="space-y-5 max-w-full">
        {!isDialog && (
          <DynamicBreadcrumb
            items={[
              { label: t("comment.title"), url: "/comment" },
              { label: t("comment.details"), url: `/comment/view/${commentId}` },
            ]}
          />
        )}

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-linear-to-r from-gray-50 to-white px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {t("comment.commentDetails")}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t("comment.viewingDetails")}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                {t("comment.personalInfo")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("comment.fullName")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {data.fullName || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("comment.email")}
                  </p>
                  <p className="text-base font-semibold text-gray-900 break-all">
                    {data.email || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("comment.createdAt")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {data.createdAt ? new Date(data.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {t("comment.updatedAt")}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                {t("comment.body")}
              </h3>
              <div className="bg-linear-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {data.body || "-"}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  };

  if (isDialog) {
    return (
      <Dialog
        visible={visible}
        onHide={closeDialog}
        header={t("comment.commentDetails")}
        style={{ width: "55rem", maxWidth: "95vw" }}
        modal
        className="comment-details-dialog"
    
      >
        {renderContent()}
      </Dialog>
    );
  }

  return <div className="p-4 md:p-6 space-y-5 max-w-5xl mx-auto">{renderContent()}</div>;
};

export default CommentDetails;
