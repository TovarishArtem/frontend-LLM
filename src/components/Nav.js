import React, { useState, useEffect } from 'react'
import {Xmark} from '@gravity-ui/icons';

const Nav = ({
	onShowAside,
	dialogs,
	currentDialogId,
	onSelect,
	onCreate,
	onDelete,
}) => {
	const [showSettings, setShowSettings] = useState(false)
	const [maxLength, setMaxLength] = useState(700);
	const [numBeams, setNumBeams] = useState(1);
	const [numReturnSequences, setNumReturnSequences] = useState(1);
	const [doSample, setDoSample] = useState(false);
	const [earlyStopping, setEarlyStopping] = useState(false);
	const [prompt, setPrompt] = useState('');


	const navClassName = window.innerWidth < 768 ? 'nav_phone' : 'nav_desktop'
	const activeClass = onShowAside ? ' active' : ''

	const toggleSettings = () => setShowSettings(!showSettings)
	useEffect(() => {
	const saved = JSON.parse(localStorage.getItem('generationSettings'));
	if (saved) {
		setMaxLength(saved.maxLength ?? 300);
		setNumBeams(saved.numBeams ?? 4);
		setNumReturnSequences(saved.numReturnSequences ?? 1);
		setDoSample(saved.doSample ?? true);
		setEarlyStopping(saved.earlyStopping ?? true);
	}
}, []);

	useEffect(() => {
	localStorage.setItem(
		'generationSettings',
		JSON.stringify({
			prompt,
			maxLength,
			numBeams,
			numReturnSequences,
			doSample,
			earlyStopping,
		})
	);
}, [ prompt, maxLength, numBeams, numReturnSequences, doSample, earlyStopping]);
	

	return (
		
		<nav className={navClassName + activeClass}>
			<div className='our_dialog'>
				<p>Ваши диалоги</p>
				<button onClick={onCreate}>+ Новый</button>
			</div>
			<ul className='ul_dialogs'>
				{dialogs.map((dialog) => {
					const isActive = dialog.id === currentDialogId;

					return (
					<li
						key={dialog.id}
						className={isActive ? 'active' : ''}
						onClick={() => onSelect(dialog.id)}
						style={{ cursor: 'pointer', position: 'relative' }}
					>
						<span className='dialog_item'>
						{dialog.name || 'Новый диалог'}
						</span>

						<Xmark
						className='button_delete'
						onClick={(e) => {
							e.stopPropagation(); // 🔑 блокируем всплытие клика
							onDelete(dialog.id);
						}}
						title='Удалить диалог'
						/>

						<hr style={{ width: '100%', opacity: '0.2' }} />
					</li>
					);
				})}
				</ul>


			<div className='settings'>
				<ul className='ul_settings'>
					<li onClick={toggleSettings} style={{ cursor: 'pointer' }}>
						Параметры
					</li>
					<li>Настройки</li>
				</ul>

				{showSettings && (
					<div className='model-settings-popup'>
					<div className='slider-setting'>
						{/* Prompt */}
					<div className='slider-setting'>
					<div className='tooltip-wrapper'>
						<label htmlFor='prompt'>Prompt (начальный текст):</label>
						<div className='tooltip-text'>
						Текст, который будет добавлен к запросу<br />
						и использован как старт для генерации.
						</div>
					</div>
					<input
						type='text'
						id='prompt'
						value={prompt}
						onChange={e => setPrompt(e.target.value)}
						placeholder='Введите prompt...'
					/>
					</div>
						{/* Num beams */}
						<div className='slider-setting'>
							<div className='tooltip-wrapper'>
								<label htmlFor='numBeams'>Num beams: {numBeams}</label>
								<div className='tooltip-text'>
								<strong>Количество "лучей" (вариантов) генерации при beam search.</strong>
								Чем больше num_beams, тем выше шанс найти более качественный ответ,<br />
								но генерация становится медленнее.
								</div>
								</div>
								<input
									type='range'
									id='numBeams'
									min='1'
									max='7'
									step='1'
									value={numBeams}
									onChange={e => setNumBeams(Number(e.target.value))}
									/>
								</div>
									</div>

						{/* Return Sequences*/}
						<div className='slider-setting'>
							<div className='tooltip-wrapper'>
								<label htmlFor='numReturnSequences'>Return Sequences: {numReturnSequences}</label>
								<div className='tooltip-text'>
								<strong>Сколько сгенерированных вариантов ответа вернуть.</strong><br / >
								Можно использовать для генерации нескольких альтернативных вариантов.
								Должно быть ≤ num_beams.
								</div>
								</div>
							<input
								type='range'
								id='numReturnSequences'
								min='1'
								max='7'
								step='1'
								value={numReturnSequences}
								onChange={e => setNumReturnSequences(Number(e.target.value))}
							/>
						</div>
						{/* doSample*/}
						<div className='slider-setting'>
							<div className='tooltip-wrapper'>
							<label htmlFor='topP'>do_sample {doSample}</label>
							<div className='tooltip-text'>
								<strong>Включает случайную выборку токенов (sampling).</strong><br />
								true — ответы более разнообразные.
								false — модель всегда выбирает самое вероятное слово.
							</div>
							</div>
							<input
								type='checkbox'
								checked={doSample}
								onChange={e => setDoSample(e.target.checked)}
							/>
						</div>
						{/* early_stopping */}
						<div className='slider-setting'>
							<div className='tooltip-wrapper'>
							<label htmlFor='topP'>early_stopping{earlyStopping}</label>
							<div className='tooltip-text'>
								<strong>Останавливает генерацию, если достигнут конец логической последовательности.</strong><br />
								Позволяет избежать "перегенерации" или бесконечных фраз.
							</div>
							</div>
							<input
								type='checkbox'
								checked={earlyStopping}
								onChange={e => setEarlyStopping(e.target.checked)}
							/>
						</div>
						{/* Max Length */}
						<div className='slider-setting'>
							<div className='tooltip-wrapper'>
							<label htmlFor='maxLength'>Max Tokens: {maxLength}</label>
							<div className='tooltip-text'>
								Ограничивает количество токенов<br />
								в ответе модели. Увеличение может<br />
								повлиять на время генерации.
							</div>
							</div>
							<input
							type='range'
							id='maxLength'
							min='10'
							max='1000'
							step='10'
							value={maxLength}
							onChange={e => setMaxLength(Number(e.target.value))}
							/>
						</div>
						<button onClick={() => setShowSettings(false)}>Закрыть</button>
						</div>
					
				)}
			</div>
		</nav>
	)
}

export default Nav
