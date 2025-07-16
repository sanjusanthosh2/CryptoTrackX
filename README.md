# CryptoTrackX 🚀

A modern, real-time cryptocurrency tracker built with React, TypeScript, and Supabase. Track live crypto prices, monitor market trends, and manage your favorite cryptocurrencies with a beautiful, responsive interface.

## ✨ Features

- **Real-time Price Tracking**: Live cryptocurrency prices updated every 60 seconds
- **Search & Filter**: Quickly find cryptocurrencies by name or symbol
- **Favorites System**: Save and manage your favorite cryptocurrencies (requires authentication)
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **User Authentication**: Secure sign-up and sign-in functionality
- **Dark Theme**: Beautiful dark gradient interface
- **Market Data**: View market cap, 24h price changes, and trading volume
- **Auto-refresh**: Automatic data updates with manual refresh option

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (Authentication, Database, Edge Functions)
- **API**: CoinGecko API for cryptocurrency data
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project on [Supabase](https://supabase.com)
   - Copy your project URL and anon key
   - The project is already configured to work with Supabase

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Start tracking cryptocurrencies!

## 📱 Usage

### Public Features
- **Browse Cryptocurrencies**: View the top 100 cryptocurrencies by market cap
- **Search**: Use the search bar to find specific coins
- **Real-time Data**: Prices update automatically every minute
- **Responsive Interface**: Works seamlessly on all devices

### Authenticated Features
- **Create Account**: Sign up with email and password
- **Add Favorites**: Click the star icon to save cryptocurrencies to your favorites
- **Manage Favorites**: View and remove cryptocurrencies from your favorites list
- **Persistent Data**: Your favorites are saved securely in the cloud

### Navigation
- **Dashboard**: Main page showing all cryptocurrencies
- **Favorites**: View your saved cryptocurrencies (requires login)
- **Search**: Filter cryptocurrencies in real-time
- **Refresh**: Manual data refresh option

## 🔧 Configuration

The application uses the following key configurations:

### API Integration
- **CoinGecko API**: Fetches cryptocurrency data via Supabase Edge Functions
- **Rate Limiting**: Handles API rate limits gracefully
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Database Schema
- **Profiles**: User profile information
- **Favorites**: User's favorite cryptocurrencies with metadata
- **Row Level Security**: Ensures users can only access their own data

## 📂 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── Header.tsx      # Navigation header
│   ├── SearchBar.tsx   # Search functionality
│   ├── CryptoGrid.tsx  # Cryptocurrency grid display
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication hook
│   ├── useFavorites.tsx # Favorites management
│   └── ...
├── pages/              # Page components
│   ├── Index.tsx       # Main dashboard
│   └── ...
├── integrations/       # External service integrations
│   └── supabase/       # Supabase configuration
└── lib/                # Utility functions
```

## 🔐 Authentication

The app uses Supabase Auth for secure user management:

- **Email/Password Authentication**: Simple and secure login system
- **Session Management**: Automatic session handling and persistence
- **Protected Routes**: Favorites feature requires authentication
- **Row Level Security**: Database policies ensure data privacy

## 🌐 Deployment
this is done on versal

### Custom Domain
- Navigate to **Project** → **Settings** → **Domains**
- Click **Connect Domain** to use your own domain
- Follow the setup instructions

### Other Platforms
The codebase is standard React/Vite and can be deployed to:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).



## 🙏 Acknowledgments

- [CoinGecko](https://coingecko.com) for providing cryptocurrency data
- [Supabase](https://supabase.com) for backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Lucide](https://lucide.dev) for icons

