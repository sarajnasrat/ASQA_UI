import { useForm, Controller } from "react-hook-form";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
// @ts-ignore
import UserService from "../../../services/user.service.ts";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppToast } from "../../../hooks/useToast.js";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb.js";
import SkeletonForm from "../../common/SkeletonForm.js";
import FileUploadField from "../../common/FileUploadField";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
};

export const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast, showToast } = useAppToast();

  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const res = await UserService.getUser(id);

        const user = res.data.data;

        reset({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.roles?.[0]?.name || "ROLE_USER",
        });

        // Set existing image URL (adjust field name if needed)
        setExistingImageUrl(
          user?.profileImage
            ? `http://localhost:8080${user.profileImage}`
            : null,
        );
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadUser();
  }, [id, reset]);

  const roleOptions = [
    { label: "Admin", value: "ROLE_ADMIN" },
    { label: "User", value: "ROLE_USER" },
    { label: "Company Admin", value: "ROLE_COMPANY" },
    { label: "Monitor", value: "MONITORING" },
  ];

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
              active: true,
              phoneNumber: data.phoneNumber,
              roles: [data.role],
            }),
          ],
          { type: "application/json" },
        ),
      );

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await UserService.updateUser(id, formData);

      showToast("success", "Success", "User Updated Successfully");

      setTimeout(() => {
        navigate("/users");
      }, 1500);
    } catch (error) {
      showToast("error", "Error", "Failed to update user");
    }
  };

  const fields = [
    { name: "firstName", label: "First Name" },
    { name: "lastName", label: "Last Name" },
    { name: "email", label: "Email" },
    { name: "phoneNumber", label: "Phone Number" },
    { name: "role", label: "Role" },
  ];
  console.log(existingImageUrl);
  return (
    <>
      <DynamicBreadcrumb
        items={[
          { label: "Users", url: "/users" },
          { label: "Edit User", url: `/users/edit/${id}` },
        ]}
        size="w-full max-w-7xl mx-auto px-0 pt-4"
      />

      {loading ? (
        <SkeletonForm skeletonType="row" fields={fields} />
      ) : (
        <div className="flex justify-center">
          <Toast ref={toast} />

          <Card className="w-full max-w-7xl mx-auto">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 3 COLUMN GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* First Name */}
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: "First name is required" }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">First Name</label>
                      <InputText {...field} className="w-full" />
                      {errors.firstName && (
                        <small className="text-red-500">
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
                  rules={{ required: "Last name is required" }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">Last Name</label>
                      <InputText {...field} className="w-full" />
                      {errors.lastName && (
                        <small className="text-red-500">
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
                    required: "Phone number is required",
                    pattern: {
                      value: /^07\d{8}$/,
                      message: "Phone must start with 07 and contain 10 digits",
                    },
                  }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">Phone Number</label>
                      <InputText
                        {...field}
                        placeholder="0701234567"
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

                {/* Email */}
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: "Invalid email address",
                    },
                  }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">Email</label>
                      <InputText {...field} type="email" className="w-full" />
                      {errors.email && (
                        <small className="text-red-500">
                          {errors.email.message}
                        </small>
                      )}
                    </div>
                  )}
                />

                {/* Role */}
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field }) => (
                    <div>
                      <label className="font-medium">Role</label>
                      <Dropdown
                        {...field}
                        options={roleOptions}
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
              </div>

              {/* Existing Image Preview */}
              {existingImageUrl && (
                <div>
                  <label className="font-medium block mb-2">
                    Current Profile Image
                  </label>
                  <img
                    src={existingImageUrl}
                    alt="Profile"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}

              {/* File Upload */}
              <FileUploadField
                label="Update Profile Image"
                name="profileImage"
                accept="image/*"
                maxFileSize={1048576}
                onFileSelect={(file) => setProfileImage(file)}
              />

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button label="Update" type="submit" loading={isSubmitting} />
                <Button
                  label="Cancel"
                  type="button"
                  severity="secondary"
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
