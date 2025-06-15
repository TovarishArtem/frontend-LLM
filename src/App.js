import { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Main from "./Main";
import Login from "./components/Login";
import Register from "./components/Register";
import './App.css'


const URL = process.env.REACT_APP_BASE_URL_API;
function App() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = async () => {
      const access = localStorage.getItem("token");
      const refresh = localStorage.getItem("refresh");

      if (!access || !refresh) return;

      try {
        await axios.post(`${URL}/token/verify`, { token: access });
        setToken(access);
        navigate("/");
      } catch (verifyErr) {
        try {
          const res = await axios.post(`${URL}/token/refresh`, { refresh : refresh });
          const newAccess = res.data.access;
          localStorage.setItem("token", newAccess);
          setToken(newAccess);
          navigate("/");
        } catch (refreshErr) {
          localStorage.removeItem("token");
          localStorage.removeItem("refresh");
          setToken(null);
        }
      }
    };

    checkToken();
  }, []);

  return (
    <Routes>
      {token ? (
        <>
          <Route path="/" element={<Main />} />
          <Route path="*" element={<Navigate to="/" />} />
        </>
      ) : (
        <>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      )}
    </Routes>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}