# AI HUB — Unified Multi-Model AI Platform

**AI HUB** is a production-grade, highly scalable web platform for multi-model AI interactions, inspired by ChatGPT, Notion AI, and Poe. It features an extensible provider/adapter architecture, server-side OpenRouter integration, dynamic model registry with caching, real-time Server-Sent Events (SSE) streaming output, rate limiting, credit accounting, and a modern dark-first SaaS interface (`#0A0A0A`).

---

## 🌟 Key Features

- **Multi-Model Support**: Access GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, DeepSeek R1, Grok 2, Kimi, and any OpenRouter model.
- **Dynamic Model Registry**: Models are loaded dynamically from `/api/models` with 10-minute server-side caching. Zero frontend changes required when adding new models.
- **OpenRouter AI Provider**: Live connection to OpenRouter API (`openrouter/free` router enabled for testing out-of-the-box).
- **Out-of-the-Box Mock Mode**: `MOCK_MODE=true` allows full UI, streaming, typewriter effect, and chat history testing without requiring API keys.
- **Real-Time SSE Streaming & Abort Controller**: Incremental token output with blinking cursor, stop generation controller, and regenerate buttons.
- **Credits & Rate Limiting System**: Configurable user credit balances (default 1,000 free credits) and rate limiting (10 requests/min).
- **Persistent Chat Storage**: Chat history grouped by Today, Yesterday, and Previous 7 days with inline renaming, deletion, and auto-generated titles.
- **Security & Privacy**: Zero API key leakage. Secrets strictly remain in server environment variables.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Environment variables available:
```env
# OpenRouter Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Application Mode (Set to false when using real OpenRouter API key)
MOCK_MODE=true

# Credits & Rate Limits
FREE_USER_CREDITS=1000
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW_MS=60000

# Optional Supabase Database Integration
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### 3. How to Obtain an OpenRouter API Key
1. Visit [https://openrouter.ai](https://openrouter.ai).
2. Sign up or log in to your account.
3. Navigate to **Keys** and click **Create Key**.
4. Paste your key into `.env` as `OPENROUTER_API_KEY=sk-or-v1-...`.
5. Set `MOCK_MODE=false`.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Architecture & Adding Providers / Models

```
src/
├── app/
│   ├── page.tsx               # Landing Page ("One workspace. Every AI.")
│   ├── chat/page.tsx          # Main Chat Workspace
│   ├── login/page.tsx         # User Auth Login
│   ├── register/page.tsx      # User Auth Register
│   ├── settings/page.tsx      # Account, Appearance, AI, Usage & Credits
│   ├── admin/page.tsx         # Admin Dashboard Overview
│   └── api/
│       ├── chat/route.ts      # Streaming SSE Chat Handler
│       ├── models/route.ts    # Dynamic Model Registry API
│       └── chats/route.ts     # Chat CRUD API
├── components/
│   ├── chat/
│   │   ├── sidebar.tsx        # Chat History Sidebar & Mobile Drawer
│   │   ├── model-selector.tsx # Dynamic Model Selector Dropdown
│   │   ├── chat-view.tsx      # Message List & Stream View
│   │   ├── message-item.tsx   # Markdown Code & Typing Cursor
│   │   └── chat-input.tsx     # Auto-expanding Textarea & Controls
│   └── ui/                    # Reusable Button, Input, Badge, Skeleton
└── lib/
    ├── ai/
    │   ├── types.ts           # AIModel, AIProvider, SendMessageOptions
    │   ├── cache.ts           # 10-Minute Server Model Cache
    │   ├── openrouter-models.ts# OpenRouter Model Normalizer & Free Models
    │   ├── router.ts          # AI Router for Provider Resolution
    │   ├── registry.ts        # Central Model Registry
    │   └── providers/
    │       ├── openrouter.ts  # OpenRouter Provider Implementation
    │       ├── mock.ts        # Mock Provider Implementation
    │       ├── openai.ts      # OpenAI Provider Adapter Stub
    │       ├── anthropic.ts   # Anthropic Provider Adapter Stub
    │       ├── google.ts      # Google Provider Adapter Stub
    │       ├── xai.ts         # xAI Grok Provider Adapter Stub
    │       ├── deepseek.ts    # DeepSeek Provider Adapter Stub
    │       └── kimi.ts        # Kimi Provider Adapter Stub
    ├── db/                    # Local Persistent JSON & PostgreSQL Schema
    ├── credits/               # Credit Accounting & Deduction
    ├── ratelimit/             # Rate Limiter Window
    └── auth/                  # Supabase & Local Auth
```

### How to Add a New AI Provider
1. Create a new file in `src/lib/ai/providers/your-provider.ts`.
2. Implement the `AIProvider` interface (`sendMessage`, `streamMessage`, `getModels`).
3. Export the class in `src/lib/ai/router.ts` inside `routeModel()`.

### How to Switch Between Mock Mode & Live OpenRouter
- **Mock Mode**: Set `MOCK_MODE=true` in `.env`.
- **Live OpenRouter Mode**: Set `MOCK_MODE=false` and provide `OPENROUTER_API_KEY=sk-or-v1-...`.

---

## 🧪 Testing & Building

Run architecture test suite:
```bash
npm run test
```

Run TypeScript verification & production build:
```bash
npm run build
```
