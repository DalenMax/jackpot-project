import Link from "next/link";

interface SuiJackpotLogoProps {
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function SuiJackpotLogo({ showTagline = true, size = 'md' }: SuiJackpotLogoProps) {
  const logoSizes = {
    sm: { container: 'w-8 h-8', text: 'text-lg', brandText: 'text-lg', tagline: 'text-xs' },
    md: { container: 'w-12 h-12', text: 'text-lg', brandText: 'text-2xl', tagline: 'text-xs' },
    lg: { container: 'w-16 h-16', text: 'text-2xl', brandText: 'text-3xl', tagline: 'text-sm' }
  };

  const currentSize = logoSizes[size];

  return (
    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
      {/* Custom SuiJackpot Logo */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className={`absolute inset-0 ${currentSize.container} rounded-full bg-gradient-to-r from-[#00D4FF] via-[#FFE500] to-[#FF61E6] opacity-50 blur-sm group-hover:opacity-80 transition-opacity`}></div>
        
        {/* Main logo container */}
        <div className={`relative ${currentSize.container} rounded-full bg-gradient-to-br from-[#0A0E27] via-[#1A1F3A] to-[#0F1635] border-2 border-[#FFE500] flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform`}>
          {/* Inner gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00D4FF]/20 via-[#FFE500]/20 to-[#FF61E6]/20"></div>
          
          {/* SUI symbol */}
          <div className={`relative z-10 text-[#FFE500] font-black ${currentSize.text} group-hover:text-white transition-colors`}>
            S
          </div>
          
          {/* Jackpot coins/chips around the S */}
          <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 rounded-full bg-[#FF61E6] animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#FFE500] animate-pulse" style={{animationDelay: '1s'}}></div>
          
          {/* Rotating ring effect */}
          <div className="absolute inset-1 border border-[#00D4FF]/30 rounded-full animate-spin" style={{animationDuration: '8s'}}></div>
        </div>
      </div>
      
      {/* Stylized brand name */}
      <div className="flex flex-col">
        <h1 className={`${currentSize.brandText} font-black leading-none`}>
          <span className="bg-gradient-to-r from-[#00D4FF] via-[#FFE500] to-[#FF61E6] bg-clip-text text-transparent">
            Sui
          </span>
          <span className="text-white">Jackpot</span>
        </h1>
        {showTagline && (
          <div className={`${currentSize.tagline} text-[#FFE500] font-semibold tracking-wider opacity-80`}>
            MASSIVE WINS
          </div>
        )}
      </div>
    </Link>
  );
}