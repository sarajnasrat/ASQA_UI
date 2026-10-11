import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type UserProfileMenuLinksProps = {
  onLinkClick?: () => void;
  isRTL: boolean;
};

const UserProfileMenuLinks = ({ onLinkClick, isRTL }: UserProfileMenuLinksProps) => {
  const { t } = useTranslation();

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="p-2">
      <Link
        to="/profile"
        className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group hover:bg-gray-50 ${isRTL ? "text-right" : "text-left"}`}
        onClick={onLinkClick}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 transition-colors group-hover:bg-blue-100">
          <i className="pi pi-user text-sm text-blue-600" />
        </div>
        <span className="text-sm text-gray-700">{t("navbar.myProfile")}</span>
      </Link>

      <Link
        to="/settings"
        className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group hover:bg-gray-50 ${isRTL ? "text-right" : "text-left"}`}
        onClick={onLinkClick}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 transition-colors group-hover:bg-purple-100">
          <i className="pi pi-cog text-sm text-purple-600" />
        </div>
        <span className="text-sm text-gray-700">
          {t("navbar.accountSettings")}
        </span>
      </Link>
    </div>
  );
};

export default UserProfileMenuLinks;
