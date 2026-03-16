import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DetailsCard from "../../../components/common/DetailsCard";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import UserService from "../../../services/user.service";

export const ViewUserDetails = () => {
  const { id } = useParams();

  const [user, setUser] = useState(null);

  const getUserById = async () => {
    try {
      const res = await UserService.getUser(id);
      setUser(res.data.data);
    } catch (error) {
      console.error("Failed to load user", error);
    }
  };

  useEffect(() => {
    if (id) {
      getUserById();
    }
  }, [id]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading user details...
      </div>
    );
  }

  const userFields = [
    { label: "First Name", name: "firstName" },
    { label: "Last Name", name: "lastName" },
    { label: "Email", name: "email" },
    { label: "Phone Number", name: "phoneNumber" },
    { label: "Roles", name: "roles" },
  ];

  return (
    <>
      <DynamicBreadcrumb
        items={[
          { label: "Users", url: "/users" },
          { label: "View User", url: `/users/view/${id}` },
        ]}
        size="max-w-7xl mx-auto pt-4"
      />
      <div className="">
        <DetailsCard
          title="User Details"
          data={user}
          fields={userFields}
          imageField="image" // remove if user has no image field
        />
      </div>
    </>
  );
};
