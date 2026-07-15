// components/feature/registration/CompanyForm.tsx
import React, { useState, useEffect } from "react";
import { Building2, Globe, Upload, X } from "lucide-react";
import { useAppToast } from "../../../../hooks/useToast";
import { useTranslation } from "react-i18next";
import CategoryService from "../../../../services/category.service";
import CompanyService from "../../../../services/company.service";
import { handleApi } from "../../../../hooks/handleApi";
import { useToast } from "../../../../hooks/ToastContext";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { SmartDatePicker } from "../../../common/datepicker/SmartDatePicker";

interface Category {
  id: number;
  name: string;
}

interface SocialLink {
  socialLinkName: string;
  address: string;
}

interface CompanyFormData {
  formData: any;
  selectedCategories: number[];
  socialLinks: any[];
  logoPreview?: string;
  businessLogoPreview?: string;
  companyLogo?: File | null;
  businessLogo?: File | null;
  existingLogoUrl?: string;
  existingBusinessLogoUrl?: string;
}

interface CompanyFormProps {
  onSuccess: (id: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
  savedData?: CompanyFormData | null;
  onDataChange?: (data: CompanyFormData) => void;
}

type CalendarType = "gregorian" | "persian" | "arabic";

const COMPANY_TYPES = [
  { value: "PRIVATE", labelKey: "company.typeOptions.PRIVATE" },
  // { value: "PUBLIC", labelKey: "company.typeOptions.PUBLIC" },
  { value: "GOVERNMENT", labelKey: "company.typeOptions.GOVERNMENT" },
  // {
  //   value: "EDUCATIONAL_INSTITUTIONS",
  //   labelKey: "company.typeOptions.EDUCATIONAL_INSTITUTIONS",
  // },
  { value: "OTHER", labelKey: "company.typeOptions.OTHER" },
];

const CompanyForm: React.FC<CompanyFormProps> = ({
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting,
  savedData,
  onDataChange,
}) => {
  const { t } = useTranslation();
  const { showToast } = useAppToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  // const [newSocialLink, setNewSocialLink] = useState<SocialLink>({
  //   socialLinkName: "",
  //   address: "",
  // });
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [businessLogo, setBusinessLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [businessLogoPreview, setBusinessLogoPreview] = useState<string>("");
  const [existingLogoUrl, setExistingLogoUrl] = useState<string>("");
  const [existingBusinessLogoUrl, setExistingBusinessLogoUrl] =
    useState<string>("");

  const [formData, setFormData] = useState({
    companyNameEN: "",
    companyNameDR: "",
    companyNamePS: "",
    email: "",
    phoneNumber: "",
    address: "",
    mainBranchAddress: "",
    activityPlace: "",
    activityType: "",
    jawazNumber: "",
    jawazExpiryDate: "",
    jawazIssueDate: "",
    tinNumber: "",
    websiteUrl: "",
    establishYear: "",
    companyOwnerNameEn: "",
    companyOwnerNameDr: "",
    companyOwnerNamePs: "",
    companyType: "PRIVATE" as const,
    aboutCompanyEn: "",
    aboutCompanyDr: "",
    aboutCompanyPs: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({});
  const [establishYearCalendarType, setEstablishYearCalendarType] =
    useState<CalendarType>("gregorian");
  const [jawazIssueCalendarType, setJawazIssueCalendarType] =
    useState<CalendarType>("gregorian");
  const [jawazExpiryCalendarType, setJawazExpiryCalendarType] =
    useState<CalendarType>("gregorian");

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Load saved data
  useEffect(() => {
    if (savedData) {
      setFormData(savedData.formData);
      setSelectedCategories(savedData.selectedCategories);
      setSocialLinks(savedData.socialLinks);
      if (savedData.logoPreview) setLogoPreview(savedData.logoPreview);
      if (savedData.businessLogoPreview)
        setBusinessLogoPreview(savedData.businessLogoPreview);
      if (savedData.existingLogoUrl)
        setExistingLogoUrl(savedData.existingLogoUrl);
      if (savedData.existingBusinessLogoUrl)
        setExistingBusinessLogoUrl(savedData.existingBusinessLogoUrl);
    }
  }, [savedData]);

  // Save data on every change
  useEffect(() => {
    if (onDataChange && !savedData?.formData?.id) {
      const dataToSave: CompanyFormData = {
        formData,
        selectedCategories,
        socialLinks,
        logoPreview,
        businessLogoPreview,
        companyLogo,
        businessLogo,
        existingLogoUrl,
        existingBusinessLogoUrl,
      };
      onDataChange(dataToSave);
    }
  }, [
    formData,
    selectedCategories,
    socialLinks,
    logoPreview,
    businessLogoPreview,
    companyLogo,
    businessLogo,
    existingLogoUrl,
    existingBusinessLogoUrl,
    onDataChange,
    savedData,
  ]);
  const [company, setCompany] = useState<any>(null);
  const getCompanyById = async () => {
    try {
      const res = await CompanyService.getCompanyById(
        Number(localStorage.getItem("companyId")),
      );
      setCompany(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    getCompanyById();
  }, []); // ✅ run once
  useEffect(() => {
    if (!company) return;

    const c = company?.data;

    if (!c) return;

    setFormData({
      companyNameEN: c.companyNameEN || "",
      companyNameDR: c.companyNameDR || "",
      companyNamePS: c.companyNamePS || "",
      email: c.email || "",
      phoneNumber: c.phoneNumber || "",

      address: c.address || "",
      mainBranchAddress: c.mainBranchAddress || "",
      activityPlace: c.activityPlace || "",
      activityType: c.activityType || "",

      jawazNumber: c.jawazNumber || "",
      jawazExpiryDate: c.jawazExpiryDate || "",
      jawazIssueDate: c.jawazIssueDate || "",

      tinNumber: c.tinNumber || "",
      websiteUrl: c.websiteUrl || "",

      establishYear: c.establishYear || "",

      companyOwnerNameEn: c.companyOwnerNameEn || "",
      companyOwnerNameDr: c.companyOwnerNameDr || "",
      companyOwnerNamePs: c.companyOwnerNamePs || "",

      companyType: c.companyType || "PRIVATE",

      aboutCompanyEn: c.aboutCompanyEn || "",
      aboutCompanyDr: c.aboutCompanyDr || "",
      aboutCompanyPs: c.aboutCompanyPs || "",
    });
    // ✅ Categories (VERY IMPORTANT - you were missing this)
    setSelectedCategories(c.categories?.map((cat: any) => cat.id) || []);

    // ✅ Social links
    setSocialLinks(c.socialLinks || []);

    // ✅ Logos (for preview)
    setExistingLogoUrl(c.logoUrl || "");
    setExistingBusinessLogoUrl(c.bussinessLogoUrl || "");
  }, [company]);

  const loadCategories = async () => {
    try {
      const response = await CategoryService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      showToast("error", t("common.error"), t("company.loadFailed"));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "logo" | "business",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("error", t("common.error"), t("common.validation.imageOnly"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("error", t("common.error"), t("common.validation.fileSize"));
      return;
    }

    if (type === "logo") {
      setCompanyLogo(file);
      setExistingLogoUrl("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBusinessLogo(file);
      setExistingBusinessLogoUrl("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type: "logo" | "business") => {
    if (type === "logo") {
      setCompanyLogo(null);
      setLogoPreview("");
      setExistingLogoUrl("");
    } else {
      setBusinessLogo(null);
      setBusinessLogoPreview("");
      setExistingBusinessLogoUrl("");
    }
  };

  // const addSocialLink = () => {
  //   if (newSocialLink.socialLinkName && newSocialLink.address) {
  //     setSocialLinks([...socialLinks, newSocialLink]);
  //     setNewSocialLink({ socialLinkName: "", address: "" });
  //   }
  // };

  // const removeSocialLink = (index: number) => {
  //   setSocialLinks(socialLinks.filter((_, i) => i !== index));
  // };

  // const handleCategoryToggle = (categoryId: number) => {
  //   setSelectedCategories((prev) =>
  //     prev.includes(categoryId)
  //       ? prev.filter((id) => id !== categoryId)
  //       : [...prev, categoryId],
  //   );
  // };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.companyNameEN)
      newErrors.companyNameEN = t("company.validation.companyNameEN.required");
    if (!formData.companyNameDR)
      newErrors.companyNameDR = t("company.validation.companyNameDR.required");
    if (!formData.companyNamePS)
      newErrors.companyNamePS = t("company.validation.companyNamePS.required");
    if (!formData.email)
      newErrors.email = t("company.validation.email.required");
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t("company.validation.email.invalid");
    if (!formData.phoneNumber)
      newErrors.phoneNumber = t("company.validation.phoneNumber.required");
    if (!formData.address)
      newErrors.address = t("company.validation.address.required");
    if (!formData.mainBranchAddress)
      newErrors.mainBranchAddress = t(
        "company.validation.mainBranchAddress.required",
      );
    if (!formData.activityPlace)
      newErrors.activityPlace = t("company.validation.activityPlace.required");

    if (!formData.jawazNumber)
      newErrors.jawazNumber = t("company.validation.jawazNumber.required");
    if (!formData.jawazIssueDate)
      newErrors.jawazIssueDate = t(
        "company.validation.jawazIssueDate.required",
      );
    if (!formData.jawazExpiryDate)
      newErrors.jawazExpiryDate = t(
        "company.validation.jawazExpiryDate.required",
      );
    if (!formData.tinNumber)
      newErrors.tinNumber = t("company.validation.tinNumber.required");
    if (!formData.establishYear)
      newErrors.establishYear = t("company.validation.establishYear.required");
    if (!formData.companyOwnerNameEn)
      newErrors.companyOwnerNameEn = t(
        "company.validation.companyOwnerNameEn.required",
      );
    if (!formData.companyOwnerNameDr)
      newErrors.companyOwnerNameDr = t(
        "company.validation.companyOwnerNameDr.required",
      );

    if (!formData.aboutCompanyEn)
      newErrors.aboutCompanyEn = t(
        "company.validation.aboutCompanyEn.required",
      );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const { showError, showSuccess } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError(t("common.validation.fillRequiredFields"));
      return;
    }

    if (selectedCategories.length === 0) {
      showError(t("company.validation.categories.required"));
      return;
    }

    setIsSubmitting(true);

    const companyData = {
      ...formData,
      categories: selectedCategories.map((id) => ({ id })),
      socialLinks,
      isActive: true,
      logoUrl: existingLogoUrl || "",
      bussinessLogoUrl: existingBusinessLogoUrl || "",
      websiteUrl: formData.websiteUrl || "",
    };

    const companyIdFromStorage = localStorage.getItem("companyId");

    let response;

    // ✅ UPDATE MODE
    if (companyIdFromStorage) {
      response = await handleApi(
        () =>
          CompanyService.updateCompany(
            Number(companyIdFromStorage),
            companyData,
            companyLogo,
            businessLogo,
          ),
        showSuccess,
        showError,
        t,
      );
    }
    // ✅ CREATE MODE
    else {
      const formDataToSend = new FormData();
      formDataToSend.append("company", JSON.stringify(companyData));

      if (companyLogo) formDataToSend.append("companyLogo", companyLogo);
      if (businessLogo) formDataToSend.append("bussinessLogo", businessLogo);

      response = await handleApi(
        () => CompanyService.createCompany(formDataToSend),
        showSuccess,
        showError,
        t,
      );
    }

    // ✅ Save companyId after success
    if (response) {
      const companyId =
        response.data?.id ||
        response.data?.data?.id ||
        response.data?.companyId;

      if (companyId) {
        localStorage.setItem("companyId", String(companyId));
        setTimeout(() => onSuccess(companyId), 500);
      }
    }

    setIsSubmitting(false);
  };
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     showError(t('common.validation.fillRequiredFields'));
  //     return;
  //   }

  //   if (selectedCategories.length === 0) {
  //     showError(t('company.validation.categories.required'));
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   // Prepare form data
  //   const formDataToSend = new FormData();
  //   const companyData = {
  //     ...formData,
  //     categories: selectedCategories.map(id => ({ id })),
  //     socialLinks: socialLinks,
  //     isActive: true,
  //     logoUrl: existingLogoUrl || '',
  //     bussinessLogoUrl: existingBusinessLogoUrl || '',
  //     websiteUrl: formData.websiteUrl || ''
  //   };
  //   formDataToSend.append('company', JSON.stringify(companyData));

  //   if (companyLogo) formDataToSend.append('companyLogo', companyLogo);
  //   if (businessLogo) formDataToSend.append('bussinessLogo', businessLogo);
  //   if(localStorage.getItem('companyId')) {
  //     await handleApi(
  //       () => CompanyService.updateCompany(Number(localStorage.getItem('companyId')), companyData, companyLogo, businessLogo),
  //       showSuccess, // success callback
  //       showError,   // error callback
  //       t            // translation function
  //     );
  //   }
  //   // Call backend using handleApi
  //   const response = await handleApi(
  //     () => CompanyService.createCompany(formDataToSend),
  //     showSuccess, // success callback
  //     showError,   // error callback
  //     t            // translation function
  //   );

  //   if (response) {
  //     // Wait a bit then call onSuccess with the company ID
  //     const companyId = response.data?.id || response.data?.data?.id || response.data?.companyId;
  //     localStorage.setItem('companyId', String(companyId));
  //     setTimeout(() => onSuccess(companyId), 500);
  //   }

  //   setIsSubmitting(false);
  // };
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   if (!validateForm()) {
  //     showToast(
  //       "error",
  //       t("common.error"),
  //       t("common.validation.fillRequiredFields"),
  //     );
  //     return;
  //   }

  //   if (selectedCategories.length === 0) {
  //     showToast(
  //       "error",
  //       t("common.error"),
  //       t("company.validation.categories.required"),
  //     );
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   try {
  //     const formDataToSend = new FormData();

  //     const companyData = {
  //       ...formData,
  //       categories: selectedCategories.map((id) => ({ id })),
  //       socialLinks: socialLinks,
  //       isActive: true,
  //       logoUrl: existingLogoUrl || "",
  //       bussinessLogoUrl: existingBusinessLogoUrl || "",
  //       websiteUrl: formData.websiteUrl || "",
  //     };

  //     formDataToSend.append("company", JSON.stringify(companyData));

  //     if (companyLogo) {
  //       formDataToSend.append("companyLogo", companyLogo);
  //     }
  //     if (businessLogo) {
  //       formDataToSend.append("bussinessLogo", businessLogo);
  //     }

  //     const response = await CompanyService.createCompany(formDataToSend);

  //     const companyId =
  //       response.data?.id ||
  //       response.data?.data?.id ||
  //       response.data?.companyId;

  //     if (companyId) {
  //       showToast(
  //         "success",
  //         t("common.success"),
  //         t("company.messages.createSuccess"),
  //       );
  //       onSuccess(companyId);
  //     } else {
  //       throw new Error(t("company.createNoId"));
  //     }
  //   } catch (error: any) {
  //     console.error("Registration error:", error);

  //     let errorMessage = t("company.createFailed");

  //     if (error.response?.data) {
  //       const backendError = error.response.data;

  //       // ✅ if errors array exists
  //       if (backendError.errors && backendError.errors.length > 0) {
  //         errorMessage = t(backendError.errors[0]);
  //       }
  //       // ✅ fallback message
  //       else if (backendError.message) {
  //         errorMessage = t(backendError.message);
  //       }
  //     }

  //     showToast("error", t("common.error"), errorMessage);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (
    field: "establishYear" | "jawazIssueDate" | "jawazExpiryDate",
    value: any,
  ) => {
    const parsedValue = value
      ? new Date(value?.date || value).toISOString()
      : "";

    setFormData((prev) => ({ ...prev, [field]: parsedValue }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Building2 className="h-5 w-5 text-blue-600 mr-2" />
          {t("company.basicInformation")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.companyNameEN")} *
            </label>
            <input
              type="text"
              name="companyNameEN"
              value={formData.companyNameEN}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.companyNameEN")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.companyNameEN ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.companyNameEN && (
              <p className="mt-1 text-sm text-red-500">
                {errors.companyNameEN}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.companyNameDR")} *
            </label>
            <input
              type="text"
              name="companyNameDR"
              value={formData.companyNameDR}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.companyNameDR")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.companyNameDR ? "border-red-500" : "border-gray-300"
              }`}
              dir="rtl"
            />
            {errors.companyNameDR && (
              <p className="mt-1 text-sm text-red-500">
                {errors.companyNameDR}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.companyNamePS")} *
            </label>
            <input
              type="text"
              name="companyNamePS"
              value={formData.companyNamePS}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.companyNamePS")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.companyNamePS ? "border-red-500" : "border-gray-300"
              }`}
              dir="rtl"
            />
            {errors.companyNamePS && (
              <p className="mt-1 text-sm text-red-500">
                {errors.companyNamePS}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.companyType")} *
            </label>
            <select
              name="companyType"
              value={formData.companyType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
            >
              {COMPANY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {t(type.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.email")} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.email")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.phoneNumber")} *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.phoneNumber")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>
          <div className="">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("common.selectDateType")} *
            </label>
            <Dropdown
              className="w-full mb-3"
              value={establishYearCalendarType}
              options={[
                { label: t("common.gregorian"), value: "gregorian" },
                { label: t("common.arabic"), value: "arabic" },
                { label: t("common.persian"), value: "persian" },
              ]}
              onChange={(e) => setEstablishYearCalendarType(e.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.establishYear")} *
            </label>

            <SmartDatePicker
              widthValue={350}
              key={`establishYear-${establishYearCalendarType}`}
              value={formData.establishYear || undefined}
              calendarType={establishYearCalendarType}
              onChange={(d: any) => handleDateChange("establishYear", d)}
            />
            {errors.establishYear && (
              <p className="mt-1 text-sm text-red-500">
                {errors.establishYear}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.websiteUrl")}
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.websiteUrl")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.address")} *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.address")}
              rows={1}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.ownerNameDr")} *
            </label>
            <input
              type="text"
              name="companyOwnerNameDr"
              value={formData.companyOwnerNameDr}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.companyOwnerNameDr")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.companyOwnerNameDr ? "border-red-500" : "border-gray-300"
              }`}
              dir="rtl"
            />
            {errors.companyOwnerNameDr && (
              <p className="mt-1 text-sm text-red-500">
                {errors.companyOwnerNameDr}
              </p>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.ownerNameEn")} *
            </label>
            <input
              type="text"
              name="companyOwnerNameEn"
              value={formData.companyOwnerNameEn}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.companyOwnerNameEn")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.companyOwnerNameEn ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.companyOwnerNameEn && (
              <p className="mt-1 text-sm text-red-500">
                {errors.companyOwnerNameEn}
              </p>
            )}
          </div>
        </div>
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("company.labels.aboutCompanyEn")} *
          </label>
          <textarea
            name="aboutCompanyEn"
            value={formData.aboutCompanyEn}
            onChange={handleInputChange}
            placeholder={t("company.placeholder.aboutCompanyEn")}
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
              errors.aboutCompanyEn ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.aboutCompanyEn && (
            <p className="mt-1 text-sm text-red-500">{errors.aboutCompanyEn}</p>
          )}
        </div>
        {/* Owner Information */}
        {/* <div className="bg-white rounded-xl shadow-lg p-4 col-span-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {t("company.ownerInformation")}
          </h2>
        </div> */}
      </div>

      {/* Business Details */}

      {/* Jawaz Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {t("company.jawazInformation")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.jawazNumber")} *
            </label>
            <input
              type="text"
              name="jawazNumber"
              value={formData.jawazNumber}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.jawazNumber")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.jawazNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.jawazNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.jawazNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.tinNumber")} *
            </label>
            <input
              type="text"
              name="tinNumber"
              value={formData.tinNumber}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.tinNumber")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.tinNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.tinNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.tinNumber}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("common.selectDateType")} *
            </label>
            <Dropdown
              className="w-full mb-3"
              value={jawazIssueCalendarType}
              options={[
                { label: t("common.gregorian"), value: "gregorian" },
                { label: t("common.arabic"), value: "arabic" },
                { label: t("common.persian"), value: "persian" },
              ]}
              onChange={(e) => setJawazIssueCalendarType(e.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.jawazIssueDate")} *
            </label>
            <SmartDatePicker
              widthValue={250}
              key={`jawazIssueDate-${jawazIssueCalendarType}`}
              value={formData.jawazIssueDate || undefined}
              calendarType={jawazIssueCalendarType}
              onChange={(d: any) => handleDateChange("jawazIssueDate", d)}
            />
            {errors.jawazIssueDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.jawazIssueDate}
              </p>
            )}
          </div>
    

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.jawazExpiryDate")} *
            </label>
            <SmartDatePicker
              widthValue={250}
              key={`jawazExpiryDate-${jawazExpiryCalendarType}`}
              value={formData.jawazExpiryDate || undefined}
              calendarType={jawazIssueCalendarType}
              onChange={(d: any) => handleDateChange("jawazExpiryDate", d)}
            />
            {errors.jawazExpiryDate && (
              <p className="mt-1 text-sm text-red-500">
                {errors.jawazExpiryDate}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* About Company */}
      {/* <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {t("company.labels.aboutCompany")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.aboutCompanyDr")} *
            </label>
            <textarea
              name="aboutCompanyDr"
              value={formData.aboutCompanyDr}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.aboutCompanyDr")}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.aboutCompanyDr ? "border-red-500" : "border-gray-300"
              }`}
              dir="rtl"
            />
            {errors.aboutCompanyDr && (
              <p className="mt-1 text-sm text-red-500">
                {errors.aboutCompanyDr}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.aboutCompanyPs")} *
            </label>
            <textarea
              name="aboutCompanyPs"
              value={formData.aboutCompanyPs}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.aboutCompanyPs")}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.aboutCompanyPs ? "border-red-500" : "border-gray-300"
              }`}
              dir="rtl"
            />
            {errors.aboutCompanyPs && (
              <p className="mt-1 text-sm text-red-500">
                {errors.aboutCompanyPs}
              </p>
            )}
          </div> */}
      {/* </div>
      </div> */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Globe className="h-5 w-5 text-blue-600 mr-2" />
          {t("company.businessDetails")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.mainBranchAddress")} *
            </label>
            <input
              type="text"
              name="mainBranchAddress"
              value={formData.mainBranchAddress}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.mainBranchAddress")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.mainBranchAddress ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.mainBranchAddress && (
              <p className="mt-1 text-sm text-red-500">
                {errors.mainBranchAddress}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.activityPlace")} *
            </label>
            <input
              type="text"
              name="activityPlace"
              value={formData.activityPlace}
              onChange={handleInputChange}
              placeholder={t("company.placeholder.activityPlace")}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow ${
                errors.activityPlace ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.activityPlace && (
              <p className="mt-1 text-sm text-red-500">
                {errors.activityPlace}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.activityType")}
            </label>

            {/* <p className="text-sm text-gray-500 mb-3">
              {t("company.labels.selectCategoriesHint")}
            </p> */}

            <MultiSelect
              value={selectedCategories}
              options={categories}
              optionLabel="name"
              optionValue="id"
              onChange={(e) => setSelectedCategories(e.value)}
              placeholder={t("company.labels.selectCategories")}
              display="chip"
              filter
              className="w-full"
            />
          </div>
        </div>
      </div>
      {/* Categories */}
      {/* <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t("company.labels.categories")}
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          {t("company.labels.selectCategoriesHint")}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div> */}

      {/* Social Links */}
      {/* <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t("company.labels.socialLinks")}
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={newSocialLink.socialLinkName}
            onChange={(e) =>
              setNewSocialLink({
                ...newSocialLink,
                socialLinkName: e.target.value,
              })
            }
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
          >
            <option value="">{t("company.labels.selectPlatform")}</option>
            <option value="Facebook">Facebook</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
            <option value="Website">Website</option>
          </select>
          <input
            type="url"
            value={newSocialLink.address}
            onChange={(e) =>
              setNewSocialLink({ ...newSocialLink, address: e.target.value })
            }
            placeholder="https://..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <button
            type="button"
            onClick={addSocialLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Plus className="h-5 w-5" />
            <span className="ml-1 hidden sm:inline">
              {t("company.labels.addLink")}
            </span>
          </button>
        </div>

        {socialLinks.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            {t("company.labels.noSocialLinksAdded")}
          </p>
        )}

        <div className="space-y-2">
          {socialLinks.map((link, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm text-gray-600 break-all">
                {link.socialLinkName}: {link.address}
              </span>
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div> */}

      {/* Logos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {t("company.labels.companyLogos")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.companyLogo")}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-all hover:shadow-md">
              {logoPreview || existingLogoUrl ? (
                <div className="relative inline-block">
                  <img
                    src={
                      logoPreview ||
                      (existingLogoUrl
                        ? `http://localhost:8080${existingLogoUrl}`
                        : "")
                    }
                    alt={t("company.labels.companyLogo")}
                    className="max-h-32 mx-auto mb-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("logo")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    {t("company.placeholder.logoUrl")}
                  </p>
                </>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, "logo")}
                accept="image/*"
                className="hidden"
                id="company-logo"
              />
              <label
                htmlFor="company-logo"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {logoPreview || existingLogoUrl
                  ? t("company.changeLogo")
                  : t("company.selectLogo")}
              </label>
            </div>
          </div>

          {/* Business Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("company.labels.bussinessLogo")}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-all hover:shadow-md">
              {businessLogoPreview || existingBusinessLogoUrl ? (
                <div className="relative inline-block">
                  <img
                    src={
                      businessLogoPreview ||
                      (existingBusinessLogoUrl
                        ? `http://localhost:8080${existingBusinessLogoUrl}`
                        : "")
                    }
                    alt={t("company.labels.bussinessLogo")}
                    className="max-h-32 mx-auto mb-2 rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile("business")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">
                    {t("company.placeholder.bussinessLogoUrl")}
                  </p>
                </>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, "business")}
                accept="image/*"
                className="hidden"
                id="business-logo"
              />
              <label
                htmlFor="business-logo"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {businessLogoPreview || existingBusinessLogoUrl
                  ? t("company.changeLogo")
                  : t("company.selectLogo")}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4  bottom-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          {t("common.back")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t("common.saving")}...
            </>
          ) : (
            t("common.saveAndContinue")
          )}
        </button>
      </div>
    </form>
    // <form onSubmit={handleSubmit} className="space-y-6">
    //   {/* Basic Information */}
    //   <div className="bg-white rounded-xl shadow-lg p-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
    //       <Building2 className="h-5 w-5 text-blue-600 mr-2" />
    //       {t('company.basicInformation')}
    //     </h2>

    //     <div className="grid md:grid-cols-2 gap-6">
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.companyNameEN')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="companyNameEN"
    //           value={formData.companyNameEN}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.companyNameEN')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.companyNameEN ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.companyNameEN && (
    //           <p className="mt-1 text-sm text-red-500">{errors.companyNameEN}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.companyNameDR')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="companyNameDR"
    //           value={formData.companyNameDR}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.companyNameDR')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.companyNameDR ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //           dir="rtl"
    //         />
    //         {errors.companyNameDR && (
    //           <p className="mt-1 text-sm text-red-500">{errors.companyNameDR}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.companyNamePS')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="companyNamePS"
    //           value={formData.companyNamePS}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.companyNamePS')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.companyNamePS ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //           dir="rtl"
    //         />
    //         {errors.companyNamePS && (
    //           <p className="mt-1 text-sm text-red-500">{errors.companyNamePS}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.companyType')} *
    //         </label>
    //         <select
    //           name="companyType"
    //           value={formData.companyType}
    //           onChange={handleInputChange}
    //           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //         >
    //           {COMPANY_TYPES.map(type => (
    //             <option key={type.value} value={type.value}>{t(type.labelKey)}</option>
    //           ))}
    //         </select>
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.email')} *
    //         </label>
    //         <input
    //           type="email"
    //           name="email"
    //           value={formData.email}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.email')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.email ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.email && (
    //           <p className="mt-1 text-sm text-red-500">{errors.email}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.phoneNumber')} *
    //         </label>
    //         <input
    //           type="tel"
    //           name="phoneNumber"
    //           value={formData.phoneNumber}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.phoneNumber')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.phoneNumber && (
    //           <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
    //         )}
    //       </div>

    //       <div className="md:col-span-2">
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.address')} *
    //         </label>
    //         <textarea
    //           name="address"
    //           value={formData.address}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.address')}
    //           rows={2}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.address ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.address && (
    //           <p className="mt-1 text-sm text-red-500">{errors.address}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.websiteUrl')}
    //         </label>
    //         <input
    //           type="url"
    //           name="websiteUrl"
    //           value={formData.websiteUrl}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.websiteUrl')}
    //           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //         />
    //       </div>
    //     </div>
    //   </div>

    //   {/* Business Details */}
    //   <div className="bg-white rounded-xl shadow-lg p-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
    //       <Globe className="h-5 w-5 text-blue-600 mr-2" />
    //       {t('company.businessDetails')}
    //     </h2>

    //     <div className="grid md:grid-cols-2 gap-6">
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.mainBranchAddress')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="mainBranchAddress"
    //           value={formData.mainBranchAddress}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.mainBranchAddress')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.mainBranchAddress ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.mainBranchAddress && (
    //           <p className="mt-1 text-sm text-red-500">{errors.mainBranchAddress}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.activityPlace')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="activityPlace"
    //           value={formData.activityPlace}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.activityPlace')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.activityPlace ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.activityPlace && (
    //           <p className="mt-1 text-sm text-red-500">{errors.activityPlace}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.activityType')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="activityType"
    //           value={formData.activityType}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.activityType')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.activityType ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.activityType && (
    //           <p className="mt-1 text-sm text-red-500">{errors.activityType}</p>
    //         )}
    //       </div>
    //     </div>
    //   </div>

    //   {/* Jawaz Information */}
    //   <div className="bg-white rounded-xl shadow-lg p-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('company.jawazInformation')}</h2>

    //     <div className="grid md:grid-cols-2 gap-6">
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.jawazNumber')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="jawazNumber"
    //           value={formData.jawazNumber}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.jawazNumber')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.jawazNumber ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.jawazNumber && (
    //           <p className="mt-1 text-sm text-red-500">{errors.jawazNumber}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.tinNumber')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="tinNumber"
    //           value={formData.tinNumber}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.tinNumber')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.tinNumber ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.tinNumber && (
    //           <p className="mt-1 text-sm text-red-500">{errors.tinNumber}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.jawazIssueDate')} *
    //         </label>
    //         <input
    //           type="date"
    //           name="jawazIssueDate"
    //           value={formData.jawazIssueDate}
    //           onChange={handleInputChange}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.jawazIssueDate ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.jawazIssueDate && (
    //           <p className="mt-1 text-sm text-red-500">{errors.jawazIssueDate}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.jawazExpiryDate')} *
    //         </label>
    //         <input
    //           type="date"
    //           name="jawazExpiryDate"
    //           value={formData.jawazExpiryDate}
    //           onChange={handleInputChange}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.jawazExpiryDate ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.jawazExpiryDate && (
    //           <p className="mt-1 text-sm text-red-500">{errors.jawazExpiryDate}</p>
    //         )}
    //       </div>
    //     </div>
    //   </div>

    //   {/* Owner Information */}
    //   <div className="bg-white rounded-xl shadow-lg p-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('company.ownerInformation')}</h2>

    //     <div className="grid md:grid-cols-2 gap-6">
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.ownerNameEn')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="companyOwnerNameEn"
    //           value={formData.companyOwnerNameEn}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.companyOwnerNameEn')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.companyOwnerNameEn ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.companyOwnerNameEn && (
    //           <p className="mt-1 text-sm text-red-500">{errors.companyOwnerNameEn}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.ownerNameDr')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="companyOwnerNameDr"
    //           value={formData.companyOwnerNameDr}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.companyOwnerNameDr')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.companyOwnerNameDr ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //           dir="rtl"
    //         />
    //         {errors.companyOwnerNameDr && (
    //           <p className="mt-1 text-sm text-red-500">{errors.companyOwnerNameDr}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.ownerNamePs')} *
    //         </label>
    //         <input
    //           type="text"
    //           name="companyOwnerNamePs"
    //           value={formData.companyOwnerNamePs}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.companyOwnerNamePs')}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.companyOwnerNamePs ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //           dir="rtl"
    //         />
    //         {errors.companyOwnerNamePs && (
    //           <p className="mt-1 text-sm text-red-500">{errors.companyOwnerNamePs}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.establishYear')} *
    //         </label>
    //         <input
    //           type="date"
    //           name="establishYear"
    //           value={formData.establishYear}
    //           onChange={handleInputChange}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.establishYear ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.establishYear && (
    //           <p className="mt-1 text-sm text-red-500">{errors.establishYear}</p>
    //         )}
    //       </div>
    //     </div>
    //   </div>

    //   {/* About Company */}
    //   <div className="bg-white rounded-xl shadow-lg p-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-6">{t('company.labels.aboutCompany')}</h2>

    //     <div className="space-y-4">
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.aboutCompanyEn')} *
    //         </label>
    //         <textarea
    //           name="aboutCompanyEn"
    //           value={formData.aboutCompanyEn}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.aboutCompanyEn')}
    //           rows={3}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.aboutCompanyEn ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //         />
    //         {errors.aboutCompanyEn && (
    //           <p className="mt-1 text-sm text-red-500">{errors.aboutCompanyEn}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.aboutCompanyDr')} *
    //         </label>
    //         <textarea
    //           name="aboutCompanyDr"
    //           value={formData.aboutCompanyDr}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.aboutCompanyDr')}
    //           rows={3}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.aboutCompanyDr ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //           dir="rtl"
    //         />
    //         {errors.aboutCompanyDr && (
    //           <p className="mt-1 text-sm text-red-500">{errors.aboutCompanyDr}</p>
    //         )}
    //       </div>

    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.aboutCompanyPs')} *
    //         </label>
    //         <textarea
    //           name="aboutCompanyPs"
    //           value={formData.aboutCompanyPs}
    //           onChange={handleInputChange}
    //           placeholder={t('company.placeholder.aboutCompanyPs')}
    //           rows={3}
    //           className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    //             errors.aboutCompanyPs ? 'border-red-500' : 'border-gray-300'
    //           }`}
    //           dir="rtl"
    //         />
    //         {errors.aboutCompanyPs && (
    //           <p className="mt-1 text-sm text-red-500">{errors.aboutCompanyPs}</p>
    //         )}
    //       </div>
    //     </div>
    //   </div>

    //   {/* Categories */}
    //   <div className="bg-white rounded-xl shadow-lg p-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('company.labels.categories')}</h2>
    //     <p className="text-sm text-gray-500 mb-3">{t('company.labels.selectCategoriesHint')}</p>
    //     <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    //       {categories.map((category) => (
    //         <label key={category.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
    //           <input
    //             type="checkbox"
    //             checked={selectedCategories.includes(category.id)}
    //             onChange={() => handleCategoryToggle(category.id)}
    //             className="rounded text-blue-600 focus:ring-blue-500"
    //           />
    //           <span className="text-sm text-gray-700">{category.name}</span>
    //         </label>
    //       ))}
    //     </div>
    //   </div>

    //   {/* Social Links */}
    //   <div className="bg-white rounded-xl shadow-lg p-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('company.labels.socialLinks')}</h2>

    //     <div className="flex gap-4 mb-4">
    //       <select
    //         value={newSocialLink.socialLinkName}
    //         onChange={(e) => setNewSocialLink({...newSocialLink, socialLinkName: e.target.value})}
    //         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //       >
    //         <option value="">{t('company.labels.selectPlatform')}</option>
    //         <option value="Facebook">Facebook</option>
    //         <option value="Twitter">Twitter</option>
    //         <option value="LinkedIn">LinkedIn</option>
    //         <option value="Instagram">Instagram</option>
    //         <option value="Website">Website</option>
    //       </select>
    //       <input
    //         type="url"
    //         value={newSocialLink.address}
    //         onChange={(e) => setNewSocialLink({...newSocialLink, address: e.target.value})}
    //         placeholder="https://..."
    //         className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    //       />
    //       <button
    //         type="button"
    //         onClick={addSocialLink}
    //         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
    //       >
    //         <Plus className="h-5 w-5" />
    //         <span className="ml-1 hidden sm:inline">{t('company.labels.addLink')}</span>
    //       </button>
    //     </div>

    //     {socialLinks.length === 0 && (
    //       <p className="text-sm text-gray-500 text-center py-4">
    //         {t('company.labels.noSocialLinksAdded')}
    //       </p>
    //     )}

    //     <div className="space-y-2">
    //       {socialLinks.map((link, index) => (
    //         <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
    //           <span className="text-sm text-gray-600">{link.socialLinkName}: {link.address}</span>
    //           <button
    //             type="button"
    //             onClick={() => removeSocialLink(index)}
    //             className="text-red-500 hover:text-red-700"
    //           >
    //             <X className="h-5 w-5" />
    //           </button>
    //         </div>
    //       ))}
    //     </div>
    //   </div>

    //   {/* Logos */}
    //   <div className="bg-white rounded-xl shadow-lg p-6">
    //     <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('company.labels.companyLogos')}</h2>

    //     <div className="grid md:grid-cols-2 gap-6">
    //       {/* Company Logo */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.companyLogo')}
    //         </label>
    //         <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
    //           {(logoPreview || existingLogoUrl) ? (
    //             <div className="relative">
    //               <img
    //                 src={logoPreview || (existingLogoUrl ? `http://localhost:8080${existingLogoUrl}` : '')}
    //                 alt={t('company.labels.companyLogo')}
    //                 className="max-h-32 mx-auto mb-2"
    //               />
    //               <button
    //                 type="button"
    //                 onClick={() => removeFile('logo')}
    //                 className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
    //               >
    //                 <X className="h-4 w-4" />
    //               </button>
    //             </div>
    //           ) : (
    //             <>
    //               <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
    //               <p className="text-sm text-gray-500 mb-2">{t('company.placeholder.logoUrl')}</p>
    //             </>
    //           )}
    //           <input
    //             type="file"
    //             onChange={(e) => handleFileChange(e, 'logo')}
    //             accept="image/*"
    //             className="hidden"
    //             id="company-logo"
    //           />
    //           <label
    //             htmlFor="company-logo"
    //             className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
    //           >
    //             {(logoPreview || existingLogoUrl) ? t('company.changeLogo') : t('company.selectLogo')}
    //           </label>
    //         </div>
    //       </div>

    //       {/* Business Logo */}
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700 mb-2">
    //           {t('company.labels.bussinessLogo')}
    //         </label>
    //         <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
    //           {(businessLogoPreview || existingBusinessLogoUrl) ? (
    //             <div className="relative">
    //               <img
    //                 src={businessLogoPreview || (existingBusinessLogoUrl ? `http://localhost:8080${existingBusinessLogoUrl}` : '')}
    //                 alt={t('company.labels.bussinessLogo')}
    //                 className="max-h-32 mx-auto mb-2"
    //               />
    //               <button
    //                 type="button"
    //                 onClick={() => removeFile('business')}
    //                 className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
    //               >
    //                 <X className="h-4 w-4" />
    //               </button>
    //             </div>
    //           ) : (
    //             <>
    //               <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
    //               <p className="text-sm text-gray-500 mb-2">{t('company.placeholder.bussinessLogoUrl')}</p>
    //             </>
    //           )}
    //           <input
    //             type="file"
    //             onChange={(e) => handleFileChange(e, 'business')}
    //             accept="image/*"
    //             className="hidden"
    //             id="business-logo"
    //           />
    //           <label
    //             htmlFor="business-logo"
    //             className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
    //           >
    //             {(businessLogoPreview || existingBusinessLogoUrl) ? t('company.changeLogo') : t('company.selectLogo')}
    //           </label>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Form Actions */}
    //   <div className="flex justify-end space-x-4">
    //     <button
    //       type="button"
    //       onClick={onCancel}
    //       className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
    //       disabled={isSubmitting}
    //     >
    //       {t('common.cancel')}
    //     </button>
    //     <button
    //       type="submit"
    //       disabled={isSubmitting}
    //       className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
    //     >
    //       {isSubmitting ? (
    //         <>
    //           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
    //           {t('common.saving')}...
    //         </>
    //       ) : (
    //         t('common.saveAndContinue')
    //       )}
    //     </button>
    //   </div>
    // </form>
  );
};

export default CompanyForm;
