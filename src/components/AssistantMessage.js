import React, { Component } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

export class AssistantMessage extends Component {
  render() {
    const { text, response } = this.props.message;

    // Гарантируем, что контент будет строкой
	const assistantText = Array.isArray(response)
	? response.join('\n') // соединяем массив строк в одну
	: typeof response === 'string'
		? response
		: text || ''; // если всё равно нет — fallback на text
	
    return (
      <div className='container_item_assistantMessage'>
        <p>{this.props.message.sender}</p>
        <div className='assistantMessage'>
          <MarkdownRenderer content={assistantText} />
        </div>
      </div>
    )
  }
}

export default AssistantMessage
