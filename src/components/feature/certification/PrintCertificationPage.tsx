import  { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CertificationService from "../../../services/certification.service";
import { PrintCertification } from "./PrintCertification";

export const PrintCertificationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [certification, setCertification] = useState<any>();

  useEffect(() => {
    if (id) {
      CertificationService.getCertificationById(Number(id)).then((res) =>
        setCertification(res.data.data),
      );
  
    }
  }, [id]);

  return (
    <PrintCertification
      certification={certification}
      onPrinted={() =>
        navigate(location.state?.returnPath || "/printed-certification", {
          replace: true,
        })
      }
    />
  );
};
