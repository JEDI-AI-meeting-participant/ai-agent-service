const express = require('express');
const router = express.Router();
const AgentService = require('../services/AgentService');

const agentService = new AgentService();

// 调用智能体 API
router.post('/chat', async (req, res) => {
  try {
    const { input, config } = req.body;
    
    // 验证必需参数
    if (!input) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: input'
      });
    }
    
    if (!config || !config.token || !config.botId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required config parameters: token and botId'
      });
    }
    
    console.log(`[AgentRoute] 收到智能体请求: ${input.substring(0, 100)}...`);
    
    // 调用智能体服务
    const result = await agentService.callCozeAPI(input, config);
    
    if (result) {
      console.log(`[AgentRoute] 智能体响应成功: ${result.content.substring(0, 100)}...`);
      res.json({
        success: true,
        data: result
      });
    } else {
      console.log('[AgentRoute] 智能体无响应');
      res.json({
        success: false,
        error: 'No response from agent',
        data: null
      });
    }
    
  } catch (error) {
    console.error('[AgentRoute] 智能体调用错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// 批量调用智能体 API（可选功能）
router.post('/batch', async (req, res) => {
  try {
    const { inputs, config } = req.body;
    
    if (!inputs || !Array.isArray(inputs)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: inputs (array)'
      });
    }
    
    if (!config || !config.token || !config.botId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required config parameters: token and botId'
      });
    }
    
    console.log(`[AgentRoute] 收到批量智能体请求: ${inputs.length} 个输入`);
    
    const results = [];
    
    for (const input of inputs) {
      try {
        const result = await agentService.callCozeAPI(input, config);
        results.push({
          input,
          success: true,
          data: result
        });
      } catch (error) {
        results.push({
          input,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    console.error('[AgentRoute] 批量智能体调用错误:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
});

module.exports = router;