const http = require('http');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3003';

// 测试健康检查
async function testHealth() {
  console.log('\n=== 测试健康检查 ===');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ 健康检查成功:', data);
    return true;
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    return false;
  }
}

// 测试智能体调用
async function testAgentChat() {
  console.log('\n=== 测试智能体调用 ===');
  
  const testPayload = {
    input: '你好，请简单介绍一下自己',
    config: {
      token: process.env.COZE_API_TOKEN || 'test_token',
      botId: process.env.COZE_BOT_ID || 'test_bot_id',
      baseURL: 'https://api.coze.cn',
      timeout: 30000
    }
  };
  
  try {
    console.log('发送请求:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ 智能体调用成功:', data);
      return true;
    } else {
      console.log('⚠️ 智能体调用返回错误:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ 智能体调用失败:', error.message);
    return false;
  }
}

// 测试错误处理
async function testErrorHandling() {
  console.log('\n=== 测试错误处理 ===');
  
  try {
    // 测试缺少参数的情况
    const response = await fetch(`${BASE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (response.status === 400 && !data.success) {
      console.log('✅ 错误处理正常:', data);
      return true;
    } else {
      console.log('⚠️ 错误处理异常:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ 错误处理测试失败:', error.message);
    return false;
  }
}

// 检查服务是否运行
function checkServiceRunning() {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始测试 AI Agent Service');
  console.log('测试地址:', BASE_URL);
  
  // 检查服务是否运行
  const isRunning = await checkServiceRunning();
  if (!isRunning) {
    console.error('❌ 服务未运行，请先启动服务: npm start');
    process.exit(1);
  }
  
  const results = [];
  
  // 运行测试
  results.push(await testHealth());
  results.push(await testErrorHandling());
  
  // 只有在配置了真实的 token 和 botId 时才测试智能体调用
  if (process.env.COZE_API_TOKEN && process.env.COZE_BOT_ID) {
    results.push(await testAgentChat());
  } else {
    console.log('\n⚠️ 跳过智能体调用测试（未配置 COZE_API_TOKEN 和 COZE_BOT_ID）');
  }
  
  // 统计结果
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📊 测试结果:');
  console.log(`通过: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('💥 部分测试失败');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    console.error('测试运行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  testHealth,
  testAgentChat,
  testErrorHandling,
  runTests
};