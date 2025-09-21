# Liora - AI-Powered Investor-Founder Matching Platform

Liora is a sophisticated web platform that connects startup founders with investors through AI-powered workflows, intelligent matching, and comprehensive investment memo generation.

## 🚀 Features

- **Dual User Experience**: Separate optimized workflows for founders and investors
- **AI-Powered Analysis**: Automated investment memo generation from company data
- **Real-time Communication**: WebSocket-based notifications and AI interviews
- **Interactive Data Visualization**: Charts and analytics for market trends and company metrics
- **Desktop-Optimized**: Built specifically for desktop users (1920x1080+)
- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand + TanStack Query
- **Real-time**: Socket.io
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **File Upload**: React Dropzone

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd liora
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── founder/           # Founder-specific pages
│   ├── investor/          # Investor-specific pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── charts/           # Chart components
│   └── layout/           # Layout components
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
├── stores/               # Zustand stores
├── types/                # TypeScript type definitions
└── services/             # API and external service integrations
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run check-all` - Run all checks (types, lint, format)

## 🎯 Key Features Implementation

### For Founders

- Company information upload and management
- AI-generated questionnaire completion
- Real-time AI interview experience
- Profile status tracking and notifications

### For Investors

- Investment preferences configuration
- Company discovery and filtering
- Comprehensive investment memo viewing
- Call scheduling with founders

### Technical Features

- Desktop-optimized responsive design (1920x1080+)
- Real-time WebSocket communication
- File upload with progress tracking
- Interactive data visualizations
- Accessibility compliance (WCAG)

## 🔒 Security & Performance

- Input validation with Zod schemas
- XSS protection and secure headers
- Optimized bundle splitting
- Image optimization with Next.js
- Desktop-first performance optimization

## 🧪 Development Guidelines

1. **Code Style**: Follow the configured ESLint and Prettier rules
2. **TypeScript**: Maintain strict type safety
3. **Components**: Use shadcn/ui components for consistency
4. **State Management**: Use Zustand for global state, TanStack Query for server state
5. **Styling**: Use Tailwind CSS utility classes
6. **Desktop-First**: Optimize for desktop experience (requirement 9.3)

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Follow the established code style and patterns
2. Ensure TypeScript types are properly defined
3. Test on desktop resolutions (1920x1080 minimum)
4. Maintain accessibility standards
5. Update documentation as needed

## 📄 License

This project is part of a hackathon submission and is for demonstration purposes.
