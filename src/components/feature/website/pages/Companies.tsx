// pages/Companies.tsx
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppToast } from '../../../../hooks/useToast';
import CompanyService from '../../../../services/company.service';

// Define the Company type based on your interface
interface Company {
  id: number;
  companyNameEN: string;
  companyNameDR: string;
  companyNamePS: string;
  email: string;
  phoneNumber: string;
  address: string;
  logoUrl?: string;
  bussinessLogoUrl?: string;
  active: boolean;
  mainBranchAddress: string;
  activityPlace: string;
  activityType: string;
  jawazNumber: string;
  jawazExpiryDate: string;
  jawazIssueDate: string;
  tinNumber: string;
  websiteUrl?: string;
  establishYear: string;
  companyOwnerNameEn: string;
  companyType: string;
  aboutCompanyEn: string;
  categories: any[];
  socialLinks: any[];
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = 'http://localhost:8080';

const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const { showToast } = useAppToast();

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    // Filter companies based on search term
    if (searchTerm.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company =>
        company.companyNameEN.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.mainBranchAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, companies]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: 0,
        size: 100, // Load more companies for better UX
      };

      const response = await CompanyService.getPaginatedCompanies(params);
      const companyData = response.data.content || response.data.data || [];
      setCompanies(companyData);
      setFilteredCompanies(companyData);
    } catch (error) {
      console.error('Error loading companies:', error);
      showToast('error', 'Error', 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name?.charAt(0)?.toUpperCase() || 'C';
  };

  // Generate a consistent color based on company name
  const getCompanyColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-indigo-500 to-indigo-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-red-500 to-red-600',
      'from-orange-500 to-orange-600',
      'from-yellow-500 to-yellow-600',
      'from-green-500 to-green-600',
      'from-teal-500 to-teal-600',
      'from-cyan-500 to-cyan-600',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 pt-24 pb-20">
      {/* Header with curved design */}
      <div className="relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Decorative circles */}
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white opacity-5 rounded-full"></div>
        <div className="absolute -top-16 -right-16 w-96 h-96 bg-white opacity-5 rounded-full"></div>

        <div className="relative container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
              <Building2 className="h-4 w-4 text-blue-200" />
              <span className="text-sm font-medium">ASQA Certified Companies</span>
            </div>

            {/* Main heading with gradient text */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="bg-linear-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                Our Certified      Companies
              </span>
              <br />
              <span className="bg-linear-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
           
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              Discover the trusted businesses that have successfully completed their ASQA certification and joined our community of excellence.
            </p>

            {/* Search bar with enhanced design */}
            <div className="relative max-w-2xl mx-auto pb-20">
              <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-purple-400 rounded-2xl blur opacity-30"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search companies by name, location, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-5 text-gray-700 bg-white rounded-2xl shadow-2xl focus:ring-4 focus:ring-blue-300 focus:outline-none text-lg"
                />
                <button className="absolute right-2 top-1/2  transform -translate-y-1/2 px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg">
                  Search
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="#f9fafb" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-32">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600"></div>
              <Building2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <p className="mt-6 text-gray-600 text-lg">Loading amazing companies...</p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-8 flex justify-between items-center">
              <p className="text-gray-600 text-lg">
                Showing <span className="font-semibold text-blue-600">{currentCompanies.length}</span> of <span className="font-semibold text-blue-600">{filteredCompanies.length}</span> companies
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>

            {/* Companies Grid */}
            {currentCompanies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentCompanies.map((company) => {
                  const colorGradient = getCompanyColor(company.companyNameEN);

                  return (
                    <div
                      key={company.id}
                      className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-100"
                    >
                      {/* Simple top border accent */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${colorGradient} opacity-70`}></div>

                      {/* Card Content */}
                      <div className="p-5">
                        {/* Header with Logo and Name */}
                        <div className="flex items-start space-x-3 mb-4">
                          {/* Logo - Smaller and cleaner */}
                          <div className="relative shrink-0">
                            <div className={`w-14 h-14 rounded-lg bg-linear-to-br ${colorGradient} bg-opacity-10 flex items-center justify-center overflow-hidden shadow-sm`}>
                              {company.logoUrl ? (
                                <img
                                  src={`${API_BASE_URL}${company.logoUrl}`}
                                  alt={company.companyNameEN}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      parent.classList.add('flex', 'items-center', 'justify-center');
                                      parent.innerHTML = `<span class="text-lg font-semibold text-gray-700">${getInitials(company.companyNameEN)}</span>`;
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-lg font-semibold text-gray-700">
                                  {getInitials(company.companyNameEN)}
                                </span>
                              )}
                            </div>

                            {/* Status indicator - Simplified */}
                            <div className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${company.active ? 'bg-green-500' : 'bg-gray-300'
                              }`}>
                              {company.active && (
                                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></span>
                              )}
                            </div>
                          </div>

                          {/* Company Name and Type */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                              {company.companyNameEN}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {company.companyType?.replace(/_/g, ' ') || 'Company'}
                            </p>
                          </div>
                        </div>

                        {/* Address - Simplified */}
                        <div className="mb-4">
                          <div className="flex items-start space-x-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                            <p className="text-sm line-clamp-2">
                              {company.mainBranchAddress || company.address || 'Address not specified'}
                            </p>
                          </div>
                        </div>


                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // No results found
              <div className="text-center py-20">
                <div className="inline-block p-8 bg-white rounded-full shadow-xl mb-6">
                  <Building2 className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No companies found</h3>
                <p className="text-gray-500 text-lg">Try adjusting your search criteria</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-16 space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>

                <div className="flex space-x-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show limited page numbers with ellipsis
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`w-12 h-12 rounded-xl font-semibold transition-all duration-300 ${currentPage === pageNumber
                              ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110'
                              : 'bg-white text-gray-600 shadow-md hover:shadow-lg hover:scale-105'
                            }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 3 ||
                      pageNumber === currentPage + 3
                    ) {
                      return (
                        <span key={pageNumber} className="w-12 h-12 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl bg-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer decoration */}
      {/* <div className="relative h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600"></div> */}
    </div>
  );
};

export default Companies;