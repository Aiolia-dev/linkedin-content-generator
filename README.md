# LinkedIn Content Generator

A smart application that helps you generate and manage LinkedIn content using AI. Built with Next.js and Firebase.

## Features

- 🔐 User Authentication (Email/Password and Google OAuth)
- 👤 User Profile Management
- 🎯 Content Preferences Configuration
- 📝 Smart Content Generation
- 🔄 Content History Management

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- A Firebase project created
- npm or yarn installed

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Aiolia-dev/linkedin-content-generator.git
cd linkedin-content-generator/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file based on `.env.example` and fill in your Firebase configuration.

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Firebase Configuration

This project requires a Firebase project with the following features enabled:
- Authentication (Email/Password and Google provider)
- Cloud Firestore
- (Optional) Firebase Analytics

## Environment Variables

Create a `.env.local` file with the following variables (see `.env.example` for template):
- Firebase configuration
- Other API keys if needed

## Deployment

The easiest way to deploy this app is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
