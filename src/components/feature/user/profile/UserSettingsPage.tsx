import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const getStoredUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
};

export const UserSettingsPage = () => {
  const { t } = useTranslation();
  const userId = getStoredUserId();

  if (!userId) {
    return <div className="p-4">{t("user.messages.notFound")}</div>;
  }

  return <Navigate to={`/users/edit/${userId}`} replace />;
};

export default UserSettingsPage;
