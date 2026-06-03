// Step progress indicator for the 3-step partner registration flow
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Registration Form', icon: '📋' },
    { number: 2, label: 'Download Agreement', icon: '📄' },
    { number: 3, label: 'Sign & Pay', icon: '💳' },
  ]

  return (
    <div className="relative flex items-center justify-between mb-10 px-2">
      {/* Connecting line */}
      <div className="absolute top-5 left-0 right-0 h-px bg-white/10 z-0" />
      <div
        className="absolute top-5 left-0 h-px bg-gradient-to-r from-aim-gold to-aim-purple z-0 transition-all duration-700"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />

      {steps.map((step) => {
        const isDone = currentStep > step.number
        const isActive = currentStep === step.number

        return (
          <div key={step.number} className="relative z-10 flex flex-col items-center gap-2">
            {/* Circle */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all duration-500 ${
                isDone
                  ? 'bg-aim-gold border-aim-gold text-aim-navy shadow-lg shadow-aim-gold/30'
                  : isActive
                  ? 'bg-aim-navy border-aim-gold text-aim-gold shadow-lg shadow-aim-gold/20 ring-4 ring-aim-gold/20'
                  : 'bg-aim-navy-light border-white/10 text-aim-copy-muted'
              }`}
            >
              {isDone ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{step.number}</span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[11px] font-semibold text-center max-w-[80px] leading-tight transition-colors duration-300 ${
                isActive ? 'text-aim-gold' : isDone ? 'text-white/70' : 'text-aim-copy-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
