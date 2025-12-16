import React, { useState, useEffect } from 'react'

const AnimatedNumber = ({ value, duration = 2000, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let startTime
    const startValue = 0
    const endValue = typeof value === 'string' ? parseFloat(value) : value

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (endValue - startValue) * easeOutCubic

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  const formatNumber = (num) => {
    if (decimals === 0) {
      return Math.round(num).toLocaleString()
    }
    return num.toFixed(decimals)
  }

  return (
    <span>
      {prefix}{formatNumber(displayValue)}{suffix}
    </span>
  )
}

export default AnimatedNumber
