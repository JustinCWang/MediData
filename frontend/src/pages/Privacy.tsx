export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-600 mb-8">Last Updated: December 5, 2025</p>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-slate-700 leading-relaxed">
              MediData ("Company," "we," "us," "our," or "Service") is committed to protecting your privacy and maintaining the highest standards of data security. This Privacy Policy explains how we collect, use, disclose, and safeguard your information, including your protected health information (PHI) and personally identifiable information (PII).
            </p>
            <p className="text-slate-700 leading-relaxed">
              We comply with all applicable privacy laws and regulations, including the Health Insurance Portability and Accountability Act (HIPAA), the Privacy Rule, the Security Rule, and other state and federal privacy laws.
            </p>
          </section>

          {/* HIPAA Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. HIPAA Compliance</h2>
            <p className="text-slate-700 leading-relaxed">
              MediData is a HIPAA-compliant healthcare platform that protects and secures all protected health information (PHI). As a healthcare service provider, we comply fully with HIPAA regulations to ensure your medical information remains confidential and secure.
            </p>
            
            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2.1 What is HIPAA?</h3>
            <p className="text-slate-700 leading-relaxed">
              The Health Insurance Portability and Accountability Act (HIPAA) is a federal law that establishes national standards for protecting patient privacy and securing health information. It applies to healthcare providers, health plans, and healthcare clearinghouses that handle PHI.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">2.2 Our HIPAA Commitments</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Privacy Rule Compliance:</strong> We limit the use and disclosure of PHI to only what is necessary for treatment, payment, and healthcare operations.</li>
              <li><strong>Security Rule Compliance:</strong> We implement comprehensive administrative, physical, and technical safeguards to protect PHI from unauthorized access, use, and disclosure.</li>
              <li><strong>Breach Notification Rule:</strong> In the event of a breach of unsecured PHI, we will notify affected individuals without unreasonable delay in accordance with HIPAA requirements.</li>
              <li><strong>Business Associate Agreements:</strong> We require all service providers and contractors with access to PHI to execute Business Associate Agreements (BAAs) ensuring they maintain HIPAA compliance.</li>
              <li><strong>Minimum Necessary Standard:</strong> We limit access to PHI to the minimum necessary to accomplish the intended purpose.</li>
            </ul>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Information We Collect</h2>
            <p className="text-slate-700 leading-relaxed">
              We collect various types of information to provide you with healthcare services and maintain our platform:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3.1 Personal Health Information (PHI)</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Medical history and diagnoses</li>
              <li>Current medications and allergies</li>
              <li>Treatment plans and provider recommendations</li>
              <li>Healthcare provider notes and communications</li>
              <li>Insurance information and billing details</li>
              <li>Laboratory results and medical records</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3.2 Personally Identifiable Information (PII)</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Full name and contact information</li>
              <li>Email address and phone number</li>
              <li>Date of birth and Social Security number</li>
              <li>Address and location data</li>
              <li>Account username and password (encrypted)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">3.3 Usage Information</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Log files and access timestamps</li>
              <li>Device information and IP addresses</li>
              <li>Browser type and platform information</li>
              <li>Pages visited and time spent on the platform</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. How We Protect Your Data</h2>
            <p className="text-slate-700 leading-relaxed">
              MediData implements multiple layers of security to protect your personal and health information from unauthorized access, disclosure, alteration, and destruction.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.1 Technical Safeguards</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Encryption:</strong> All data is encrypted in transit using TLS/SSL protocols and at rest using AES-256 encryption</li>
              <li><strong>Secure Authentication:</strong> Multi-factor authentication (MFA) for all user accounts</li>
              <li><strong>Firewalls:</strong> Advanced firewalls and intrusion detection systems monitor for threats</li>
              <li><strong>Regular Backups:</strong> Automated and encrypted backups stored in secure, redundant locations</li>
              <li><strong>Security Monitoring:</strong> 24/7 monitoring and logging of all system access and activities</li>
              <li><strong>Penetration Testing:</strong> Regular security audits and penetration testing by third-party security experts</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.2 Administrative Safeguards</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Access Controls:</strong> Role-based access control (RBAC) limiting employee access to only necessary information</li>
              <li><strong>Workforce Training:</strong> Mandatory HIPAA and data privacy training for all staff members</li>
              <li><strong>Security Policies:</strong> Comprehensive security policies and procedures reviewed annually</li>
              <li><strong>Incident Response Plan:</strong> Detailed procedures for detecting, responding to, and reporting security incidents</li>
              <li><strong>Background Checks:</strong> Thorough background verification for all employees with access to PHI</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">4.3 Physical Safeguards</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Data Centers:</strong> Secure, redundant data centers with restricted physical access and surveillance</li>
              <li><strong>Server Security:</strong> Servers housed in SOC 2 Type II compliant facilities</li>
              <li><strong>Access Badges:</strong> Multi-factor identification required for facility access</li>
              <li><strong>Climate Control:</strong> Advanced systems protecting hardware from damage</li>
              <li><strong>Secure Disposal:</strong> Certified secure destruction of physical media containing PHI</li>
            </ul>
          </section>

          {/* Data Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Your Privacy Rights</h2>
            <p className="text-slate-700 leading-relaxed">
              Under HIPAA and other privacy laws, you have the following rights regarding your health information:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.1 Right to Access</h3>
            <p className="text-slate-700 leading-relaxed">
              You have the right to access, review, and obtain a copy of your health information maintained by MediData. We will provide copies within 30 days of your request, or within a reasonable timeframe as required by law.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.2 Right to Amendment</h3>
            <p className="text-slate-700 leading-relaxed">
              You have the right to request correction or amendment of inaccurate or incomplete health information. We will review your request and respond within 60 days.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.3 Right to Accounting of Disclosures</h3>
            <p className="text-slate-700 leading-relaxed">
              You have the right to receive an accounting of how and to whom your health information has been disclosed, within the past six years, except for disclosures made for treatment, payment, and healthcare operations.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.4 Right to Request Restrictions</h3>
            <p className="text-slate-700 leading-relaxed">
              You have the right to request restrictions on the use and disclosure of your health information. While we cannot guarantee approval of all requests, we will carefully consider your preferences.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.5 Right to Confidential Communication</h3>
            <p className="text-slate-700 leading-relaxed">
              You have the right to request that we communicate with you about your health information through alternative means or at different locations.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">5.6 Right to Revoke Consent</h3>
            <p className="text-slate-700 leading-relaxed">
              You may revoke your authorization for us to use and disclose your health information at any time by submitting a written request. However, this will not affect any uses or disclosures made prior to receiving your revocation.
            </p>
          </section>

          {/* Data Usage */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed">
              We use your information solely for purposes necessary to provide healthcare services, conduct business operations, and comply with legal requirements:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6.1 Treatment</h3>
            <p className="text-slate-700 leading-relaxed">
              We use your health information to provide, coordinate, and manage your healthcare services, including consultations with providers, treatment planning, and follow-up care.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6.2 Payment</h3>
            <p className="text-slate-700 leading-relaxed">
              We use your information to process payments, submit claims to insurance companies, and manage billing and accounts receivable.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6.3 Healthcare Operations</h3>
            <p className="text-slate-700 leading-relaxed">
              We use your information to improve our services, conduct quality assurance, manage our business, and ensure regulatory compliance.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">6.4 Limited Other Uses</h3>
            <p className="text-slate-700 leading-relaxed">
              We do not use or disclose your health information for marketing purposes without your explicit consent. Any research use of your information will be done only with your separate written authorization.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. When We Disclose Your Information</h2>
            <p className="text-slate-700 leading-relaxed">
              MediData only discloses your health information in specific circumstances required or permitted by HIPAA:
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.1 With Your Authorization</h3>
            <p className="text-slate-700 leading-relaxed">
              We will only disclose your information to third parties with your explicit written consent. You can revoke this authorization at any time.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.2 To Healthcare Providers</h3>
            <p className="text-slate-700 leading-relaxed">
              We share your information with other healthcare providers involved in your care, as necessary for treatment and coordination of care.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.3 For Legal Compliance</h3>
            <p className="text-slate-700 leading-relaxed">
              We may disclose your information when required by law, court order, subpoena, or as authorized by HIPAA exceptions (public health activities, law enforcement, etc.).
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.4 Business Associates</h3>
            <p className="text-slate-700 leading-relaxed">
              We may share your information with service providers and business associates who assist us in providing services. All business associates are required to sign Business Associate Agreements and maintain HIPAA compliance.
            </p>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">7.5 We Do NOT Share Your Information For:</h3>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Marketing or commercial purposes without explicit consent</li>
              <li>Sale or unauthorized disclosure to third parties</li>
              <li>Sharing with non-essential business partners</li>
              <li>Any purpose outside treatment, payment, and healthcare operations without authorization</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Data Retention and Deletion</h2>
            <p className="text-slate-700 leading-relaxed">
              We retain your health information for as long as necessary to provide services and comply with legal requirements. Retention periods vary based on the type of information and applicable regulations:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>Active Patient Records:</strong> Maintained for the duration of the patient-provider relationship plus a minimum of 7 years</li>
              <li><strong>Medical Records:</strong> Retained in accordance with state and federal requirements (typically 7-10 years)</li>
              <li><strong>Billing Records:</strong> Maintained for a minimum of 7 years for audit and compliance purposes</li>
              <li><strong>Deleted Information:</strong> Securely destroyed using certified secure deletion methods to prevent recovery</li>
            </ul>
          </section>

          {/* Breach Notification */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Breach Notification and Security Incidents</h2>
            <p className="text-slate-700 leading-relaxed">
              In the unlikely event of a security breach involving unsecured PHI, MediData will:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li>Investigate the breach immediately and assess the risk to your information</li>
              <li>Notify you without unreasonable delay (typically within 30 days) of the breach</li>
              <li>Provide details about the information involved, what happened, and steps you should take</li>
              <li>Notify appropriate regulatory agencies and the media if required by law</li>
              <li>Offer credit monitoring and identity protection services at no cost to you</li>
              <li>Implement corrective actions to prevent future incidents</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Third-Party Services and Links</h2>
            <p className="text-slate-700 leading-relaxed">
              MediData may contain links to third-party websites and services. We are not responsible for the privacy practices of these external sites. We recommend reviewing their privacy policies before providing any information.
            </p>
            <p className="text-slate-700 leading-relaxed">
              All third-party service providers that access your health information are required to execute Business Associate Agreements and maintain the same level of security and privacy protection.
            </p>
          </section>


          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Children's Privacy</h2>
            <p className="text-slate-700 leading-relaxed">
              MediData is not intended for children under 18 years old. Parents and legal guardians are responsible for monitoring their children's access to the platform. If we become aware that a child has provided information in violation of this policy, we will delete such information promptly.
            </p>
          </section>

          {/* Policy Changes */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              MediData may update this Privacy Policy to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of material changes by email or through our platform. Your continued use of MediData following changes indicates your acceptance of the updated Privacy Policy.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have questions about this Privacy Policy, wish to exercise your privacy rights, or need to report a security concern, please contact our Privacy Officer:
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mt-4 text-slate-700">
              <p className="font-semibold">MediData Privacy Office</p>
              <p>Email: privacy@medidata.com</p>
              <p>Phone: 1-800-MEDIDATA</p>
              <p className="text-sm mt-2">Response time: Within 5 business days</p>
            </div>
          </section>

          {/* Regulatory Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">14. Regulatory Compliance and Certifications</h2>
            <p className="text-slate-700 leading-relaxed">
              MediData complies with the following regulations and standards:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4">
              <li><strong>HIPAA:</strong> Health Insurance Portability and Accountability Act (Privacy and Security Rules)</li>

              <li><strong>State Privacy Laws:</strong> CCPA, HIPAA state amendments, and applicable state privacy regulations</li>
              <li><strong>SOC 2 Type II:</strong> Security, Availability, Processing Integrity, Confidentiality, and Privacy</li>
              <li><strong>ISO 27001:</strong> Information Security Management Systems</li>
              <li><strong>NIST Cybersecurity Framework:</strong> Compliance with NIST standards for healthcare organizations</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            By using MediData, you acknowledge that you have read and understood this Privacy Policy and agree to our privacy practices. Your privacy and the security of your health information are our top priorities.
          </p>
        </div>
      </div>
    </div>
  );
}
