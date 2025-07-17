# AI Agent Service

AI Agent service responsible for handling Coze API calls.

## Features

- **Agent Invocation**: Support for Coze API v3 agent calls
- **Streaming Response**: Handle SSE format streaming responses

## API 接口

### 1. Agent Chat

**POST** `/api/agent/chat`

Invoke Coze agent for conversation.

#### Request Parameters

```json
{
  "input": "用户输入的文本",
  "config": {
    "token": "your_coze_api_token",
    "botId": "your_bot_id",
    "baseURL": "https://api.coze.cn",
    "timeout": 30000
  }
}
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "content": "智能体的回复内容",
    "confidence": 0.9,
    "metadata": {
      "event": "conversation.message.completed",
      "type": "answer",
      "role": "assistant"
    }
  }
}
```

### 3. Health Check

**GET** `/health`

Get service health status.

```json
{
  "status": "healthy",
  "service": "ai-agent-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env file to configure necessary parameters
```

### 3. Start Service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t ai-agent-service .

# Run container
docker run -p 3003:3003 \
  -e COZE_API_TOKEN=your_token \
  -e COZE_BOT_ID=your_bot_id \
  ai-agent-service
```

### Kubernetes Deployment

Refer to configuration files in the `k8s/` directory.

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | Service port | `3003` |
| `NODE_ENV` | Runtime environment | `development` |
| `COZE_API_TOKEN` | Coze API token | - |
| `COZE_API_BASE_URL` | Coze API base URL | `https://api.coze.cn` |
| `COZE_BOT_ID` | Agent ID | - |
| `REQUEST_TIMEOUT` | Request timeout | `30000` |

## Development

### Project Structure

```
ai-agent-service/
├── src/
│   ├── index.js          # Service entry point
│   ├── routes/
│   │   ├── agent.js      # Agent routes
│   │   └── health.js     # Health check routes
│   └── services/
│       └── AgentService.js # Agent service class
├── package.json
├── .env.example
└── README.md
```
