/**
 * AuthBackground.tsx - Authentication Background Component
 * 
 * Provides a consistent full-screen background for authentication pages using
 * the modern gradient glow treatment shared across login/register.
 */

interface AuthBackgroundProps {
  children: React.ReactNode
}

export default function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <section className="page-surface relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-8rem] top-[-6rem] h-[26rem] w-[26rem] rounded-full bg-sky-300/80 blur-[90px] animate-light-wander-a" />
        <div className="absolute right-[-10rem] top-0 h-[20rem] w-[20rem] rounded-full bg-blue-300/75 blur-[80px] animate-light-wander-b" />
        <div className="absolute left-[15%] bottom-[-6rem] h-[18rem] w-[18rem] rounded-full bg-cyan-300/70 blur-[70px] animate-light-wander-c" />
        <div className="absolute right-[12%] bottom-[-4rem] h-[22rem] w-[22rem] rounded-full bg-emerald-300/75 blur-[90px] animate-light-wander-d" />
        <div className="absolute left-[55%] top-[10%] h-[16rem] w-[16rem] rounded-full bg-teal-300/70 blur-[60px] animate-light-wander-e" />
        <div className="absolute right-[40%] bottom-[8%] h-[14rem] w-[14rem] rounded-full bg-sky-200/80 blur-[55px] animate-light-wander-f" />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center">
        {children}
      </div>
    </section>
  )
}

