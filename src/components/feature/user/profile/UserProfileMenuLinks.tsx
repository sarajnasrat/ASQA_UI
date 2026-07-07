import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type UserProfileMenuLinksProps = {
  onLinkClick?: () => void;
};

const UserProfileMenuLinks = ({ onLinkClick }: UserProfileMenuLinksProps) => {
  const { t } = useTranslation();

  return (
    <div className="p-2">
      <Link
        to="/profile"
        className="flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group hover:bg-gray-50"
        onClick={onLinkClick}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 transition-colors group-hover:bg-blue-100">
          <i className="pi pi-user text-sm text-blue-600" />
        </div>
        <span className="text-sm text-gray-700">{t("navbar.myProfile")}</span>
      </Link>

      <Link
        to="/settings"
        className="flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors group hover:bg-gray-50"
        onClick={onLinkClick}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 transition-colors group-hover:bg-purple-100">
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
