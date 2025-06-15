import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const URL = process.env.REACT_APP_BASE_URL_API;
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Сброс ошибки при изменении полей
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${URL}/token`,
        new URLSearchParams(formData),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      // Сохраняем токены
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh", refreshToken);

      setToken(accessToken);
      

      navigate("/");
    } catch (error) {
      console.error("Ошибка входа:", error.response?.data || error.message);
      setError("Неверное имя пользователя или пароль");
    }
  };

  return (
    <div className="login_or_register">
      <div className="window">
        <form onSubmit={handleSubmit}>
          <h2>Авторизация</h2>
          <input
            type="text"
            name="username"
            placeholder="Имя пользователя"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Войти</button>
          {error && <p className="error">{error}</p>}
        </form>
        <p>
          Еще нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
