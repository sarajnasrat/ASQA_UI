// components/Footer.js
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { useEffect, useState } from "react";
import { handleApi } from "../../../../hooks/handleApi";
import OrganizationInfoService from "../../../../services/organizationinfo.service";
import { useToast } from "../../../../hooks/ToastContext";
type OrganizationContact = {
  organizationName: string;
  address: string;
  phoneNumber: string;
  emailAddress: string;
};
const Footer = () => {
  const { t } = useTranslation();

  const [contact, setContact] = useState<OrganizationContact | null>(null);
  const { showSuccess, showError } = useToast();

  // useEffect(() => {
  //   const loadOrganizationInfo = async () => {
  //     const response = await handleApi(
  //       () =>
  //         ContactUsService.getPaginatedContactUs({
  //           page: 0,
  //           size: 10,
  //           sort: "id,desc",
  //         }),
  //       () => {},
  //       showError,
  //     );

  //     if (response) {
  //       const records = response.data?.data?.data || response.data?.data || [];

  //       if (Array.isArray(records) && records.length > 0) {
  //         setContact(records[0]);
  //       }
  //     }
  //   };

  //   loadOrganizationInfo();
  // }, [showError]);

    useEffect(() => {
    const loadOrganizationInfo = async () => {
      const response = await handleApi(
        () =>
          OrganizationInfoService.getPaginatedOrganizationInfo({
            page: 0,
            size: 10,
            sort: "id,desc",
          }),
        () => {},
        showError,
      );

      if (response) {
        const records = response.data?.data?.data || response.data?.data || [];

        if (Array.isArray(records) && records.length > 0) {
          setContact(records[0]);
        }
      }
    };

    loadOrganizationInfo();
  }, [showError]);
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  const quickLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/services", label: t("nav.services") },
    { to: "/companies", label: t("nav.companies") },
    { to: "/international-parties", label: t("nav.internationalParties") },
    { to: "/organization-services", label: t("nav.organizationServices") },
    { to: "/contact", label: t("nav.contact") },
    { to: "/registration", label: t("website.footer.links.register") },
  ];

  const serviceItems = [
    t("footer.services.companyCertification"),
    t("footer.services.qualityAssurance"),
    t("footer.services.complianceReview"),
    t("footer.services.documentVerification"),
    t("footer.services.certificateGeneration"),
  ];
console.log("contact",contact);
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">ASQA</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {t("website.footer.description")}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("website.footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors text-sm block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">
              {t("website.footer.ourServices")}
            </h3>
            <ul className="space-y-2">
              {serviceItems.map((service, index) => (
                <li key={index} className="text-gray-400 text-sm">
                  {service}
                </li>
              ))}
            </ul>
          </div> */}

          {/* Contact Info */}
        <div>
  <h3 className="text-lg font-semibold mb-4">
    {t("website.footer.contactUs")}
  </h3>

  <ul className="space-y-3">
    <li className="flex items-start space-x-3">
      <MapPin className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
      <div className="text-gray-400 text-sm">
        <div>{contact?.address || t("common.notSpecified")}</div>
      </div>
    </li>

    <li className="flex items-center space-x-3">
      <Phone className="h-5 w-5 text-blue-400 shrink-0" />
      <span className="text-gray-400 text-sm">
        {contact?.phoneNumber || t("common.notSpecified")}
      </span>
    </li>

    <li className="flex items-center space-x-3">
      <Mail className="h-5 w-5 text-blue-400 shrink-0" />
      <span className="text-gray-400 text-sm">
        {contact?.emailAddress || t("common.notSpecified")}
      </span>
    </li>
  </ul>
</div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            {t("website.footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
