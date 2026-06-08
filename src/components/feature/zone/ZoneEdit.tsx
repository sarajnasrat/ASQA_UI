import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAppToast } from "../../../hooks/useToast";
import ZoneService from "../../../services/zone.service";


interface Props {
  zoneId: number;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ZoneEdit: React.FC<Props> = ({
  zoneId,
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useAppToast();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      location: "",
    },
  });

  /* =============================
     Load Zone
  ============================= */
  const loadZone = async () => {
    try {
      setLoading(true);

      const response = await ZoneService.getZone(zoneId);
      const zone = response.data.data;

      reset({
        name: zone.name,
        location: zone.location,
      });
    } catch {
      showToast("error", t("common.error"), t("zone.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && zoneId) {
      loadZone();
    }
  }, [zoneId, visible]);

  /* =============================
     Update Zone
  ============================= */
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      await ZoneService.updateZone(zoneId, data);

      showToast("success", t("common.success"), t("zone.updated"));

      onSuccess();
      onClose();
    } catch {
      showToast("error", t("common.error"), t("zone.updateFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={t("zone.edit")}
      visible={visible}
      modal
      style={{ width: "450px" }}
      onHide={onClose}
      className="rounded-xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-3">
        
        {/* Zone Name */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">
            {t("zone.name.label")}
          </label>

          <Controller
            name="name"
            control={control}
            rules={{ required: t("zone.name.required") }}
            render={({ field }) => (
              <InputText
                {...field}
                className="w-full"
                placeholder={t("zone.name.placeholder")}
              />
            )}
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">
            {t("zone.location")}
          </label>

          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <InputText
                {...field}
                className="w-full"
                placeholder={t("zone.locationPlaceholder")}
              />
            )}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            label={t("common.cancel")}
            severity="secondary"
            outlined
            onClick={onClose}
          />

          <Button
            type="submit"
            label={t("common.update")}
            loading={loading}
          />
        </div>
      </form>
    </Dialog>
  );
};
