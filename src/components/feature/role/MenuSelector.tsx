import { MultiSelect } from "primereact/multiselect";
import { useTranslation } from "react-i18next";

export interface SidebarMenuOption {
  id: number;
  labelEn?: string;
  labelDr?: string;
  labelPs?: string;
  type?: "GROUP" | "ROUTE";
  path?: string | null;
  active?: boolean;
  icon?: string;
  parentId?: number | null;
  children?: SidebarMenuOption[];
}

interface Props {
  menus: SidebarMenuOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

export const MenuSelector = ({ menus, selectedIds, onChange, disabled = false }: Props) => {
  const { t, i18n } = useTranslation();
  const options = menus.map((menu) => {
    const label = (i18n.language === "dr" ? menu.labelDr : i18n.language === "ps" ? menu.labelPs : menu.labelEn)
      || menu.labelEn || menu.labelDr || menu.labelPs || String(menu.id);
    return {
      id: Number(menu.id),
      label: `${label}${menu.path ? ` (${menu.path})` : ""}${menu.active === false ? ` — ${t("role.navigation.inactive")}` : ""}`,
    };
  });

  return (
    <div className="space-y-2 mt-4">
      <label htmlFor="role-sidebar-menus" className="block text-sm font-semibold text-gray-700">
        {t("role.navigation.title")}
      </label>
      <MultiSelect inputId="role-sidebar-menus" value={selectedIds} options={options}
        disabled={disabled}
        optionLabel="label" optionValue="id" onChange={(event) => onChange(event.value ?? [])}
        placeholder={t("role.navigation.placeholder")} emptyMessage={t("role.navigation.empty")}
        display="chip" filter showClear className="w-full" />
      <p className="text-xs text-gray-500">{t("role.navigation.hint")}</p>
      {selectedIds.length === 0 && <p className="text-xs text-amber-700">{t("role.navigation.none")}</p>}
    </div>
  );
};
