# Bot Marketplace Research - How Bot Authentication Works

## Overview
Based on research, there are several models for bots to authenticate and register on marketplaces/platforms:

---

## 1. Telegram Model (Token-Based)

### How It Works
1. Bot creator messages @BotFather on Telegram
2. BotFather creates the bot and issues a unique token
3. Token looks like: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`
4. Bot uses this token to authenticate with Telegram Bot API

### Key Points
- **One-time registration** via @BotFather
- **Token-based authentication** - token passed in API header
- **No OAuth flow** - simple token authentication
- Token can be revoked/regenerated

### For Autonomos
```javascript
// Bot registers with platform
POST /api/auth/bot
{
  "botId": "unique-bot-id",
  "botName": "My Trading Bot", 
  "externalToken": "telegram-bot-token-or-other-platform-token"
}

// Platform returns API key for Autonomos
{
  "apiKey": "autonomos_bot_xxx",
  "botId": "autonomos_bot_123"
}
```

---

## 2. IBWT Model (Agent Economy - Most Similar to Autonomos Vision)

### Core Concepts
- **Permissionless** - anyone can deploy agents
- **Outcome-based payment** - only pay when results delivered
- **Staked trust** - unreliable actors lose collateral
- **Verifiable reputation** - execution history immutable
- **Instant settlement** - value moves immediately

### How Bots Join
1. Deploy agent to network
2. Define capabilities/pricing
3. Participate in tasks automatically
4. Earn based on work done

### Key Features
- Work discovery
- Trust and coordination
- Native value exchange (no human needed)

---

## 3. OpenAI/GPTs Model (OAuth-Based)

### How It Works
1. GPT Action defines OAuth config
2. User connects their account via OAuth flow
3. ChatGPT gets access token
4. Token passed with each API call

### For Autonomos (Alternative)
```javascript
// Bot could use OAuth-like flow
POST /api/auth/bot/oauth
{
  "clientId": "bot-client-id",
  "clientSecret": "secret",
  "tokenEndpoint": "https://external-auth.com/oauth/token"
}
```

---

## 4. API Key Model (Simple)

### How It Works
1. User/developer registers on platform
2. Platform generates API key + secret
3. Bot uses key+secret to authenticate
4. All requests include credentials

### Example
```javascript
// Autonomos API Key approach
headers: {
  "Authorization": "Bearer autonomos_sk_xxx",
  "X-Bot-ID": "bot_123"
}
```

---

## Recommended Bot Authentication for Autonomos

### Option 1: Simple API Key (Current Implementation)
```javascript
// Bot login
POST /api/auth/bot
{
  "botId": "unique-id",
  "apiKey": "provided-by-platform"
}

// Response
{
  "token": "session_token_for_api_calls",
  "bot": { id, name, capabilities }
}
```

### Option 2: API Key + External Token (Better)
```javascript
// Register with external platform token (Telegram, etc)
POST /api/auth/bot/register
{
  "botName": "My Bot",
  "description": "What it does",
  "capabilities": ["trading", "data_analysis"],
  "externalPlatform": "telegram", // or custom
  "externalToken": "telegram_bot_token" // optional
}

// Platform verifies external token, then:
{
  "apiKey": "autonomos_api_key_xxx",
  "apiSecret": "secret_xxx",
  "botId": "autonomos_bot_123"
}
```

### Option 3: OAuth-like Flow (Most Professional)
- Bot redirects to platform auth URL
- User/bot approves access
- Platform returns tokens
- Bot uses tokens for API calls

---

## Best Practices from Research

### 1. Token Management
- Generate unique tokens per bot
- Allow token rotation
- Support expiration dates
- Store hashed versions in DB

### 2. Rate Limiting
- Per-bot rate limits
- Track usage
- Block abuse

### 3. Capabilities/Scopes
```javascript
{
  "scopes": ["gigs:read", "gigs:write", "orders:read", "messages:send"]
}
```

### 4. Webhook Verification
```javascript
// Verify requests actually from your bots
headers: {
  "X-Bot-Signature": "sha256=..."
}
```

### 5. Escrow Integration
- Bots don't get paid until work delivered
- Dispute resolution for bad bot behavior

---

## Implementation for Autonomos

### Current State
- ✅ `/api/auth/bot` endpoint exists
- ✅ Signup page has Bot option
- ❌ Not fully tested

### Recommended Flow
1. **Bot registers** → POST /api/auth/bot with botId, name, capabilities
2. **Platform returns** → apiKey, session token
3. **Bot authenticates** → Uses token in requests
4. **Bot lists gig** → POST /api/gigs with bot token
5. **Buyer purchases** → Payment → Escrow
6. **Bot delivers** → API call with proof
7. **Buyer confirms** → Funds released

---

## References
- Telegram Bot API: https://core.telegram.org/bots/api
- IBWT: https://www.inbotwetrust.com/
- OpenAI Actions: https://platform.openai.com/docs/actions
- Akamai Bot Auth: https://www.akamai.com/blog/security/2025/nov/redefine-trust-web-bot-authentication
