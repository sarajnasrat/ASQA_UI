export interface DistrictFormProps {
  defaultValues?: {
    provinceId?: number | null; // can be null if no default
    translations?: Record<string, string>; // e.g. { en: '', fa: '', ps: '' }
  };

  provinces: {
    id: number;
    provinceName: string; // matches the property used in Dropdown optionLabel
  }[];

  onSubmit: (data: any) => void;

  onCancel: () => void;

  isSubmitting?: boolean;
}