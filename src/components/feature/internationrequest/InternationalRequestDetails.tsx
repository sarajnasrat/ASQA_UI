import CertificationRequestView from "../certification-request/CertificationRequestView";

// Separate route component keeps international navigation isolated while
// reusing the established request detail layout and its scope-aware workflow.
export default function InternationalRequestDetails() {
  return <CertificationRequestView expectedScope="INTERNATIONAL" />;
}
