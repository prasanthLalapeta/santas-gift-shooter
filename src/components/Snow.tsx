import React, { useEffect, useState } from 'react';

interface Snowflake {
    id: number;
    size: number;
    left: number;
    animationDuration: number;
    delay: number;
    type: 'snow' | 'sparkle';
    character: string;
}

const Snow: React.FC = () => {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
    const snowflakeChars = ['❆', '❅', '❋', '❄', '❉', '❊'];

    useEffect(() => {
        const createSnowflakes = () => {
            const flakes: Snowflake[] = [];
            const count = 150;

            for (let i = 0; i < count; i++) {
                flakes.push({
                    id: i,
                    size: Math.random() * 16 + 8,
                    left: Math.random() * 100,
                    animationDuration: Math.random() * 5 + 3,
                    delay: -Math.random() * 5,
                    type: Math.random() > 0.8 ? 'sparkle' : 'snow',
                    character: snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)]
                });
            }
            setSnowflakes(flakes);
        };

        createSnowflakes();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className={`absolute ${flake.type === 'sparkle' ? 'sparkle' : 'snowflake'}`}
                    style={{
                        fontSize: `${flake.size}px`,
                        left: `${flake.left}%`,
                        animation: `${flake.type === 'sparkle' ? 'sparkle' : 'snowfall'} ${flake.animationDuration}s linear infinite`,
                        animationDelay: `${flake.delay}s`,
                        opacity: 0,
                        color: '#DCD7C9',
                        textShadow: '0 0 5px rgba(220, 215, 201, 0.5)'
                    }}
                >{flake.character}</div>
            ))}
        </div>
    );
};

export default Snow; 