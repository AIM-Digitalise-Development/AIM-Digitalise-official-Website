const Card = ({ children, className = '', hover = false, padding = 'md' }) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  return (
    <div
      className={`card-elevated ${hover ? 'card-elevated-hover cursor-pointer ' : ''} ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
