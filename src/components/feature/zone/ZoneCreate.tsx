import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ZoneService from "../../../services/zone.service";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ZoneCreate: React.FC<Props> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      location: "",
    },
  });

  // ✅ Submit
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      await ZoneService.createZone(data);

      reset();
      onClose();

      onSuccess && onSuccess();
    } catch (error) {
      console.error("Create Zone Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header={t("zone.create")}
      visible={visible}
      style={{ width: "450px" }}
      modal
      onHide={onClose}
      className="rounded-xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 mt-2"
      >
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

          {errors.name && (
            <small className="text-red-500">
              {errors.name.message as string}
            </small>
          )}
        </div>

        {/* Description */}
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
            label={t("common.save")}
            loading={loading}
          />
        </div>
      </form>
    </Dialog>
  );
};

export default ZoneCreate;
