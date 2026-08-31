import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "primereact/checkbox";
import { Button } from "primereact/button";
import { ChevronDown, Minus, ShieldCheck } from "lucide-react";

interface PermissionSelectorProps {
  permissions: any[];
  selectedIds: string[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggle: (permission: any) => void;
  onSelectAll: (permissions: any[]) => void;
  onClearAll: (permissions?: any[]) => void;
}

const actionOrder = ["VIEW", "ADD", "UPDATE", "DELETE"];
export const hiddenPermissionGroups = new Set([
  "EMAILVERIFICATION",
  "FORGOTPASSWORD",
  "MULTILANGUAGE",
  "PROVINCETRANSLATION",
  "LANGUAGE",
  "DISTRICTTRANSLATION",
  "COUNTRYTRANSLATION",
  "CERTIFICATIONREQUESTSTATUSHISTORY",
  "CERTIFICATIONSTATUSEVENT",
  "CERTIFICATIONLIFECYCLEEVENT",
  "ADDRESS",
]);
const resourceLabels: Record<string, string> = {
  ABOUTUS: "About Us", AUDITLOG: "Audit Logs", AUDITLOGDETAIL: "Audit Log Details", ATTACHMENT: "Attachments",
  CERTIFICATION: "Certifications", CERTIFICATIONCONTRACT: "Certification Contracts", CERTIFICATIONLIFECYCLEEVENT: "Certification Lifecycle Events",
  CERTIFICATIONREQUEST: "Certification Requests", CERTIFICATIONREQUESTSTATUSHISTORY: "Certification Request Status History", CERTIFICATIONSTATUSEVENT: "Certification Status Events",
  CERTIFICATIONSUPERVISION: "Certification Supervision", COMPANY: "Companies", COMPANYCLASSIFICATION: "Company Classification", COMPANYCONTACTPERSON: "Company Contact Persons",
  COMMITEE: "Committees", COMMITEEASSIGNMENT: "Committee Assignments", COMMITEEMEMBER: "Committee Members", COMMITEEREPORT: "Committee Reports",
  CONTACTUS: "Contact Us", COUNTRY: "Countries", COUNTRYTRANSLATION: "Country Translations", DISTRICT: "Districts", DISTRICTTRANSLATION: "District Translations",
  INTERNATIONALPARTY: "International Parties", LANGUAGE: "Languages", MENU: "Menus", MULTILANGUAGE: "Multilanguage", NOTIFICATION: "Notifications",
  ORGANIZATION: "Organizations", ORGANIZATIONACTIVITY: "Organization Activity", ORGANIZATIONINFO: "Organization Information", PARTNERORGANIZATION: "Partner Organizations",
  PAYMENT: "Payments", PERMISSION: "Permissions", PROVINCE: "Provinces", PROVINCETRANSLATION: "Province Translations", REPORTS: "Reports", REQUEST: "Requests",
  ROLE: "Roles", STANDARD: "Standards", SUPERVISIONDURATION: "Supervision Duration", USER: "Users", ZONE: "Zones", CATEGORY: "Categories", ADDRESS: "Addresses", EMAILVERIFICATION: "Email Verification", FORGOTPASSWORD: "Forgot Password",
};
const resourceName = (name: string) => resourceLabels[name] || name.replace(/^(VIEW|ADD|UPDATE|DELETE)_/, "").replaceAll("_", " ").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({ permissions, selectedIds, searchTerm, onSearchChange, onToggle, onSelectAll, onClearAll }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const filtered = useMemo(() => permissions.filter((p) => p.permissionName?.toLowerCase().includes(searchTerm.toLowerCase())), [permissions, searchTerm]);
  const groups = useMemo(() => {
    const grouped = new Map<string, any[]>();
    filtered.forEach((permission) => {
      const group = permission.permissionName?.replace(/^(VIEW|ADD|UPDATE|DELETE)_/, "") || "OTHER";
      if (hiddenPermissionGroups.has(group)) return;
      grouped.set(group, [...(grouped.get(group) || []), permission]);
    });
    return [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, items]) => [key, items.sort((a, b) => actionOrder.indexOf(a.permissionName.split("_")[0]) - actionOrder.indexOf(b.permissionName.split("_")[0]))] as const);
  }, [filtered]);

  const toggle = (permission: any) => {
    onToggle(permission);
    const action = permission.permissionName?.split("_")[0];
    if (action !== "VIEW" && !selectedIds.includes(String(permission.id))) {
      const view = permissions.find((p) => p.permissionName === `VIEW_${permission.permissionName.replace(/^(ADD|UPDATE|DELETE)_/, "")}`);
      if (view && !selectedIds.includes(String(view.id))) onToggle(view);
    }
  };
  const groupSelected = (items: any[]) => items.filter((p) => selectedIds.includes(String(p.id))).length;

  return <div className="space-y-3">
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1"><i className="pi pi-search absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" placeholder={String(t("role.placeholders.searchPermissions"))} /></div>
      <div className="flex gap-2"><Button type="button" onClick={() => onSelectAll(filtered)} className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200" icon="pi pi-check-square" label={String(t("role.buttons.all"))} /><Button type="button" onClick={() => onClearAll()} className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200" icon="pi pi-ban" label={String(t("role.buttons.none"))} /></div>
    </div>
    <div className="max-h-[28rem] overflow-y-auto rounded-xl border border-gray-200 bg-slate-50/70 p-3" style={{ scrollbarWidth: "thin" }}>
      {groups.length ? groups.map(([group, items]) => { const selected = groupSelected(items); const isCollapsed = collapsed[group]; return <section key={group} className="mb-3 overflow-hidden rounded-xl border border-slate-200 bg-white last:mb-0">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5"><button type="button" onClick={() => setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }))} className="flex min-w-0 items-center gap-2 text-left"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><ShieldCheck size={15} /></span><span className="truncate text-sm font-bold text-slate-700">{String(t(`permissionGroups.${group}`, { defaultValue: resourceName(group) }))}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{selected}/{items.length}</span><ChevronDown size={15} className={`text-slate-400 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} /></button><div className="flex items-center gap-2"><button type="button" onClick={() => onSelectAll(items)} className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">{String(t("role.buttons.all"))}</button>{selected > 0 && <button type="button" onClick={() => onClearAll(items)} className="text-[11px] font-semibold text-slate-400 hover:text-slate-700">{String(t("role.buttons.none"))}</button>}</div></div>
        {!isCollapsed && <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">{items.map((permission) => { const checked = selectedIds.includes(String(permission.id)); return <label key={permission.id} htmlFor={`perm-${permission.id}`} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 transition-all ${checked ? "border-indigo-300 bg-indigo-50/80" : "border-slate-100 bg-slate-50/50 hover:border-indigo-200 hover:bg-white"}`}><Checkbox inputId={`perm-${permission.id}`} checked={checked} onChange={() => toggle(permission)} /><span className={`text-xs font-semibold ${checked ? "text-indigo-700" : "text-slate-600"}`}>{String(t(`permissions.${permission.permissionName}`, permission.permissionName.replaceAll("_", " ")))}</span></label>})}</div>}
      </section>}) : <div className="py-12 text-center text-sm text-gray-500"><Minus className="mx-auto mb-2 text-gray-300" />{String(t("role.messages.noPermissionsFound"))}</div>}
    </div>
  </div>;
};
