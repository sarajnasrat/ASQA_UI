import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import FileUploadField from "../../common/FileUploadField";
// @ts-ignore
import UserService from "../../../services/user.service.ts";
import { useNavigate } from "react-router-dom";
import { useAppToast } from "../../../hooks/useToast.js";
import { Toast } from "primereact/toast";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb.js";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  role: string;
};

export const UserRegistration = () => {
  const navigate = useNavigate();
  const { toast, showToast } = useAppToast();
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>();

  const passwordValue = watch("password");

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
              password: data.password,
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

      await UserService.registerUser(formData);

      reset();
      setProfileImage(null);

      showToast("success", "Success", "User Registered Successfully");
      setTimeout(() => navigate("/users"), 1500);
    } catch (error) {
      showToast("error", "Error", "Failed to register user");
    }
  };

  // Password strength checker
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
        label: "Weak",
        color: "bg-red-500",
        textColor: "text-red-500",
      };
    if (score === 3)
      return {
        score,
        label: "Fair",
        color: "bg-orange-500",
        textColor: "text-orange-500",
      };
    if (score === 4)
      return {
        score,
        label: "Good",
        color: "bg-yellow-500",
        textColor: "text-yellow-500",
      };
    return {
      score,
      label: "Strong",
      color: "bg-green-500",
      textColor: "text-green-500",
    };
  };

  const strength = getPasswordStrength(passwordValue);

  return (
    <>
      <DynamicBreadcrumb
        items={[
          { label: "Users", url: "/users" },
          { label: "Register User", url: "/users/new" },
        ]}
        size="pl-5 pr-5 max-w-8xl mx-auto mt-1"
      />

      <div className="flex justify-center pl-5 pr-5 max-w-8xl mx-auto">
        <Toast ref={toast} />

        <Card className="w-full max-w-8xl shadow-2  ">
          {/* Simple Header */}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* 3 COLUMN GRID - Minimal spacing */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
              {/* First Name */}
              <Controller
                name="firstName"
                control={control}
                rules={{ required: "First name is required" }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      {...field}
                      placeholder="First name"
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
                rules={{ required: "Last name is required" }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      {...field}
                      placeholder="Last name"
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
                  required: "Phone number is required",
                  pattern: {
                    value: /^07\d{8}$/,
                    message: "Must start with 07 and be 10 digits",
                  },
                }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      {...field}
                      placeholder="0701234567"
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
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      {...field}
                      type="email"
                      placeholder="email@example.com"
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
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                }}
                render={({ field }) => (
                  <div style={{ width: "100%" }}>
                    <label className="block text-sm font-medium mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Password
                      {...field}
                      toggleMask
                      feedback={false}
                      placeholder="Enter password"
                      className={`w-105 ${errors.password ? "p-invalid" : ""}`}
                      inputClassName="w-105"
                    />
                    {/* Simple Strength Indicator */}
                    {passwordValue && (
                      <div className="mt-2">
                        <div className="flex align-items-center gap-2 mb-1">
                          <div className="flex-1 h-1 bg-gray-200 border-round">
                            <div
                              className={`h-1 border-round ${strength.color}`}
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
                  required: "Please confirm password",
                  validate: (value) =>
                    value === passwordValue || "Passwords do not match",
                }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <Password
                      {...field}
                      toggleMask
                      feedback={false}
                      placeholder="Confirm password"
                      className={`w-105 ${errors.password ? "p-invalid" : ""}`}
                      inputClassName="w-105"
                    />

                    {/* Simple match indicator */}
                    {field.value &&
                      passwordValue &&
                      field.value !== passwordValue && (
                        <small className="text-orange-500 block mt-1">
                          Passwords do not match
                        </small>
                      )}

                    {field.value &&
                      passwordValue &&
                      field.value === passwordValue && (
                        <small className="text-green-500 block mt-1">
                          ✓ Passwords match
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
               <div>
   {/* Role */}
              <Controller
                name="role"
                control={control}
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <Dropdown
                      {...field}
                      options={roleOptions}
                      placeholder="Select role"
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

               </div>
           
            </div>

            {/* Profile Image - Simple */}
            <div className="mt-2 pt-2 border-top-1 surface-border">
              <div className="mb-2">
                <span className="font-medium">Profile Image</span>
              </div>
              <FileUploadField
                name="profileImage"
                accept="image/*"
                maxFileSize={1048576}
                onFileSelect={(file) => setProfileImage(file)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-content-end gap-2 mt-4 pt-3 border-top-1 surface-border">
              <Button
                label="Cancel"
                type="button"
                severity="secondary"
                raised
                text
                icon="pi pi-times"
                onClick={() => navigate("/users")}
                className="p-button-outlined"
                style={{ minWidth: "100px" }}
              />
              <Button
                label="Register"
                type="submit"
                severity="success"
                raised
                text
                icon="pi pi-save"
                loading={isSubmitting}
                style={{ minWidth: "100px" }}
              />
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};
