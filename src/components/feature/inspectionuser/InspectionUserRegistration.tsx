import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
// @ts-ignore
import UserService from "../../../services/user.service.ts";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppToast } from "../../../hooks/useToast.js";
import { Toast } from "primereact/toast";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb.js";
import ZoneService from "../../../services/zone.service.ts";
import { useTranslation } from "react-i18next";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: string;
  zoneId: number;
  active: boolean;
};

type UserRegistrationLocationState = {
  from?: string;
  returnTo?: string;
  committeeId?: number | null;
  commiteeType?: string | null;
};

type InspectionUserRegistrationProps = {
  onClose?: () => void;
  onSaved?: () => void;
};

export const InspectionUserRegistration = ({
  onClose,
  onSaved,
}: InspectionUserRegistrationProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { toast, showToast } = useAppToast();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(
    null,
  );
  const [zones, setZones] = useState<{ label: string; value: any }[]>([]);
  const roles = [
    {
      label: t("user.roles.INSPECTION_USERS", "Inspection User"),
      value: "INSPECTION_USERS",
    },
  ];
  const navigationState =
    (location.state as UserRegistrationLocationState) || {};
  const isFromCommitteeMemberCreate =
    navigationState.from === "committee-member-create";
  const redirectPath = isFromCommitteeMemberCreate
    ? navigationState.returnTo || "/commitee-list"
    : "/inspection-users";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  const passwordValue = watch("password");

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await ZoneService.getAllZones();
        const zoneOptions = response.data.map((zone: any) => ({
          label: zone.name,
          value: zone.id,
        }));
        setZones(zoneOptions);
      } catch (error) {
        showToast(
          "error",
          t("common.error"),
          t("user.messages.zoneLoadFailed"),
        );
      }
    };

    fetchZones();
  }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      const formData = new FormData();

      formData.append(
        "user",
        new Blob(
          [
            JSON.stringify({
              firstName: data.firstName,
              lastName: data.lastName,
              email: data.email,
              password: data.password,
              active: data.active ?? true,
              phoneNumber: data.phoneNumber,
              roles: ["INSPECTION_USERS"],
              zone: { id: data.zoneId },
            }),
          ],
          { type: "application/json" },
        ),
      );

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await UserService.registerUser(formData);

      reset();
      setProfileImage(null);

      showToast(
        "success",
        t("common.success"),
        t("user.messages.createSuccess"),
      );
      setTimeout(() => {
        onSaved?.();
        if (onClose) onClose();
        else
          navigate(redirectPath, {
            state: isFromCommitteeMemberCreate
              ? {
                  fromUserRegistration: true,
                  committeeId: navigationState.committeeId ?? null,
                  commiteeType: navigationState.commiteeType ?? null,
                }
              : undefined,
          });
      }, 1500);
    } catch (error) {
      showToast("error", t("common.error"), t("user.messages.createFailed"));
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password)
      return {
        score: 0,
        label: "",
        color: "bg-gray-200",
        textColor: "text-gray-500",
      };

    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
      return {
        score,
        label: t("user.passwordStrength.weak"),
        color: "bg-red-500",
        textColor: "text-red-500",
      };
    if (score === 3)
      return {
        score,
        label: t("user.passwordStrength.fair"),
        color: "bg-orange-500",
        textColor: "text-orange-500",
      };
    if (score === 4)
      return {
        score,
        label: t("user.passwordStrength.good"),
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
      };
    return {
      score,
      label: t("user.passwordStrength.strong"),
      color: "bg-green-500",
      textColor: "text-green-500",
    };
  };

  const strength = getPasswordStrength(passwordValue);

  return (
    <>
      <div className="">
        <Toast ref={toast} />

        <Dialog
          visible
          modal
          dismissableMask
          onHide={() => (onClose ? onClose() : navigate("/inspection-users"))}
          header={t("user.inspection.createTitle")}
          className="w-[min(96vw,1000px)]"
          contentClassName="max-h-[78vh] overflow-y-auto"
        >
          <div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {/* First Name */}
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: t("user.validation.firstNameRequired") }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("user.fields.firstName")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        {...field}
                        placeholder={t("user.placeholders.firstName")}
                        className={`w-full ${errors.firstName ? "p-invalid" : ""}`}
                      />
                      {errors.firstName && (
                        <small className="text-red-500 block mt-1">
                          {errors.firstName.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {/* Last Name */}
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: t("user.validation.lastNameRequired") }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("user.fields.lastName")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        {...field}
                        placeholder={t("user.placeholders.lastName")}
                        className={`w-full ${errors.lastName ? "p-invalid" : ""}`}
                      />
                      {errors.lastName && (
                        <small className="text-red-500 block mt-1">
                          {errors.lastName.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {/* Phone Number */}
                <Controller
                  name="phoneNumber"
                  control={control}
                  rules={{
                    required: t("user.validation.phoneRequired"),
                    pattern: {
                      value: /^07\d{8}$/,
                      message: t("user.validation.phoneInvalid"),
                    },
                  }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("user.fields.phoneNumber")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        {...field}
                        placeholder={t("user.placeholders.phoneNumber")}
                        maxLength={10}
                        className={`w-full ${errors.phoneNumber ? "p-invalid" : ""}`}
                      />
                      {errors.phoneNumber && (
                        <small className="text-red-500 block mt-1">
                          {errors.phoneNumber.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {/* Email */}
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: t("user.validation.emailRequired"),
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: t("user.validation.emailInvalid"),
                    },
                  }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("user.fields.email")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        {...field}
                        type="email"
                        placeholder={t("user.placeholders.email")}
                        className={`w-full ${errors.email ? "p-invalid" : ""}`}
                      />
                      {errors.email && (
                        <small className="text-red-500 block mt-1">
                          {errors.email.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {/* Password */}
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: t("user.validation.passwordRequired"),
                    minLength: {
                      value: 6,
                      message: t("user.validation.passwordMinLength"),
                    },
                  }}
                  render={({ field }) => (
                    <div style={{ width: "100%" }}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("user.fields.password")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Password
                        {...field}
                        toggleMask
                        feedback={false}
                        placeholder={t("user.placeholders.password")}
                        className={`w-full ${errors.password ? "p-invalid" : ""}`}
                        inputClassName="w-full"
                      />
                      {passwordValue && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-1 bg-gray-200 rounded-full">
                              <div
                                className={`h-1 rounded-full ${strength.color}`}
                                style={{
                                  width: `${(strength.score / 5) * 100}%`,
                                }}
                              />
                            </div>
                            <small className={strength.textColor}>
                              {strength.label}
                            </small>
                          </div>
                        </div>
                      )}
                      {errors.password && (
                        <small className="text-red-500 block mt-1">
                          {errors.password.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {/* Confirm Password */}
                <Controller
                  name="confirmPassword"
                  control={control}
                  rules={{
                    required: t("user.validation.confirmPasswordRequired"),
                    validate: (value) =>
                      value === passwordValue ||
                      t("user.validation.passwordsNotMatch"),
                  }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("user.fields.confirmPassword")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Password
                        {...field}
                        toggleMask
                        feedback={false}
                        placeholder={t("user.placeholders.confirmPassword")}
                        className={`w-full ${errors.confirmPassword ? "p-invalid" : ""}`}
                        inputClassName="w-full"
                      />
                      {field.value &&
                        passwordValue &&
                        field.value !== passwordValue && (
                          <small className="text-orange-500 block mt-1">
                            {t("user.validation.passwordsDoNotMatch")}
                          </small>
                        )}
                      {field.value &&
                        passwordValue &&
                        field.value === passwordValue && (
                          <small className="text-green-500 block mt-1">
                            ✓ {t("user.validation.passwordsMatch")}
                          </small>
                        )}
                      {errors.confirmPassword && (
                        <small className="text-red-500 block mt-1">
                          {errors.confirmPassword.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {false && (
                  <>
                    {/* Inspection role is assigned automatically and is not editable. */}
                    <Controller
                      name="role"
                      control={control}
                      rules={{ required: t("user.validation.roleRequired") }}
                      render={({ field }) => (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {t("user.fields.role")}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <Dropdown
                            {...field}
                            options={roles}
                            style={{ display: "none" }}
                            placeholder={t("user.placeholders.selectRole")}
                            className={`w-full ${errors.role ? "p-invalid" : ""}`}
                          />
                          {errors.role && (
                            <small className="text-red-500 block mt-1">
                              {errors.role.message}
                            </small>
                          )}
                        </div>
                      )}
                    />
                  </>
                )}

                {/* Zone */}

                <Controller
                  name="zoneId"
                  control={control}
                  rules={{ required: t("user.validation.zoneRequired") }}
                  render={({ field }) => (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("user.fields.zone")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        {...field}
                        options={zones}
                        placeholder={t("user.placeholders.selectZone")}
                        className={`w-full ${errors.zoneId ? "p-invalid" : ""}`}
                      />
                      {errors.zoneId && (
                        <small className="text-red-500 block mt-1">
                          {errors.zoneId.message}
                        </small>
                      )}
                    </div>
                  )}
                />
                <Controller
                  name="active"
                  control={control}
                  defaultValue={true}
                  render={({ field }) => (
                    <div className="flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
                      <Checkbox
                        inputId="inspection-active"
                        checked={field.value ?? true}
                        onChange={(e) => field.onChange(e.checked)}
                      />
                      <label
                        htmlFor="inspection-active"
                        className="text-sm font-medium text-gray-700"
                      >
                        {t("user.status.active")}
                      </label>
                    </div>
                  )}
                />
                {/* Profile Image */}
                <div className="order-first flex justify-center min-w-0 lg:col-span-3 lg:row-span-1">
                  <div className="group relative h-40 w-40 shrink-0 overflow-visible rounded-full border-4 border-white bg-blue-100 shadow-lg ring-4 ring-blue-50">
                    {profilePreviewUrl ? (
                      <img
                        src={profilePreviewUrl}
                        alt={t("user.labels.profileImage")}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-blue-500">
                        <i className="pi pi-user" />
                      </div>
                    )}
                    <label
                      htmlFor="inspection-profile-image"
                      className="absolute bottom-0 right-0 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700"
                      aria-label={t("common.choosefile")}
                    >
                        <i className="pi pi-camera text-base" />
                    </label>
                  </div>
                  <div>
                    <input
                      id="inspection-profile-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        setProfileImage(file);
                        setProfilePreviewUrl(
                          file ? URL.createObjectURL(file) : null,
                        );
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <Button
                  label={t("user.buttons.cancel")}
                  type="button"
                  severity="secondary"
                  raised
                  text
                  icon="pi pi-times"
                  onClick={() => onClose ? onClose() : navigate(redirectPath, {
                      state: isFromCommitteeMemberCreate
                        ? {
                            fromUserRegistration: true,
                            committeeId: navigationState.committeeId ?? null,
                            commiteeType: navigationState.commiteeType ?? null,
                          }
                        : undefined,
                    })}
                  className="p-button-outlined"
                  style={{ minWidth: "100px" }}
                />
                <Button
                  label={t("user.buttons.save")}
                  type="submit"
                  severity="info"
                  raised
                  text
                  icon="pi pi-save"
                  loading={isSubmitting}
                  style={{ minWidth: "100px" }}
                />
              </div>
            </form>
          </div>
        </Dialog>
      </div>
    </>
  );
};

export default InspectionUserRegistration;
