/**
 * AuthBackground.tsx - Authentication Background Component
 * 
 * Provides a consistent full-screen background for authentication pages.
 * Uses the MediData background image with overlay effects for better text readability.
 * 
 * Features:
 * - Full-screen background image from public folder
 * - Dark overlay (60% opacity) for contrast
 * - Gradient overlay for visual depth
 * - Centered content area for form cards
 */

interface AuthBackgroundProps {
  children: React.ReactNode
}

export default function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <section
      className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10"
      style={{ backgroundImage: "url('/MediData Background.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-slate-900/60" />
      {/* Gradient overlay for visual depth */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/30 via-sky-500/10 to-emerald-400/20" />
      {/* Content container - centered and above overlays */}
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </section>
  )
}

