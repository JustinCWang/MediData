export default function App() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <a href="#" className="inline-flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">MediData</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-slate-600">Features</a>
            <a href="#how-it-works" className="hover:text-slate-600">How it works</a>
            <a href="#contact" className="hover:text-slate-600">Contact</a>
          </nav>
          <a
            href="#get-started"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white text-sm font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get started
          </a>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  Find the right provider, fast.
                </h1>
                <p className="mt-4 text-lg text-slate-600">
                  MediData connects patients with the most suitable healthcare provider based on
                  needs, availability, insurance, and outcomes—within minutes.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="#get-started"
                    className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-white font-medium shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Find my provider
                  </a>
                  <a
                    href="#learn-more"
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Learn more
                  </a>
                </div>
              </div>
              <div className="md:pl-6">
                <div className="aspect-4/3 w-full rounded-xl border border-slate-200 br-linear-to-br from-blue-50 to-sky-50 p-6">
                  <div className="h-full w-full rounded-lg border border-dashed border-slate-300 grid place-items-center text-slate-500">
                    Future: search, match results, and booking UI
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-slate-50">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard title="Personalized matching" description="We match by condition, specialty, location, insurance, and provider outcomes." />
              <FeatureCard title="Verified providers" description="Profiles include credentials, ratings, availability, and accepted insurance." />
              <FeatureCard title="Fast and secure" description="HIPAA-conscious design with fast response times and secure data handling." />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">How it works</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              <li className="rounded-lg border border-slate-200 bg-white p-5">
                <span className="font-semibold">1. Tell us your needs</span>
                <p className="mt-2 text-slate-600">Symptoms, preferences, insurance, and location.</p>
              </li>
              <li className="rounded-lg border border-slate-200 bg-white p-5">
                <span className="font-semibold">2. Get matched</span>
                <p className="mt-2 text-slate-600">We surface top providers with real-time availability.</p>
              </li>
              <li className="rounded-lg border border-slate-200 bg-white p-5">
                <span className="font-semibold">3. Book in minutes</span>
                <p className="mt-2 text-slate-600">Schedule directly and manage follow-ups seamlessly.</p>
              </li>
            </ol>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>© {new Date().getFullYear()} MediData. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-slate-800">Privacy</a>
            <a href="#" className="hover:text-slate-800">Terms</a>
            <a href="#" className="hover:text-slate-800">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  )
}
