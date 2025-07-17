# AI Agent Service

智能体服务，负责处理 Coze API 调用。

## 功能特性

- **智能体调用**: 支持 Coze API v3 智能体调用
- **流式响应**: 处理 SSE 格式的流式响应

## API 接口

### 1. 智能体聊天

**POST** `/api/agent/chat`

调用 Coze 智能体进行对话。

#### 请求参数

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

#### 响应格式

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

### 3. 健康检查

**GET** `/health`

获取服务健康状态。

```json
{
  "status": "healthy",
  "service": "ai-agent-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置必要的参数
```

### 3. 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker build -t ai-agent-service .

# 运行容器
docker run -p 3003:3003 \
  -e COZE_API_TOKEN=your_token \
  -e COZE_BOT_ID=your_bot_id \
  ai-agent-service
```

### Kubernetes 部署

参考 `k8s/` 目录下的配置文件。

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | `3003` |
| `NODE_ENV` | 运行环境 | `development` |
| `COZE_API_TOKEN` | Coze API 令牌 | - |
| `COZE_API_BASE_URL` | Coze API 基础URL | `https://api.coze.cn` |
| `COZE_BOT_ID` | 智能体ID | - |
| `REQUEST_TIMEOUT` | 请求超时时间 | `30000` |

## 开发

### 项目结构

```
ai-agent-service/
├── src/
│   ├── index.js          # 服务入口
│   ├── routes/
│   │   ├── agent.js      # 智能体路由
│   │   └── health.js     # 健康检查路由
│   └── services/
│       └── AgentService.js # 智能体服务类
├── package.json
├── .env.example
└── README.md
```
