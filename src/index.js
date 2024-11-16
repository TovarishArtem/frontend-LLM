import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals


document.addEventListener(
	'DOMContentLoaded',
	function () {
		const messageContainer = document.querySelector('#message_container')
		const messageInput = document.querySelector('[name=message_input]')
		const messageInputBtn = document.querySelector('[name=send_message_button]')
		const fileInput = document.querySelector('[name=file_input]')

		let websocketClient = new WebSocket('ws://localhost:8765')
		websocketClient.onopen = () => {
			messageInputBtn.onclick = () => {
				// websocketClient.send(messageInput.value);
				reader.onloadend = () => {
					const base64Data = reader.result.replace(
						/^data:image\/\w+;base64,/,
						''
					)
					const message = { text, image: base64Data }
					websocketClient.send(JSON.stringify(message)) // Отправляем JSON с текстом и изображением
				}
				reader.readAsDataURL(file)
				const newUserMessage = document.createElement('div')
				newUserMessage.innerHTML = text
				newUserMessage.className += 'user_message'
				messageContainer.appendChild(newUserMessage)
			}
			websocketClient.onmessage = message => {
				const newMessage = document.createElement('div')
				newMessage.innerHTML = message.data
				newMessage.className += 'anton_message'
				messageContainer.appendChild(newMessage)
			}
		}
	},
	false
)
