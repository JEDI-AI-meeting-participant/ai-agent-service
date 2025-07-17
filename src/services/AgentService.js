const fetch = require('node-fetch');

class AgentService {
  constructor() {
    this.defaultConfig = {
      baseURL: 'https://api.coze.cn',
      timeout: 30000
    };
  }

  /**
   * 调用 Coze API - 支持流式响应处理
   * 完全参考 AIAssistant.ts 中的 callCozeAPI 方法
   */
  async callCozeAPI(input, config) {
    console.log('[AgentService] 🚀 开始调用智能体API');
    
    if (!config.token || !config.botId) {
      console.error('[AgentService] Coze API配置不完整');
      throw new Error('Coze API配置不完整: 缺少 token 或 botId');
    }

    const requestPayload = {
      bot_id: config.botId,
      user_id: '123',
      additional_messages: [
        {
          role: 'user',
          type: 'question',
          content_type: 'text',
          content: input
        }
      ],
      stream: true
    };

    try {
      const baseURL = config.baseURL || this.defaultConfig.baseURL;
      const url = `${baseURL}/v3/chat`;
      
      console.log('[AgentService] 📤 发送请求:', {
        url,
        payload: requestPayload
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.token}`
        },
        body: JSON.stringify(requestPayload),
        timeout: config.timeout || this.defaultConfig.timeout
      });

      console.log('[AgentService] 📨 收到响应:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AgentService] ❌ API响应错误:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 获取完整响应文本（参考用户提供的代码）
      const fullResponse = await response.text();
      console.log('[AgentService] 📄 完整响应文本:', fullResponse.substring(0, 500) + (fullResponse.length > 500 ? '...' : ''));
      
      // 解析SSE格式的流式响应（参考用户提供的代码）
      const lines = fullResponse.split('\n');
      let currentEvent = null;
      
      console.log('[AgentService] 📋 开始解析', lines.length, '行数据');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        console.log('[AgentService] 🔍 处理第', i, '行:', line);
        
        // 解析事件类型
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
          console.log('[AgentService] 📡 检测到事件类型:', currentEvent);
          continue;
        }
        
        // 解析数据内容
        if (line.startsWith('data:')) {
          const jsonStr = line.startsWith('data: ') ? line.slice(6) : line.slice(5);
          
          if (jsonStr === '[DONE]') {
            console.log('[AgentService] 🏁 遇到结束标记');
            continue;
          }
          
          try {
            const data = JSON.parse(jsonStr);
            const eventType = data.event || currentEvent;
            
            console.log('[AgentService] 📦 解析数据成功:', {
              eventType,
              dataType: data.type,
              dataRole: data.role,
              hasContent: !!data.content,
              contentPreview: data.content ? data.content.substring(0, 50) + (data.content.length > 50 ? '...' : '') : 'null'
            });
            
            // 提取最终AI回复（参考用户提供的代码）
            if (eventType === 'conversation.message.completed' && 
                data.type === 'answer' && 
                data.content) {
              console.log('[AgentService] ✅ 找到有效的AI回复:', data.content);
              return {
                content: data.content,
                confidence: 0.9,
                metadata: data
              };
            }
          } catch (parseError) {
            console.error('[AgentService] ❌ JSON解析失败:', {
              line: line,
              jsonStr: jsonStr,
              error: parseError.message
            });
          }
        }
      }
      
      console.log('[AgentService] ⚠️ 未找到有效的AI回复');
      return null;
      
    } catch (error) {
      console.error('[AgentService] 智能体API调用错误:', error);
      throw error;
    }
  }

  /**
   * 验证配置
   */
  validateConfig(config) {
    const required = ['token', 'botId'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
      throw new Error(`缺少必需的配置参数: ${missing.join(', ')}`);
    }
    
    return true;
  }
}

module.exports = AgentService;