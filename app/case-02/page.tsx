"use client";

import { useRouter } from "next/navigation";

export default function Case02Intro() {
  const router = useRouter();

  const handleBeginInvestigation = () => {
    router.push('/case-02/board');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url("/villa-intro.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Dark Overlay for readability */}
      <div className="fixed inset-0 z-10 bg-black/40" />
      
      {/* Content Container */}
      <div className="relative z-20 min-h-screen flex items-center justify-start p-8 md:p-16 lg:p-20">
        {/* Premium Glassmorphism Info Card */}
        <div 
          className="w-full max-w-xl p-10 md:p-12"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          
          {/* Header */}
          <div className="mb-6">
            <p className="text-xs font-light tracking-[0.4em] text-[#D4AF37] uppercase opacity-90">
              CASE 002
            </p>
          </div>
          
          {/* Title */}
          <div className="mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold leading-tight" 
              style={{ 
                fontFamily: 'Georgia, serif',
                color: '#D4AF37',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)'
              }}
            >
              THE LAST TRANSACTION
            </h1>
          </div>
          
          {/* Story Text */}
          <div className="mb-10">
            <p className="text-white text-base md:text-lg leading-relaxed opacity-95" 
               style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              A crypto investor was found dead inside his private villa. His Ledger device is missing, 
              along with assets worth $500,000.
            </p>
          </div>
          
          {/* Details Table */}
          <div className="mb-12 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#D4AF37] text-sm font-light tracking-wide opacity-80">LOCATION:</span>
              <span className="text-white text-sm font-light opacity-90">Private Villa</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#D4AF37] text-sm font-light tracking-wide opacity-80">DATE:</span>
              <span className="text-white text-sm font-light opacity-90">March 14</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#D4AF37] text-sm font-light tracking-wide opacity-80">TIME:</span>
              <span className="text-white text-sm font-light opacity-90">22:30</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#D4AF37] text-sm font-light tracking-wide opacity-80">STATUS:</span>
              <span 
                className="text-sm font-medium"
                style={{ 
                  color: '#D4AF37',
                  textShadow: '0 0 8px rgba(212, 175, 55, 0.5)'
                }}
              >
                Under Investigation
              </span>
            </div>
          </div>
          
          {/* Premium Ghost Button */}
          <button
            onClick={handleBeginInvestigation}
            className="group w-full flex items-center justify-center gap-3 px-6 py-4 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'transparent',
              border: '1px solid #D4AF37',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(212, 175, 55, 0.4)';
              e.currentTarget.style.borderColor = '#E6C547';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.2)';
              e.currentTarget.style.borderColor = '#D4AF37';
            }}
          >
            {/* Premium Fingerprint Icon */}
            <svg 
              className="w-5 h-5 transition-transform group-hover:scale-110" 
              style={{ color: '#D4AF37' }}
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M17.81 4.47c-.8 0-1.54.3-2.12.8l-1.44 1.44c-.58.5-1.32.8-2.12.8s-1.54-.3-2.12-.8L8.81 5.27c-.58-.5-1.32-.8-2.12-.8s-1.54.3-2.12.8L3.14 6.69c-.58.5-.92 1.23-.92 2.02v8.58c0 .79.34 1.52.92 2.02l1.43 1.22c.58.5 1.32.8 2.12.8s1.54-.3 2.12-.8l1.44-1.44c.58-.5 1.32-.8 2.12-.8s1.54.3 2.12.8l1.44 1.44c.58.5 1.32.8 2.12.8s1.54-.3 2.12-.8l1.43-1.22c.58-.5.92-1.23.92-2.02V8.71c0-.79-.34-1.52-.92-2.02l-1.43-1.22c-.58-.5-1.32-.8-2.12-.8z"/>
            </svg>
            
            <span 
              className="font-bold text-sm"
              style={{ 
                color: '#D4AF37',
                letterSpacing: '0.15em',
                textTransform: 'uppercase'
              }}
            >
              BEGIN INVESTIGATION
            </span>
          </button>
          
        </div>
      </div>
    </div>
  );
}
