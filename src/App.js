import './App.css'
import React from 'react'
import ParticlesBackground from './ParticlesBackground'
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
		this.websocketClient = new WebSocket('ws://26.184.252.243:8765')
		this.websocketClient.onmessage = message => {
			let text = message.data
			this.createDelayedAssistentMessage(text)
		}

		this.createMessageUser = this.createMessageUser.bind(this)
	}

	// Создаём временное сообщение "Загрузка..." и заменяем его через 5 секунд
	createDelayedAssistentMessage(finalMessage) {
		// Добавляем сообщение "Загрузка..."
		const loadingMessageId = Date.now()
		const loadingMessage = {
			id: loadingMessageId,
			sender: 'assistent',
			text: 'Пишет...',
			image: null,
		}

		this.setState(prevState => ({
			messages: [...prevState.messages, loadingMessage],
		}))

		// Через 5 секунд заменяем "Загрузка..." на ответ
		setTimeout(() => {
			this.setState(prevState => ({
				messages: prevState.messages.map(message =>
					message.id === loadingMessageId
						? { ...message, text: finalMessage } // Обновляем текст сообщения
						: message
				),
			}))
		}, 5000)
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
				<ParticlesBackground className='particlesBackground' />
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
