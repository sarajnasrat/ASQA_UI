import React, { useEffect, useState, useRef } from "react";
import { useAppToast } from "../../../../hooks/useToast";
import { useNavigate } from "react-router-dom";
import ProvinceService from "../../../../services/province.service";
import CountryService from "../../../../services/country.service";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import DynamicBreadcrumb from "../../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../../common/DynamicTable";
import { ProvinceCreate } from "./ProvinceCreate";
import { ProvinceUpdate } from "./ProvinceUpdate";
import { useTranslation } from "react-i18next";

export const ProvinceList: React.FC = () => {
    const [provinceList, setProvinceList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
    const [countries, setCountries] = useState<any[]>([]);

    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const { toast, showToast } = useAppToast();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Fetch countries for create/update dropdown
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await CountryService.getAllCountries();
                setCountries(res.data);
            } catch (error) {
                showToast("error", t("common.error"), t("province.loadCountriesFailed"));
            }
        };
        fetchCountries();
    }, []);

    // Fetch provinces with pagination
    const getAllProvinces = async () => {
        setLoading(true);
        try {
            const res = await ProvinceService.getPaginatedProvinces({ page: first / rows, size: rows, sort: "id,desc" });
            setProvinceList(res.data.data);
            setTotalRecords(res.data.totalElements);
        } catch (error) {
            showToast("error", t("common.error"), t("province.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllProvinces();
    }, [first, rows]);

    // Create / Edit Success handler
    const handleCreateSuccess = () => {
        setShowCreateDialog(false);
        getAllProvinces();
        showToast("success", t("common.success"), t("province.created"));
    };

    const handleEditSuccess = () => {
        setShowEditDialog(false);
        getAllProvinces();
        showToast("success", t("common.success"), t("province.updated"));
    };

    const handleEdit = (province: any) => {
        setSelectedProvinceId(province.id);
        setShowEditDialog(true);
    };

    const confirmDelete = (province: any) => {
        confirmDialog({
            message: (
                <div className="flex flex-col items-center gap-2 p-4">
                    <div className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                        <i className="pi pi-trash text-3xl text-white"></i>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">{t("province.delete")}</span>
                    <p className="text-gray-600 text-center">
                        {t("province.deleteConfirm", { name: province.name || "—" })}
                    </p>
                </div>
            ),
            header: "",
            acceptLabel: t("province.delete"),
            rejectLabel: t("common.cancel"),
            accept: () => handleDelete(province.id),
            closeOnEscape: true,
            dismissableMask: true,
        });
    };

    const handleDelete = async (id: number) => {
        try {
            await ProvinceService.deleteProvince(id);
            showToast("success", t("common.success"), t("province.deleted"));
            getAllProvinces();
        } catch (error) {
            showToast("error", t("common.error"), t("province.deleteFailed"));
        }
    };

    const actionTemplate = (rowData: any) => {
        const menu = useRef<any>(null);

        const items: MenuItem[] = [
            { label: t("common.edit"), icon: "pi pi-pencil", command: () => handleEdit(rowData) },
            { label: t("common.delete"), icon: "pi pi-trash", command: () => confirmDelete(rowData) },
            { label: t("common.view"), icon: "pi pi-eye", command: () => navigate(`/provinces/view/${rowData.id}`) },
        ];

        return (
            <div className="flex justify-center">
                <TieredMenu model={items} popup ref={menu} />
                <Button icon="pi pi-ellipsis-v" className="p-button-text p-button-sm" onClick={(e) => menu.current.toggle(e)} />
            </div>
        );
    };

    const header = () => (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {t("province.list")}
                </h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {totalRecords} {t("common.total")}
                </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                    icon="pi pi-plus"
                    label={t("province.create")}
                    text
                    raised
                    severity="info"
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 border-none shadow-md hover:shadow-lg transition-all"
                />
                <Button
                    icon="pi pi-sync"
                    label={t("common.refersh")}
                    text
                    raised
                    severity="info"
                    onClick={getAllProvinces}
                />
            </div>
        </div>
    );

    const columns = [
        {
            field: "id",
            header: "ID",
            style: { width: "80px" },
            className: "text-sm font-medium text-gray-600",
            body: (row: any) => <span className="font-medium text-gray-800">{row.id}</span>
        },
        {
            field: "provinceName",
            header: t("province.name"),
            sortable: true,
            style: { minWidth: "200px" },
            body: (row: any) => <span className="font-medium text-gray-800">{row.provinceName || "—"}</span>
        },
        {
            field: "country.countryName",
            header: t("province.country"),
            sortable: true,
            style: { minWidth: "150px" },
            body: (row: any) => <span className="text-gray-700">{row.country?.countryName || "—"}</span>
        },
        {
            header: t("common.action"),
            body: actionTemplate,
            style: { width: "140px" }
        },
    ];
    const breadcrumbItems = [{ label: "Province", url: "" }];
    console.log(selectedProvinceId);
    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            {showCreateDialog && (
                <ProvinceCreate countries={countries} onClose={() => setShowCreateDialog(false)} onSuccess={handleCreateSuccess} />
            )}

            {showEditDialog && selectedProvinceId && (
                <ProvinceUpdate provinceId={selectedProvinceId} countries={countries} onClose={() => setShowEditDialog(false)} onSuccess={handleEditSuccess} />
            )}

            <DynamicBreadcrumb items={breadcrumbItems} size="pl-5 pr-5 max-w-8xl mx-auto mt-3" />

            <DynamicTable
                title={t("province.list")}
                value={provinceList}
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