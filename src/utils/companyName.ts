type LocalizedCompany = {
  companyNameEN?: string | null;
  companyNameDR?: string | null;
  companyNamePS?: string | null;
};

export const getLocalizedCompanyName = (
  company: LocalizedCompany | null | undefined,
  language: string,
): string => {
  if (!company) return "";

  const languageCode = language.split("-")[0];
  const localizedName =
    languageCode === "dr"
      ? company.companyNameDR
      : languageCode === "ps"
        ? company.companyNamePS
        : company.companyNameEN;

  return (
    localizedName ||
    company.companyNameEN ||
    company.companyNameDR ||
    company.companyNamePS ||
    ""
  );
};
