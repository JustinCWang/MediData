export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 dark:bg-slate-900 dark:shadow-none dark:border dark:border-slate-700">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 dark:text-white">Terms of Use</h1>
        <p className="text-slate-600 mb-8 dark:text-slate-200">Last Updated: December 5, 2025</p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">1. Introduction</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              Welcome to MediData. These Terms of Use govern your access to and use of the MediData platform, including all content, features, and services offered through our website.
            </p>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              By accessing or using MediData, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not use the Service.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">2. Eligibility and Accounts</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              You must be at least 18 years old and have the legal capacity to enter into binding agreements to use MediData. By using our Service, you represent and warrant that you meet these requirements.
            </p>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              You are responsible for maintaining the confidentiality of your account credentials and are solely responsible for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account or credentials.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">3. Acceptable Use Policy</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">You agree not to use MediData for any unlawful or prohibited purpose, including:</p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-4 dark:text-slate-200">
              <li>Violating any applicable laws, regulations, or third-party rights</li>
              <li>Harassing, threatening, or defaming any individual or organization</li>
              <li>Transmitting malware, viruses, or harmful code</li>
              <li>Attempting to gain unauthorized access to our systems or networks</li>
              <li>Impersonating any person or entity</li>
              <li>Scraping, crawling, or automated data collection without permission</li>
              <li>Disrupting the normal functioning of the Service</li>
              <li>Posting false, misleading, or fraudulent medical information</li>
            </ul>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">4. User Content and Submissions</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              Any content, comments, reviews, or information you submit to MediData ("User Content") are provided on an "as-is" basis. You retain all rights to your User Content, but by submitting it, you grant MediData a worldwide, royalty-free, non-exclusive license to use, reproduce, modify, and display your User Content in connection with the Service.
            </p>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              You are solely responsible for the accuracy and legality of any User Content you submit. You warrant that your User Content does not infringe on any third-party intellectual property rights and complies with all applicable laws.
            </p>
          </section>

          {/* Medical Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">5. Medical Disclaimer</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              <strong>IMPORTANT: MediData is not a substitute for professional medical advice, diagnosis, or treatment.</strong> The information provided on our Service is for informational purposes only and should not be considered medical advice.
            </p>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              Always consult with a qualified healthcare provider before making any medical decisions. MediData does not provide medical services and is not liable for any health decisions made based on information found on our platform.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">6. Privacy and Data Protection</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              Your use of MediData is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your personal information.
            </p>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              We are committed to protecting your health information and complying with applicable data protection laws, including HIPAA where applicable.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">7. Intellectual Property Rights</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              All content, software, designs, and materials on MediData, excluding User Content, are the exclusive property of MediData or our licensors. You may not reproduce, distribute, or transmit this content without our prior written permission.
            </p>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              MediData, the MediData logo, and other trademarks are the property of MediData. You may not use these marks without our express written consent.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">8. Limitation of Liability</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEDIDATA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA, OR BUSINESS INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              Our total liability to you shall not exceed the amount paid by you to use MediData in the 12 months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">9. Disclaimers</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              MEDIDATA IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              We do not warrant that our Service will be uninterrupted, error-free, or free from harmful components. Your use of MediData is entirely at your own risk.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">10. Indemnification</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              You agree to indemnify and hold harmless MediData, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising out of or related to your use of the Service or violation of these Terms.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">11. Termination</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              MediData may terminate or suspend your account and access to the Service at any time, with or without cause, and without prior notice. Upon termination, your rights to use the Service will immediately cease.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">12. Modifications to Terms and Service</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              MediData reserves the right to modify these Terms and our Service at any time. Changes will be effective immediately upon posting to our website. Your continued use of MediData following changes indicates your acceptance of the modified Terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">13. Governing Law and Dispute Resolution</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              These Terms are governed by and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions. Any disputes arising out of or related to these Terms or the Service shall be resolved through binding arbitration or court proceedings, as permitted by applicable law.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">14. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              If you have questions about these Terms or MediData, please contact us at:
            </p>
            <div className="bg-slate-50 p-4 rounded-lg mt-4 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <p className="font-semibold">MediData Support</p>
              <p>Email: support@medidata.com</p>
            </div>
          </section>

          {/* Severability */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4 dark:text-white">15. Severability</h2>
            <p className="text-slate-700 leading-relaxed dark:text-slate-200">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            By using MediData, you acknowledge that you have read and understood these Terms of Use and agree to be bound by them.
          </p>
        </div>
      </div>
    </div>
  );
}