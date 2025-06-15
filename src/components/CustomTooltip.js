import React from 'react'
import '../CustomTooltip.css'

const CustomTooltip = ({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}) => {
  return (
    <div className="custom-tooltip" {...tooltipProps}>
      <div className="custom-tooltip__header">
        <span className="custom-tooltip__step">
          Шаг {index + 1}
        </span>
        <button className="custom-tooltip__close" {...closeProps}>
          ×
        </button>
      </div>
      <div className="custom-tooltip__body">
        {step.content}
      </div>
      <div className="custom-tooltip__footer">
        {index > 0 && (
          <button className="custom-tooltip__back" {...backProps}>
            Назад
          </button>
        )}
        <button className="custom-tooltip__next" {...primaryProps}>
          {isLastStep ? 'Завершить' : 'Далее'}
        </button>
      </div>
    </div>
  )
}

export default CustomTooltip
