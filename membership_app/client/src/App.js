import React, { useState } from 'react';
import './App.css';
import Register from './Register';
import Login from './Login';
import ImageUpload from './ImageUpload';
import MyImages from './MyImages';

function App() {
    const [view, setView] = useState('login'); // 初期状態はログイン画面
    const [loggedInUser, setLoggedInUser] = useState(null); // ログイン状態を管理

    const handleLogin = (user) => {
        setLoggedInUser(user); // ログイン成功時にユーザー情報を保存
        setView('my-images'); // ログイン後は画像一覧画面を表示
    };

    const handleLogout = () => {
        setLoggedInUser(null); // ログアウト
        setView('login'); // ログアウト後はログイン画面に戻す
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>Membership App</h1>
                {loggedInUser ? (
                    <div>
                        <p>Welcome, {loggedInUser.username}!</p>
                        <button onClick={handleLogout}>Logout</button>
                        <button onClick={() => setView('upload')}>Upload Image</button>
                        <button onClick={() => setView('my-images')}>My Images</button>
                    </div>
                ) : (
                    <p>Please log in or register to continue.</p>
                )}
                <div>
                    {!loggedInUser && (
                        <>
                            <button onClick={() => setView('login')}>Login</button>
                            <button onClick={() => setView('register')}>Register</button>
                        </>
                    )}
                </div>
                {view === 'register' && <Register />}
                {view === 'login' && <Login onLogin={handleLogin} />}
                {view === 'upload' && loggedInUser && <ImageUpload userId={loggedInUser.id} />}
                {view === 'my-images' && loggedInUser && <MyImages userId={loggedInUser.id} />}
            </header>
        </div>
    );
}

export default App;
