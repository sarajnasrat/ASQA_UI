// pages/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CheckCircle,
  FileText,
  Award,
  Users,
  Clock,
  Shield,
  TrendingUp,
  Globe,
  Building2,
  ArrowRight,
  Star,
  Sparkles,
  Target,
  HeartHandshake,
  Rocket,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      title: t("home.process.steps.2.title"),
      description: t("home.process.steps.2.description"),
      icon: <Building2 className="h-6 w-6" />,
      color: "from-indigo-500 to-purple-500",
    },
    {
      number: "03",
      title: t("home.process.steps.3.title"),
      description: t("home.process.steps.3.description"),
      icon: <Users className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "04",
      title: t("home.process.steps.4.title"),
      description: t("home.process.steps.4.description"),
      icon: <Award className="h-6 w-6" />,
      color: "from-pink-500 to-rose-500",
    },
  ];

  const certificationTypes = [
    {
      icon: <Building2 className="h-8 w-8" />,
      title: t("home.certificationTypes.domestic.title"),
      description: t("home.certificationTypes.domestic.description"),
      features: [
        t("home.certificationTypes.domestic.features.1"),
        t("home.certificationTypes.domestic.features.2"),
        t("home.certificationTypes.domestic.features.3"),
      ],
      gradient: "from-blue-500 to-cyan-500",
      lightBg: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: t("home.certificationTypes.international.title"),
      description: t("home.certificationTypes.international.description"),
      features: [
        t("home.certificationTypes.international.features.1"),
        t("home.certificationTypes.international.features.2"),
        t("home.certificationTypes.international.features.3"),
      ],
      gradient: "from-indigo-500 to-purple-500",
      lightBg: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: t("home.certificationTypes.standard.title"),
      description: t("home.certificationTypes.standard.description"),
      features: [
        t("home.certificationTypes.standard.features.1"),
        t("home.certificationTypes.standard.features.2"),
        t("home.certificationTypes.standard.features.3"),
      ],
      gradient: "from-purple-500 to-pink-500",
      lightBg: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="overflow-hidden pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[550px] flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
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
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              <span className="text-xs font-medium">{t("home.badge")}</span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="bg-linear-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                {t("home.hero.title")}
              </span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg mb-6 text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t("home.hero.description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/certification/select-type")}
                className="group relative inline-flex items-center bg-linear-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-xl font-semibold text-base hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  {t("home.hero.cta.start")}
                  <Rocket className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => navigate("/about")}
                className="inline-flex items-center bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                {t("home.hero.cta.learn")}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
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
              {t("home.certificationTypes.title")}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("home.certificationTypes.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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

                <h3 className={`text-xl font-bold mb-3 group-hover:${type.textColor} transition-colors`}>
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-4">{type.description}</p>

                <ul className="space-y-2 mb-6">
                  {type.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className={`h-4 w-4 ${type.textColor} mr-2`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate("/certification/select-type")}
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col">
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-linear-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}
                    >
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {step.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {t("home.process.steps.step")} {step.number}
                      </span>
                      <div
                        className={`w-8 h-1 bg-linear-to-r ${step.color} rounded-full opacity-50`}
                      ></div>
                    </div>
                  </div>
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

                <div
                  className={`relative mb-8 w-16 h-16 bg-linear-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform duration-500`}
                >
                  {feature.icon}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
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
              onClick={() => navigate("/certification/select-type")}
              className="group inline-flex items-center bg-white text-blue-600 px-10 py-5 rounded-2xl font-semibold text-xl hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              {t("home.cta.buttons.start")}
              <Rocket className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate("/contact")}
              className="inline-flex items-center bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-2xl font-semibold text-xl hover:bg-white/20 transition-all duration-300 border border-white/30"
            >
              {t("home.cta.buttons.contact")}
              <HeartHandshake className="ml-2 h-5 w-5" />
            </button>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
            {[
              t("home.cta.badges.iso"),
              t("home.cta.badges.government"),
              t("home.cta.badges.international"),
              t("home.cta.badges.support"),
            ].map((badge, index) => (
              <div key={index} className="flex items-center space-x-2 text-white/80">
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