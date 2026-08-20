import { InspectionAssignmentList } from "../commiteeassignment/InspectionAssignmentList";
import { ApprovalAssignmentList } from "../commiteeassignment/ApprovalAssignmentList";

export function InternationalInspectionAssignmentList() {
  return (
    <InspectionAssignmentList
      certificationScope="INTERNATIONAL"
      listPath="/international-commitee-assignment-list"
      titleKey="internationalRequest.titles.inspectionCommitteeAssignments"
    />
  );
}

export function InternationalApprovalAssignmentList() {
  return (
    <ApprovalAssignmentList
      certificationScope="INTERNATIONAL"
      listPath="/international-approval-commitee-assignment"
      titleKey="internationalRequest.titles.approvalCommitteeAssignments"
    />
  );
}
