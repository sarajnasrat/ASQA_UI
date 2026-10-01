import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { OrganizationChart } from "primereact/organizationchart";
import { Timeline } from "primereact/timeline";
import { Award, Building2, CheckCircle2, ClipboardCheck, Clock, FileText, Send, Shield, Target, UserRound, Users } from "lucide-react";

const Services = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "dr" || i18n.language === "ps" || i18n.dir() === "rtl";
  const stepMeta = [
    { number: "01", icon: Target }, { number: "02", icon: Building2 },
    { number: "03", icon: UserRound }, { number: "04", icon: FileText },
    { number: "05", icon: Send },
  ];
  const steps = stepMeta.map((step, index) => ({
    ...step,
    title: t(`website.services.steps.${index + 1}.title`),
    description: t(`website.services.steps.${index + 1}.description`),
    details: [1, 2, 3].map((item) => t(`website.services.steps.${index + 1}.details.${item}`)),
  }));
  const chart = [{
    label: t("certification.page.certificationType.certificationTypeLabel"),
    style: { background: "#2563eb", color: "#fff", border: "1px solid #2563eb" },
    expanded: true,
    children: (isRtl ? ["standard", "quality"] : ["quality", "standard"]).map((type) =>
      type === "quality"
        ? {
            label: t("certification.page.certificationType.domesticType"),
            style: { background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" },
            expanded: true,
            children: [
              t("certification.page.certificationType.domesticOptions.system"),
              t("certification.page.certificationType.domesticOptions.services"),
              t("certification.page.certificationType.domesticOptions.product"),
            ].map((label) => ({
              label,
              style: { background: "#fff", color: "#334155", border: "1px solid #dbeafe" },
            })),
          }
        : {
            label: t("certification.page.certificationType.standard.title"),
            style: { background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a" },
            expanded: true,
          },
    ),
  }];
  const benefits = [Award, Shield, Users, Clock].map((Icon, index) => ({
    icon: Icon,
    title: t(`website.services.benefits.items.${index + 1}.title`),
    description: t(`website.services.benefits.items.${index + 1}.description`),
  }));

  return (
    <div className="bg-slate-50 pb-20 pt-24">
      <section
        className="relative overflow-hidden bg-cover bg-center py-24 text-white md:py-32"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(4, 20, 54, 0.96) 0%, rgba(12, 42, 96, 0.84) 52%, rgba(20, 35, 82, 0.58) 100%), url('/static/services-hero.png')",
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
            <ClipboardCheck className="h-4 w-4" />{t("website.services.header.badge")}
          </div>
          <h1 className="mb-5 text-4xl font-bold md:text-6xl">{t("website.services.header.title")}</h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-blue-100 md:text-xl">{t("website.services.header.description")}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{t("website.services.chart.title")}</h2>
            <p className="mx-auto max-w-2xl text-slate-600">{t("website.services.chart.description")}</p>
          </div>
          <div className="mx-auto max-w-7xl overflow-x-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-10">
            <OrganizationChart className="services-process-chart min-w-max" value={chart} nodeTemplate={(node) => (
              <div dir={isRtl ? "rtl" : "ltr"} className="min-w-40 px-4 py-3 text-center text-sm font-semibold">{node.label}</div>
            )} />
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-14 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">{t("website.services.timeline.title")}</h2>
            <p className="mx-auto max-w-2xl text-slate-600">{t("website.services.timeline.description")}</p>
          </div>
          <div dir={isRtl ? "rtl" : "ltr"} className={`services-timeline ${isRtl ? "rtl" : "ltr"}`}>
          <Timeline value={steps} align="alternate" marker={(step) => {
            const Icon = step.icon;
            return <span className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-lg"><Icon className="h-5 w-5" /></span>;
          }} content={(step) => (
            <article dir={isRtl ? "rtl" : "ltr"} className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-start shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 text-sm font-bold text-blue-600">{t("website.services.timeline.step")} {step.number}</div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mb-5 leading-7 text-slate-600">{step.description}</p>
              <ul className="space-y-3">{step.details.map((detail) => (
                <li key={detail} className="flex items-start gap-3 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /><span>{detail}</span></li>
              ))}</ul>
            </article>
          )} />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center"><h2 className="mb-4 text-3xl font-bold text-slate-900">{t("website.services.benefits.title")}</h2><p className="text-slate-600">{t("website.services.benefits.description")}</p></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">{benefits.map(({ icon: Icon, title, description }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon className="h-7 w-7" /></div><h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3><p className="text-sm leading-6 text-slate-600">{description}</p></article>
          ))}</div>
        </div>
      </section>

      <section className="container mx-auto px-4"><div className="rounded-3xl bg-linear-to-r from-blue-700 to-indigo-700 px-6 py-14 text-center text-white shadow-xl md:px-12"><h2 className="mb-4 text-3xl font-bold">{t("website.services.cta.title")}</h2><p className="mx-auto mb-8 max-w-2xl text-blue-100">{t("website.services.cta.description")}</p><Link to="/registration" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-blue-700 transition hover:bg-blue-50">{t("website.services.cta.button")}<Send className="h-4 w-4 rtl:rotate-180" /></Link></div></section>

      <style>{`
        .services-process-chart { direction: ltr; }
        .services-process-chart .p-organizationchart-table { border-collapse: separate; border-spacing: 0; direction: ltr; }
        .services-process-chart .p-organizationchart-node-content { overflow: hidden; border-radius: .75rem; padding: 0; box-shadow: 0 4px 12px rgb(15 23 42 / .08); }
        .services-process-chart .p-node-toggler { display: none; }
        .services-process-chart .p-organizationchart-line-down { width: 2px; height: 24px; border: 0; background: #94a3b8; }
        .services-process-chart .p-organizationchart-line-top { border-top: 2px solid #94a3b8; }
        .services-process-chart .p-organizationchart-line-left { border-right-color: #94a3b8; }
        .services-process-chart .p-organizationchart-line-right { border-left-color: #94a3b8; }
        .p-timeline-event-connector { background: #bfdbfe; width: 3px; }
        .services-timeline.rtl { direction: rtl; }
        .services-timeline.rtl .p-timeline-event-content,
        .services-timeline.rtl .p-timeline-event-opposite { text-align: right; }
        .services-timeline.ltr .p-timeline-event-content,
        .services-timeline.ltr .p-timeline-event-opposite { text-align: left; }
        @media (max-width: 767px) { .p-timeline.p-timeline-alternate .p-timeline-event { flex-direction: row; } .p-timeline.p-timeline-alternate .p-timeline-event-opposite { display: none; } .p-timeline.p-timeline-alternate .p-timeline-event-content { text-align: start; padding-inline-start: 1rem; } }
      `}</style>
    </div>
  );
};

export default Services;
