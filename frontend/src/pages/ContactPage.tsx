/**
 * ContactPage.tsx - Contact form page
 *
 * Provides a simple form for users to send support inquiries and routes back home after submission.
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ContactPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitStatus('loading')

    try {
      // Simulate API call - replace with actual backend endpoint
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } catch {
      setSubmitStatus('error')
      setTimeout(() => setSubmitStatus('idle'), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 dark:text-white">Get in Touch</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto dark:text-slate-300">
            Have questions about MediData? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Phone Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition dark:bg-slate-800 dark:shadow-none">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-white text-xl">☎</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">Call Us</h3>
            <p className="text-slate-600 mb-4 dark:text-slate-400">Speak directly with our support team</p>
            <a
              href="tel:+11111111111"
              className="text-2xl font-bold text-sky-600 hover:text-sky-700 transition dark:text-sky-400 dark:hover:text-sky-300"
            >
              1 (111) 111-1111
            </a>
            <p className="text-sm text-slate-500 mt-4 dark:text-slate-400">Mon-Fri, 9am-6pm EST</p>
          </div>

          {/* Email Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition dark:bg-slate-800 dark:shadow-none">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-white text-xl">✉</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">Email Us</h3>
            <p className="text-slate-600 mb-4 dark:text-slate-300">Send us your questions or concerns</p>
            <a
              href="mailto:contact@medidata.com"
              className="text-lg font-semibold text-emerald-600 hover:text-emerald-700 transition break-all dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              contact@medidata.com
            </a>
            <p className="text-sm text-slate-500 mt-4 dark:text-slate-400">Response within 24 hours</p>
          </div>

          {/* Hours Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition dark:bg-slate-800 dark:shadow-none">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-full w-12 h-12 flex items-center justify-center">
                <span className="text-white text-xl">🕐</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 dark:text-white">Business Hours</h3>
            <p className="text-slate-600 mb-4 dark:text-slate-400">When we're available</p>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">Mon - Fri: 9am - 6pm EST</p>
              <p className="font-semibold text-slate-900 dark:text-white">Sat - Sun: 10am - 4pm EST</p>
            </div>
            <p className="text-sm text-slate-500 mt-4 dark:text-slate-400">Holiday hours may vary</p>
          </div>
        </div>
      </div>

      {/* Contact Form and Additional Info */}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2 dark:text-white">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2 dark:text-white">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-slate-900 mb-2 dark:text-white">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-slate-900 mb-2 dark:text-white">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={submitStatus === 'loading'}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${submitStatus === 'loading'
                  ? 'bg-slate-400 cursor-not-allowed'
                  : submitStatus === 'success'
                    ? 'bg-green-600 hover:bg-green-700'
                    : submitStatus === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700'
                  }`}
              >
                {submitStatus === 'loading' ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Sending...
                  </>
                ) : submitStatus === 'success' ? (
                  <>
                    <span>✓</span>
                    Message Sent!
                  </>
                ) : submitStatus === 'error' ? (
                  <>
                    <span>✕</span>
                    Error Sending
                  </>
                ) : (
                  <>
                    <span>✉</span>
                    Send Message
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    Thank you for reaching out! We'll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    There was an error sending your message. Please try again or contact us directly.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Additional Information */}
          <div className="space-y-8">
            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Quick Answers</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 dark:text-white">How long does it take to get a response?</h3>
                  <p className="text-slate-600 text-sm dark:text-slate-300">
                    We typically respond to emails within 24 hours. For urgent matters, please call us directly.
                  </p>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 dark:text-white">What are your support hours?</h3>
                  <p className="text-slate-600 text-sm dark:text-slate-300">
                    We're available Monday-Friday 9am-6pm EST and Saturday-Sunday 10am-4pm EST.
                  </p>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 dark:text-white">Do you have a physical office?</h3>
                  <p className="text-slate-600 text-sm dark:text-slate-300">
                    MediData operates primarily online. Contact us via phone or email for virtual assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Support Options */}
            <div className="bg-white rounded-lg shadow-lg p-8 dark:bg-slate-800">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 dark:text-white">Other Ways to Get Help</h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold mt-1">•</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Live Chat:</strong> Available on our website during business hours
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold mt-1">•</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Help Center:</strong> Visit our comprehensive knowledge base for self-service support
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold mt-1">•</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Status Page:</strong> Check our system status and scheduled maintenance
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-sky-600 font-bold mt-1">•</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    <strong>Social Media:</strong> Follow us for updates and announcements
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto mt-16">
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-emerald-500 rounded-lg shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience MediData?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of users who trust MediData for their healthcare needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-white text-sky-600 font-semibold rounded-lg hover:bg-slate-100 transition dark:bg-slate-800 dark:text-sky-400 dark:hover:bg-slate-700"
            >
              Get Started
            </button>
            <button onClick={() => navigate('/about')}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
