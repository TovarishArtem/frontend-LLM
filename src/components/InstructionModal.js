import React from 'react'
import '../InstructionModal.css'

const InstructionModal = ({ onClose, onStart }) => {
  return (
    <div className="instruction-overlay">
      <div className="instruction-modal">
        <h2>Добро пожаловать!</h2>
        <p>Хотите пройти инструктаж по основным функциям сайта?</p>
        <div className="instruction-buttons">
          <button onClick={onClose}>Нет, спасибо</button>
          <button onClick={onStart}>Да, показать</button>
        </div>
      </div>
    </div>
  )
}

export default InstructionModal
