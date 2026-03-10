
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { TieredMenu } from "primereact/tieredmenu";
import type { MenuItem } from "primereact/menuitem";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { CategoryCreate } from "./CategoryCreate";
import { useTranslation } from "react-i18next";
import { useAppToast } from "../../../hooks/useToast";
import CategoryService from "../../../services/category.service";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { CategoryUpdate } from "./CategoryUpdate";

export const CategoryList: React.FC = () => {

    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);

    const { toast, showToast } = useAppToast();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const getAllCategories = async () => {
        setLoading(true);
        try {
            const res = await CategoryService.getPaginatedCategories({
                page: first / rows,
                size: rows,
                sort: "id,desc"
            });

            setCategoryList(res.data.data);
            setTotalRecords(res.data.totalElements);

        } catch (error) {
            showToast("error", t("common.error"), t("category.loadFailed"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllCategories();
    }, [first, rows]);

    const handleCreateSuccess = () => {
        setShowCreateDialog(false);
        getAllCategories();
        showToast("success", t("common.success"), t("category.created"));
    };

    const handleEditSuccess = () => {
        setShowEditDialog(false);
        getAllCategories();
        showToast("success", t("common.success"), t("category.updated"));
    };

    const handleEdit = (category: any) => {
        setSelectedCategoryId(category.id);
        setShowEditDialog(true);
    };

    const confirmDelete = (category: any) => {
        confirmDialog({
            message: (
                <div className="flex flex-col items-center gap-2 p-4">
                    <div className="relative w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                        <i className="pi pi-trash text-3xl text-white"></i>
                    </div>
                    <span className="text-lg font-semibold text-gray-800">
                        {t("category.delete")}
                    </span>
                    <p className="text-gray-600 text-center">
                        {t("category.deleteConfirm", { name: category.name || "—" })}
                    </p>
                </div>
            ),
            header: "",
            acceptLabel: t("category.delete"),
            rejectLabel: t("common.cancel"),
            accept: () => handleDelete(category.id),
            closeOnEscape: true,
            dismissableMask: true,
        });
    };

    const handleDelete = async (id: number) => {
        try {
            await CategoryService.deleteCategory(id);

            showToast("success", t("common.success"), t("category.deleted"));
            getAllCategories();

        } catch (error) {
            showToast("error", t("common.error"), t("category.deleteFailed"));
        }
    };

    const actionTemplate = (rowData: any) => {

        const menu = useRef<any>(null);

        const items: MenuItem[] = [
            {
                label: t("common.edit"),
                icon: "pi pi-pencil",
                command: () => handleEdit(rowData)
            },
            {
                label: t("common.delete"),
                icon: "pi pi-trash",
                command: () => confirmDelete(rowData)
            },
            {
                label: t("common.view"),
                icon: "pi pi-eye",
                command: () => navigate(`/categories/view/${rowData.id}`)
            }
        ];

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

    const header = () => (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    {t("category.list")}
                </h2>

                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {totalRecords} {t("common.total")}
                </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <Button
                    icon="pi pi-plus"
                    label={t("category.create")}
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
                    onClick={getAllCategories}
                />
            </div>
        </div>
    );

    const columns = [
        {
            field: "id",
            header: "ID",
            style: { width: "80px" },
            body: (row: any) => (
                <span className="font-medium text-gray-800">{row.id}</span>
            )
        },
        {
            field: "name",
            header: t("category.name"),
            sortable: true,
            style: { minWidth: "200px" },
            body: (row: any) => (
                <span className="font-medium text-gray-800">
                    {row.name || "—"}
                </span>
            )
        },
        {
            field: "categoryType",
            header: t("category.type"),
            sortable: true,
            style: { minWidth: "150px" },
            body: (row: any) => (
                <span className="text-gray-700">
                    {row.categoryType || "—"}
                </span>
            )
        },
        {
            header: t("common.action"),
            body: actionTemplate,
            style: { width: "140px" }
        }
    ];

    const breadcrumbItems = [{ label: "Category", url: "" }];

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            {showCreateDialog && (
                <CategoryCreate
                    onClose={() => setShowCreateDialog(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {showEditDialog && selectedCategoryId && (
                <CategoryUpdate
                    categoryId={selectedCategoryId}
                    onClose={() => setShowEditDialog(false)}
                    onSuccess={handleEditSuccess}
                />
            )}

            <DynamicBreadcrumb
                items={breadcrumbItems}
                size="pl-5 pr-5 max-w-8xl mx-auto mt-3"
            />

            <DynamicTable
                title={t("category.list")}
                value={categoryList}
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
