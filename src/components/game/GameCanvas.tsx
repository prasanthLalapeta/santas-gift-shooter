import React, { useRef, useEffect, useCallback } from 'react';

interface GameCanvasProps {
  width: number;
  height: number;
  santa: {
    x: number;
    y: number;
    width: number;
    height: number;
    isMoving?: boolean;
    direction?: 'left' | 'right';
  };
  gifts: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    startTime?: number;
    hit?: boolean;
    color: string;
    health: number;
  }>;
  bullets: Array<{
    x: number;
    y: number;
    speed: number;
    trail: Array<{ x: number; y: number }>;
  }>;
  combo: number;
  lastHitTime: number;
  scorePopups: Array<{
    x: number;
    y: number;
    score: number;
    time: number;
  }>;
}

const adjustColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

const GameCanvas: React.FC<GameCanvasProps> = ({ width, height, santa, gifts, bullets, combo, lastHitTime, scorePopups }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0);

  const draw = useCallback((timestamp: number) => {
    if (gameStartTimeRef.current === 0) {
      gameStartTimeRef.current = timestamp;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const timeElapsed = (timestamp - gameStartTimeRef.current) / 1000;

    // Draw night sky background with gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#0B1026');  // Dark blue night sky
    skyGradient.addColorStop(1, '#1B2952');  // Lighter blue at bottom
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw northern lights effect
    const time = timestamp / 2000;
    ctx.strokeStyle = 'rgba(120, 230, 180, 0.2)';
    ctx.lineWidth = 30;
    ctx.beginPath();
    for (let i = 0; i < width; i += 50) {
      const y = Math.sin(i / 100 + time) * 50 + height / 4;
      ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Draw stars
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.7;
      const size = Math.random() * 2;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw falling snow with slower, more natural movement
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 100; i++) {
      // Use consistent positions for snowflakes based on index
      const x = ((Math.sin(i * 432.43) + 1) * width / 2);

      // Slower falling speed and slight horizontal movement
      const speed = 0.2 + (Math.sin(i * 123.45) * 0.1);
      const horizontalMovement = Math.sin((timestamp / 2000) + i) * 2;

      const baseY = ((timestamp * speed) + (i * 100)) % height;
      const y = baseY + Math.sin((timestamp / 1000) + i) * 5;

      // Vary snowflake sizes
      const size = 1 + (Math.sin(i * 789.12) + 1);

      // Add slight opacity variation
      ctx.globalAlpha = 0.5 + Math.sin((timestamp / 1000) + i) * 0.3;

      ctx.beginPath();
      ctx.arc(x + horizontalMovement, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Reset global alpha
    ctx.globalAlpha = 1;

    // Draw ground snow
    const groundGradient = ctx.createLinearGradient(0, height - 100, 0, height);
    groundGradient.addColorStop(0, '#FFFFFF');
    groundGradient.addColorStop(1, '#E3E3E3');
    ctx.fillStyle = groundGradient;
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, height);
    ctx.lineTo(width, height - 50);
    ctx.quadraticCurveTo(width * 0.75, height - 70, width * 0.5, height - 50);
    ctx.quadraticCurveTo(width * 0.25, height - 30, 0, height - 60);
    ctx.fill();

    // Draw Santa with more Christmas details
    ctx.save();
    ctx.translate(santa.x, santa.y);

    // Flip Santa if moving left
    if (santa.direction === 'left') {
      ctx.scale(-1, 1);
      ctx.translate(-santa.width, 0);
    }

    // Draw Santa's body
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.ellipse(santa.width / 2, santa.height / 2, santa.width / 2.2, santa.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw legs with animation
    const legOffset = santa.isMoving ? Math.sin(timeElapsed * 10) * 5 : 0;

    // Left leg
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(
      santa.width / 3,
      santa.height - 10 + legOffset,
      8,
      12,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Right leg
    ctx.beginPath();
    ctx.ellipse(
      2 * santa.width / 3,
      santa.height - 10 - legOffset,
      8,
      12,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw face
    ctx.fillStyle = '#FFE4C4';
    ctx.beginPath();
    ctx.arc(santa.width / 2, santa.height / 2.5, santa.width / 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Draw beard with slight movement
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    const beardWave = santa.isMoving ? Math.sin(timeElapsed * 8) * 2 : 0;
    ctx.ellipse(
      santa.width / 2,
      santa.height / 1.8 + beardWave,
      santa.width / 3,
      santa.height / 4,
      0,
      0,
      Math.PI
    );
    ctx.fill();

    // Draw hat with bobbing motion
    const hatBob = santa.isMoving ? Math.sin(timeElapsed * 10) * 2 : 0;

    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(santa.width / 4, santa.height / 3 + hatBob);
    ctx.quadraticCurveTo(
      santa.width / 2,
      hatBob,
      3 * santa.width / 4,
      santa.height / 3 + hatBob
    );
    ctx.fill();

    // Hat trim
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(
      santa.width / 2,
      santa.height / 3 + hatBob,
      santa.width / 2.2,
      santa.height / 8,
      0,
      0,
      Math.PI
    );
    ctx.fill();

    // Hat pom-pom with extra bounce
    ctx.beginPath();
    ctx.arc(
      santa.width / 2,
      hatBob,
      santa.width / 6,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();

    // Draw bullet trails
    bullets.forEach(bullet => {
      if (bullet.trail.length > 1) {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bullet.trail[0].x, bullet.trail[0].y);
        bullet.trail.forEach(pos => {
          ctx.lineTo(pos.x, pos.y);
        });
        ctx.stroke();
      }
    });

    // Draw bullets
    ctx.fillStyle = '#FFD700';
    bullets.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw gifts with modern design
    gifts.forEach(gift => {
      ctx.save();
      ctx.translate(gift.x, gift.y);

      if (!gift.hit) {
        // Draw gift box shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(2, 2, gift.width, gift.height);

        // Draw gift box with gradient
        const gradient = ctx.createLinearGradient(0, 0, gift.width, gift.height);
        gradient.addColorStop(0, gift.color);
        gradient.addColorStop(1, adjustColor(gift.color, -30)); // Darker shade
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, gift.width, gift.height);

        // Draw ribbon (simplified, modern style)
        const ribbonWidth = 6;
        ctx.fillStyle = '#FFFFFF';

        // Cross pattern
        ctx.fillRect(
          gift.width / 2 - ribbonWidth / 2,
          0,
          ribbonWidth,
          gift.height
        );
        ctx.fillRect(
          0,
          gift.height / 2 - ribbonWidth / 2,
          gift.width,
          ribbonWidth
        );

        // Bow (minimal design)
        ctx.beginPath();
        ctx.arc(
          gift.width / 2,
          gift.height / 2,
          ribbonWidth * 1.5,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // Health indicator (if needed)
        if (gift.health > 1) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.beginPath();
          ctx.arc(
            gift.width / 2,
            gift.height / 2,
            ribbonWidth * 1.2,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            gift.health.toString(),
            gift.width / 2,
            gift.height / 2
          );
        }

        // Shine effect
        const shine = ctx.createLinearGradient(0, 0, gift.width, gift.height);
        shine.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        shine.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        shine.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shine;
        ctx.fillRect(0, 0, gift.width, gift.height);
      } else {
        // Explosion effect
        const explosionGradient = ctx.createRadialGradient(
          gift.width / 2, gift.height / 2, 0,
          gift.width / 2, gift.height / 2, gift.width
        );
        explosionGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        explosionGradient.addColorStop(0.2, 'rgba(255, 220, 0, 0.6)');
        explosionGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');

        ctx.fillStyle = explosionGradient;
        ctx.beginPath();
        ctx.arc(gift.width / 2, gift.height / 2, gift.width, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    // Draw score popups
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    scorePopups.forEach(popup => {
      const age = (Date.now() - popup.time) / 1000;
      const alpha = 1 - age;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillText(`+${popup.score}`, popup.x, popup.y - age * 50);
    });



    animationFrameRef.current = requestAnimationFrame(draw);
  }, [width, height, santa, gifts, bullets, combo, lastHitTime, scorePopups]);

  // Set up animation loop
  useEffect(() => {
    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border border-game-secondary rounded-lg shadow-lg"
    />
  );
};

export default GameCanvas;