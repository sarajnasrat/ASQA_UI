import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import DetailsCard from "../../../components/common/DetailsCard";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import UserService from "../../../services/user.service";

export const ViewUserDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getUserById = async () => {
    setLoading(true);
    try {
      const res = await UserService.getUser(Number(id));
      setUser(res.data.data);
    } catch (error) {
      console.error("Failed to load user", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getUserById();
    }
  }, [id]);

const formatRoles = (roles?: any[]) => {
  if (!roles || roles.length === 0) {
    return String(t("user.labels.notProvided"));
  }

  return roles
    .map((r: any) => t(`role.${r?.name}`))
    .join(", ");
};
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">{String(t("common.loading"))}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        {String(t("user.messages.notFound"))}
      </div>
    );
  }

  // Transform the user data to handle special formatting
  const formattedUser = {
    ...user,
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    firstName: user.firstName || String(t("user.labels.notProvided")),
    lastName: user.lastName || String(t("user.labels.notProvided")),
    email: user.email || String(t("user.labels.notProvided")),
    phoneNumber: user.phoneNumber || String(t("user.labels.notProvided")),
    username: user.username || String(t("user.labels.notProvided")),
    roles: formatRoles(user.roles),
    createdDate: user.createdDate
      ? new Date(user.createdDate).toLocaleDateString()
      : String(t("user.labels.notProvided")),
    updatedDate: user.updatedDate
      ? new Date(user.updatedDate).toLocaleDateString()
      : String(t("user.labels.notProvided")),
    zone: user.zone?.name || String(t("user.labels.notAssigned")),
    enabled: user.enabled
      ? String(t("user.status.active"))
      : String(t("user.status.inactive")),
  };

  const userFields = [
    { label: String(t("user.details.firstName")), name: "firstName" },
    { label: String(t("user.details.lastName")), name: "lastName" },
    { label: String(t("user.details.email")), name: "email" },
    { label: String(t("user.details.phoneNumber")), name: "phoneNumber" },
    { label: String(t("user.details.username")), name: "username" },
    { label: String(t("user.details.roles")), name: "roles" },
    { label: String(t("user.details.zone")), name: "zone" },
    { label: String(t("user.details.createdDate")), name: "createdDate" },
    { label: String(t("user.details.updatedDate")), name: "updatedDate" },
    { label: String(t("user.details.status")), name: "enabled" },
  ];

  return (
    <>
      <DynamicBreadcrumb
        items={[
          { label: String(t("user.title")), url: "/users" },
          {
            label: String(t("user.details.viewUser")),
            url: `/users/view/${id}`,
          },
        ]}
        size="max-w-7xl mx-auto pt-4"
      />
      <div className="container mx-auto px-4 py-6">
        <DetailsCard
          title={String(t("user.details.userDetails"))}
          data={formattedUser}
          fields={userFields}
          imageField="profileImage"
        />
      </div>
    </>
  );
};

export default ViewUserDetails;
