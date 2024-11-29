import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyImages = ({ userId }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/my-images/${userId}`);
                setImages(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching images:', err);
                setError(err.response?.data?.message || 'Failed to load images');
                setLoading(false);
            }
        };

        fetchImages();
    }, [userId]);

    if (loading) return <p>Loading images...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h2>My Uploaded Images</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {images.map((image, index) => (
                    <div key={index}>
                        <img
                            src={`http://localhost:5000${image.file_path}`}
                            alt={`Uploaded ${index}`}
                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyImages;
