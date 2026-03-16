// components/feature/registration/CompanyForm.tsx
import React, { useState, useEffect } from 'react';
import { Building2, Globe, Calendar, Upload, X, Plus } from 'lucide-react';
import { useAppToast } from '../../../../hooks/useToast';
import CategoryService from '../../../../services/category.service';
import CompanyService from '../../../../services/company.service';

interface Category {
  id: number;
  name: string;
}

interface SocialLink {
  socialLinkName: string;
  address: string;
}

interface CompanyFormProps {
  onSuccess: (id: number) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const COMPANY_TYPES = [
  { value: 'PRIVATE', label: 'Private' },
  { value: 'PUBLIC', label: 'Public' },
  { value: 'GOVERNMENT', label: 'Government' },
  { value: 'EDUCATIONAL_INSTITUTIONS', label: 'Educational Institution' },
  { value: 'OTHER', label: 'Other' }
];

const CompanyForm: React.FC<CompanyFormProps> = ({ 
  onSuccess, 
  onCancel, 
  isSubmitting, 
  setIsSubmitting 
}) => {
  const { showToast } = useAppToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newSocialLink, setNewSocialLink] = useState<SocialLink>({ socialLinkName: '', address: '' });
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [businessLogo, setBusinessLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [businessLogoPreview, setBusinessLogoPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    companyNameEN: '',
    companyNameDR: '',
    companyNamePS: '',
    email: '',
    phoneNumber: '',
    address: '',
    mainBranchAddress: '',
    activityPlace: '',
    activityType: '',
    jawazNumber: '',
    jawazExpiryDate: '',
    jawazIssueDate: '',
    tinNumber: '',
    websiteUrl: '',
    establishYear: '',
    companyOwnerNameEn: '',
    companyOwnerNameDr: '',
    companyOwnerNamePs: '',
    companyType: 'PRIVATE' as const,
    aboutCompanyEn: '',
    aboutCompanyDr: '',
    aboutCompanyPs: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await CategoryService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      showToast('error', 'Error', 'Failed to load categories');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'business') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Error', 'Only image files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Error', 'File size must be less than 5MB');
      return;
    }

    if (type === 'logo') {
      setCompanyLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBusinessLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (type: 'logo' | 'business') => {
    if (type === 'logo') {
      setCompanyLogo(null);
      setLogoPreview('');
    } else {
      setBusinessLogo(null);
      setBusinessLogoPreview('');
    }
  };

  const addSocialLink = () => {
    if (newSocialLink.socialLinkName && newSocialLink.address) {
      setSocialLinks([...socialLinks, newSocialLink]);
      setNewSocialLink({ socialLinkName: '', address: '' });
    }
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.companyNameEN) newErrors.companyNameEN = 'Company name (English) is required';
    if (!formData.companyNameDR) newErrors.companyNameDR = 'Company name (Dari) is required';
    if (!formData.companyNamePS) newErrors.companyNamePS = 'Company name (Pashto) is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.mainBranchAddress) newErrors.mainBranchAddress = 'Main branch address is required';
    if (!formData.activityPlace) newErrors.activityPlace = 'Activity place is required';
    if (!formData.activityType) newErrors.activityType = 'Activity type is required';
    if (!formData.jawazNumber) newErrors.jawazNumber = 'Jawaz number is required';
    if (!formData.jawazIssueDate) newErrors.jawazIssueDate = 'Jawaz issue date is required';
    if (!formData.jawazExpiryDate) newErrors.jawazExpiryDate = 'Jawaz expiry date is required';
    if (!formData.tinNumber) newErrors.tinNumber = 'TIN number is required';
    if (!formData.establishYear) newErrors.establishYear = 'Establish year is required';
    if (!formData.companyOwnerNameEn) newErrors.companyOwnerNameEn = 'Owner name (English) is required';
    if (!formData.companyOwnerNameDr) newErrors.companyOwnerNameDr = 'Owner name (Dari) is required';
    if (!formData.companyOwnerNamePs) newErrors.companyOwnerNamePs = 'Owner name (Pashto) is required';
    if (!formData.aboutCompanyEn) newErrors.aboutCompanyEn = 'About company (English) is required';
    if (!formData.aboutCompanyDr) newErrors.aboutCompanyDr = 'About company (Dari) is required';
    if (!formData.aboutCompanyPs) newErrors.aboutCompanyPs = 'About company (Pashto) is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started');
    
    if (!validateForm()) {
      showToast('error', 'Error', 'Please fill in all required fields');
      return;
    }

    if (selectedCategories.length === 0) {
      showToast('error', 'Error', 'Please select at least one category');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      const companyData = {
        ...formData,
        categories: selectedCategories.map(id => ({ id })),
        socialLinks: socialLinks,
        isActive: true,
        logoUrl: '',
        bussinessLogoUrl: '',
        websiteUrl: formData.websiteUrl || ''
      };
      
      formDataToSend.append('company', JSON.stringify(companyData));
      
      if (companyLogo) {
        formDataToSend.append('companyLogo', companyLogo);
      }
      if (businessLogo) {
        formDataToSend.append('bussinessLogo', businessLogo);
      }

      console.log('Sending request to create company');
      const response = await CompanyService.createCompany(formDataToSend);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Check for company ID in various possible locations
      const companyId = response.data?.id || 
                       response.data?.data?.id || 
                       response.data?.companyId;
      
      if (companyId) {
        console.log('Company created successfully with ID:', companyId);
        showToast('success', 'Success', 'Company registered successfully!');
        
        // Call onSuccess with the company ID
        onSuccess(companyId);
        
        console.log('onSuccess called with ID:', companyId);
      } else {
        console.error('No company ID in response:', response.data);
        showToast('error', 'Error', 'Company created but no ID returned');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.errors?.[0] || 
                          error.response?.data?.message || 
                          'Failed to create company';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
      console.log('Form submission completed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Building2 className="h-5 w-5 text-blue-600 mr-2" />
          Basic Information
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name (English) *
            </label>
            <input
              type="text"
              name="companyNameEN"
              value={formData.companyNameEN}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyNameEN ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.companyNameEN && (
              <p className="mt-1 text-sm text-red-500">{errors.companyNameEN}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name (Dari) *
            </label>
            <input
              type="text"
              name="companyNameDR"
              value={formData.companyNameDR}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyNameDR ? 'border-red-500' : 'border-gray-300'
              }`}
              dir="rtl"
            />
            {errors.companyNameDR && (
              <p className="mt-1 text-sm text-red-500">{errors.companyNameDR}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name (Pashto) *
            </label>
            <input
              type="text"
              name="companyNamePS"
              value={formData.companyNamePS}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyNamePS ? 'border-red-500' : 'border-gray-300'
              }`}
              dir="rtl"
            />
            {errors.companyNamePS && (
              <p className="mt-1 text-sm text-red-500">{errors.companyNamePS}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Type *
            </label>
            <select
              name="companyType"
              value={formData.companyType}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {COMPANY_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={2}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              name="websiteUrl"
              value={formData.websiteUrl}
              onChange={handleInputChange}
              placeholder="https://www.company.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Globe className="h-5 w-5 text-blue-600 mr-2" />
          Business Details
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Branch Address *
            </label>
            <input
              type="text"
              name="mainBranchAddress"
              value={formData.mainBranchAddress}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.mainBranchAddress ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.mainBranchAddress && (
              <p className="mt-1 text-sm text-red-500">{errors.mainBranchAddress}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Place *
            </label>
            <input
              type="text"
              name="activityPlace"
              value={formData.activityPlace}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.activityPlace ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.activityPlace && (
              <p className="mt-1 text-sm text-red-500">{errors.activityPlace}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity Type *
            </label>
            <input
              type="text"
              name="activityType"
              value={formData.activityType}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.activityType ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.activityType && (
              <p className="mt-1 text-sm text-red-500">{errors.activityType}</p>
            )}
          </div>
        </div>
      </div>

      {/* Jawaz Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Jawaz Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jawaz Number *
            </label>
            <input
              type="text"
              name="jawazNumber"
              value={formData.jawazNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.jawazNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.jawazNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.jawazNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TIN Number *
            </label>
            <input
              type="text"
              name="tinNumber"
              value={formData.tinNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.tinNumber ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.tinNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.tinNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jawaz Issue Date *
            </label>
            <input
              type="date"
              name="jawazIssueDate"
              value={formData.jawazIssueDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.jawazIssueDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.jawazIssueDate && (
              <p className="mt-1 text-sm text-red-500">{errors.jawazIssueDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jawaz Expiry Date *
            </label>
            <input
              type="date"
              name="jawazExpiryDate"
              value={formData.jawazExpiryDate}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.jawazExpiryDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.jawazExpiryDate && (
              <p className="mt-1 text-sm text-red-500">{errors.jawazExpiryDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Owner Information</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name (English) *
            </label>
            <input
              type="text"
              name="companyOwnerNameEn"
              value={formData.companyOwnerNameEn}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyOwnerNameEn ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.companyOwnerNameEn && (
              <p className="mt-1 text-sm text-red-500">{errors.companyOwnerNameEn}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name (Dari) *
            </label>
            <input
              type="text"
              name="companyOwnerNameDr"
              value={formData.companyOwnerNameDr}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyOwnerNameDr ? 'border-red-500' : 'border-gray-300'
              }`}
              dir="rtl"
            />
            {errors.companyOwnerNameDr && (
              <p className="mt-1 text-sm text-red-500">{errors.companyOwnerNameDr}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner Name (Pashto) *
            </label>
            <input
              type="text"
              name="companyOwnerNamePs"
              value={formData.companyOwnerNamePs}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.companyOwnerNamePs ? 'border-red-500' : 'border-gray-300'
              }`}
              dir="rtl"
            />
            {errors.companyOwnerNamePs && (
              <p className="mt-1 text-sm text-red-500">{errors.companyOwnerNamePs}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Establish Year *
            </label>
            <input
              type="date"
              name="establishYear"
              value={formData.establishYear}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.establishYear ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.establishYear && (
              <p className="mt-1 text-sm text-red-500">{errors.establishYear}</p>
            )}
          </div>
        </div>
      </div>

      {/* About Company */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">About Company</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Company (English) *
            </label>
            <textarea
              name="aboutCompanyEn"
              value={formData.aboutCompanyEn}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.aboutCompanyEn ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.aboutCompanyEn && (
              <p className="mt-1 text-sm text-red-500">{errors.aboutCompanyEn}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Company (Dari) *
            </label>
            <textarea
              name="aboutCompanyDr"
              value={formData.aboutCompanyDr}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.aboutCompanyDr ? 'border-red-500' : 'border-gray-300'
              }`}
              dir="rtl"
            />
            {errors.aboutCompanyDr && (
              <p className="mt-1 text-sm text-red-500">{errors.aboutCompanyDr}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About Company (Pashto) *
            </label>
            <textarea
              name="aboutCompanyPs"
              value={formData.aboutCompanyPs}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.aboutCompanyPs ? 'border-red-500' : 'border-gray-300'
              }`}
              dir="rtl"
            />
            {errors.aboutCompanyPs && (
              <p className="mt-1 text-sm text-red-500">{errors.aboutCompanyPs}</p>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Links</h2>
        
        <div className="flex gap-4 mb-4">
          <select
            value={newSocialLink.socialLinkName}
            onChange={(e) => setNewSocialLink({...newSocialLink, socialLinkName: e.target.value})}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select platform</option>
            <option value="Facebook">Facebook</option>
            <option value="Twitter">Twitter</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Instagram">Instagram</option>
            <option value="Website">Website</option>
          </select>
          <input
            type="url"
            value={newSocialLink.address}
            onChange={(e) => setNewSocialLink({...newSocialLink, address: e.target.value})}
            placeholder="https://..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={addSocialLink}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="text-sm text-gray-600">{link.socialLinkName}: {link.address}</span>
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Logos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Company Logos</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Company logo preview" className="max-h-32 mx-auto mb-2" />
                  <button
                    type="button"
                    onClick={() => removeFile('logo')}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Click to upload company logo</p>
                </>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'logo')}
                accept="image/*"
                className="hidden"
                id="company-logo"
              />
              <label
                htmlFor="company-logo"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                {logoPreview ? 'Change Logo' : 'Select Logo'}
              </label>
            </div>
          </div>

          {/* Business Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
              {businessLogoPreview ? (
                <div className="relative">
                  <img src={businessLogoPreview} alt="Business logo preview" className="max-h-32 mx-auto mb-2" />
                  <button
                    type="button"
                    onClick={() => removeFile('business')}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Click to upload business logo</p>
                </>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, 'business')}
                accept="image/*"
                className="hidden"
                id="business-logo"
              />
              <label
                htmlFor="business-logo"
                className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                {businessLogoPreview ? 'Change Logo' : 'Select Logo'}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
    <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save & Continue'
          )}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;