import React, { useCallback } from 'react'
import { loadSlim } from 'tsparticles-slim'
import Particles from 'react-tsparticles'

const ParticlesBackground = () => {
  const particlesInit = useCallback(async engine => {
    await loadSlim(engine) // только базовые функции
  }, [])

  const particlesOptions = {
    particles: {
      number: {
        value: 30,
        density: {
          enable: true,
          value_area: 1000,
        },
      },
      color: {
        value: '#ffffff',
      },
      shape: {
        type: 'circle', // легче, чем 'star'
      },
      opacity: {
        value: 0.3,
      },
      size: {
        value: 4,
        random: true,
      },
      move: {
        enable: true,
        speed: 1.2,
      },
    },
    interactivity: {
      events: {
        onhover: { enable: false },
        onclick: { enable: false },
      },
    },
    retina_detect: true,
  }

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
    />
  )
}

export default ParticlesBackground
