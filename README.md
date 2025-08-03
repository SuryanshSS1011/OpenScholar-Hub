# OpenScholar Hub

A research collaboration platform that democratizes access to research by enabling students, researchers, and professionals to collaborate on projects, share datasets, and publish findings in an open environment.

## Features

- **Research Collaboration**: Create and manage research projects with team members
- **Real-time Chat**: Integrated chat system for seamless communication
- **Article Management**: Discover, save, and discuss research articles
- **User Profiles**: Comprehensive profiles showcasing research interests and contributions
- **External Integrations**: Connect with Slack, Discord, and Google Scholar
- **Authentication**: Secure authentication with Google OAuth

## Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Real-time**: Socket.io for chat functionality
- **External APIs**: Slack, Discord, Google Scholar

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd OpenScholar-Hub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
# Edit .env.local with your Firebase and API credentials
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint checks

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# External API Keys
SLACK_BOT_TOKEN=your_slack_token
DISCORD_TOKEN=your_discord_token
SCHOLAR_API_KEY=your_scholar_key
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.