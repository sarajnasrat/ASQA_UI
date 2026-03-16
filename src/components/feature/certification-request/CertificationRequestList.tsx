import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import CertificationRequestService from "../../../services/CertificationReques.service";
import { Toast } from "primereact/toast";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { DynamicTable } from "../../common/DynamicTable";
import { Button } from "primereact/button";
import type { MenuItem } from "primereact/menuitem";
import { useNavigate } from "react-router-dom";
import { TieredMenu } from "primereact/tieredmenu";
import { CertificationRequestUpdate } from "./CertificationRequestUpdate";

export const CertificationRequestList = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const toast = useRef<Toast>(null);

    const [certificationRequests, setCertificationRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
const [currentStatus, setCurrentStatus] = useState<string>(""); // empty string
    const [updateVisible, setUpdateVisible] = useState(false);
const [selectedId, setSelectedId] = useState<number | null>(null); const openUpdate = (id: number, status: string) => {
    setSelectedId(id);
    setCurrentStatus(status);   // ⭐ correct
    setUpdateVisible(true);
};

    const loadData = async () => {
        try {
            setIsLoading(true);
            const res = await CertificationRequestService.getAllPaginated({
                page: first / rows,
                size: rows,
                sort: "id,desc",
            });

            setCertificationRequests(res.data.data);
            setTotalRecords(res.data.totalElements);
        } catch (e) {
            toast.current?.show({
                severity: "error",
                summary: t("common.error"),
                detail: t("certificationRequest.loadFailed"),
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [first, rows]);

    const handleDelete = async (id: number) => {
        try {
            await CertificationRequestService.delete(id);

            toast.current?.show({
                severity: "success",
                summary: t("common.success"),
                detail: t("certificationRequest.deleted"),
            });

            loadData();
        } catch {
            toast.current?.show({
                severity: "error",
                summary: t("common.error"),
                detail: t("certificationRequest.deleteFailed"),
            });
        }
    };

    const confirmDelete = (row: any) => {
        confirmDialog({
            message: t("certificationRequest.deleteConfirm", {
                serial: row.serialNumber,
            }),
            header: t("certificationRequest.delete"),
            icon: "pi pi-exclamation-triangle",
            acceptLabel: t("common.delete"),
            rejectLabel: t("common.cancel"),
            accept: () => handleDelete(row.id),
        });
    };

    const actionTemplate = (rowData: any) => {
 
        const menu = useRef<any>(null);

        const items: MenuItem[] = [
            {
                label: t("common.view"),
                icon: "pi pi-eye",
                command: () =>
                    navigate(`/certification-request/view/${rowData.id}`),
            },
            {
                label: t("common.edit"),
                icon: "pi pi-pencil",
                command: () =>
                    openUpdate(rowData.id, rowData.requestStatus),
                
            },
            {
                label: t("common.delete"),
                icon: "pi pi-trash",
                command: () => confirmDelete(rowData),
            },
        ];

        return (
            <div className="flex justify-center">
                <TieredMenu model={items} popup ref={menu} />
                <Button
                    icon="pi pi-ellipsis-v"
                    text
                    rounded
                    onClick={(e) => menu.current.toggle(e)}
                />
            </div>
        );
    };

    const columns = [
        {
            field: "serialNumber",
            header: t("certificationRequest.labels.serialNumber"),
            sortable: true,
            body: (row: any) => <span>{row.serialNumber}</span>,
        },
        {
            field: "requestType",
            header: t("certificationRequest.labels.requestType"),
            body: (row: any) =>
                t(
                    `certificationRequest.typeOptions.${row.requestType}`
                ),
        },
        {
            field: "requestStatus",
            header: t("certificationRequest.labels.requestStatus"),
            body: (row: any) => (
                <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                    {t(
                        `certificationRequest.statusOptions.${row.requestStatus}`
                    )}
                </span>
            ),
        },
        {
            field: "certificationType",
            header: t("certificationRequest.labels.certificationType"),
            body: (row: any) =>
                t(
                    `certificationRequest.certificationTypeOptions.${row.certificationType}`
                ),
        },
        {
            field: "createdDate",
            header: t("certificationRequest.labels.createdDate"),
            body: (row: any) =>
                new Date(row.createdDate).toLocaleString(),
        },
        {
            header: t("common.action"),
            body: actionTemplate,
            style: { width: "120px" },
        },
    ];

    const header = (
        <div className="flex justify-between align-items-center">
            <h2 className="text-xl font-bold">
                {t("certificationRequest.list")}
            </h2>

            <div className="flex gap-2">
                <Button
                    icon="pi pi-plus"
                    text
                    severity="info"
                    raised
                    label={t("certificationRequest.create")}
                    onClick={() =>
                        navigate("/certification-request/create")
                    }
                />
                <Button
                    icon="pi pi-sync"
                    text
                    severity="info"
                    raised
                    onClick={loadData}
                    label={t("certificationRequest.refersh")}
                />
            </div>
        </div>
    );

    const breadcrumbItems = [
        { label: t("certificationRequest.list"), url: "" },
    ];

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            <DynamicBreadcrumb items={breadcrumbItems} />

            <DynamicTable
                title={t("certificationRequest.list")}
                value={certificationRequests}
                columns={columns}
                header={header}
                loading={isLoading}
                first={first}
                rows={rows}
                totalRecords={totalRecords}
                onPage={(e) => {
                    setFirst(e.first);
                    setRows(e.rows);
                }}
            />
            <CertificationRequestUpdate
                requestId={selectedId}
                currentStatus={currentStatus}
                visible={updateVisible}
                onHide={() => setUpdateVisible(false)}
                onSuccess={loadData}
            />
        </>
    );
};