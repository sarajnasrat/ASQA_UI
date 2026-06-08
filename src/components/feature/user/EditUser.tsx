import { useForm, Controller } from "react-hook-form";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import UserService from "../../../services/user.service";
import ZoneService from "../../../services/zone.service";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppToast } from "../../../hooks/useToast";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import SkeletonForm from "../../common/SkeletonForm";
import FileUploadField from "../../common/FileUploadField";
import { useTranslation } from "react-i18next";
import { useToast } from "../../../hooks/ToastContext";
import { handleApi } from "../../../hooks/handleApi";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  zoneId: number | null;
};

type ZoneOption = {
  label: string;
  value: number;
};

export const EditUser = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast, showToast } = useAppToast();
  const baseUrl =
    import.meta.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const { showError, showSuccess } = useToast();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      role: "ROLE_USER",
      zoneId: null,
    },
  });

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await ZoneService.getAllZones();

        const zoneOptions: ZoneOption[] = response.data.map((zone: any) => ({
          label: zone.name,
          value: zone.id,
        }));

        setZones(zoneOptions);
      } catch {
        showToast(
          "error",
          t("common.error"),
          t("user.messages.zoneLoadFailed"),
        );
      }
    };

    fetchZones();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const res = await UserService.getUser(Number(id));
        const user = res.data.data;

        reset({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          role: user.roles?.[0]?.name || "ROLE_USER",
          zoneId: user.zone?.id || null,
        });

        setExistingImageUrl(
          user?.profileImage ? `${baseUrl}${user.profileImage}` : null,
        );
      } catch {
        showToast("error", t("common.error"), t("user.messages.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, reset]);

  const roleOptions = [
    { label: t("user.roles.ADMIN"), value: "ROLE_ADMIN" },
    { label: t("user.roles.USER"), value: "ROLE_USER" },
    { label: t("user.roles.COMPANY_ADMIN"), value: "ROLE_COMPANY_ADMIN" },
    { label: t("user.roles.MONITORING"), value: "ROLE_MONITORING" },
    { label: t("user.roles.SUPER_ADMIN"), value: "ROLE_SUPER_ADMIN" },
    { label: t("user.roles.COMMITTEE_MEMBER"), value: "ROLE_COMMITTEE_MEMBER" },
    { label: t("user.roles.INSPECTOR"), value: "ROLE_INSPECTOR" },
  ];

  const onSubmit = async (data: FormValues) => {
    if (!id) return;

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
              active: true,
              phoneNumber: data.phoneNumber,
              roles: [data.role],
              zone: { id: data.zoneId },
            }),
          ],
          { type: "application/json" },
        ),
      );

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }
      // ✅ UPDATE MODE
      const response = await handleApi(
        () => UserService.updateUser(Number(id), formData),
        showSuccess,
        showError,
        t,
      );
      if (response?.status === 200) {
        setTimeout(() => {
          navigate("/users");
        }, 1000);
      }
    } catch {
      showToast("error", t("common.error"), t("user.messages.updateFailed"));
    }
  };

  const fields = [
    { name: "firstName", label: t("user.fields.firstName") },
    { name: "lastName", label: t("user.fields.lastName") },
    { name: "email", label: t("user.fields.email") },
    { name: "phoneNumber", label: t("user.fields.phoneNumber") },
    { name: "role", label: t("user.fields.role") },
    { name: "zoneId", label: t("user.fields.zone") },
  ];

  return (
    <>
      <Toast ref={toast} />

      <DynamicBreadcrumb
        items={[
          { label: t("user.title"), url: "/users" },
          { label: t("user.breadcrumb.editUser"), url: `/users/edit/${id}` },
        ]}
        size="w-full max-w-7xl mx-auto px-0 pt-4"
      />

      {loading ? (
        <SkeletonForm skeletonType="row" fields={fields} />
      ) : (
        <div className="flex justify-center">
          <Card className="w-full max-w-7xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: t("user.validation.firstNameRequired") }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">
                        {t("user.fields.firstName")}
                      </label>
                      <InputText {...field} className="w-full" />
                      {errors.firstName && (
                        <small className="text-red-500">
                          {errors.firstName.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: t("user.validation.lastNameRequired") }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">
                        {t("user.fields.lastName")}
                      </label>
                      <InputText {...field} className="w-full" />
                      {errors.lastName && (
                        <small className="text-red-500">
                          {errors.lastName.message}
                        </small>
                      )}
                    </div>
                  )}
                />

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
                      <label className="font-medium">
                        {t("user.fields.phoneNumber")}
                      </label>
                      <InputText
                        {...field}
                        placeholder={t("user.placeholders.phoneNumber")}
                        maxLength={10}
                        className="w-full"
                      />
                      {errors.phoneNumber && (
                        <small className="text-red-500">
                          {errors.phoneNumber.message}
                        </small>
                      )}
                    </div>
                  )}
                />

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
                      <label className="font-medium">
                        {t("user.fields.email")}
                      </label>
                      <InputText {...field} type="email" className="w-full" />
                      {errors.email && (
                        <small className="text-red-500">
                          {errors.email.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="role"
                  control={control}
                  rules={{ required: t("user.validation.roleRequired") }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">
                        {t("user.fields.role")}
                      </label>
                      <Dropdown
                        {...field}
                        options={roleOptions}
                        placeholder={t("user.placeholders.selectRole")}
                        className="w-full"
                      />
                      {errors.role && (
                        <small className="text-red-500">
                          {errors.role.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="zoneId"
                  control={control}
                  rules={{ required: t("user.validation.zoneRequired") }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">
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
                        <small className="text-red-500">
                          {errors.zoneId.message}
                        </small>
                      )}
                    </div>
                  )}
                />
              </div>

              {existingImageUrl && (
                <div>
                  <label className="font-medium block mb-2">
                    {t("user.fields.currentProfileImage")}
                  </label>
                  <img
                    src={existingImageUrl}
                    alt={t("user.labels.profileImage")}
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}

              <FileUploadField
                label={t("user.fields.updateProfileImage")}
                name="profileImage"
                accept="image/*"
                maxFileSize={1048576}
                onFileSelect={(file) => setProfileImage(file)}
              />

              <div className="flex justify-start gap-2 pt-4">
                <Button
                  label={t("user.buttons.update")}
                  icon="pi pi-save"
                  text
                  raised
                  severity="info"
                  type="submit"
                  loading={isSubmitting}
                />

                <Button
                  label={t("user.buttons.cancel")}
                  type="button"
                  severity="secondary"
                  text
                  raised
                  icon="pi pi-times"
                  onClick={() => navigate("/users")}
                />
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
};
