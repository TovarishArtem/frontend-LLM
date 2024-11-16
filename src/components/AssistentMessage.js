import React, { Component } from 'react'

export class AssistentMessage extends Component {
	render() {
		return (
			<div className='container_item_assistantMessage'>
				<p>{this.props.message.sender}</p>
				<div className='assistantMessage'>
					<p>{this.props.message.text}</p>
				</div>
			</div>
		)
	}
}

export default AssistentMessage
