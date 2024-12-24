import React, { useEffect, useState } from 'react';

interface Cloud {
    id: number;
    scale: number;
    speed: number;
    opacity: number;
    top: number;
    delay: number;
}

const Clouds: React.FC = () => {
    const [clouds, setClouds] = useState<Cloud[]>([]);

    useEffect(() => {
        const createClouds = () => {
            const newClouds: Cloud[] = [];
            const count = 6;

            for (let i = 0; i < count; i++) {
                newClouds.push({
                    id: i,
                    scale: Math.random() * 0.5 + 0.5,
                    speed: Math.random() * 20 + 30,
                    opacity: Math.random() * 0.3 + 0.1,
                    top: Math.random() * 40,
                    delay: -Math.random() * 20,
                });
            }
            setClouds(newClouds);
        };

        createClouds();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {clouds.map((cloud) => (
                <div
                    key={cloud.id}
                    className="cloud absolute"
                    style={{
                        top: `${cloud.top}%`,
                        transform: `scale(${cloud.scale})`,
                        animation: `float-cloud ${cloud.speed}s linear infinite`,
                        animationDelay: `${cloud.delay}s`,
                        opacity: cloud.opacity,
                    }}
                />
            ))}
        </div>
    );
};

export default Clouds; 