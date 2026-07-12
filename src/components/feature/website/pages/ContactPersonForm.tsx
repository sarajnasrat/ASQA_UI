// components/feature/registration/ContactPersonForm.tsx
import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Briefcase, MapPin, Building } from "lucide-react";

import DistrictService from "../../../../services/district.service";
import { useAppToast } from "../../../../hooks/useToast";
import CompanyContactPersonService from "../../../../services/company-contact-person.service";
import { AddressType } from "../enum/AddressType";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../../hooks/ToastContext";
import { handleApi } from "../../../../hooks/handleApi";
import type {
  Country,
  Province,
} from "../../../../interface/address.interface";
import CountryService from "../../../../services/country.service";
import ProvinceService from "../../../../services/province.service";

// Define types based on backend entities
interface District {
  id: number;
  districtName?: string;
  nameEn?: string;
  nameDr?: string;
  namePs?: string;
  province?: {
    id?: number;
    provinceName?: string;
    country?: {
      id?: number;
      countryName?: string;
    };
  };
}

interface Address {
  district?: District | null;
  districtId?: number;
  countryId?: number;
  provinceId?: number;
  details: string;
  addressType: AddressType;
}

interface ContactPersonFormProps {
  companyId: number;
  onSuccess: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const ContactPersonForm: React.FC<ContactPersonFormProps> = ({
  companyId,
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting,
}) => {
  const { showToast } = useAppToast();
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    position: "",
  });

  const [addresses, setAddresses] = useState<Address[]>([
    {
      countryId: undefined,
      provinceId: undefined,
      districtId: undefined,
      details: "",
      addressType: AddressType.HEAD_OFFICE,
    },
  ]);

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({});
  const [addressErrors, setAddressErrors] = useState<any[]>([]);

  // Countries loaded on mount
  const [countries, setCountries] = useState<Country[]>([]);

  // Per-address provinces and districts
  const [provincesPerAddress, setProvincesPerAddress] = useState<
    Record<number, Province[]>
  >({});
  const [districtsPerAddress, setDistrictsPerAddress] = useState<
    Record<number, District[]>
  >({});
  const [loadingProvinces, setLoadingProvinces] = useState<
    Record<number, boolean>
  >({});
  const [loadingDistricts, setLoadingDistricts] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    const contactPersonId = Number(localStorage.getItem("contactPersonId"));
    if (contactPersonId) {
      getContactPersonById(contactPersonId);
    }
  }, []);

  const loadCountries = async () => {
    try {
      const response = await CountryService.getAllCountries();
      // Ensure we're setting an array, even if response.data is undefined or null
      setCountries(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading countries:", error);
      showToast("error", t("common.error"), t("common.countryLoadFailed"));
      setCountries([]); // Set empty array on error
    }
  };

  // Load provinces by country ID for a specific address index
  const loadProvincesByCountry = async (
    countryId: number,
    addressIndex: number,
  ) => {
    // Validate countryId
    if (!countryId || isNaN(countryId)) {
      console.warn("Invalid countryId:", countryId);
      return;
    }

    setLoadingProvinces((prev) => ({ ...prev, [addressIndex]: true }));
    try {
      const response = await ProvinceService.getProvincesByCountryId(countryId);

      // Handle different response structures
      let provincesData = [];
      if (response.data?.data) {
        // If response has nested data property
        provincesData = Array.isArray(response.data.data)
          ? response.data.data
          : [];
      } else if (response.data) {
        // If response.data is directly the array
        provincesData = Array.isArray(response.data) ? response.data : [];
      } else {
        provincesData = [];
      }


      setProvincesPerAddress((prev) => ({
        ...prev,
        [addressIndex]: provincesData,
      }));
    } catch (error) {
      showToast("error", t("common.error"), t("common.provinceLoadFailed"));
      setProvincesPerAddress((prev) => ({ ...prev, [addressIndex]: [] }));
    } finally {
      setLoadingProvinces((prev) => ({ ...prev, [addressIndex]: false }));
    }
  };


  // Load districts by province ID for a specific address index
const loadDistrictsByProvince = async (
  provinceId: number,
  addressIndex: number,
) => {
  // Validate provinceId
  if (!provinceId || isNaN(provinceId)) {
    console.warn("Invalid provinceId:", provinceId);
    return;
  }

  setLoadingDistricts((prev) => ({ ...prev, [addressIndex]: true }));
  try {
    const response = await DistrictService.getDistrictByProvinceId(provinceId);
    
    // Handle nested response structure { data: [...] }
    // The structure might be similar to provinces response
    let districtsData = [];
    if (response.data?.data) {
      districtsData = Array.isArray(response.data.data) ? response.data.data : [];
    } else if (Array.isArray(response.data)) {
      districtsData = response.data;
    } else {
      districtsData = [];
    }
    
    
    setDistrictsPerAddress((prev) => ({
      ...prev,
      [addressIndex]: districtsData,
    }));
  } catch (error) {
    showToast("error", t("common.error"), t("common.districtLoadFailed"));
    setDistrictsPerAddress((prev) => ({ ...prev, [addressIndex]: [] }));
  } finally {
    setLoadingDistricts((prev) => ({ ...prev, [addressIndex]: false }));
  }
};

  const getContactPersonById = async (id: number) => {
    try {
      const response = await CompanyContactPersonService.getById(id);
      const data = response.data.data;

      setFormData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        phoneNumber: data.phoneNumber || "",
        position: data.position || "",
      });

      // Contact person getById returns only district basics, so resolve each district
      // to its province/country before initializing dependent selects.
      const mappedAddresses = await Promise.all(
        (data.addresses || []).map(async (address: any) => {
          const districtId = address.district?.id;
          let provinceId: number | undefined;
          let countryId: number | undefined;

          if (districtId) {
            try {
              const districtResponse = await DistrictService.getDistrict(
                districtId,
              );
              const districtData =
                districtResponse.data?.data || districtResponse.data;
              provinceId = districtData?.province?.id;
              countryId = districtData?.province?.country?.id;
            } catch (error) {
              console.error("Error loading district details:", error);
            }
          }

          return {
            countryId,
            provinceId,
            districtId,
            details: address.details || "",
            addressType: address.addressType || AddressType.HEAD_OFFICE,
          };
        }),
      );

      const initialAddresses = mappedAddresses.length
        ? mappedAddresses
        : [
            {
              countryId: undefined,
              provinceId: undefined,
              districtId: undefined,
              details: "",
              addressType: AddressType.HEAD_OFFICE,
            },
          ];

      setAddresses(initialAddresses);

      initialAddresses.forEach((address, index) => {
        if (address.countryId) {
          loadProvincesByCountry(address.countryId, index);
        }
        if (address.provinceId) {
          loadDistrictsByProvince(address.provinceId, index);
        }
      });
    } catch (error) {
      showToast(
        "error",
        t("common.error"),
        t("common.contactPersonLoadFailed"),
      );
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.firstName?.trim())
      newErrors.firstName = t("contactPerson.errors.firstNameRequired");
    if (!formData.lastName?.trim())
      newErrors.lastName = t("contactPerson.errors.lastNameRequired");
    if (!formData.position?.trim())
      newErrors.position = t("contactPerson.errors.positionRequired");
    if (!formData.email?.trim())
      newErrors.email = t("contactPerson.errors.emailRequired");
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = t("contactPerson.errors.emailInvalid");
    if (!formData.phoneNumber?.trim())
      newErrors.phoneNumber = t("contactPerson.errors.phoneRequired");

    setErrors(newErrors);

    // Validate addresses
    const newAddressErrors: any[] = [];
    let hasAddressError = false;

    addresses.forEach((address, index) => {
      const addressError: any = {};
      if (!address.districtId) {
        addressError.districtId = t("contactPerson.addresses.districtRequired");
        hasAddressError = true;
      }
      newAddressErrors[index] = addressError;
    });

    setAddressErrors(newAddressErrors);

    return Object.keys(newErrors).length === 0 && !hasAddressError;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddressChange = (
    index: number,
    field: keyof Address,
    value: any,
  ) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };

    // Handle cascading resets
    if (field === "countryId") {
      // Reset province and district when country changes
      updatedAddresses[index].provinceId = undefined;
      updatedAddresses[index].districtId = undefined;
      setProvincesPerAddress((prev) => ({ ...prev, [index]: [] }));
      setDistrictsPerAddress((prev) => ({ ...prev, [index]: [] }));
      if (value && !isNaN(Number(value))) {
        loadProvincesByCountry(Number(value), index);
      }
    } else if (field === "provinceId") {
      // Reset district when province changes
      updatedAddresses[index].districtId = undefined;
      setDistrictsPerAddress((prev) => ({ ...prev, [index]: [] }));
      if (value && !isNaN(Number(value))) {
        loadDistrictsByProvince(Number(value), index);
      }
    }

    setAddresses(updatedAddresses);

    // Clear error for this field
    if (addressErrors[index]?.[field]) {
      const updatedErrors = [...addressErrors];
      updatedErrors[index] = { ...updatedErrors[index], [field]: "" };
      setAddressErrors(updatedErrors);
    }
  };

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        countryId: undefined,
        provinceId: undefined,
        districtId: undefined,
        details: "",
        addressType: AddressType.BRANCH_OFFICE,
      },
    ]);
    setAddressErrors([...addressErrors, {}]);
  };

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index));
      setAddressErrors(addressErrors.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("error", t("common.error"), t("common.fillRequiredFields"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Keep backend-required address fields populated even though they are hidden in the UI.
      const addressesToSend = addresses.map((addr) => ({
        district: addr.districtId ? { id: addr.districtId } : null,
        details: addr.details?.trim() || "N/A",
        addressType: addr.addressType || AddressType.HEAD_OFFICE,
      }));

      // Prepare payload
      const contactPersonData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        position: formData.position,
        company: { id: companyId },
        addresses: addressesToSend,
      };


      const contactPersonFromStorage = localStorage.getItem("contactPersonId");

      let response;

      // UPDATE if exists
      if (contactPersonFromStorage) {
        response = await handleApi(
          () =>
            CompanyContactPersonService.update(
              Number(contactPersonFromStorage),
              contactPersonData,
            ),
          showSuccess,
          showError,
          t,
        );
      }
      // OTHERWISE CREATE
      else {
        response = await handleApi(
          () => CompanyContactPersonService.create(contactPersonData),
          showSuccess,
          showError,
          t,
        );
      }

      // Save contactPersonId after success
      if (response) {
        const contactPersonId =
          response.data?.id ||
          response.data?.data?.id ||
          response.data?.companyId;

        if (contactPersonId) {
          localStorage.setItem("contactPersonId", String(contactPersonId));
        }
      }


      showToast(
        "success",
        t("common.success"),
        t("contactPerson.successMessage"),
      );

      onSuccess();
    } catch (error: any) {
      console.error("Error creating contact person:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0] ||
        t("contactPerson.errorMessage");

      showToast("error", t("common.error"), errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <User className="h-6 w-6 text-blue-600 mr-2" />
        {t("contactPerson.info")}
      </h2>

      <div className="space-y-6">
        {/* Contact Person Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              {t("contactPerson.firstName")} *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("contactPerson.placeholders.firstName")}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              {t("contactPerson.lastName")} *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("contactPerson.placeholders.lastName")}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
              {t("contactPerson.position")} *
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.position ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("contactPerson.placeholders.position")}
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-500">{errors.position}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              {t("contactPerson.email")} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("contactPerson.placeholders.email")}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              {t("contactPerson.phoneNumber")} *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              dir="ltr"
              inputMode="tel"
              style={{ direction: "ltr", unicodeBidi: "plaintext", textAlign: "left" }}
              className={`phone-number-input w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={t("contactPerson.placeholders.phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Addresses Section */}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              {t("contactPerson.addresses.title")}
            </h3>
            <button
              type="button"
              onClick={addAddress}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center"
            >
              <Building className="h-4 w-4 mr-2" />
              {t("contactPerson.addresses.addAddress")}
            </button>
          </div>

          {addresses.map((address, index) => (
            <div
              key={index}
              className="mb-6 p-4 bg-gray-50 rounded-lg relative"
            >
              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAddress(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl font-bold"
                  aria-label={t("contactPerson.addresses.removeAddress")}
                >
                  ×
                </button>
              )}

              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {t("contactPerson.addresses.addressLabel")} {index + 1}
              </h4>

              {/* Row 1: Country, Province, District */}
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                {/* Country Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contactPerson.addresses.country")}
                  </label>
                  <select
                    value={address.countryId || ""}
                    onChange={(e) =>
                      handleAddressChange(
                        index,
                        "countryId",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      addressErrors[index]?.countryId
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">
                      {t("contactPerson.addresses.selectCountry")}
                    </option>
                    {countries && countries.length > 0 ? (
                      countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.countryName ||
                            `${t("contactPerson.addresses.country")} ${country.id}`}
                        </option>
                      ))
                    ) : (
                      <option disabled>
                        {t("contactPerson.addresses.noCountriesAvailable")}
                      </option>
                    )}
                  </select>
                  {addressErrors[index]?.countryId && (
                    <p className="mt-1 text-xs text-red-500">
                      {addressErrors[index].countryId}
                    </p>
                  )}
                </div>

                {/* Province Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contactPerson.addresses.province")}
                  </label>
                  <select
                    value={address.provinceId || ""}
                    onChange={(e) =>
                      handleAddressChange(
                        index,
                        "provinceId",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      addressErrors[index]?.provinceId
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={!address.countryId || loadingProvinces[index]}
                  >
                    <option value="">
                      {loadingProvinces[index]
                        ? t("common.loading")
                        : !address.countryId
                          ? t("contactPerson.addresses.selectCountryFirst")
                          : t("contactPerson.addresses.selectProvince")}
                    </option>
                    {provincesPerAddress[index] &&
                    provincesPerAddress[index].length > 0
                      ? provincesPerAddress[index].map((prov) => (
                          <option key={prov.id} value={prov.id}>
                            {prov.provinceName ||
                              `${t("contactPerson.addresses.province")} ${prov.id}`}
                          </option>
                        ))
                      : null}
                  </select>
                  {addressErrors[index]?.provinceId && (
                    <p className="mt-1 text-xs text-red-500">
                      {addressErrors[index].provinceId}
                    </p>
                  )}
                </div>

                {/* District Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contactPerson.addresses.district")} *
                  </label>
                  <select
                    value={address.districtId || ""}
                    onChange={(e) =>
                      handleAddressChange(
                        index,
                        "districtId",
                        e.target.value ? Number(e.target.value) : undefined,
                      )
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      addressErrors[index]?.districtId
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    disabled={!address.provinceId || loadingDistricts[index]}
                  >
                    <option value="">
                      {loadingDistricts[index]
                        ? t("common.loading")
                        : !address.provinceId
                          ? t("contactPerson.addresses.selectProvinceFirst")
                          : t("contactPerson.addresses.selectDistrict")}
                    </option>
                    {districtsPerAddress[index] &&
                    districtsPerAddress[index].length > 0
                      ? districtsPerAddress[index].map((district) => (
                          <option key={district.id} value={district.id}>
                            {district.districtName ||
                              district.nameEn ||
                              district.nameDr ||
                              district.namePs ||
                              `${t("contactPerson.addresses.district")} ${district.id}`}
                          </option>
                        ))
                      : null}
                  </select>
                  {addressErrors[index]?.districtId && (
                    <p className="mt-1 text-xs text-red-500">
                      {addressErrors[index].districtId}
                    </p>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            {t("common.back")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t("common.saving")}
              </>
            ) : (
              t("common.saveAndContinue")
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ContactPersonForm;
