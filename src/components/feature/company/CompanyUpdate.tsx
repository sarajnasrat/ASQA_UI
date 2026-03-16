import React, { useEffect, useState, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { Toast } from "primereact/toast";
import { useNavigate, useParams } from "react-router-dom";

import FileUploadField from "../../common/FileUploadField";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import CompanyService from "../../../services/company.service";
import CategoryService from "../../../services/category.service";

import { useAppToast } from "../../../hooks/useToast";
import { useToast } from "../../../hooks/ToastContext";
import { handleApi } from "../../../hooks/handleApi";
import type { Company, CategoryReference, CompanyType } from "./company";
import { useTranslation } from "react-i18next";

export const CompanyUpdate: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const toastRef = useRef<Toast>(null);
  const { showToast } = useAppToast();
  const { showError, showSuccess } = useToast();

  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [businessLogoFile, setBusinessLogoFile] = useState<File | null>(null);
  const [categories, setCategories] = useState<CategoryReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Company>({
    defaultValues: {
      companyNameEN: "",
      companyNameDR: "",
      companyNamePS: "",
      email: "",
      phoneNumber: "",
      address: "",
      logoUrl: "",
      bussinessLogoUrl: "",
      isActive: true,
      mainBranchAddress: "",
      activityPlace: "",
      activityType: "",
      jawazNumber: "",
      jawazIssueDate: "",
      jawazExpiryDate: "",
      tinNumber: "",
      websiteUrl: "",
      establishYear: "",
      companyOwnerNameEn: "",
      companyOwnerNameDr: "",
      companyOwnerNamePs: "",
      companyType: "PRIVATE",
      aboutCompanyEn: "",
      aboutCompanyDr: "",
      aboutCompanyPs: "",
      categories: [],
      socialLinks: [],
    },
  });

  const { fields: socialLinksFields, append, remove } = useFieldArray({
    control,
    name: "socialLinks",
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    loadCategories();
    loadCompany();
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await CategoryService.getAllCategories();
      setCategories(res.data || []);
    } catch {
      showToast("error", "Error", "Failed to load categories");
    }
  };

const loadCompany = async () => {
  try {
    const res = await CompanyService.getCompanyById(id);
    const data = res.data.data;

    // Convert dates to string or undefined
    const establishYear = data.establishYear ? new Date(data.establishYear) : undefined;
    const jawazIssueDate = data.jawazIssueDate ? new Date(data.jawazIssueDate) : undefined;
    const jawazExpiryDate = data.jawazExpiryDate ? new Date(data.jawazExpiryDate) : undefined;

    reset({
      companyNameEN: data.companyNameEN || "",
      companyNameDR: data.companyNameDR || "",
      companyNamePS: data.companyNamePS || "",
      email: data.email || "",
      phoneNumber: data.phoneNumber || "",
      address: data.address || "",
      logoUrl: data.logoUrl || "",
      bussinessLogoUrl: data.bussinessLogoUrl || "",
      isActive: data.active ?? true,
      mainBranchAddress: data.mainBranchAddress || "",
      activityPlace: data.activityPlace || "",
      activityType: data.activityType || "",
      jawazNumber: data.jawazNumber || "",
      jawazIssueDate: jawazIssueDate?.toISOString().split("T")[0], // convert to string
      jawazExpiryDate: jawazExpiryDate?.toISOString().split("T")[0], // convert to string
      tinNumber: data.tinNumber || "",
      websiteUrl: data.websiteUrl || "",
      establishYear: establishYear?.getFullYear().toString(), // just year as string
      companyOwnerNameEn: data.companyOwnerNameEn || "",
      companyOwnerNameDr: data.companyOwnerNameDr || "",
      companyOwnerNamePs: data.companyOwnerNamePs || "",
      companyType: data.companyType || "PRIVATE",
      aboutCompanyEn: data.aboutCompanyEn || "",
      aboutCompanyDr: data.aboutCompanyDr || "",
      aboutCompanyPs: data.aboutCompanyPs || "",
      categories: data.categories || [],
      socialLinks: data.socialLinks || [],
    });

    setLoading(false);
  } catch (e) {
    showToast("error", "Error", "Failed to load company");
    setLoading(false);
  }
};
  // ================= SUBMIT =================
const onSubmit = async (data: Company) => {
    setIsSubmitting(true);

    try {
        const categoriesPayload = Array.isArray(data.categories)
            ? data.categories.map(cat => (typeof cat === "number" ? { id: cat } : { id: cat.id }))
            : [];

        const socialLinksPayload = Array.isArray(data.socialLinks)
            ? data.socialLinks.map(link => ({
                  socialLinkName: link.socialLinkName || "",
                  address: link.address || "",
              }))
            : [];

        const serializeDate = (d?: Date | string) => (d instanceof Date ? d.toISOString() : d || null);

        const payload = {
            ...data,
            categories: categoriesPayload,
            socialLinks: socialLinksPayload,
            establishYear: serializeDate(data.establishYear),
            jawazIssueDate: serializeDate(data.jawazIssueDate),
            jawazExpiryDate: serializeDate(data.jawazExpiryDate),
        };

        const formData = new FormData();
        formData.append("company", JSON.stringify(payload));
        if (companyLogoFile) formData.append("companyLogo", companyLogoFile);
        if (businessLogoFile) formData.append("bussinessLogo", businessLogoFile);

        const response = await handleApi(
            () => CompanyService.updateCompany(Number(id), formData),
            showSuccess,
            showError,
            t
        );

        if (response) {
            showToast("success", "Success", "Company updated successfully!");
            setTimeout(() => navigate("/companies"), 1500);
        }
    } catch (error) {
        console.error(error);
        showToast("error", "Error", "Failed to update company");
    } finally {
        setIsSubmitting(false);
    }
};


  const companyTypeOptions: CompanyType[] = [
    "PRIVATE",
    "PUBLIC",
    "GOVERNMENT",
    "EDUCATIONAL_INSTITUTIONS",
    "OTHER",
  ];

  const platformOptions = [
    { label: "Facebook", value: "Facebook" },
    { label: "Twitter", value: "Twitter" },
    { label: "LinkedIn", value: "LinkedIn" },
    { label: "Instagram", value: "Instagram" },
    { label: "YouTube", value: "YouTube" },
    { label: "Website", value: "Website" },
  ];

  if (loading) return <div className="p-5">Loading...</div>;

  return (
    <>
      <DynamicBreadcrumb
        items={[
          { label: "Companies", url: "/companies" },
          { label: "Update Company", url: `/companies/${id}` },
        ]}
      />

      <div className="flex justify-center p-5">
        <Toast ref={toastRef} />
        <Card className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="p-4">
                        {/* Company Information Section */}
                        <div className="mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Company Names */}
                                <div className="field">
                                    <label
                                        htmlFor="companyNameEN"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.companyNameEN")}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="companyNameEN"
                                        control={control}
                                        rules={{ required: "Company name EN is required" }}
                                        render={({ field }) => (
                                            <>
                                                <InputText
                                                    id="companyNameEN"
                                                    {...field}
                                                    className={`w-full ${errors.companyNameEN ? "p-invalid" : ""}`}
                                                    placeholder="Enter company name in English"
                                                />
                                                {errors.companyNameEN && (
                                                    <small className="p-error block mt-1">
                                                        {errors.companyNameEN.message}
                                                    </small>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="companyNameDR"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.companyNameDR")}
                                    </label>
                                    <Controller
                                        name="companyNameDR"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="companyNameDR"
                                                {...field}
                                                className="w-full"
                                                placeholder="د شرکت نوم (دری)"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="companyNamePS"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.companyNamePS")}
                                    </label>
                                    <Controller
                                        name="companyNamePS"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="companyNamePS"
                                                {...field}
                                                className="w-full"
                                                placeholder="د شرکت نوم (پښتو)"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Contact Information Section */}
                        <div className="mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="field">
                                    <label htmlFor="email" className="font-medium block mb-2">
                                        {t("company.labels.email")}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="email"
                                        control={control}
                                        rules={{
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+\.\S+$/,
                                                message: "Invalid email format",
                                            },
                                        }}
                                        render={({ field }) => (
                                            <>
                                                <InputText
                                                    id="email"
                                                    {...field}
                                                    type="email"
                                                    className={`w-full ${errors.email ? "p-invalid" : ""}`}
                                                    placeholder="company@example.com"
                                                />
                                                {errors.email && (
                                                    <small className="p-error block mt-1">
                                                        {errors.email.message}
                                                    </small>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="phoneNumber"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.phoneNumber")}{" "}
                                    </label>
                                    <Controller
                                        name="phoneNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="phoneNumber"
                                                {...field}
                                                className="w-full"
                                                placeholder="+93 123 456 789"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="websiteUrl"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.websiteUrl")}
                                    </label>
                                    <Controller
                                        name="websiteUrl"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="websiteUrl"
                                                {...field}
                                                className="w-full"
                                                placeholder="https://www.example.com"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="companyType"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.companyType")} <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="companyType"
                                        control={control}
                                        rules={{ required: "Company type is required" }}
                                        render={({ field }) => (
                                            <>
                                                <Dropdown
                                                    id="companyType"
                                                    {...field}
                                                    options={companyTypeOptions.map((c) => ({
                                                        label: c.replace(/_/g, " "),
                                                        value: c,
                                                    }))}
                                                    placeholder="Select Company Type"
                                                    className={`w-full ${errors.companyType ? "p-invalid" : ""}`}
                                                />
                                                {errors.companyType && (
                                                    <small className="p-error block mt-1">
                                                        {errors.companyType.message}
                                                    </small>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                                <div className="field md:col-span-2">
                                    <label htmlFor="address" className="font-medium block mb-2">
                                        =                   {t("company.labels.address")}{" "}                  </label>
                                    <Controller
                                        name="address"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="address"
                                                {...field}
                                                className="w-full"
                                                placeholder="Street, City, Country"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Legal Information Section */}
                        <div className="mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="field">
                                    <label htmlFor="tinNumber" className="font-medium block mb-2">
                                        {t("company.labels.tinNumber")}{" "}                  </label>
                                    <Controller
                                        name="tinNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="tinNumber"
                                                {...field}
                                                className="w-full"
                                                placeholder="Tax Identification Number"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="jawazNumber"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.jawazNumber")}
                                    </label>
                                    <Controller
                                        name="jawazNumber"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="jawazNumber"
                                                {...field}
                                                className="w-full"
                                                placeholder="License/Registration Number"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="establishYear"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.establishYear")}
                                    </label>
                                    <Controller
                                        name="establishYear"
                                        control={control}
                                        render={({ field }) => (
                                            <Calendar
                                                id="establishYear"
                                                {...field}
                                                view="year"
                                                dateFormat="yy"
                                                className="w-full"
                                                placeholder="Select year"
                                                showIcon
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="jawazIssueDate"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.jawazIssueDate")}                                    </label>
                                    <Controller
                                        name="jawazIssueDate"
                                        control={control}
                                        render={({ field }) => (
                                            <Calendar
                                                id="jawazIssueDate"
                                                {...field}
                                                dateFormat="yy-mm-dd"
                                                className="w-full"
                                                placeholder="Select date"
                                                showIcon
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="jawazExpiryDate"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.jawazExpiryDate")}
                                    </label>
                                    <Controller
                                        name="jawazExpiryDate"
                                        control={control}
                                        render={({ field }) => (
                                            <Calendar
                                                id="jawazExpiryDate"
                                                {...field}
                                                dateFormat="yy-mm-dd"
                                                className="w-full"
                                                placeholder="Select date"
                                                showIcon
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Owner Information Section */}
                        <div className="mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="field">
                                    <label
                                        htmlFor="companyOwnerNameEn"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.ownerNameEn")}
                                    </label>
                                    <Controller
                                        name="companyOwnerNameEn"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="companyOwnerNameEn"
                                                {...field}
                                                className="w-full"
                                                placeholder="Owner name in English"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="companyOwnerNameDr"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.ownerNameDr")}
                                    </label>
                                    <Controller
                                        name="companyOwnerNameDr"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="companyOwnerNameDr"
                                                {...field}
                                                className="w-full"
                                                placeholder="د مالک نوم (دری)"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="companyOwnerNamePs"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.ownerNamePs")}
                                    </label>
                                    <Controller
                                        name="companyOwnerNamePs"
                                        control={control}
                                        render={({ field }) => (
                                            <InputText
                                                id="companyOwnerNamePs"
                                                {...field}
                                                className="w-full"
                                                placeholder="د مالک نوم (پښتو)"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* About Company Section */}
                        <div className="mb-5">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3 pb-2 border-bottom-1 surface-border">
                                {t("company.labels.aboutCompany")}
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="field">
                                    <label
                                        htmlFor="aboutCompanyEn"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.aboutCompanyEn")}
                                    </label>
                                    <Controller
                                        name="aboutCompanyEn"
                                        control={control}
                                        render={({ field }) => (
                                            <InputTextarea
                                                id="aboutCompanyEn"
                                                {...field}
                                                rows={3}
                                                className="w-full"
                                                placeholder="Describe your company in English"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="aboutCompanyDr"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.aboutCompanyDr")}
                                    </label>
                                    <Controller
                                        name="aboutCompanyDr"
                                        control={control}
                                        render={({ field }) => (
                                            <InputTextarea
                                                id="aboutCompanyDr"
                                                {...field}
                                                rows={3}
                                                className="w-full"
                                                placeholder="د شرکت په اړه (دری)"
                                            />
                                        )}
                                    />
                                </div>

                                <div className="field">
                                    <label
                                        htmlFor="aboutCompanyPs"
                                        className="font-medium block mb-2"
                                    >
                                        {t("company.labels.aboutCompanyPs")}
                                    </label>
                                    <Controller
                                        name="aboutCompanyPs"
                                        control={control}
                                        render={({ field }) => (
                                            <InputTextarea
                                                id="aboutCompanyPs"
                                                {...field}
                                                rows={3}
                                                className="w-full"
                                                placeholder="د شرکت په اړه (پښتو)"
                                            />
                                        )}
                                    />
                                </div>
                            </div>
                        </div>{" "}
                        {/* Social Links Section */}
                        <div className="mb-5">
                            {socialLinksFields.length === 0 ? (
                                <Message
                                    severity="info"
                                    text={t("company.labels.nosocialLinksAdded")}
                                    className="w-full p-1"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {socialLinksFields.map(
                                        (item, index) => (
                                            (
                                                <div key={item.id} className=" border-round p-1">
                                                    <div className="flex justify-content-between align-items-center mb-2">
                                                        <span className="font-medium">
                                                            {item.socialLinkName || "Platform"}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            icon="pi pi-trash"
                                                            className="p-button-rounded p-button-danger p-button-text p-button-sm"
                                                            onClick={() => remove(index)}
                                                            tooltip="Remove"
                                                            tooltipOptions={{ position: "top" }}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div className="field">
                                                            <label
                                                                htmlFor={`platform-${index}`}
                                                                className="font-medium block mb-2"
                                                            >
                                                                {t("company.labels.platform")}
                                                            </label>
                                                            <Controller
                                                                name={`socialLinks.${index}.socialLinkName`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <Dropdown
                                                                        id={`platform-${index}`}
                                                                        {...field}
                                                                        options={platformOptions}
                                                                        placeholder="Select platform"
                                                                        className="w-full"
                                                                    />
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="field">
                                                            <label
                                                                htmlFor={`url-${index}`}
                                                                className="font-medium block mb-2"
                                                            >
                                                                {t("company.labels.url")}                                                            </label>
                                                            <Controller
                                                                name={`socialLinks.${index}.address`}
                                                                control={control}
                                                                render={({ field }) => (
                                                                    <InputText
                                                                        id={`url-${index}`}
                                                                        {...field}
                                                                        className="w-full"
                                                                        placeholder="https://..."
                                                                    />
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ),
                                    )}
                                </div>
                            )}
                            <div className="flex align-items-center justify-content-between mb-3 pb-2 border-bottom-1 surface-border mt-2">
                                <Button
                                    type="button"
                                    label={t("company.labels.addLink")}
                                    icon="pi pi-plus"
                                    className="p-button-sm p-button-outlined"
                                    onClick={() => append({ socialLinkName: "", address: "" })}
                                />
                            </div>
                        </div>
                        {/* Categories Section */}
                        <div className="mb-5">
                            <div className="field">
                                <label htmlFor="categories" className="font-medium block mb-2">
                                    {t("company.labels.categories")}
                                </label>
                                <Controller
                                    name="categories"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <Dropdown
                                                id="categories"
                                                {...field}
                                                options={categories.map((c) => ({
                                                    label: c.name,
                                                    value: c,
                                                }))}
                                                placeholder={t("company.labels.selectCategories")}
                                                className="w-full"
                                                showClear
                                                filter
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.value)}
                                            />
                                            <small className="text-gray-500 block mt-1">
                                                {t("company.labels.selectCategoriesHint")}
                                            </small>
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                        {/* Logos Section */}
                        <div className="mb-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="field">
                                    <label className="font-medium block mb-2">{t("company.labels.companyLogo")}</label>
                                    <FileUploadField
                                        name="companyLogo"
                                        accept="image/*"
                                        maxFileSize={1048576}
                                        onFileSelect={setCompanyLogoFile}
                                    />
                                </div>

                                <div className="field">
                                    <label className="font-medium block mb-2">
                                        {t("company.labels.businessLogo")}                                    </label>
                                    <FileUploadField
                                        name="businessLogo"
                                        accept="image/*"
                                        maxFileSize={1048576}
                                        onFileSelect={setBusinessLogoFile}
                                    />
                                </div>
                            </div>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate("/company")}

                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                            >
                                <i className="pi pi-times" />
                                {t("common.cancel")}

                            </button>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 min-w-27.5 justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="pi pi-spin pi-spinner" />
                                        {t("common.saving")}
                                    </>
                                ) : (
                                    <>
                                        <i className="pi pi-check" />
                                        {t("common.save")}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
        </Card>
      </div>
    </>
  );
};

export default CompanyUpdate;