import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useForm, Controller } from "react-hook-form";
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
      showToast("error", "Error", "Failed to load zone");
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

      showToast("success", "Success", "Zone updated successfully");

      onSuccess();
      onClose();
    } catch {
      showToast("error", "Error", "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Edit Zone"
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
            Zone Name
          </label>

          <Controller
            name="name"
            control={control}
            rules={{ required: "Zone name is required" }}
            render={({ field }) => (
              <InputText {...field} className="w-full" />
            )}
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-gray-700">
            Location
          </label>

          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <InputText {...field} className="w-full" />
            )}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            outlined
            onClick={onClose}
          />

          <Button
            type="submit"
            label="Update"
            loading={loading}
          />
        </div>
      </form>
    </Dialog>
  );
};