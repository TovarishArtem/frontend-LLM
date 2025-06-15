import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../Login.css'

const Register = () => {
	const [formData, setFormData] = useState({ username: '', password: '' })
	const navigate = useNavigate() // Навигация после успешной регистрации
	const URL = process.env.REACT_APP_BASE_URL_API;

	const handleChange = e => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleRegister = async e => {
		e.preventDefault()
		try {
			const response = await axios.post(
				URL + '/register',
				formData,
				{
					headers: { 'Content-Type': 'application/json' },
				}
			)

			alert('Регистрация успешна! Теперь войдите.')
			navigate('/login') // Перенаправляем пользователя на страницу логина
		} catch (error) {
			console.error(
				'Ошибка регистрации:',
				error.response?.data?.detail || error.message
			)
			alert(`Ошибка: ${error.response?.data?.detail || 'Неизвестная ошибка'}`)
		}
	}

	return (
		<div className='login_or_register'>
			<div className='window'>
				<form onSubmit={handleRegister}>
					<h2>Регистрация</h2>
					<input
						type='text'
						name='username'
						placeholder='Имя'
						value={formData.username}
						onChange={handleChange}
						required
					/>
					<input
						type='password'
						name='password'
						placeholder='Пароль'
						value={formData.password}
						onChange={handleChange}
						required
					/>
					<button type='submit'>Зарегистрироваться</button>
				</form>
			</div>
		</div>
	)
}

export default Register
