# 🎅 Santa's Gift Shooter

A festive shooting game where Santa shoots gifts for points! Help Santa spread Christmas cheer in this fun and engaging game.

## 🎮 Play Now

[Play Santa's Gift Shooter](https://santas-gift-shooter.on-fleek.app/)

## 🎯 How to Play

- Use `←/→` or `A/D` keys to move Santa
- Press `SPACE` to shoot gifts
- Build combos for bonus points
- Score as many points as you can in 60 seconds!

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/prasanthLalapeta/santas-gift-shooter.git

# Navigate to project directory
cd santas-gift-shooter

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🚀 Deployment

This game is deployed using [Fleek](https://fleek.xyz/). To deploy your own instance:

### Prerequisites
- Node.js and npm installed
- A GitHub account
- Fleek account

### Steps

1. Fork this repository
2. Sign up on [Fleek](https://fleek.xyz/)
3. Build the project:
    ```bash
    # Build the project
    npm run build
    ```

4. Install and set up Fleek CLI:
    ```bash
    # Install Fleek CLI globally
    npm install -g @fleekxyz/cli

    # Login to Fleek
    fleek login

    # Initialize Fleek in your project
    fleek sites init
    ```

5. During initialization:
    - Select "yes" when asked about linking to existing sites
    - Choose your site from the list
    - Specify "dist" as the directory for upload
    - Choose "no" for build command
    - Select JSON format for configuration

6. Deploy your site:
    ```bash
    fleek sites deploy
    ```

After successful deployment, you'll receive:
- An IPFS Content Identifier (CID)
- A public URL (*.on-fleek.app)

## 🏗️ Built With

- React
- TypeScript
- Vite
- TailwindCSS
- Deployed on IPFS via Fleek

## 👨‍💻 Author

Built with ❤️ by [@heylalapeta](https://x.com/heylalapeta)

## 📄 License

This project is licensed under the MIT License
