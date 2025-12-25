"use client";
import React, { useEffect } from "react";

import CustomModal from "@/components/reuseable/Shared/CustomModal";
import CustomSideWindow from "@/components/reuseable/Shared/CustomSideWindow";
import { useWindowSize } from "@/hooks/useWindowSize";
import SearchField from "@/components/reuseable/Shared/SearchField";
import { z } from "zod";
import { toast } from "react-hot-toast";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "@/redux/api/users/userApi";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import FormInputHF from "@/components/reuseable/forms/WithHookForm/FormInputHF";
import SearchSelectHF from "@/components/reuseable/forms/WithHookForm/SearchSelectHF";
import FormPhotoUploadHF from "@/components/reuseable/forms/WithHookForm/FormPhotoUploadHF";
import { useGetRolesQuery } from "@/redux/api/settings/constants/rolesApi";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

type AddEditUserModalProps = {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  editingUser?: any | null;
  onUserCreated?: () => void;
  onUserUpdated?: () => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
};

export default function AddEditUserModal({
  searchTerm,
  setSearchTerm,
  editingUser = null,
  onUserCreated,
  onUserUpdated,
  open,
  setOpen,
}: AddEditUserModalProps) {
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  // Zod schema for validation
  const schema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z
      .string({ required_error: "Email is required" })
      .min(1, "Email is required")
      .email("Invalid email address")
      .regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Email format is invalid"),
    password: editingUser
      ? z
          .string()
          .optional()
          .refine(
            (val) => !val || val.length >= 8,
            "Password must be at least 8 characters"
          )
          .refine(
            (val) =>
              !val ||
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/.test(
                val
              ),
            "Password must include at least one number, one lowercase letter, one uppercase letter, and one special character"
          )
      : z
          .string({ required_error: "Password is required" })
          .min(1, "Password is required")
          .min(8, "Password must be at least 8 characters")
          .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
            "Password must include at least one number, one lowercase letter, one uppercase letter, and one special character"
          ),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    profileImage: z.string().optional().nullable(),
    is_suspended: z.boolean().optional(),
    role: z
      .object(
        { id: z.number(), name: z.string() },
        { required_error: "Role is required" }
      )
      .refine((val) => val && typeof val.id === "number", {
        message: "Role is required",
      }),
    company_name: z.string().optional().nullable(),
    company_address: z.string().optional().nullable(),
  });

  const getDefaultValues = (editingUser: any) =>
    editingUser
      ? {
          username: editingUser.username || "",
          email: editingUser.email || "",
          password: "", // Don't prefill password
          firstName: editingUser.firstName || "",
          lastName: editingUser.lastName || "",
          phone: editingUser.phone || "",
          profileImage: editingUser.profileImage || null,
          is_suspended: editingUser.is_suspended || false,
          role: editingUser.role
            ? {
                value: editingUser.role.id,
                label: editingUser.role.name,
                type: editingUser.role.type || "internal",
              }
            : null,
          company_name: editingUser.company_name || "",
          company_address: editingUser.company_address || "",
        }
      : {
          username: "",
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          phone: "",
          profileImage: null,
          is_suspended: false,
          role: null,
          company_name: "",
          company_address: "",
        };

  const methods = useForm({
    resolver: async (data) => {
      // Map select fields to { id, name } for Zod
      const mappedData = {
        ...data,
        role:
          data.role && typeof data.role === "object"
            ? {
                id: data.role.value,
                name: data.role.label,
                type: data.role.type,
              }
            : undefined,
      };
      try {
        return {
          values: schema.parse(mappedData),
          errors: {},
        };
      } catch (e: any) {
        console.log("ZOD ERROR", e);
        return {
          values: {},
          errors: e.formErrors?.fieldErrors || {},
        };
      }
    },
    defaultValues: getDefaultValues(editingUser),
  });

  // Reset form values when editingUser changes
  useEffect(() => {
    methods.reset(getDefaultValues(editingUser));
  }, [editingUser, methods]);

  const onSubmit = async (values: any) => {
    try {
      if (editingUser) {
        const updatePayload: any = {
          id: editingUser.id,
          username: values.username.trim(),
          email: values.email.trim(),
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          profileImage: values.profileImage || undefined,
          is_suspended: values.is_suspended,
          role_id: values.role?.id,
          company_name: values.company_name || undefined,
          company_address: values.company_address || undefined,
        };

        // Only include password if it was provided
        if (values.password && values.password.trim()) {
          updatePayload.password = values.password.trim();
        }

        await updateUser?.(updatePayload)?.unwrap?.();
        toast.success("User updated successfully");
        if (onUserUpdated) onUserUpdated();
      } else {
        await createUser?.({
          ...values,
          username: values.username.trim(),
          email: values.email.trim(),
          profileImage: values.profileImage || undefined,
          role_id: values.role?.id,
          company_name: values.company_name || undefined,
          company_address: values.company_address || undefined,
          role: undefined,
          is_super_user: false, // Always false from UI
        })?.unwrap?.();
        toast.success("User created successfully");
        if (onUserCreated) onUserCreated();
      }
      methods.reset();
      if (setOpen) setOpen(false);
      // setModalOpen(false);
    } catch (error: any) {
      console.log("ERROR", error);
      toast.error(error?.data?.message || "Failed to submit user");
    }
  };

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery({
    limit: 100,
  });

  // Watch role field to determine if external
  type RoleOption = { id: number; name: string; type: string };
  const selectedRole = useWatch({
    control: methods.control,
    name: "role",
  }) as RoleOption | null;
  const showCompanyFields = !!selectedRole && selectedRole.type === "external";

  // Watch suspension status from form
  const isSuspended = useWatch({
    control: methods.control,
    name: "is_suspended",
  }) as boolean;

  // Map API data to SearchSelectHF options
  const roleOptions = (rolesData?.data || []).map((r: any) => ({
    value: r.id,
    label: r.name,
    ...r,
  }));

  const isLoading = editingUser ? isUpdating : isCreating;
  const { width } = useWindowSize();
  const isMobile = width < 1024; // lg breakpoint


  return (
    <div className="flex items-center justify-between gap-4 sm+:mb-4">
      {/* Mobile: Add New Button + CustomSideWindow (width < 1024px) */}
      {isMobile ? (
        <>
          <Button
            onClick={() => setOpen?.(true)}
            className="flex items-center gap-2"
            size="sm"
          >
            Add New
          </Button>
          <CustomSideWindow
            open={open || false}
            onOpenChange={setOpen || (() => {})}
          >
          <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="w-full max-w-2xl mx-auto px-6 py-0 flex flex-col gap-4"
        >
          <div className="mb-2">
            <h3 className="text-2xl font-bold mb-1 tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {editingUser ? "Edit User" : "User Information"}
            </h3>
            <p className="text-body-2 text-text_highlight">
              {editingUser
                ? "Update the details for this user."
                : "Fill in the details to create a new user account."}
            </p>
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
              isMobile ? "max-h-[calc(100vh-200px)] overflow-y-auto pr-4" : ""
            }`}
          >
            <div className="md:col-span-2 w-[200px]">
              <FormPhotoUploadHF
                label="Profile Picture"
                profilePicture={true}
                mode="upload-string"
                onImageUpload={(image) =>
                  methods.setValue("profileImage", image as string | null)
                }
                uploadedImages={methods.watch("profileImage")}
                previewImage={methods.watch("profileImage")}
                disabled={isLoading}
              />
            </div>
            <FormInputHF
              name="firstName"
              label="First Name"
              placeholder="Enter first name"
              disabled={isLoading}
            />
            <FormInputHF
              name="lastName"
              label="Last Name"
              placeholder="Enter last name"
              disabled={isLoading}
            />
            <FormInputHF
              name="username"
              label="Username"
              placeholder="Enter username"
              required
              disabled={isLoading || !!editingUser}
            />
            <FormInputHF
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email"
              required
              disabled={isLoading}
            />
            <FormInputHF
              name="password"
              label={editingUser ? "New Password (Optional)" : "Password"}
              type="password"
              placeholder={
                editingUser
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
              required={!editingUser}
              disabled={isLoading}
            />
            <FormInputHF
              name="phone"
              label="Phone"
              placeholder="Enter phone"
              disabled={isLoading}
            />
            <SearchSelectHF
              name="role"
              label="Role"
              options={roleOptions}
              required
              disabled={rolesLoading || isLoading}
              searchable
              placeholder="Search and select role"
            />
            {editingUser && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="suspend-switch"
                    className={`text-sm font-medium ${
                      isSuspended ? "text-warning" : "text-success"
                    }`}
                  >
                    {isSuspended ? "Suspended" : "Active"}
                  </label>
                  <Switch
                    checked={!isSuspended}
                    onCheckedChange={(checked) =>
                      methods.setValue("is_suspended", !checked)
                    }
                    disabled={isLoading}
                    id="suspend-switch"
                  />
                </div>
              </div>
            )}
            {showCompanyFields && (
              <>
                <FormInputHF
                  name="company_name"
                  label="Company Name"
                  placeholder="Enter company name"
                  disabled={isLoading}
                />
                <FormInputHF
                  name="company_address"
                  label="Company Address"
                  placeholder="Enter company address"
                  disabled={isLoading}
                />
              </>
            )}
          </div>
          <div className="flex justify-end items-center mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  {editingUser ? "Updating..." : "Creating..."}
                </span>
              ) : editingUser ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
          </CustomSideWindow>
        </>
      ) : (
        /* Desktop: CustomModal (width >= 1024px) */
        <CustomModal
          contentClassName="min-w-[600px]"
          triggerText={<span className="flex items-center gap-1">Add New</span>}
          resolver={schema}
          onSubmit={() => {}}
          open={open}
          onOpenChange={setOpen}
          form={<FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="w-full max-w-2xl mx-auto px-6 py-0 flex flex-col gap-4"
        >
          <div className="mb-2">
            <h3 className="text-2xl font-bold mb-1 tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {editingUser ? "Edit User" : "User Information"}
            </h3>
            <p className="text-body-2 text-text_highlight">
              {editingUser
                ? "Update the details for this user."
                : "Fill in the details to create a new user account."}
            </p>
          </div>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
              isMobile ? "max-h-[calc(100vh-200px)] overflow-y-auto pr-4" : ""
            }`}
          >
            <div className="md:col-span-2 w-[200px]">
              <FormPhotoUploadHF
                label="Profile Picture"
                profilePicture={true}
                mode="upload-string"
                onImageUpload={(image) =>
                  methods.setValue("profileImage", image as string | null)
                }
                uploadedImages={methods.watch("profileImage")}
                previewImage={methods.watch("profileImage")}
                disabled={isLoading}
              />
            </div>
            <FormInputHF
              name="firstName"
              label="First Name"
              placeholder="Enter first name"
              disabled={isLoading}
            />
            <FormInputHF
              name="lastName"
              label="Last Name"
              placeholder="Enter last name"
              disabled={isLoading}
            />
            <FormInputHF
              name="username"
              label="Username"
              placeholder="Enter username"
              required
              disabled={isLoading || !!editingUser}
            />
            <FormInputHF
              name="email"
              label="Email"
              type="email"
              placeholder="Enter email"
              required
              disabled={isLoading}
            />
            <FormInputHF
              name="password"
              label={editingUser ? "New Password (Optional)" : "Password"}
              type="password"
              placeholder={
                editingUser
                  ? "Leave blank to keep current password"
                  : "Enter password"
              }
              required={!editingUser}
              disabled={isLoading}
            />
            <FormInputHF
              name="phone"
              label="Phone"
              placeholder="Enter phone"
              disabled={isLoading}
            />
            <SearchSelectHF
              name="role"
              label="Role"
              options={roleOptions}
              required
              disabled={rolesLoading || isLoading}
              searchable
              placeholder="Search and select role"
            />
            {editingUser && (
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="suspend-switch"
                    className={`text-sm font-medium ${
                      isSuspended ? "text-warning" : "text-success"
                    }`}
                  >
                    {isSuspended ? "Suspended" : "Active"}
                  </label>
                  <Switch
                    checked={!isSuspended}
                    onCheckedChange={(checked) =>
                      methods.setValue("is_suspended", !checked)
                    }
                    disabled={isLoading}
                    id="suspend-switch"
                  />
                </div>
              </div>
            )}
            {showCompanyFields && (
              <>
                <FormInputHF
                  name="company_name"
                  label="Company Name"
                  placeholder="Enter company name"
                  disabled={isLoading}
                />
                <FormInputHF
                  name="company_address"
                  label="Company Address"
                  placeholder="Enter company address"
                  disabled={isLoading}
                />
              </>
            )}
          </div>
          <div className="flex justify-end items-center mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  {editingUser ? "Updating..." : "Creating..."}
                </span>
              ) : editingUser ? (
                "Update User"
              ) : (
                "Create User"
              )}
            </Button>
          </div>
        </form>
      </FormProvider>}
          triggerProps={{
            className: "flex items-center gap-2",
            disabled: isLoading,
            size: "sm",
          }}
        />
      )}
      <div className="flex-1 max-w-sm">
        <SearchField
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full"
        />
      </div>
    </div>
  );
}
