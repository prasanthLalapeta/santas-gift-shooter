const generateOgImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#2C3639');
    gradient.addColorStop(0.5, '#3F4E4F');
    gradient.addColorStop(1, '#2C3639');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#DCD7C9';
    ctx.textAlign = 'center';
    ctx.fillText("Santa's Gift Shooter", canvas.width / 2, canvas.height / 2);

    // Santa emoji
    ctx.font = '120px Arial';
    ctx.fillText('🎅', canvas.width / 2, canvas.height / 2 - 100);

    // Game elements
    ctx.font = '60px Arial';
    ctx.fillText('🎁 🎯 🎮', canvas.width / 2, canvas.height / 2 + 100);

    return canvas.toDataURL('image/png');
};

export default generateOgImage; 