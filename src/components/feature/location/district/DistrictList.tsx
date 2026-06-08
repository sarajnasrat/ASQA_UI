import { useEffect, useRef, useState } from "react";
import { useAppToast } from "../../../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import DistrictService from "../../../../services/district.service";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import DynamicBreadcrumb from "../../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../../common/DynamicTable";
import { DistrictCreate } from "./DistrictCreate";
import { useTranslation } from "react-i18next";
import ProvinceService from "../../../../services/province.service";
import { DistrictUpdate } from "./DistrictUpdate";
import { useAuth } from "../../../../context/AuthContext";

export const DistrictList = () => {
  const { hasPermission } = useAuth();
  const [districtList, setDistrictList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast, showToast } = useAppToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null,
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const menu = useRef<any>(null);

  // Pagination
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    getAllDistricts();
  }, [first, rows]);

  const [provinces, setProvinces] = useState<any[]>([]);

  useEffect(() => {
    // Fetch provinces from API when component mounts
    const fetchProvinces = async () => {
      try {
        const res = await ProvinceService.getAllProvinces(); // Your API call
        setProvinces(res.data);
      } catch (error) {
        showToast("error", t("common.error"), t("district.loadProvincesFailed"));
      }
    };
    fetchProvinces();
  }, []);

  const getAllDistricts = async () => {
    try {
      setLoading(true);
      const res = await DistrictService.getPaginatedDistricts({
        page: first / rows,
        size: rows,
        sort: "id,desc",
      });
      setDistrictList(res.data.data);
      setTotalRecords(res.data.totalElements);
    } catch (error) {
      showToast("error", t("common.error"), t("district.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    getAllDistricts();
    showToast("success", t("common.success"), t("district.created"));
  };

  const handleEdit = (district: any) => {
    setSelectedDistrictId(district.id);
    setShowEditDialog(true);
  };

  const confirmDelete = (district: any) => {
    confirmDialog({
      message: (
        <div className="flex flex-col items-center gap-2 p-4">
          <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
            <i className="pi pi-trash text-3xl text-white"></i>
          </div>
          <span className="text-lg font-semibold text-gray-800">
            {t("district.delete")}
          </span>
          <p className="text-gray-600 text-center">
            {t("district.deleteConfirm", { name: district.name || t("common.notSpecified") })}
          </p>
        </div>
      ),
      header: "",
      acceptLabel: t("district.delete"),
      rejectLabel: t("common.cancel"),
      accept: () => handleDelete(district.id),
      closeOnEscape: true,
      dismissableMask: true,
      breakpoints: { "960px": "90vw", "640px": "95vw" },
    });
  };

  const handleDelete = async (id: any) => {
    try {
      await DistrictService.deleteDistrict(id);
      showToast("success", t("common.success"), t("district.deleted"));
      getAllDistricts();
    } catch (error) {
      showToast("error", t("common.error"), t("district.deleteFailed"));
    }
  };

  const actionTemplate = (rowData: any) => {
    const items: MenuItem[] = [
      hasPermission("UPDATE_DISTRICT") && {
        label: t("common.edit"),
        icon: "pi pi-pencil",
        command: () => handleEdit(rowData),
      },
      hasPermission("DELETE_DISRICT") && {
        label: t("common.delete"),
        icon: "pi pi-trash",
        command: () => confirmDelete(rowData),
      },
      hasPermission("VIEW_DISTRICT") && {
        label: t("common.view"),
        icon: "pi pi-eye",
        command: () => navigate(`/districts/view/${rowData.id}`),
      },
    ].filter(Boolean) as MenuItem[];

    return (
      <div className="flex justify-center">
        <TieredMenu model={items} popup ref={menu} />
        <Button
          icon="pi pi-ellipsis-v"
          className="p-button-text p-button-sm"
          onClick={(e) => menu.current.toggle(e)}
        />
      </div>
    );
  };

  const header = () => {
    return (
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {t("district.list")}
          </h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
            {totalRecords} {t("common.total")}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button
            icon="pi pi-plus"
            label={t("district.create")}
            text
            raised
            severity="info"
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 border-none shadow-md hover:shadow-lg transition-all"
          />
          <Button
            icon="pi pi-sync"
            label={t("common.refresh")}
            text
            severity="info"
            raised
            onClick={getAllDistricts}
          />
        </div>
      </div>
    );
  };

  const columns = [
    {
      field: "id",
      header: t("common.id"),
      style: { width: "80px" },
      className: "text-sm font-medium text-gray-600",
    },
    {
      field: "districtName",
      header: t("district.name"),
      sortable: true,
      style: { minWidth: "200px" },
      body: (rowData: any) => (
        <span className="font-medium text-gray-700">
          {rowData.districtName || t("common.notSpecified")}
        </span>
      ),
    },
    {
      field: "province.provinceName",
      header: t("district.province"),
      sortable: true,
      style: { minWidth: "150px" },
      body: (rowData: any) => (
        <span className="text-gray-700">
          {rowData.province?.provinceName || t("common.notSpecified")}
        </span>
      ),
    },
    {
      header: t("common.action"),
      body: actionTemplate,
      style: { width: "140px" },
    },
  ];

  const breadcrumbItems = [{ label: t("district.list"), url: "" }];

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      {showCreateDialog && (
        <DistrictCreate
          onClose={() => setShowCreateDialog(false)}
          onSuccess={handleCreateSuccess}
          provinces={provinces} // ✅ Pass the list here
        />
      )}

      {showEditDialog && selectedDistrictId && (
        <DistrictUpdate
          districtId={selectedDistrictId}
          onClose={() => setShowEditDialog(false)}
          onSuccess={() => {
            setShowEditDialog(false);
            getAllDistricts();
          }}
          provinces={provinces} // ✅ Pass the list here too
        />
      )}

      <DynamicBreadcrumb
        items={breadcrumbItems}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
      />

      <DynamicTable
        title={t("district.list")}
        value={districtList}
        columns={columns}
        header={header()}
        loading={loading}
        first={first}
        rows={rows}
        totalRecords={totalRecords}
        onPage={(e) => {
          setFirst(e.first);
          setRows(e.rows);
        }}
      />
    </>
  );
};
