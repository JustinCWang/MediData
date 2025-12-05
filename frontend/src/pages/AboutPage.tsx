import { useNavigate } from 'react-router-dom'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-sky-50 to-slate-50 py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Healthcare Made <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-emerald-500">Simple</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            At MediData, we believe everyone deserves easy access to the right healthcare provider. We're here to bridge the gap between patients and quality care.
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-sky-600 to-emerald-500 mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">Who We Are</h2>
          <div className="space-y-6 text-slate-700">
            <p className="text-lg leading-relaxed">
              MediData is a modern healthcare navigation platform dedicated to making healthcare access simpler, faster, and more intuitive. We're a team of healthcare advocates, technologists, and patient-centered designers who understand the frustration of searching for the right medical care.
            </p>
            <p className="text-lg leading-relaxed">
              We operate as a digital bridge connecting patients and families across the United States with hospitals, clinics, and medical specialists. Whether you're looking for preventive care, specialized treatment, or follow-up services, MediData is here to guide you with clarity and confidence.
            </p>
            <p className="text-lg leading-relaxed">
              Founded on the principle that healthcare navigation should be empowering—not overwhelming—we've built a platform that puts you first. Every feature we develop, every partnership we make, and every decision we take is guided by one core question: <span className="font-semibold italic">"How can we make this easier for our users?"</span>
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">What We Do</h2>
          <p className="text-lg text-slate-700 mb-12">
            MediData connects you with the healthcare providers that matter most to you. Our platform makes it easy to:
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Search by Location */}
            <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-sky-600">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Search by Location</h3>
              <p className="text-slate-700">
                Find hospitals, clinics, and specialists near you with just a few clicks. Whether you're at home or traveling, discover quality care in your neighborhood.
              </p>
            </div>

            {/* Explore by Specialty */}
            <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-emerald-500">
              <div className="text-3xl mb-4">⚕️</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Explore by Specialty</h3>
              <p className="text-slate-700">
                From family medicine and pediatrics to orthopedic surgery, physical therapy, and beyond—find specialists trained in the care you need.
              </p>
            </div>

            {/* Understand Your Needs */}
            <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-purple-600">
              <div className="text-3xl mb-4">💡</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Understand Your Healthcare Needs</h3>
              <p className="text-slate-700">
                Tell us what you're looking for—routine checkups, urgent care, chronic disease management—and we'll help you find the right fit.
              </p>
            </div>

            {/* Request Appointments */}
            <div className="bg-white p-8 rounded-lg shadow-md border-l-4 border-rose-600">
              <div className="text-3xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Request Appointments Directly</h3>
              <p className="text-slate-700">
                Skip the phone tag. Browse provider availability and request appointments straight through MediData, making scheduling effortless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">Why We Exist</h2>
          <div className="space-y-6 text-slate-700">
            <p className="text-lg leading-relaxed">
              MediData was born from a simple but powerful observation: <span className="font-semibold">accessing quality healthcare shouldn't be a puzzle.</span>
            </p>
            <p className="text-lg leading-relaxed">
              We've all been there. You need medical care—whether for yourself, a child, or a parent—and you're faced with endless options, fragmented information, and confusing processes. You might spend hours researching providers, making calls, waiting on hold, and still not feel confident you've made the right choice. For many families and individuals, this process is frustrating, stressful, and sometimes leads to delayed care.
            </p>
            <p className="text-lg leading-relaxed">
              We created MediData to change that reality. Our founders and team members have experienced this frustration firsthand—as patients, as family caregivers, and as people who believe healthcare should work better. We came together with a shared conviction: <span className="font-semibold italic">every person deserves to navigate healthcare with confidence, clarity, and compassion.</span>
            </p>
            <p className="text-lg leading-relaxed">
              Today, MediData serves as the bridge between confusion and confidence, between endless searching and finding the right provider. We're committed to removing barriers so you can focus on what matters most: your health and your family's wellbeing.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Our Mission & Values</h2>

          <div className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
            <div className="bg-sky-50 border-l-4 border-sky-600 p-8 rounded">
              <p className="text-lg text-slate-700 italic">
                To empower individuals and families to confidently navigate healthcare by simplifying the search for quality providers, making information transparent and accessible, and enabling seamless connections with the care they need.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Core Values */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Core Values</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">🤝 Accessibility</h4>
                  <p className="text-slate-700">Healthcare information and connections should be available to everyone, regardless of background or technical comfort. We design for simplicity and inclusivity.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">🔍 Transparency</h4>
                  <p className="text-slate-700">We believe in honest, clear information. You'll always know what to expect, understand your options, and have access to the details that matter to you.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">💙 Patient-First Care</h4>
                  <p className="text-slate-700">Everything we do is centered on your needs. Your experience, your peace of mind, and your health outcomes drive our decisions every single day.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Our Commitment</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">👨‍👩‍👧‍👦 Family-Oriented</h4>
                  <p className="text-slate-700">We understand healthcare is often a family matter. Whether you're seeking care for yourself, your kids, or aging parents, we support the entire family journey.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">📚 Informed Decisions</h4>
                  <p className="text-slate-700">We empower you with the knowledge and tools to make healthcare decisions that align with your values and needs.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">🛡️ Trust & Security</h4>
                  <p className="text-slate-700">Your health information is sacred. We protect your privacy with industry-leading security and comply with all healthcare regulations including HIPAA.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-8">Our Vision</h2>
          <div className="bg-gradient-to-r from-sky-50 to-emerald-50 p-12 rounded-lg border-2 border-sky-200">
            <p className="text-xl text-slate-700 leading-relaxed mb-6">
              We envision a healthcare landscape where every person in the United States can easily find the right provider, understand their options, and access care without barriers, confusion, or unnecessary delays.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              In this future, healthcare navigation is no longer a source of stress. Families confidently connect with providers who understand their needs, appointments happen seamlessly, and everyone has access to high-quality care that works for them. MediData is proud to lead this transformation—one patient, one family, one connection at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose MediData Section */}
      <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-12">Why Choose MediData?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Simple & Intuitive</h3>
              <p className="text-slate-700">Designed for ease of use. Find care in minutes, not hours.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Nationwide Network</h3>
              <p className="text-slate-700">Access to thousands of providers and facilities across the United States.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤲</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Truly Patient-Centric</h3>
              <p className="text-slate-700">Built by people who care about your healthcare journey.</p>
            </div>
          </div>
        </div>
      </section>

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
              className="px-8 py-3 bg-white text-sky-600 font-semibold rounded-lg hover:bg-slate-100 transition"
            >
              Get Started
            </button>
            
          </div>
        </div>
      </div>
    </div>
  )
}
