export interface CountryFormProps {
  defaultValues?: {
    countryCode?: string;
    countryName?: string;
    translations?: Record<string, string>;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}