import { useEffect, useState } from "react";
import { Globe2, MapPin, Mail, Phone, ExternalLink, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
  const { showToast } = useAppToast();
  const [items, setItems] = useState<InternationalParty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await InternationalPartyService.getPaginatedInternationalParties({
          page: 0,
          size: 100,
          sort: "id,desc",
        });
        setItems(response.data?.data || []);
      } catch {
        showToast("error", t("common.error"), t("internationalParty.failedtofetch"));
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 pt-24 pb-20">
      <section className="relative overflow-hidden bg-linear-to-r from-blue-700 via-indigo-700 to-sky-700 text-white py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 mb-6">
            <Globe2 className="h-4 w-4 text-blue-100" />
            <span className="text-sm font-medium">{t("website.internationalParties.badge")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("website.internationalParties.title")}
          </h1>
          <p className="text-lg text-blue-100 max-w-3xl mx-auto">
            {t("website.internationalParties.description")}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-5 text-gray-600">{t("website.internationalParties.loading")}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-14 text-center shadow-sm">
            <Globe2 className="mx-auto h-14 w-14 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {t("website.internationalParties.emptyTitle")}
            </h2>
            <p className="text-gray-500">{t("website.internationalParties.emptyDescription")}</p>
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
