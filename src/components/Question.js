import React, { useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'

const Question = ({ createQuestion }) => {
	const inputRef = useRef()
	const fileInputRef = useRef()
	const [files, setFiles] = useState([])
	const [isDragging, setIsDragging] = useState(false) // Состояние для отображения зоны перетаскивания

	// Обработчик для отправки вопроса
	const handleSend = () => {
		const messageText = inputRef.current.value
		const file = files[0] || fileInputRef.current?.files[0]

		if (messageText || file) {
			createQuestion(messageText, file || null)
		}

		// Очистка
		inputRef.current.value = ''
		if (fileInputRef.current) fileInputRef.current.value = ''
		setFiles([]) // Сбросим файлы после отправки
	}

	// Обработчик для выбора файлов
	const handleFileChange = e => {
		const selectedFiles = e.target.files
		if (selectedFiles && selectedFiles.length > 0) {
			setFiles([...selectedFiles]) // Обновляем состояние с выбранными файлами
		}
	}

	// Обработчик для удаления файла
	const handleRemoveFile = () => {
		setFiles([]) // Очищаем файлы
	}

	const handleKeyDown = event => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSend()
		}
	}

	// Обработчик для dropzone
	const { getRootProps, getInputProps } = useDropzone({
		accept: 'image/*', // Только изображения
		maxFiles: 1, // Ожидаем только один файл
		onDrop: (acceptedFiles, rejectedFiles) => {
			if (rejectedFiles.length > 0) {
				alert('Ошибка: Неверный файл')
			} else {
				setFiles(acceptedFiles)
			}
			setIsDragging(false) // Скрыть dropzone после того как файл перетащен
		},
		onDragEnter: () => setIsDragging(true), // Отображаем dropzone, когда начинается перетаскивание
		onDragLeave: () => setIsDragging(false), // Скрываем dropzone, когда файл уходит из зоны
	})

	// Проверяем, есть ли файлы
	const previewFile = files.length > 0 ? files[0].name : null // Имя файла

	return (
		<div className='question_container'>
			{previewFile && (
				<div className='container-image'>
					<div className='file-preview'>
						{/* Обрезаем название до 10 символов и добавляем '...' если оно длинное */}
						<p>
							{previewFile.length > 10
								? previewFile.slice(0, 10) + '...'
								: previewFile}
						</p>
						{/* Кнопка для удаления файла */}
						<button onClick={handleRemoveFile} className='remove-file'>
							X
						</button>
					</div>
				</div>
			)}
			<div className='question_win'>
				{/* Скрытый input для загрузки файла */}
				<input
					type='file'
					id='file-upload' // Добавляем id для связи с label
					ref={fileInputRef}
					style={{ display: 'none' }}
					onChange={handleFileChange} // Обработчик изменений файлов
				/>

				{/* Иконка для загрузки файла, при клике на неё открывается диалоговое окно */}
				<label
					htmlFor='file-upload' // Связываем с id скрытого input
					className='custom-file-upload'
					style={{ cursor: 'pointer' }}
					title='Файл'
				>
					<i
						className='fa fa-upload'
						style={{ fontSize: '40px', color: '#007BFF' }}
					></i>
				</label>

				{/* Текстовое поле для ввода вопроса */}
				<textarea
					ref={inputRef}
					autoFocus
					placeholder='Задайте вопрос'
					onInput={e => {
						// Динамически меняем высоту textarea при вводе
						e.target.style.height = 'auto'
						e.target.style.height = `${e.target.scrollHeight}px`
					}}
					onKeyDown={handleKeyDown}
				></textarea>

				{/* Кнопка отправки вопроса */}
				<label
					type='submit'
					onClick={handleSend}
					className='send_message'
					title='Отправить'
				></label>
			</div>

			{/* Отображаем Dropzone только если файлов нет и происходит перетаскивание */}
			{(files.length === 0 || isDragging) && (
				<div
					{...getRootProps()}
					className={`dropzone ${isDragging ? 'dragging' : ''}`}
				>
					<input {...getInputProps()} />
					<p>Перетащите файл сюда или нажмите для выбора</p>
				</div>
			)}
		</div>
	)
}

export default Question
