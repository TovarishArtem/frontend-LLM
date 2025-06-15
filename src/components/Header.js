import React from 'react'
import { ArrowRightFromSquare } from '@gravity-ui/icons'
import { CircleInfo } from '@gravity-ui/icons'
import { BarsAscendingAlignLeft } from '@gravity-ui/icons'

const Header = ({ onStartTour, setShowAside, model, setModel }) => {
	const handleLogout = () => {
		// Очистка данных аутентификации (например, JWT-токен)
		localStorage.removeItem('token') // Если используете sessionStorage -> sessionStorage.removeItem('token')

		// Перенаправление на страницу входа (если используете React Router)
		window.location.href = '/login' // Или используйте navigate() из react-router
	}
	return (
		<header className='header'>
			<div className='left-section'>
				<BarsAscendingAlignLeft
					className='buttonAside_burger'
					onClick={setShowAside}
				/>
			</div>
			<div className='center-section'>
				<select
					className='model-select'
					value={model}
					onChange={e => setModel(e.target.value)}
				>
					<option value='llama3.2-vision'>Llama3.2-vision</option>
					<option value='omnifusion1.1'>Omnifusion1.1</option>
				</select>
			</div>
			<div className='right-section'>
				<div className='container_buttonsHeader'>
					{/* Кнопка для выхода */}
					<button
						className='exit'
						onClick={handleLogout}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							marginLeft: '3.5rem',
						}}
						title='Выйти'
					>
						<ArrowRightFromSquare size={30} />
					</button>
					{/* Кнопка для инструктажа */}
					<button
						className='exit'
						onClick={onStartTour} // Вызов функции для показа модалки
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							marginRight: '1rem',
						}}
						title='Инструктаж'
					>
						<CircleInfo size={30} />
					</button>
				</div>
			</div>
		</header>
	)
}

export default Header
