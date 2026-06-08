
import { useTranslation } from "react-i18next";

export const CommiteeMemberView = () => {
  const { t } = useTranslation();
  return (
    <div>{t("commitee.member.viewTitle")}</div>
  );
};
