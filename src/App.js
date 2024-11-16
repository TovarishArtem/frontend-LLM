import './App.css'
import React from 'react'

import DialogСhat from './components/DialogСhat'
import Header from './components/Header'
import Nav from './components/Nav'
import Question from './components/Question'

class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			messages: [
				{
					id: 1,
					text: 'я юзер',
					sender: 'user',
					image: null,
				},
				{
					id: 2,
					text: 'я ассистент',
					sender: 'assistent',
					image: null,
				},
			],
		}
		this.websocketClient = new WebSocket('ws://localhost:8765')
		this.websocketClient.onmessage = message => {
			let text = message.data
			this.createMessageAssistent(text)
		}

		this.createMessageUser = this.createMessageUser.bind(this)
	}

	createMessageAssistent(message) {
		const newMessage = {
			id: Date.now(),
			sender: 'assistent',
			text: message,
			image: null,
		}
		this.setState(prevState => ({
			messages: [...prevState.messages, newMessage],
		}))
	}

	createMessageUser(message, image) {
		// Проверяем, есть ли изображение и является ли оно не SVG
		if (image) {
			// Проверяем тип файла
			const fileType = image.type.toLowerCase() // Получаем MIME-тип файла
			const isImage = fileType.startsWith('image/') // Проверяем, является ли это изображением
			const isSvg = fileType === 'image/svg+xml' // Проверяем, является ли это SVG

			if (isImage && !isSvg) {
				const reader = new FileReader()
				reader.onload = () => {
					const base64Image = reader.result.split(',')[1] // Убираем префикс data:image/png;base64,

					const messageData = {
						text: message,
						image: base64Image, // Передаем изображение как base64 строку
					}

					// Отправляем JSON с текстом и изображением
					this.websocketClient.send(JSON.stringify(messageData))

					// Сохраняем сообщение с изображением в state
					const newMessage = {
						id: Date.now(),
						sender: 'user',
						text: message,
						image: base64Image, // Сохраняем изображение как base64
					}
					this.setState(prevState => ({
						messages: [...prevState.messages, newMessage],
					}))
				}
				reader.readAsDataURL(image)
			} else {
				// Если изображение не является изображением (например, SVG), выводим ошибку или игнорируем
				alert('Please upload a valid image (excluding SVG files).')
			}
		} else {
			// Если изображения нет, отправляем только текст
			this.websocketClient.send(JSON.stringify({ text: message }))
			const newMessage = {
				id: Date.now(),
				sender: 'user',
				text: message,
				image: null,
			}
			this.setState(prevState => ({
				messages: [...prevState.messages, newMessage],
			}))
		}
	}

	render() {
		return (
			<div className='App'>
				<Header />
				<div className='container_nav_and_main'>
					<Nav />

					<main>
						<div className='container_win_chat_and_img'>
							<div className='win_chat'>
								{/* Передаем userMessages с изображениями в DialogChat */}
								<DialogСhat userMessages={this.state.messages} />
								{/* Передаем функцию createMessageUser в Question */}
								<Question createQuestion={this.createMessageUser} />
							</div>
						</div>
					</main>
				</div>
			</div>
		)
	}
}

export default App
