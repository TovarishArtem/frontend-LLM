import React, { Component } from 'react'

const BASE_URL = process.env.REACT_APP_BASE_URL;
export class UserMessage extends Component {
	
	render() {
		// Доступ к строке изображения base64 из пропсов
		const { image, text } = this.props.message

		return (
			<div className='container_item_userMessage'>
				<p className='p_userMessage'>{this.props.message.sender}</p>
				<div className='userMessage'>
					{/* Если есть изображение, вставляем его */}
					{image && (
						<img
							src={`${BASE_URL}/media/images/${decodeURIComponent(image.split('/').pop())}`}
							alt='User uploaded'
						/>
						)}

					{/* Если есть текст, отображаем его */}
					<p>{text}</p>
				</div>
			</div>
		)
	}
}

export default UserMessage
