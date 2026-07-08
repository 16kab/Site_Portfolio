import ScrollRevealTitle from './ScrollRevealTitle';
import ScrollFadeIn from './ScrollFadeIn';

interface Recommendation {
  name: string;
  position: string;
  company: string;
  text: string;
  image?: string;
}

interface RecommendationsProps {
  recommendations: Recommendation[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  return (
    <section>
      <div>
        {/* Header */}
        <div className="mb-20">
          <ScrollRevealTitle delay={0.2}>
            <p 
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 500,
                fontSize: 'clamp(0.8125rem, 0.75rem + 0.3125vw, 0.9375rem)',
                lineHeight: '1.6',
                color: '#BABABA',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Ce que disent mes collaborateurs
            </p>
          </ScrollRevealTitle>
          <ScrollRevealTitle delay={0.25}>
            <h1 
              style={{ 
                fontFamily: 'Manrope, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(2rem, 1rem + 5vw, 3rem)',
                lineHeight: '1.1',
                letterSpacing: '-1.4px',
                color: '#F1F1F1'
              }}
            >
              Références
            </h1>
          </ScrollRevealTitle>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {recommendations.map((rec, index) => (
            <ScrollFadeIn key={index} delay={0.3 + index * 0.05}>
              <div
                className="p-8 flex flex-col h-full"
                style={{
                  backgroundColor: '#151615',
                  borderRadius: '12px',
                  border: '1px solid #1C1D1C'
                }}
              >
                {/* Content */}
                <div className="flex-1 flex flex-col">
                  {/* Testimonial Text */}
                  <p 
                    className="flex-1"
                    style={{ 
                      fontFamily: 'Manrope, sans-serif',
                      fontWeight: 400,
                      fontSize: 'clamp(0.875rem, 0.8125rem + 0.3125vw, 1rem)',
                      lineHeight: '1.7',
                      color: '#BABABA',
                      fontStyle: 'italic'
                    }}
                  >
                    "{rec.text}"
                  </p>

                  {/* Author Info */}
                  <div 
                    className="pt-4 mt-4"
                    style={{ 
                      borderTop: '1px solid rgba(186, 186, 186, 0.15)' 
                    }}
                  >
                    <p 
                      style={{ 
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 600,
                        fontSize: 'clamp(1.125rem, 1rem + 0.625vw, 1.375rem)',
                        lineHeight: '1.3',
                        letterSpacing: '-0.5px',
                        color: '#F1F1F1'
                      }}
                    >
                      {rec.name}
                    </p>
                    <p 
                      style={{ 
                        fontFamily: 'Manrope, sans-serif',
                        fontWeight: 400,
                        fontSize: 'clamp(0.8125rem, 0.75rem + 0.3125vw, 0.9375rem)',
                        lineHeight: '1.5',
                        color: '#BABABA'
                      }}
                    >
                      {rec.position} - {rec.company}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollFadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}