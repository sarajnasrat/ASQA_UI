import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { InputText } from "primereact/inputtext";
import RoleService from "../../../services/role.service";
import MenuService from "../../../services/menu.service";
import { useAppToast } from "../../../hooks/useToast";
import type { SidebarMenuOption } from "./MenuSelector";

interface EditRoleMenusDialogProps {
  roleId: string;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type MenuNode = SidebarMenuOption & { children?: MenuNode[]; sortOrder?: number };

const menuLabel = (
  menu: MenuNode,
  language: string,
  t: (key: string, options?: any) => string,
) => {
  const localizedLabel = language === "dr"
    ? menu.labelDr || menu.labelPs || menu.labelEn
    : language === "ps"
      ? menu.labelPs || menu.labelDr || menu.labelEn
      : menu.labelEn || menu.labelDr || menu.labelPs;
  return localizedLabel || t("role.menuEditor.unnamed");
};

const sortMenuTree = (items: MenuNode[]): MenuNode[] =>
  [...items]
    .sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id))
    .map((item) => ({
      ...item,
      children: sortMenuTree(Array.isArray(item.children) ? item.children : []),
    }));

const normalizeMenuTree = (items: MenuNode[]): MenuNode[] => {
  // Support nested menu data as well as a flat list linked by parentId.
  if (items.some((item) => Array.isArray(item.children) && item.children.length > 0)) {
    return sortMenuTree(items);
  }

  const byId = new Map<number, MenuNode>();
  items.forEach((item) => byId.set(Number(item.id), { ...item, children: [] }));
  const roots: MenuNode[] = [];
  byId.forEach((item) => {
    const parent = item.parentId == null ? undefined : byId.get(Number(item.parentId));
    if (parent) parent.children!.push(item);
    else roots.push(item);
  });
  return sortMenuTree(roots);
};

const filterMenuTree = (
  items: MenuNode[],
  query: string,
  language: string,
  t: (key: string, options?: any) => string,
): MenuNode[] => items.flatMap((item) => {
  if (menuLabel(item, language, t).toLocaleLowerCase().includes(query)) return [item];
  const children = filterMenuTree(item.children || [], query, language, t);
  return children.length ? [{ ...item, children }] : [];
});

export const EditRoleMenusDialog = ({ roleId, visible, onClose, onSuccess }: EditRoleMenusDialogProps) => {
  const { t, i18n } = useTranslation();
  const { showToast } = useAppToast();
  const showToastRef = useRef(showToast);
  const translateRef = useRef(t);
  showToastRef.current = showToast;
  translateRef.current = t;
  const [role, setRole] = useState<any>(null);
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setSearch("");
      try {
        const [roleResponse, menusResponse] = await Promise.all([
          RoleService.getRole(roleId),
          MenuService.getAllMenus(),
        ]);
        if (!active) return;
        const roleData = roleResponse.data?.data;
        if (!roleData) throw new Error("Role was not found");
        setRole(roleData);
        setMenus(Array.isArray(menusResponse.data)
          ? normalizeMenuTree(menusResponse.data as MenuNode[])
          : []);
        setSelectedIds((roleData.menuIds || []).map(Number));
      } catch (error) {
        console.error("Failed to load role menus", error);
        showToastRef.current("error", translateRef.current("common.error"), translateRef.current("role.navigation.loadFailed"));
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [visible, roleId]);

  const filteredMenus = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return menus;
    return filterMenuTree(menus, query, i18n.language, t);
  }, [menus, search, i18n.language, t]);

  const allMenuIds = useMemo(() => {
    const ids: number[] = [];
    const visit = (items: MenuNode[]) => items.forEach((item) => {
      ids.push(Number(item.id));
      visit(item.children || []);
    });
    visit(menus);
    return ids;
  }, [menus]);

  const translatedRoleName = role?.name
    ? t(`role.${role.name}`, {
        defaultValue: t(`user.roles.${role.name.replace(/^ROLE_/, "")}`, {
          defaultValue: role.name,
        }),
      })
    : "…";

  const toggleMenu = (id: number) => setSelectedIds((current) =>
    current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id],
  );

  const renderMenuCard = (menu: MenuNode, depth = 0) => {
    const id = Number(menu.id);
    const selected = selectedIds.includes(id);
    const children = menu.children || [];
    return (
      <div key={id} className={depth === 0 ? "rounded-xl border border-slate-200 bg-white p-3" : "rounded-lg border border-slate-100 bg-slate-50/70 p-2.5"}>
        <label htmlFor={`role-menu-${id}`} className="flex cursor-pointer items-center gap-4">
          <Checkbox inputId={`role-menu-${id}`} checked={selected} onChange={() => toggleMenu(id)} />
          <span className="min-w-0 flex-1 truncate text-base font-semibold text-slate-800">{menuLabel(menu, i18n.language, t)}</span>
          {selected && <i className="pi pi-check-circle text-indigo-600" />}
        </label>
        {children.length > 0 && (
          <div className={`mt-3 space-y-2 border-l-2 border-indigo-100 pl-4 ${depth === 0 ? "ml-4" : "ml-3"}`}>
            {children.map((child) => renderMenuCard(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const saveMenus = async () => {
    if (!role) return;
    setSaving(true);
    try {
      await RoleService.updateRole(roleId, {
        name: role.name,
        menuIds: selectedIds,
        permissions: (role.permissions || []).map((permission: any) => ({ id: Number(permission.id) })),
      });
      showToast("success", t("common.success"), t("role.messages.updateSuccess"));
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update role menus", error);
      showToast("error", t("common.error"), t("role.messages.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-between">
      <p className="m-0 self-center text-sm text-slate-500">
        <i className="pi pi-info-circle mr-2 text-indigo-500" />
        {t("role.menuEditor.permissionNote", { defaultValue: "Menu visibility is managed here. Page permissions stay unchanged." })}
      </p>
      <div className="flex justify-end gap-2">
        <Button label={t("common.cancel")} severity="secondary" outlined onClick={onClose} disabled={saving} />
        <Button label={t("role.buttons.save")} icon="pi pi-check" onClick={saveMenus} loading={saving} disabled={loading || !role} className="border-0 bg-indigo-600 hover:bg-indigo-700" />
      </div>
    </div>
  );

  return (
    <Dialog
      visible={visible}
      onHide={onClose}
      modal
      draggable={false}
      resizable={false}
      blockScroll
      style={{ width: "min(1200px, 98vw)" }}
      className="overflow-hidden rounded-2xl"
      contentClassName="p-0"
      footer={footer}
      header={
        <div className="flex items-center gap-4 py-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <i className="pi pi-sitemap text-xl" />
          </div>
          <div>
            <h2 className="m-0 text-xl font-bold text-slate-800">
              {t("role.menuEditor.title", { defaultValue: "Edit role menus" })}
            </h2>
            <p className="mb-0 mt-1 text-sm font-normal text-slate-500">
              {t("role.menuEditor.subtitle", { defaultValue: "Choose which sections appear in the sidebar for" })}{" "}
              <span className="font-semibold text-indigo-700">{translatedRoleName}</span>
            </p>
          </div>
        </div>
      }
      pt={{ header: { className: "border-b border-slate-100 px-6 py-5" } }}
    >
      <div className="space-y-5 px-6 py-5">
        <div className="grid gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="text-sm font-semibold text-indigo-100">{t("role.menuEditor.selectionLabel", { defaultValue: "Sidebar access" })}</div>
            <div className="mt-1 text-2xl font-bold">{selectedIds.length} <span className="text-base font-medium text-indigo-100">{t("role.menuEditor.selected", { defaultValue: "menus selected" })}</span></div>
          </div>
          <div className="flex gap-2">
            <Button label={t("role.menuEditor.selectAll", { defaultValue: "Select all" })} icon="pi pi-check-square" onClick={() => setSelectedIds(allMenuIds)} className="border border-white/30 bg-white/10 text-white hover:bg-white/20" />
            <Button label={t("role.menuEditor.clear", { defaultValue: "Clear" })} icon="pi pi-times" onClick={() => setSelectedIds([])} className="border border-white/30 bg-white/10 text-white hover:bg-white/20" />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="m-0 text-base font-bold text-slate-800">{t("role.menuEditor.available", { defaultValue: "Available menus" })}</h3>
            <p className="mb-0 mt-1 text-sm text-slate-500">{t("role.menuEditor.helper", { defaultValue: "Select the pages this role should see in its navigation." })}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{allMenuIds.length} {t("role.menuEditor.items", { defaultValue: "items" })}</span>
        </div>

        <div className="relative w-full sm:max-w-md">
          <i className="pi pi-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <InputText
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("role.menuEditor.search", { defaultValue: "Search menu names…" })}
            className="w-full rounded-xl border-slate-200 py-3 pl-11 pr-4 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {loading ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 text-slate-500"><i className="pi pi-spin pi-spinner text-3xl text-indigo-500" /><span>{t("common.loading", { defaultValue: "Loading…" })}</span></div>
        ) : filteredMenus.length ? (
          <div className="max-h-[52vh] space-y-4 overflow-y-auto p-1">
            {filteredMenus.map((parent) => (
              <section key={parent.id} className={`rounded-2xl border border-indigo-100 bg-indigo-50/40 ${parent.children?.length ? "p-6" : "p-3"}`}>
                <div className={`flex items-center gap-4 ${parent.children?.length ? "mb-4" : ""}`}>
                  <Checkbox inputId={`role-menu-${parent.id}`} checked={selectedIds.includes(Number(parent.id))} onChange={() => toggleMenu(Number(parent.id))} />
                  <label htmlFor={`role-menu-${parent.id}`} className="flex-1 cursor-pointer text-base font-bold text-slate-800">{menuLabel(parent, i18n.language, t)}</label>
                  {selectedIds.includes(Number(parent.id)) && <i className="pi pi-check-circle text-indigo-600" />}
                </div>
                {parent.children?.length ? (
                  <div className="grid grid-cols-1 gap-2 border-l-2 border-indigo-200 pl-4 sm:grid-cols-2">
                    {parent.children.map((child) => renderMenuCard(child))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center text-slate-500"><i className="pi pi-folder-open mb-3 block text-3xl text-slate-300" />{t("role.menuEditor.noResults", { defaultValue: "No menus match your search." })}</div>
        )}
      </div>
    </Dialog>
  );
};
