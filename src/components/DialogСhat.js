import React, { useEffect, useRef } from 'react'
import UserMessage from './UserMessage'
import AssistantMessage from './AssistantMessage'

const DialogChat = ({ messages }) => {
	const bottomRef = useRef(null)

	useEffect(() => {
		// Скроллим вниз при каждом обновлении messages
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: 'smooth' })
		}
	}, [messages])

	return (
		<div className='dialog_chat'>
			<div className='items_chat'>
				{Array.isArray(messages) && messages.length > 0 ? (
					messages.map((el, index) =>
						el.sender === 'user' ? (
							<UserMessage key={index} message={el} />
						) : (
							<AssistantMessage key={index} message={el} />
						)
					)
				) : (
					<p className='empty-chat'>Пока нет сообщений</p>
				)}

				{/* Якорь для автоскролла */}
				<div ref={bottomRef} />
			</div>
		</div>
	)
}

export default DialogChat
