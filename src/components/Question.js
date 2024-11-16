import React, { Component, createRef } from 'react'

export class Question extends Component {
	constructor(props) {
		super(props)
		this.inputRef = createRef() // Создаем ref для текста
		this.fileInputRef = createRef() // Создаем ref для загрузки файла
	}

	handleSend = () => {
		const messageText = this.inputRef.current.value
		const file = this.fileInputRef.current.files[0]

		if (file) {
			this.props.createQuestion(messageText, file)
		} else {
			// Если файла нет, передаем только текст
			this.props.createQuestion(messageText, null)
		}
		// Очистка всех инпутов после отправки
		this.inputRef.current.value = '' // Очистить текстовое поле
		this.fileInputRef.current.value = '' // Очистить файл
	}

	render() {
		return (
			<>
				<div className='question_win'>
					<input
						ref={this.fileInputRef} // Привязываем ref к input file
						type='file'
						id='file-upload'
						style={{ display: 'none' }}
					/>
					<label htmlFor='file-upload' className='custom-file-upload'></label>
					<textarea
						ref={this.inputRef}
						autoFocus
						placeholder='Задайте вопрос'
						onInput={e => {
							e.target.style.height = 'auto'
							e.target.style.height = `${e.target.scrollHeight}px`
						}}
					></textarea>
					<label
						onClick={this.handleSend} // Используем метод handleSend для отправки
						className='send_message'
					></label>
				</div>
			</>
		)
	}
}

export default Question
