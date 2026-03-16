// components/feature/registration/ContactPersonForm.tsx
import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, MapPin, Home, Building } from 'lucide-react';

import DistrictService from '../../../../services/district.service';
import { useAppToast } from '../../../../hooks/useToast';
import CompanyContactPersonService from '../../../../services/company-contact-person.service';

// Define types based on backend entities
interface District {
  id: number;
  name?: string;
  nameEn?: string;
  nameDr?: string;
  namePs?: string;
}

interface Address {
  district?: District | null;
  districtId?: number;
  details: string;
  addressType: AddressType;
}

enum AddressType {
  HEAD_OFFICE = 'HOME',
  BRANCH_OFFICE = 'WORK',
  FACTORY = 'FACTORY',
  WAREHOUSE = 'WAREHOUSE',
  OTHER = 'OTHER'
}

interface ContactPersonFormProps {
  companyId: number;
  onSuccess: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (value: boolean) => void;
}

const ContactPersonForm: React.FC<ContactPersonFormProps> = ({
  companyId,
  onSuccess,
  onCancel,
  isSubmitting,
  setIsSubmitting
}) => {
  const { showToast } = useAppToast();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
  });

  const [addresses, setAddresses] = useState<Address[]>([
    {
      districtId: undefined,
      details: '',
      addressType: AddressType.HEAD_OFFICE
    }
  ]);

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [addressErrors, setAddressErrors] = useState<any[]>([]);

  const addressTypeOptions = [
    { value: AddressType.HEAD_OFFICE, label: 'Head Office' },
    { value: AddressType.BRANCH_OFFICE, label: 'Branch Office' },
    { value: AddressType.FACTORY, label: 'Factory' },
    { value: AddressType.WAREHOUSE, label: 'Warehouse' },
    { value: AddressType.OTHER, label: 'Other' }
  ];

  useEffect(() => {
    loadDistricts();
  }, []);

  const loadDistricts = async () => {
    setLoadingDistricts(true);
    try {
      const response = await DistrictService.getAllDistricts();
      setDistricts(response.data || []);
    } catch (error) {
      console.error('Error loading districts:', error);
      showToast('error', 'Error', 'Failed to load districts');
    } finally {
      setLoadingDistricts(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.position) newErrors.position = 'Position is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';

    setErrors(newErrors);

    // Validate addresses
    const newAddressErrors: any[] = [];
    let hasAddressError = false;

    addresses.forEach((address, index) => {
      const addressError: any = {};
      if (!address.districtId) {
        addressError.districtId = 'District is required';
        hasAddressError = true;
      }
      if (!address.details) {
        addressError.details = 'Address details are required';
        hasAddressError = true;
      }
      if (!address.addressType) {
        addressError.addressType = 'Address type is required';
        hasAddressError = true;
      }
      newAddressErrors[index] = addressError;
    });

    setAddressErrors(newAddressErrors);

    return Object.keys(newErrors).length === 0 && !hasAddressError;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddressChange = (index: number, field: keyof Address, value: any) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = { ...updatedAddresses[index], [field]: value };
    setAddresses(updatedAddresses);

    // Clear error for this field
    if (addressErrors[index]?.[field]) {
      const updatedErrors = [...addressErrors];
      updatedErrors[index] = { ...updatedErrors[index], [field]: '' };
      setAddressErrors(updatedErrors);
    }
  };

  const addAddress = () => {
    setAddresses([
      ...addresses,
      {
        districtId: undefined,
        details: '',
        addressType: AddressType.BRANCH_OFFICE
      }
    ]);
    setAddressErrors([...addressErrors, {}]);
  };

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index));
      setAddressErrors(addressErrors.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare addresses with district objects
      const addressesToSend = addresses.map(addr => ({
        district: addr.districtId ? { id: addr.districtId } : null,
        details: addr.details,
        addressType: addr.addressType
      }));

      // Prepare contact person data matching backend entity
      const contactPersonData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        position: formData.position,
        company: { id: companyId },
        addresses: addressesToSend
      };

      console.log('Sending contact person data:', contactPersonData);

      const response = await CompanyContactPersonService.create(contactPersonData);
      
      console.log('Contact person response:', response);
      
      showToast('success', 'Success', 'Contact person added successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating contact person:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0] || 
                          'Failed to add contact person';
      showToast('error', 'Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
        <User className="h-6 w-6 text-blue-600 mr-2" />
        Contact Person Information
      </h2>

      <div className="space-y-6">
        {/* Contact Person Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
              Position/Role *
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.position ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., CEO, Manager"
            />
            {errors.position && (
              <p className="mt-1 text-sm text-red-500">{errors.position}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Mail className="h-4 w-4 text-gray-400 mr-2" />
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Phone className="h-4 w-4 text-gray-400 mr-2" />
              Phone Number *
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+93 123 456 789"
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Addresses Section */}
        <div className="border-t pt-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              Addresses
            </h3>
            <button
              type="button"
              onClick={addAddress}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center"
            >
              <Building className="h-4 w-4 mr-2" />
              Add Address
            </button>
          </div>

          {addresses.map((address, index) => (
            <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg relative">
              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAddress(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              )}
              
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Address {index + 1}
              </h4>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* District Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District *
                  </label>
                  <select
                    value={address.districtId || ''}
                    onChange={(e) => handleAddressChange(index, 'districtId', e.target.value ? Number(e.target.value) : undefined)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      addressErrors[index]?.districtId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingDistricts}
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.nameEn || district.name || `District ${district.id}`}
                      </option>
                    ))}
                  </select>
                  {addressErrors[index]?.districtId && (
                    <p className="mt-1 text-xs text-red-500">{addressErrors[index].districtId}</p>
                  )}
                </div>

                {/* Address Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address Type *
                  </label>
                  <select
                    value={address.addressType}
                    onChange={(e) => handleAddressChange(index, 'addressType', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      addressErrors[index]?.addressType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {addressTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {addressErrors[index]?.addressType && (
                    <p className="mt-1 text-xs text-red-500">{addressErrors[index].addressType}</p>
                  )}
                </div>

                {/* Address Details */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details *
                  </label>
                  <input
                    type="text"
                    value={address.details}
                    onChange={(e) => handleAddressChange(index, 'details', e.target.value)}
                    placeholder="Street, building, etc."
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      addressErrors[index]?.details ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {addressErrors[index]?.details && (
                    <p className="mt-1 text-xs text-red-500">{addressErrors[index].details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
      </div>
    </form>
  );
};

export default ContactPersonForm;