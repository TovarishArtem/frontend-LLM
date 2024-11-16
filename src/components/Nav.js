import React, { Component } from 'react'

export class Nav extends Component {
	render() {
		return (
			<>
				<nav>
					<div className='our_dialog'>
						<p>Ваши диалоги</p>
					</div>
					<div className='settings'>
						<ul className='ul_settings'>
							<li>Настройки</li>
							<li>Параметры</li>
						</ul>
					</div>
				</nav>
			</>
		)
	}
}

export default Nav
