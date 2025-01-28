import React, { useState } from 'react';
import axios from 'axios';
import "./RegistrationForm.css"; // Подключаем стили
import google from '../public/google.png'
import vk from '../public/vk.png'
import video from '../public/bg.mp4'
import pass from '../public/pass.png'

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', { email, password });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Ошибка авторизации');
        }
    };

    return (
        <div className="video-background">
            <video autoPlay loop muted className="video">
                <source src={video} type="video/mp4" />
                Ваш браузер не поддерживает видео тег.
            </video>
            <form onSubmit={handleLogin} className='form_auto'>
                <h2>Авторизация</h2>
                <div className='mail_auto'>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className='mail_auto'> 
                    <label>Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ marginLeft: '10px' }}
                    >
                        {showPassword ? <img src={pass}/> : <img src={pass}/>}
                    </button>
                </div>
                <button type="submit" style={{ width: '100%', padding: '10px', margin: '10px 0' }}>
                    Войти
                </button>
                {message && <p>{message}</p>}
            <p>У вас еще нет аккаунта? <a href="/">Регистрация</a></p>
            </form>
        </div>
    );
};

export default LoginForm;