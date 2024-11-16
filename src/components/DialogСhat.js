import React, { Component } from 'react'
import UserMessage from './UserMessage'
import AssistentMessage from './AssistentMessage'

export class DialogChat extends Component {
	render() {
		return (
			<>
				<div className='dialog_chat'>
					<div className='items_chat'>
						{this.props.userMessages.length > 0 &&
							this.props.userMessages.map((el, index) =>
								el.sender === 'user' ? (
									<UserMessage key={index} message={el} />
								) : (
									<AssistentMessage key={index} message={el} />
								)
							)}
					</div>
				</div>
			</>
		)
	}
}

export default DialogChat
