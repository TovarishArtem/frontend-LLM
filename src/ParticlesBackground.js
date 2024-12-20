import React, { useCallback } from 'react'
import { loadFull } from 'tsparticles' // Импортируем функцию для загрузки полного конфигуратора

import Particles from 'react-tsparticles'

const ParticlesBackground = () => {
	const particlesInit = useCallback(async engine => {
		// Загружаем все необходимые пресеты и плагины
		await loadFull(engine)
	}, [])

	const particlesOptions = {
		particles: {
			number: {
				value: 85,
				density: {
					enable: true,
					value_area: 2288.528160733591,
				},
			},
			color: {
				value: '#ffffff',
			},
			shape: {
				type: 'star',
				stroke: {
					width: 0,
					color: '#000000',
				},
				polygon: {
					nb_sides: 5,
				},
			},
			opacity: {
				value: 0.063,
			},
			size: {
				value: 3,
				random: true,
			},
			line_linked: {
				enable: true,
				distance: 150,
				color: '#ffffff',
				opacity: 0.4,
				width: 1,
			},
			move: {
				enable: true,
				speed: 4.8,
			},
		},
		interactivity: {
			detect_on: 'canvas',
			events: {
				onhover: {
					enable: true,
					mode: 'repulse',
				},
				onclick: {
					enable: true,
					mode: 'push',
				},
			},
			modes: {
				grab: {
					distance: 400,
					line_linked: {
						opacity: 1,
					},
				},
				bubble: {
					distance: 400,
					size: 40,
					duration: 2,
					opacity: 8,
					speed: 3,
				},
				repulse: {
					distance: 200,
				},
				push: {
					particles_nb: 4,
				},
				remove: {
					particles_nb: 2,
				},
			},
		},
		retina_detect: true,
	}

	return (
		<Particles
			id='tsparticles'
			init={particlesInit}
			options={particlesOptions}
		/>
	)
}

export default ParticlesBackground
