// pages/Contact.tsx
import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useToast } from "../../../../hooks/ToastContext";
import { handleApi } from "../../../../hooks/handleApi";
import CommentService from "../../../../services/comment.service";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      email: "",
      subject: "",
      message: "",
    };

    if (!formData.name) newErrors.name = t("website.contact.form.validation.nameRequired");
    if (!formData.email) {
      newErrors.email = t("website.contact.form.validation.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("website.contact.form.validation.emailInvalid");
    }
    if (!formData.subject) newErrors.subject = t("website.contact.form.validation.subjectRequired");
    if (!formData.message) newErrors.message = t("website.contact.form.validation.messageRequired");

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      fullName: formData.name,
      email: formData.email,
      subject: formData.subject,
      body: formData.message,
    };

    const response = await handleApi(
      () => CommentService.createComment(payload),
      () => showSuccess(t("common.success"), t("website.contact.form.successToast")),
      showError,
    );

    setIsSubmitting(false);

    if (response) {
      setIsSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      setTimeout(() => setIsSubmitted(false), 5000);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: t("website.contact.cards.phone.title"),
      details: ["+93 (555) 123-4567", "+93 (555) 987-6543"],
      action: t("website.contact.cards.phone.action"),
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: t("website.contact.cards.email.title"),
      details: ["info@asqa.com", "support@asqa.com"],
      action: t("website.contact.cards.email.action"),
    },
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: t("website.contact.cards.office.title"),
      details: [t("website.contact.map.addressLine1"), t("website.contact.map.addressLine2")],
      action: t("website.contact.cards.office.action"),
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: t("website.contact.cards.hours.title"),
      details: [t("website.contact.cards.hours.line1"), t("website.contact.cards.hours.line2")],
      action: t("website.contact.cards.hours.action"),
    },
  ];

  const position: LatLngExpression = [34.5553, 69.2075];

  const faqItems = [
    {
      q: t("website.contact.faq.items.1.question"),
      a: t("website.contact.faq.items.1.answer"),
    },
    {
      q: t("website.contact.faq.items.2.question"),
      a: t("website.contact.faq.items.2.answer"),
    },
    {
      q: t("website.contact.faq.items.3.question"),
      a: t("website.contact.faq.items.3.answer"),
    },
    {
      q: t("website.contact.faq.items.4.question"),
      a: t("website.contact.faq.items.4.answer"),
    },
  ];

  return (
    <div className="pt-24 pb-20">
      <section className="bg-linear-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t("website.contact.header.title")}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t("website.contact.header.description")}
          </p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {info.title}
                </h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-gray-600 text-sm mb-1">
                    {detail}
                  </p>
                ))}
                <p className="text-blue-600 text-sm font-medium mt-2">
                  {info.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {t("website.contact.form.title")}
              </h2>

              {isSubmitted && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                  {t("website.contact.form.successMessage")}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("website.contact.form.labels.name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("website.contact.form.labels.email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("website.contact.form.labels.subject")}
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.subject ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("website.contact.form.labels.message")}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                  }`}
                >
                  <Send className="h-5 w-5" />
                  <span>{isSubmitting ? t("website.contact.form.sending") : t("website.contact.form.submit")}</span>
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
              <div className="h-100 lg:h-125 w-full relative">
                <MapContainer
                  center={position}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                  attributionControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>
                      <div className="text-center">
                        <strong>{t("website.contact.map.popupTitle")}</strong>
                        <br />
                        {t("website.contact.map.addressLine1")}
                        <br />
                        {t("website.contact.map.addressLine2")}
                        <br />
                        <span className="text-sm text-gray-600">
                          {t("website.contact.map.country")}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {t("website.contact.map.title")}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {t("website.contact.map.description")}
                </p>
                <a
                  href="https://maps.google.com/?q=34.5553,69.2075"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center"
                >
                  {t("website.contact.map.directions")}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            {t("website.contact.faq.title")}
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;