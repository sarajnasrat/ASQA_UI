import { useForm, Controller } from "react-hook-form";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import UserService from "../../../services/user.service";
import ZoneService from "../../../services/zone.service";
import RoleService from "../../../services/role.service";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppToast } from "../../../hooks/useToast";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import SkeletonForm from "../../common/SkeletonForm";
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
  active: boolean;
};

type ZoneOption = {
  label: string;
  value: number;
};

export type EditUserProps = { userId?: number; onClose?: () => void; onSaved?: () => void };

export const EditUser = ({ userId, onClose, onSaved }: EditUserProps = {}) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = userId?.toString() || routeId;
  const { toast, showToast } = useAppToast();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [existingImageName, setExistingImageName] = useState("");
  const [zones, setZones] = useState<ZoneOption[]>([]);
  const [roles, setRoles] = useState<{ label: string; value: string }[]>([]);
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
      active: true,
    },
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await RoleService.getAllRoles();
        const roleOptions = response.data.map((role: any) => ({
          label: t(`user.roles.${role.name?.replace(/^ROLE_/, "")}`) || role.name,
          value: role.name,
        }));
        setRoles(roleOptions);
      } catch {
        showToast(
          "error",
          t("common.error"),
          t("user.messages.roleLoadFailed"),
        );
      }
    };

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

    fetchRoles();
    fetchZones();
  }, [t, i18n.language]);

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
          active: user.active ?? true,
        });

        setExistingImageUrl(user?.profileImage ? `${import.meta.env.REACT_APP_API_BASE_URL || "http://localhost:8080"}${user.profileImage}` : null);
        setExistingImageName(user?.profileImage?.split("/").pop() || "");

      } catch {
        showToast("error", t("common.error"), t("user.messages.loadFailed"));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, reset]);

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
              active: data.active,
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
        onSaved?.();
        if (onClose) onClose();
        else {
        setTimeout(() => {
          navigate("/users");
        }, 1000);
        }
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

    

      {loading ? (
        <SkeletonForm skeletonType="row" fields={fields} />
      ) : (
        <div className="flex justify-center">
          <Dialog
            visible
            modal
            dismissableMask
            onHide={() => (onClose ? onClose() : navigate("/users"))}
            header={t("user.breadcrumb.editUser")}
            className="w-[min(96vw,1100px)]"
            contentClassName="max-h-[78vh] overflow-y-auto"
          >
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="order-first flex justify-center min-w-0 lg:col-span-3">
                  <div className="relative h-40 w-40 overflow-visible rounded-full border-4 border-white bg-blue-100 shadow-lg ring-4 ring-blue-50">
                    {profilePreviewUrl || existingImageUrl ? <img src={profilePreviewUrl || existingImageUrl || ""} alt={t("user.labels.profileImage")} className="h-full w-full rounded-full object-cover" /> : <div className="flex h-full w-full items-center justify-center rounded-full text-2xl font-semibold text-blue-500"><i className="pi pi-user" /></div>}
                    <label htmlFor="user-edit-profile-image" className="absolute bottom-0 right-0 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg transition hover:scale-105 hover:bg-blue-700"><i className="pi pi-camera text-base" /></label>
                    <input id="user-edit-profile-image" type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0] || null; setProfileImage(file); setProfilePreviewUrl(file ? URL.createObjectURL(file) : null); }} />
                  </div>
                </div>
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
                        options={roles}
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
                  name="active"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <Checkbox inputId="user-edit-active" checked={field.value ?? true} onChange={(e) => field.onChange(e.checked)} />
                      <label htmlFor="user-edit-active" className="text-sm font-medium text-gray-700">{t("user.status.active")}</label>
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
                  onClick={() => (onClose ? onClose() : navigate("/users"))}
                />
              </div>
            </form>
          </div>
          </Dialog>
        </div>
      )}
    </>
  );
};
