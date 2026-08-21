import PixelBlast from '../PixelBlast/PixelBlast';
import './PageHero.css';

/* Contact passes no copy at all, so there is nothing to caption its hero with —
   skip the text block entirely rather than render an empty heading. */
export default function PageHero({ eyebrow, title, subtitle }) {
  const hasContent = Boolean(eyebrow || title || subtitle);

  return (
    <section className="page-hero">
      <div className="page-hero__pixels" aria-hidden="true">
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color="#59a14a"
          patternScale={3}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>
      <div className="page-hero__glow" aria-hidden="true" />
      {hasContent && (
        <div className="page-hero__background">
          <div className="page-hero__inner">
            {eyebrow && <span className="page-hero__eyebrow">{eyebrow}</span>}
            <h1 className="page-hero__title">{title}</h1>
            {subtitle && <p className="page-hero__subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
    </section>
  );
}
