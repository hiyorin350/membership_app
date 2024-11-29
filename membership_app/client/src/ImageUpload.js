import React, { useState } from 'react';
import axios from 'axios';

const ImageUpload = ({ userId }) => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('image', file); // アップロードするファイル
        formData.append('userId', userId); // 会員IDを送信

        try {
            const res = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(res.data.message);
            setImageUrl(res.data.filePath); // アップロードされた画像URL
        } catch (err) {
            console.error('Upload error:', err);
            setMessage('Error uploading file');
        }
    };

    return (
        <div>
            <h2>Upload Image</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <button type="submit">Upload</button>
            </form>
            {message && <p>{message}</p>}
            {imageUrl && (
                <div>
                    <p>Uploaded Image:</p>
                    <img src={`http://localhost:5000${imageUrl}`} alt="Uploaded" style={{ maxWidth: '100%' }} />
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
