/**
 * FeatureCard.tsx - Feature Card Component
 * 
 * A reusable card component for displaying feature highlights.
 * Used in the Features section of the landing page.
 */

interface FeatureCardProps {
  title: string
  description: string
}

export default function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  )
}

