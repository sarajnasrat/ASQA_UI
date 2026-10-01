// pages/Home.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OrganizationChart } from "primereact/organizationchart";
import {
  CheckCircle,
  FileText,
  Award,
  Users,
  Shield,
  Globe,
  Building2,
  ArrowRight,
  Sparkles,
  Target,
  HeartHandshake,
  Rocket,
  Send,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = [
    { image: "/static/hero-quality-lab.png", title: t("home.hero.title"), description: t("home.hero.description") },
    { image: "/static/hero-manufacturing-quality.png", title: t("home.hero.slides.verify.title"), description: t("home.hero.slides.verify.description") },
    { image: "/static/hero-certification-team.png", title: t("home.hero.slides.trust.title"), description: t("home.hero.slides.trust.description") },
  ];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);

  const currentHeroSlide = heroSlides[activeSlide];
  const sliderTitle = heroSlides[0].title;
  const sliderDescription = heroSlides[0].description;

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-white" />,
      title: t("home.features.items.1.title"),
      description: t("home.features.items.1.description"),
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/20",
    },
    {
      icon: <Shield className="h-8 w-8 text-white" />,
      title: t("home.features.items.2.title"),
      description: t("home.features.items.2.description"),
      gradient: "from-indigo-500 to-purple-500",
      shadow: "shadow-indigo-500/20",
    },
    {
      icon: <Award className="h-8 w-8 text-white" />,
      title: t("home.features.items.3.title"),
      description: t("home.features.items.3.description"),
      gradient: "from-purple-500 to-pink-500",
      shadow: "shadow-purple-500/20",
    },
  ];

  const steps = [
    {
      number: "01",
      title: t("home.process.steps.1.title"),
      description: t("home.process.steps.1.description"),
      icon: <Target className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "02",
      title: t("registration.steps.companyInfo"),
      description: t("home.process.steps.2.description"),
      icon: <Building2 className="h-6 w-6" />,
      color: "from-indigo-500 to-purple-500",
    },
    {
      number: "03",
      title: t("registration.steps.contactPerson"),
      description: t("home.process.steps.3.description"),
      icon: <Users className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "04",
      title: t("registration.steps.documents"),
      description: t("home.process.steps.4.description"),
      icon: <FileText className="h-6 w-6" />,
      color: "from-pink-500 to-rose-500",
    },
    {
      number: "05",
      title: t("registration.steps.reviewSubmit"),
      description: t("home.process.steps.5.description"),
      icon: <Send className="h-6 w-6" />,
      color: "from-rose-500 to-orange-500",
    },
  ];

  const certificationTypes = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: t("certification.page.certificationType.domesticType"),
      description: t("certification.page.certificationType.domestic.description"),
      features: [
        t("certification.page.certificationType.domesticOptions.system"),
        t("certification.page.certificationType.domesticOptions.services"),
        t("certification.page.certificationType.domesticOptions.product"),
      ],
      gradient: "from-blue-500 to-cyan-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: t("certification.page.certificationType.standard.title"),
      description: t("certification.page.certificationType.standard.description"),
      features: [
        
      ],
      gradient: "from-purple-500 to-pink-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  const requestTypeChart = [
    {
      label: t("certification.documentTypes"),
      style: { background: "#2563eb", color: "#ffffff", border: "1px solid #2563eb" },
      expanded: true,
      children: [
        {
          label: t("certification.page.certificationType.domesticType"),
          style: { background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" },
          expanded: true,
          children: [
            { label: t("certification.page.certificationType.domesticOptions.system"), style: { background: "#ffffff", color: "#334155", border: "1px solid #dbeafe" } },
            { label: t("certification.page.certificationType.domesticOptions.services"), style: { background: "#ffffff", color: "#334155", border: "1px solid #dbeafe" } },
            { label: t("certification.page.certificationType.domesticOptions.product"), style: { background: "#ffffff", color: "#334155", border: "1px solid #dbeafe" } },
          ],
        },
        {
          label: t("certification.page.certificationType.standard.title"),
          style: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
          expanded: true,
        },
      ],
    },
  ];

  return (
    <div className="overflow-hidden pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative flex min-h-[460px] items-center justify-center overflow-hidden bg-slate-950 text-white sm:min-h-[500px] lg:min-h-[580px]">
        <img
          key={currentHeroSlide.image}
          src={currentHeroSlide.image}
          alt=""
          className="absolute inset-0 block h-full w-full object-cover object-center transition-opacity duration-700"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-slate-950/15" />
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 hidden overflow-hidden">
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

        <div className="relative container mx-auto px-4 py-20 sm:py-24 lg:py-28">
          <div className="mx-auto max-w-4xl text-center" aria-live="polite">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-3 py-1.5 mb-6 border border-white/20">
              {/* <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> */}
              <span className="text-xs font-medium">{t("home.badge")}</span>
            </div>

            {/* Main heading */}
            <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
              <span>
                {sliderTitle}
              </span>
            </h1>

            {/* Description */}
            <p className="mb-6 max-w-2xl text-base font-medium leading-relaxed text-slate-100 drop-shadow-md md:mx-auto md:text-lg">
              {sliderDescription}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/registration")}
                className="group relative inline-flex items-center bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-semibold text-base hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  {t("home.hero.cta.start")}
                  {/* <Rocket className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /> */}
                </span>
              </button>

              <button
                onClick={() => navigate("/certification-detals")}
                className="inline-flex items-center bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                {t("home.hero.cta.search")}
                {/* <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /> */}
              </button>
            </div>
          </div>
        </div>

        <button type="button" aria-label={t("home.hero.previousSlide")} onClick={() => setActiveSlide((activeSlide - 1 + heroSlides.length) % heroSlides.length)} className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-5 sm:h-11 sm:w-11">
          <ArrowRight className="h-5 w-5 rotate-180" />
        </button>
        <button type="button" aria-label={t("home.hero.nextSlide")} onClick={() => setActiveSlide((activeSlide + 1) % heroSlides.length)} className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-5 sm:h-11 sm:w-11">
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {heroSlides.map((slide, index) => (
            <button key={slide.image} type="button" aria-label={`${t("home.hero.goToSlide")} ${index + 1}`} onClick={() => setActiveSlide(index)} className={`h-2.5 rounded-full transition-all ${index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80"}`} />
          ))}
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
              fillOpacity="0.8"
            />
          </svg>
        </div>
      </section>

      {/* Certification Types Preview */}
      <section className="py-20 bg-linear-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("certification.page.certificationType.certificationTypeLabel")}
            </h2>
      
          </div>

          <div className="mx-auto max-w-6xl overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-8">
            <OrganizationChart
              className="request-type-chart"
              value={requestTypeChart}
              nodeTemplate={(node) => (
                <div dir={i18n.dir()} className="min-w-40 px-4 py-3 text-center text-sm font-semibold">
                  {node.label}
                </div>
              )}
            />
            <style>{`
              .request-type-chart {
                min-width: max-content;
                direction: ltr;
              }

              .request-type-chart .p-organizationchart-table {
                border-collapse: separate !important;
                border-spacing: 0 !important;
                direction: ltr !important;
              }

              .request-type-chart .p-organizationchart-node-content {
                overflow: hidden;
                border-radius: 0.75rem !important;
                padding: 0 !important;
                box-shadow: 0 4px 12px rgb(15 23 42 / 0.1);
              }

              .request-type-chart .p-node-toggler {
                display: none !important;
              }

              .request-type-chart .p-organizationchart-line-down {
                margin: 0 auto !important;
                height: 24px !important;
                width: 2px !important;
                border: 0 !important;
                background-color: #94a3b8 !important;
              }

              .request-type-chart .p-organizationchart-line-top {
                border-top: 2px solid #94a3b8 !important;
              }

              .request-type-chart .p-organizationchart-line-left {
                border-right: 1px solid #94a3b8 !important;
              }

              .request-type-chart .p-organizationchart-line-right {
                border-left: 1px solid #94a3b8 !important;
              }

              @media (max-width: 767px) {
                .request-type-chart .p-organizationchart-table > tbody > tr > td {
                  padding-inline: 0.35rem !important;
                }

                .request-type-chart .p-organizationchart-node-content > div > div {
                  min-width: 8.5rem;
                  max-width: 11rem;
                  white-space: normal;
                }
              }
            `}</style>
          </div>
          {/*
          <div className="relative mx-auto max-w-6xl">
            <div className="relative z-10 mx-auto mb-10 max-w-sm rounded-2xl border-2 border-blue-200 bg-white p-5 text-center shadow-lg">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {t("certification.page.requestType.title")}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {t("certification.page.requestType.subtitle")}
              </p>
            </div>
            <div className="absolute left-1/2 top-28 hidden h-8 w-px -translate-x-1/2 bg-blue-200 md:block" />
            <div className="absolute left-1/4 right-1/4 top-36 hidden h-px bg-blue-200 md:block" />
            <div className="grid gap-8 md:grid-cols-2">
            {certificationTypes.map((type, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${type.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                ></div>

                <div
                  className={`relative mb-6 w-16 h-16 ${type.lightBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}
                >
                  <div className={type.textColor}>{type.icon}</div>
                </div>

                <h3
                  className={`text-xl font-bold mb-3 group-hover:${type.textColor} transition-colors`}
                >
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-4">{type.description}</p>

                {type.features.length > 0 && <div className="relative mt-6 border-t border-slate-100 pt-5">
                  <div className="absolute -top-1 left-8 h-2 w-2 rounded-full bg-slate-300" />
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {type.title}
                  </div>
                  <div className={`grid gap-3 ${type.features.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                  {type.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className={`flex min-h-16 items-center gap-2 rounded-xl border ${type.border} ${type.lightBg} px-3 py-3 text-sm font-medium text-slate-700 transition-transform duration-300 hover:-translate-y-1`}
                    >
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white ${type.textColor} shadow-sm`}>
                        <CheckCircle className="h-4 w-4" />
                      </span>
                      <span>{feature}</span>
                    </div>
                  ))}
                  </div>
                </div>
                }

                <button
                  onClick={() => navigate("/registration")}
                  className={`inline-flex items-center text-sm font-semibold ${type.textColor} hover:gap-2 transition-all`}
                >
                  {t("home.certificationTypes.learnMore")}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${type.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
                ></div>
              </div>
            ))}
            </div>
          </div> */}
        </div>
      </section>

      {/* Process Steps Section */}
      <section className="py-24 bg-linear-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium text-blue-600">
                {t("home.process.badge")}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t("home.process.title")}{" "}
              <span className="relative">
                <span className="relative z-10 text-blue-600"></span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-blue-100 z-0"></span>
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("home.process.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-x-10 lg:gap-y-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="relative z-10 bg-white rounded-2xl p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center space-x-3 mb-5">
                    <div
                      className={`w-12 h-12 rounded-xl bg-linear-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                    >
                      {step.number}
                    </div>
                    <div className="text-blue-600 bg-blue-50 rounded-lg p-2" aria-hidden="true">
                      {step.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {step.description}
                  </p>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              {t("home.features.badge")}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              {t("home.features.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}
                ></div>

                <div className="relative mb-6 flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${feature.gradient} shadow-lg ${feature.shadow} transition-transform duration-500 group-hover:scale-110`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                    {feature.title}
                  </h3>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r ${feature.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-3xl`}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t("home.cta.title")}
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            {t("home.cta.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/registration")}
              className="group inline-flex items-center bg-white text-blue-600 px-10 py-5 rounded-2xl font-semibold text-xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              {t("home.cta.buttons.start")}
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-semibold text-xl hover:bg-white/20 transition-all duration-300 border border-white/30"
            >
              {t("home.cta.buttons.contact")}
            </button>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
            {[
              t("home.cta.badges.iso"),
              t("home.cta.badges.government"),
              t("home.cta.badges.international"),
              t("home.cta.badges.support"),
            ].map((badge, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-white/80"
              >
                <CheckCircle className="h-4 w-4 text-green-300" />
                <span className="text-sm">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
