import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { TabView, TabPanel } from "primereact/tabview";
import { Avatar } from "primereact/avatar";
import { Chip } from "primereact/chip";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { ProgressSpinner } from "primereact/progressspinner";
import { Galleria } from "primereact/galleria";
import { Timeline } from "primereact/timeline";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Badge } from "primereact/badge";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import DynamicBreadcrumb from "../../common/DynamicBreadcrumb";
import { useAppToast } from "../../../hooks/useToast";
import CompanyService from "../../../services/company.service";
import { useTranslation } from "react-i18next";

interface CompanyDetailsData {
    id: number;
    companyNameEN: string;
    companyNameDR?: string;
    companyNamePS?: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    logoUrl?: string;
    bussinessLogoUrl?: string;
    isActive: boolean;
    mainBranchAddress?: string;
    activityPlace?: string;
    activityType?: string;
    jawazNumber?: string;
    jawazIssueDate?: string;
    jawazExpiryDate?: string;
    tinNumber?: string;
    websiteUrl?: string;
    establishYear?: string;
    companyOwnerNameEn?: string;
    companyOwnerNameDr?: string;
    companyOwnerNamePs?: string;
    companyType: string;
    aboutCompanyEn?: string;
    aboutCompanyDr?: string;
    aboutCompanyPs?: string;
    categories?: Array<{ id: number; name: string }>;
    socialLinks?: Array<{ socialLinkName: string; address: string }>;
    createdAt?: string;
    updatedAt?: string;
}

export const CompanyDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { toast, showToast } = useAppToast();
    
    const [company, setCompany] = useState<CompanyDetailsData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const [images, setImages] = useState<any[]>([]);

    useEffect(() => {
        if (id) {
            fetchCompanyDetails();
        }
    }, [id]);

    const fetchCompanyDetails = async () => {
        setLoading(true);
        try {
            // Replace with actual API call
            // const response = await CompanyService.getCompanyById(id);
            // setCompany(response.data);
            
            // Mock data for demonstration
            setTimeout(() => {
                setCompany(mockCompanyData);
                setLoading(false);
            }, 1000);
        } catch (error) {
            showToast("error", t("common:error"), t("company:loadFailed"));
            setLoading(false);
        }
    };

    // Mock data for demonstration
    const mockCompanyData: CompanyDetailsData = {
        id: 1,
        companyNameEN: "Tech Solutions Ltd",
        companyNameDR: "تک حل لارې شرکت",
        companyNamePS: "د تخنیکي حل لارو شرکت",
        email: "info@techsolutions.com",
        phoneNumber: "+93 123 456 789",
        address: "Kabul, Afghanistan",
        logoUrl: "https://via.placeholder.com/150",
        bussinessLogoUrl: "https://via.placeholder.com/150",
        isActive: true,
        mainBranchAddress: "Main Street, Kabul",
        activityPlace: "Kabul, Herat, Mazar",
        activityType: "IT Services",
        jawazNumber: "JZ-2024-001",
        jawazIssueDate: "2024-01-15",
        jawazExpiryDate: "2025-01-14",
        tinNumber: "TIN-123456789",
        websiteUrl: "https://www.techsolutions.com",
        establishYear: "2010",
        companyOwnerNameEn: "Ahmad Khan",
        companyOwnerNameDr: "احمد خان",
        companyOwnerNamePs: "احمد خان",
        companyType: "PRIVATE",
        aboutCompanyEn: "Leading technology solutions provider in Afghanistan...",
        aboutCompanyDr: "په افغانستان کې د ټیکنالوژۍ مخکښ چمتو کونکی...",
        aboutCompanyPs: "په افغانستان کې د ټیکنالوژۍ مخکښ چمتو کوونکی...",
        categories: [
            { id: 1, name: "Technology" },
            { id: 2, name: "Consulting" }
        ],
        socialLinks: [
            { socialLinkName: "Facebook", address: "https://facebook.com/techsolutions" },
            { socialLinkName: "LinkedIn", address: "https://linkedin.com/company/techsolutions" }
        ],
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-02-20T14:20:00Z"
    };

    const getCompanyTypeSeverity = (type: string) => {
        switch(type) {
            case 'PRIVATE': return 'info';
            case 'PUBLIC': return 'success';
            case 'GOVERNMENT': return 'warning';
            case 'EDUCATIONAL_INSTITUTIONS': return 'help';
            default: return 'secondary';
        }
    };

    const getStatusSeverity = (isActive: boolean) => {
        return isActive ? 'success' : 'danger';
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Custom timeline marker
    const timelineMarker = (item: any) => {
        return (
            <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1">
                <i className={`pi pi-${item.icon}`}></i>
            </span>
        );
    };

    // Timeline events for company history
    const timelineEvents = [
        { status: 'Created', date: company?.createdAt, icon: 'plus', color: '#4CAF50' },
        { status: 'Last Updated', date: company?.updatedAt, icon: 'pencil', color: '#2196F3' },
        { status: 'License Issued', date: company?.jawazIssueDate, icon: 'verified', color: '#FF9800' },
        { status: 'License Expiry', date: company?.jawazExpiryDate, icon: 'calendar-times', color: '#f44336' },
    ];

    if (loading) {
        return (
            <>
                <DynamicBreadcrumb
                    items={[
                        { label: t("company:list"), url: "/companies" },
                        { label: t("company:details"), url: `/companies/${id}` },
                    ]}
                    size="w-full max-w-8xl mx-auto px-5 pt-4"
                />
                <div className="flex justify-center items-center p-8">
                    <ProgressSpinner />
                </div>
            </>
        );
    }

    if (!company) {
        return (
            <>
                <DynamicBreadcrumb
                    items={[
                        { label: t("company:list"), url: "/companies" },
                        { label: t("company:details"), url: `/companies/${id}` },
                    ]}
                    size="w-full max-w-8xl mx-auto px-5 pt-4"
                />
                <div className="flex justify-center p-8">
                    <Card className="text-center">
                        <i className="pi pi-exclamation-triangle text-4xl text-yellow-500 mb-3"></i>
                        <h3>{t("company:notFound")}</h3>
                        <Button 
                            label={t("common:back")} 
                            icon="pi pi-arrow-left"
                            onClick={() => navigate("/companies")}
                        />
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <Toast ref={toast} />
            
            <DynamicBreadcrumb
                items={[
                    { label: t("company:list"), url: "/companies" },
                    { label: company.companyNameEN, url: `/companies/${id}` },
                ]}
                size="w-full max-w-8xl mx-auto px-5 pt-4"
            />

            <div className="max-w-8xl mx-auto px-5 pb-6">
                {/* Header Section with Company Info */}
                <Card className="mb-4 shadow-2">
                    <div className="flex flex-column md:flex-row align-items-start md:align-items-center gap-4">
                        {/* Logo and Basic Info */}
                        <div className="flex align-items-center gap-4 flex-1">
                            <Avatar 
                                image={company.logoUrl} 
                                size="xlarge" 
                                shape="circle"
                                className="shadow-2"
                                icon="pi pi-building"
                            />
                            <div>
                                <div className="flex align-items-center gap-2 mb-2">
                                    <h1 className="text-3xl font-bold m-0">{company.companyNameEN}</h1>
                                    <Tag 
                                        value={t(`company:typeOptions.${company.companyType}`)} 
                                        severity={getCompanyTypeSeverity(company.companyType)}
                                        rounded
                                    />
                                    <Tag 
                                        value={company.isActive ? t("common:active") : t("common:inactive")}
                                        severity={getStatusSeverity(company.isActive)}
                                        rounded
                                    />
                                </div>
                                <div className="flex flex-wrap gap-3 text-gray-600">
                                    <span className="flex align-items-center gap-1">
                                        <i className="pi pi-envelope"></i>
                                        {company.email}
                                    </span>
                                    {company.phoneNumber && (
                                        <span className="flex align-items-center gap-1">
                                            <i className="pi pi-phone"></i>
                                            {company.phoneNumber}
                                        </span>
                                    )}
                                    {company.websiteUrl && (
                                        <span className="flex align-items-center gap-1">
                                            <i className="pi pi-globe"></i>
                                            <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                {company.websiteUrl}
                                            </a>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button 
                                label={t("common:edit")}
                                icon="pi pi-pencil"
                                className="p-button-outlined flex-1 md:flex-initial"
                                onClick={() => navigate(`/companies/edit/${id}`)}
                            />
                            <Button 
                                label={t("common:back")}
                                icon="pi pi-arrow-left"
                                className="p-button-outlined p-button-secondary flex-1 md:flex-initial"
                                onClick={() => navigate("/companies")}
                            />
                        </div>
                    </div>
                </Card>

                {/* Main Content with Tabs */}
                <Card className="shadow-2">
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        {/* Overview Tab */}
                        <TabPanel header={t("company:tabs.overview")} leftIcon="pi pi-home mr-2">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                {/* Left Column - Key Information */}
                                <div className="lg:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card title={t("company:basicInfo")} className="h-full">
                                            <div className="space-y-3">
                                                <DetailRow 
                                                    icon="pi pi-building" 
                                                    label={t("company:labels.companyNameDR")} 
                                                    value={company.companyNameDR || 'N/A'} 
                                                />
                                                <DetailRow 
                                                    icon="pi pi-building" 
                                                    label={t("company:labels.companyNamePS")} 
                                                    value={company.companyNamePS || 'N/A'} 
                                                />
                                                <DetailRow 
                                                    icon="pi pi-map-marker" 
                                                    label={t("company:labels.address")} 
                                                    value={company.address || 'N/A'} 
                                                />
                                                <DetailRow 
                                                    icon="pi pi-calendar" 
                                                    label={t("company:labels.establishYear")} 
                                                    value={company.establishYear || 'N/A'} 
                                                />
                                                <DetailRow 
                                                    icon="pi pi-tag" 
                                                    label={t("company:labels.tinNumber")} 
                                                    value={company.tinNumber || 'N/A'} 
                                                />
                                            </div>
                                        </Card>

                                        <Card title={t("company:legalInfo")} className="h-full">
                                            <div className="space-y-3">
                                                <DetailRow 
                                                    icon="pi pi-verified" 
                                                    label={t("company:labels.jawazNumber")} 
                                                    value={company.jawazNumber || 'N/A'} 
                                                />
                                                <DetailRow 
                                                    icon="pi pi-calendar-plus" 
                                                    label={t("company:labels.jawazIssueDate")} 
                                                    value={formatDate(company.jawazIssueDate)} 
                                                />
                                                <DetailRow 
                                                    icon="pi pi-calendar-times" 
                                                    label={t("company:labels.jawazExpiryDate")} 
                                                    value={formatDate(company.jawazExpiryDate)} 
                                                />
                                                <DetailRow 
                                                    icon="pi pi-map" 
                                                    label={t("company:labels.mainBranchAddress")} 
                                                    value={company.mainBranchAddress || 'N/A'} 
                                                />
                                            </div>
                                        </Card>

                                        <Card title={t("company:categories")} className="md:col-span-2">
                                            <div className="flex flex-wrap gap-2">
                                                {company.categories && company.categories.length > 0 ? (
                                                    company.categories.map(cat => (
                                                        <Chip key={cat.id} label={cat.name} />
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500">No categories selected</span>
                                                )}
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                {/* Right Column - Timeline and Stats */}
                                <div className="lg:col-span-1">
                                    <Card title={t("company:timeline")} className="mb-4">
                                        <Timeline 
                                            value={timelineEvents} 
                                            opposite={(item) => item.status}
                                            content={(item) => <small className="text-gray-500">{formatDate(item.date)}</small>}
                                            marker={timelineMarker}
                                            className="timeline-details"
                                        />
                                    </Card>

                                    <Card title={t("company:activityInfo")}>
                                        <div className="space-y-3">
                                            <DetailRow 
                                                icon="pi pi-map-marker" 
                                                label={t("company:labels.activityPlace")} 
                                                value={company.activityPlace || 'N/A'} 
                                            />
                                            <DetailRow 
                                                icon="pi pi-briefcase" 
                                                label={t("company:labels.activityType")} 
                                                value={company.activityType || 'N/A'} 
                                            />
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </TabPanel>

                        {/* About Company Tab */}
                        <TabPanel header={t("company:tabs.about")} leftIcon="pi pi-info-circle mr-2">
                            <div className="grid grid-cols-1 gap-4">
                                <Card>
                                    <h4 className="font-bold mb-3">{t("company:labels.aboutCompanyEn")}</h4>
                                    <p className="text-gray-700">{company.aboutCompanyEn || 'N/A'}</p>
                                </Card>
                                {company.aboutCompanyDr && (
                                    <Card>
                                        <h4 className="font-bold mb-3">{t("company:labels.aboutCompanyDr")}</h4>
                                        <p className="text-gray-700 text-right" dir="rtl">{company.aboutCompanyDr}</p>
                                    </Card>
                                )}
                                {company.aboutCompanyPs && (
                                    <Card>
                                        <h4 className="font-bold mb-3">{t("company:labels.aboutCompanyPs")}</h4>
                                        <p className="text-gray-700 text-right" dir="rtl">{company.aboutCompanyPs}</p>
                                    </Card>
                                )}
                            </div>
                        </TabPanel>

                        {/* Owner Information Tab */}
                        <TabPanel header={t("company:tabs.owner")} leftIcon="pi pi-user mr-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="text-center">
                                    <Avatar icon="pi pi-user" size="xlarge" shape="circle" className="mb-3" />
                                    <h3 className="font-bold">{company.companyOwnerNameEn || 'N/A'}</h3>
                                    <p className="text-gray-500">English</p>
                                </Card>
                                {company.companyOwnerNameDr && (
                                    <Card className="text-center" dir="rtl">
                                        <Avatar icon="pi pi-user" size="xlarge" shape="circle" className="mb-3" />
                                        <h3 className="font-bold">{company.companyOwnerNameDr}</h3>
                                        <p className="text-gray-500">دری</p>
                                    </Card>
                                )}
                                {company.companyOwnerNamePs && (
                                    <Card className="text-center" dir="rtl">
                                        <Avatar icon="pi pi-user" size="xlarge" shape="circle" className="mb-3" />
                                        <h3 className="font-bold">{company.companyOwnerNamePs}</h3>
                                        <p className="text-gray-500">پښتو</p>
                                    </Card>
                                )}
                            </div>
                        </TabPanel>

                        {/* Social Links Tab */}
                        <TabPanel header={t("company:tabs.social")} leftIcon="pi pi-share-alt mr-2">
                            {company.socialLinks && company.socialLinks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {company.socialLinks.map((link, index) => (
                                        <Card key={index} className="hover:shadow-3 transition-shadow">
                                            <div className="flex align-items-center gap-3">
                                                <Avatar 
                                                    icon={`pi pi-${link.socialLinkName.toLowerCase()}`} 
                                                    size="large" 
                                                    style={{ backgroundColor: getPlatformColor(link.socialLinkName), color: '#ffffff' }}
                                                />
                                                <div>
                                                    <h4 className="font-bold m-0">{link.socialLinkName}</h4>
                                                    <a href={link.address} target="_blank" rel="noopener noreferrer" className="text-primary">
                                                        {link.address}
                                                    </a>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8">
                                    <i className="pi pi-share-alt text-4xl text-gray-400 mb-3"></i>
                                    <p className="text-gray-500">{t("company:messages.noSocialLinks")}</p>
                                </div>
                            )}
                        </TabPanel>

                        {/* Logos Tab */}
                        <TabPanel header={t("company:tabs.logos")} leftIcon="pi pi-image mr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card title={t("company:labels.logoUrl")} className="text-center">
                                    <div className="flex justify-content-center p-4">
                                        <Avatar 
                                            image={company.logoUrl} 
                                            size="xlarge" 
                                            shape="circle" 
                                            className="shadow-3"
                                            icon="pi pi-building"
                                        />
                                    </div>
                                </Card>
                                <Card title={t("company:labels.bussinessLogoUrl")} className="text-center">
                                    <div className="flex justify-content-center p-4">
                                        <Avatar 
                                            image={company.bussinessLogoUrl} 
                                            size="xlarge" 
                                            shape="circle" 
                                            className="shadow-3"
                                            icon="pi pi-briefcase"
                                        />
                                    </div>
                                </Card>
                            </div>
                        </TabPanel>
                    </TabView>
                </Card>

                {/* Footer with Metadata */}
                <div className="flex justify-content-between align-items-center mt-4 text-gray-500 text-sm">
                    <span>
                        <i className="pi pi-calendar mr-1"></i>
                        {t("common:created")}: {formatDate(company.createdAt)}
                    </span>
                    <span>
                        <i className="pi pi-refresh mr-1"></i>
                        {t("common:lastUpdated")}: {formatDate(company.updatedAt)}
                    </span>
                </div>
            </div>
        </>
    );
};

// Helper component for detail rows
const DetailRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex align-items-start gap-2">
        <i className={`pi ${icon} text-primary mt-1`}></i>
        <div>
            <span className="text-gray-500 text-sm block">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    </div>
);

// Helper function for platform colors
const getPlatformColor = (platform: string): string => {
    const colors: { [key: string]: string } = {
        'Facebook': '#1877F2',
        'Twitter': '#1DA1F2',
        'LinkedIn': '#0077B5',
        'Instagram': '#E4405F',
        'YouTube': '#FF0000',
        'Website': '#4CAF50'
    };
    return colors[platform] || '#6c757d';
};

export default CompanyDetails;