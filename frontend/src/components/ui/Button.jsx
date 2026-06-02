import { forwardRef } from 'react'

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-aim-navy disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-aim-gold text-aim-navy hover:bg-aim-gold-light focus:ring-aim-gold/50 shadow-brand-gold',
    secondary: 'bg-transparent text-slate-200 border border-white/15 hover:border-aim-gold/40 hover:bg-aim-gold/10 hover:text-white focus:ring-aim-gold/30',
    danger: 'bg-aim-purple text-white hover:bg-aim-purple-light focus:ring-aim-purple/50 shadow-brand-purple',
    outline: 'border-2 border-aim-gold/70 text-aim-gold hover:bg-aim-gold/10 focus:ring-aim-gold/40 bg-transparent',
    ghost: 'text-slate-300 hover:bg-white/5 hover:text-aim-gold focus:ring-aim-gold/30',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5'
  }

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
