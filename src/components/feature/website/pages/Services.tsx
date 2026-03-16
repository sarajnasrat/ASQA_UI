// pages/Services.js
import React from 'react';
import { CheckCircle, Clock, Shield, Award, FileText, Users } from 'lucide-react';

const Services = () => {
  const steps = [
    {
      number: '01',
      title: 'Initial Consultation',
      description: 'Discuss your certification needs and requirements with our experts'
    },
    {
      number: '02',
      title: 'Company Registration',
      description: 'Register your company details in our system'
    },
    {
      number: '03',
      title: 'Document Submission',
      description: 'Upload all required documentation for review'
    },
    {
      number: '04',
      title: 'Compliance Review',
      description: 'Our team reviews your submission against ASQA standards'
    },
    {
      number: '05',
      title: 'Site Assessment',
      description: 'Optional on-site or virtual assessment of your facilities'
    },
    {
      number: '06',
      title: 'Certification Issuance',
      description: 'Receive your official ASQA certificate upon approval'
    }
  ];

  const benefits = [
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: 'International Recognition',
      description: 'ASQA certification is recognized globally'
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: 'Enhanced Credibility',
      description: 'Build trust with clients and stakeholders'
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: 'Market Access',
      description: 'Access new markets and opportunities'
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: 'Efficient Process',
      description: 'Streamlined digital certification process'
    }
  ];

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Comprehensive certification services for companies worldwide
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Certification Process
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            A straightforward path to ASQA certification
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-blue-600 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Benefits of ASQA Certification
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Why companies choose ASQA for their certification needs
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Get Certified?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your certification journey today with our simple online registration process
          </p>
          <a
            href="/registration"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Register Your Company
          </a>
        </div>
      </section>
    </div>
  );
};

export default Services;