import { InspectionCommitteApprovedRequest } from "../inspection-committee-approved-request/InspectionCommitteApprovedRequest";

export default function InternationalApprovedRequest() {
  return (
    <InspectionCommitteApprovedRequest
      certificationScope="INTERNATIONAL"
      menuPath="/international-approved-request"
      viewPath="/international-certification-request/view"
      titleKey="internationalRequest.titles.approvedRequests"
    />
  );
}
