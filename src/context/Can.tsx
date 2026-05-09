import React from "react";
import { useAuth } from "./AuthContext";

interface CanProps {
  permission?: string;
  anyOf?: string[];
  allOf?: string[];
  children: React.ReactNode;
}

const Can: React.FC<CanProps> = ({
  permission,
  anyOf,
  allOf,
  children,
}) => {

  const { permissions } = useAuth();

  if (permission && permissions.includes(permission))
    return <>{children}</>;

  if (anyOf && anyOf.some(p => permissions.includes(p)))
    return <>{children}</>;

  if (allOf && allOf.every(p => permissions.includes(p)))
    return <>{children}</>;

  return null;
};

export default Can;