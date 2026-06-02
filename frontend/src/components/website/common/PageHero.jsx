const PageHero = ({
  badge,
  title,
  highlight,
  description,
  children,
  className = '',
}) => (
  <section
    className={`relative pt-16 pb-14 md:pt-20 md:pb-16 section-white bg-mesh-brand bg-grid-pattern border-b border-white/10 overflow-hidden ${className}`}
  >
    <div className="ambient-glows" aria-hidden />
    <div className="container-custom relative z-10">
      <div className="max-w-3xl mx-auto text-center space-y-5">
        {badge && (
          <div className="badge-pill mx-auto w-fit">
            <span className="badge-pill-dot" />
            {badge}
          </div>
        )}
        <h1 className="heading-display text-4xl md:text-5xl lg:text-6xl">
          {title}
          {highlight && (
            <>
              {' '}
              <span className="text-gradient">{highlight}</span>
            </>
          )}
        </h1>
        <div className="divider-brand" />
        {description && (
          <p className="text-lg copy-on-dark-muted max-w-2xl mx-auto">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  </section>
)

export default PageHero
