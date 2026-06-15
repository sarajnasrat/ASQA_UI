import { useEffect, useState } from "react";
import {
  Globe2,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Building2,
  Sparkles,
  Rocket,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppToast } from "../../../../hooks/useToast";
import InternationalPartyService from "../../../../services/internationalparty.service";

interface InternationalParty {
  id: number;
  name: string;
  shortName?: string;
  location: string;
  logo?: string;
  about: string;
  websiteUrl?: string;
  email?: string;
  phoneNumber?: string;
  organizationType?: string;
  isActive: boolean;
}

const InternationalParties = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useAppToast();
  const [items, setItems] = useState<InternationalParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response =
          await InternationalPartyService.getPaginatedInternationalParties({
            page: 0,
            size: 100,
            sort: "id,desc",
          });
        setItems(response.data?.data || []);
      } catch {
        showToast(
          "error",
          t("common.error"),
          t("internationalParty.failedtofetch"),
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getLogoSrc = (logo?: string) => {
    if (!logo) return "";
    if (
      logo.startsWith("http://") ||
      logo.startsWith("https://") ||
      logo.startsWith("data:image/") ||
      logo.startsWith("/")
    ) {
      return logo;
    }
    return "";
  };

  return (
    <div className="overflow-hidden pt-24 pb-20">
      {/* Hero Section - Matching Home page style */}
      <section className="relative min-h-125 flex items-center justify-center bg-linear-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
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
              <Globe2 className="h-3.5 w-3.5 text-blue-200" />
              <span className="text-xs font-medium">
                {t("website.internationalParties.badge") || "Global Network"}
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="bg-linear-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                {t("website.internationalParties.title") ||
                  "International Certification Bodies"}
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl text-slate-200/90 max-w-4xl mx-auto leading-9 md:leading-10 font-light tracking-wide">
              {t("website.internationalParties.description") ||
                "Connect with leading certification organizations worldwide and find the right partner for your international certification needs."}
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

      {/* Parties List Section */}
      <section className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-5 text-gray-600">
              {t("website.internationalParties.loading")}
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-14 text-center shadow-sm">
            <Globe2 className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {t("website.internationalParties.emptyTitle")}
            </h2>
            <p className="text-gray-500">
              {t("website.internationalParties.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const logoSrc = getLogoSrc(item.logo);
              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-2 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500" />
                  <div className="p-6">
                    <div className="mb-5 flex items-start gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden">
                        {logoSrc ? (
                          <img
                            src={logoSrc}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-9 w-9 text-gray-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold text-gray-900 line-clamp-2">
                          {item.name}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.shortName && (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                              {item.shortName}
                            </span>
                          )}
                          {item.organizationType && (
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                              {item.organizationType}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                      <span>{item.location}</span>
                    </div>

                    <p className="mb-5 line-clamp-4 text-sm leading-7 text-gray-600">
                      {item.about}
                    </p>

                    <div className="space-y-2 border-t border-gray-100 pt-4">
                      {item.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-4 w-4 text-indigo-500" />
                          <span className="truncate">{item.email}</span>
                        </div>
                      )}
                      {item.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-4 w-4 text-cyan-500" />
                          <span>{item.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {item.websiteUrl && (
                      <a
                        href={item.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-700"
                      >
                        {t("website.internationalParties.visitWebsite")}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default InternationalParties;
