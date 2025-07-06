import React from 'react';

interface ParticlesBackgroundProps {
  id?: string;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({ id = 'particles' }) => {

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 12,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.6 + 0.2,
  }));

  return (
    <div id={id} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes floatParticle {
            0%, 100% {
              transform: translateY(0px) translateX(0px) scale(1);
              opacity: 0.4;
            }
            25% {
              transform: translateY(-30px) translateX(15px) scale(1.2);
              opacity: 0.8;
            }
            50% {
              transform: translateY(-60px) translateX(-10px) scale(0.8);
              opacity: 0.6;
            }
            75% {
              transform: translateY(-30px) translateX(-15px) scale(1.1);
              opacity: 0.7;
            }
          }

          @keyframes glowEffect {
            0%, 100% {
              box-shadow: 0 0 10px #6DAEDB70, 0 0 20px #6DAEDB30;
            }
            50% {
              box-shadow: 0 0 20px #6DAEDB90, 0 0 40px #6DAEDB50, 0 0 60px #6DAEDB20;
            }
          }

          .floating-particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
                         animation: floatParticle var(--duration) ease-in-out infinite, glowEffect 8s ease-in-out infinite;
            animation-delay: var(--delay);
            background: radial-gradient(circle, #6DAEDB, #4F91C3, transparent);
          }

          .floating-particle:nth-child(2n) {
            background: radial-gradient(circle, #8FC8E8, #6DAEDB, transparent);
          }

          .floating-particle:nth-child(3n) {
            background: radial-gradient(circle, #A8D5F0, #8FC8E8, transparent);
          }

          .floating-particle:nth-child(4n) {
            animation-direction: reverse;
          }
        `,
        }}
      /><svg className="absolute inset-0 w-full h-full opacity-30" style={{ zIndex: 11 }}>
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6DAEDB" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#4F91C3" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6DAEDB" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {particles.slice(0, 12).map((particle, index) => {
          const nextParticle = particles[index + 1] || particles[0];
          const distance = Math.sqrt(
            Math.pow(particle.x - nextParticle.x, 2) + Math.pow(particle.y - nextParticle.y, 2)
          );

          if (distance < 40) {
            return (
              <line
                key={`connection-${particle.id}`}
                x1={`${particle.x}%`}
                y1={`${particle.y}%`}
                x2={`${nextParticle.x}%`}
                y2={`${nextParticle.y}%`}
                stroke="url(#connectionGradient)"
                strokeWidth="1"
                opacity="0.6"
              />
            );
          }
          return null;
        })}
      </svg>{particles.map(particle => (
        <div
          key={particle.id}
          className="floating-particle"
          style={
            {
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              '--duration': `${particle.duration}s`,
              '--delay': `${particle.delay}s`,
              opacity: particle.opacity,
            } as React.CSSProperties
          }
        />
      ))}<div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, #6DAEDB 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, #4F91C3 0%, transparent 50%),
            radial-gradient(circle at 60% 20%, #8FC8E8 0%, transparent 40%)
          `,
          animation: 'pulse 12s ease-in-out infinite',
        }}
      />
    </div>
  );
};

export default ParticlesBackground;