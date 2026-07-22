import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import UserService from "../../../services/user.service";

type FormValues = { firstName: string; lastName: string; email: string; phoneNumber: string };
export default function InspectionUserEdit() { const { id } = useParams(); const navigate = useNavigate(); const { register, handleSubmit, reset } = useForm<FormValues>();
  useEffect(() => { if (id) UserService.getUser(Number(id)).then((r) => reset(r.data.data)); }, [id, reset]);
  const submit = (data: FormValues) => { const form = new FormData(); form.append("user", new Blob([JSON.stringify({ ...data, active: true, roles: ["ROLE_INSPECTION_USERS"] })], { type: "application/json" })); UserService.updateUser(Number(id), form).then(() => navigate("/inspection-users")); };
  return <form onSubmit={handleSubmit(submit)} className="mx-auto grid max-w-4xl grid-cols-1 gap-4 p-6 md:grid-cols-2">{(["firstName", "lastName", "email", "phoneNumber"] as const).map((name) => <div key={name}><label className="mb-1 block font-medium">{name}</label><InputText {...register(name)} className="w-full" /></div>)}<Button type="submit" label="Save" /></form>; }
