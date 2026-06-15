import { useEffect, useState } from "react";
import { BriefcaseBusiness, Sparkles, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppToast } from "../../../../hooks/useToast";
import OrganizationServicesService from "../../../../services/organizationservices.service";

interface OrganizationServiceItem {
  id: number;
  name: string;
  service: string;
  isActive: boolean;
}

const OrganizationServices = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useAppToast();
  const [item, setItem] = useState<OrganizationServiceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const isRtl = i18n.language === "ps" || i18n.language === "dr";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await OrganizationServicesService.getPaginatedOrganizations({
          page: 0,
          size: 1,
          sort: "id,desc",
        });
        const data = response.data?.data || [];
        setItem(data.length > 0 ? data[0] : null);
      } catch {
        showToast("error", t("common.error"), t("organization.failedtofetch"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 pt-24 pb-20">
      {/* Hero Section */}
 <section className="relative min-h-[500px] flex items-center justify-center bg-linear-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
  {/* Animated background pattern */}
  <div className="absolute inset-0 opacity-10">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }}
    />
  </div>

  {/* Floating particles */}
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(12)].map((_, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white/5 animate-float"
        style={{
          width: Math.random() * 150 + 30 + "px",
          height: Math.random() * 150 + 30 + "px",
          left: Math.random() * 100 + "%",
          top: Math.random() * 100 + "%",
          animationDelay: Math.random() * 5 + "s",
          animationDuration: Math.random() * 10 + 10 + "s",
        }}
      />
    ))}
  </div>

  <div className="relative container mx-auto px-4 py-16 md:py-20">
    <div className="max-w-4xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 mb-6 border border-white/20">
        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
        <span className="text-xs font-medium">{t("website.organizationServices.badge")}</span>
      </div>

      {/* Main heading */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
        <span className="bg-linear-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
          {t("website.organizationServices.title")}
        </span>
      </h1>

      {/* Description */}
      <p className="text-base md:text-lg mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
        {t("website.organizationServices.description")}
      </p>
    </div>
  </div>

  {/* Curved bottom */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg
      viewBox="0 0 1440 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <path
        d="M0 80L48 72C96 64 192 48 288 40C384 32 480 32 576 40C672 48 768 64 864 72C960 80 1056 80 1152 72C1248 64 1344 48 1392 40L1440 32V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
        fill="white"
        fillOpacity="0.9"
      />
    </svg>
  </div>
</section>

      {/* Content Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 md:py-24">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
            <p className="mt-5 text-gray-600 text-base md:text-lg">
              {t("website.organizationServices.loading")}
            </p>
          </div>
        ) : !item ? (
          <div className="max-w-2xl mx-auto text-center">
            <div className="rounded-2xl bg-white p-8 md:p-12 shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BriefcaseBusiness className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                {t("website.organizationServices.emptyTitle")}
              </h2>
              <p className="text-gray-500 text-base md:text-lg">
                {t("website.organizationServices.emptyDescription")}
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Service Header */}
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl md:rounded-3xl shadow-lg mb-5 md:mb-6">
                <BriefcaseBusiness className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                {item.name}
              </h2>
              {/* <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm md:text-base text-gray-600">
                  {t("website.organizationServices.activeService")}
                </span>
              </div> */}
            </div>

            {/* Service Content */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500"></div>
              <div className="p-6 md:p-8 lg:p-10">
                <div
                  dir={isRtl ? "rtl" : "ltr"}
                  className="prose prose-base md:prose-lg max-w-none text-gray-700 leading-relaxed
                    [&_h1]:text-2xl [&_h1]:md:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4
                    [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-800 [&_h2]:mb-3
                    [&_h3]:text-lg [&_h3]:md:text-xl [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:mb-2
                    [&_p]:mb-4 [&_p]:leading-relaxed
                    [&_ul]:list-disc [&_ul]:ps-5 md:[&_ul]:ps-6 [&_ul]:mb-4 [&_ul]:space-y-2
                    [&_ol]:list-decimal [&_ol]:ps-5 md:[&_ol]:ps-6 [&_ol]:mb-4 [&_ol]:space-y-2
                    [&_li]:mb-1
                    [&_strong]:text-gray-900 [&_strong]:font-semibold
                    [&_a]:text-indigo-600 [&_a]:hover:text-indigo-700 [&_a]:underline
                    [&_img]:rounded-lg [&_img]:shadow-md [&_img]:my-4
                    [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                    [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-50 [&_th]:font-semibold
                    [&_td]:border [&_td]:border-gray-300 [&_td]:p-2
                    [&_blockquote]:border-l-4 [&_blockquote]:border-indigo-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4"
                  dangerouslySetInnerHTML={{
                    __html: item.service || `<p class="text-gray-500 italic">${t("common.notSpecified")}</p>`,
                  }}
                />
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 md:mt-10 text-center">
              <p className="text-sm text-gray-500">
                {t("website.organizationServices.footerNote")}
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default OrganizationServices;