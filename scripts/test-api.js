#!/usr/bin/env node

/**
 * AI Agent Service API 测试脚本
 * 用于验证服务的各个接口功能
 */

const http = require('http');
const https = require('https');

class APITester {
  constructor(baseUrl = 'http://localhost:3003') {
    this.baseUrl = baseUrl;
    this.results = [];
  }

  /**
   * 发送 HTTP 请求
   */
  async request(options, data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(options.path, this.baseUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const req = client.request({
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = body ? JSON.parse(body) : null;
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: jsonBody
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }

      req.end();
    });
  }

  /**
   * 记录测试结果
   */
  logResult(testName, success, message, response = null) {
    const result = {
      test: testName,
      success,
      message,
      timestamp: new Date().toISOString()
    };

    if (response) {
      result.statusCode = response.statusCode;
      result.responseTime = response.responseTime;
    }

    this.results.push(result);

    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}: ${message}`);
    
    if (response && !success) {
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body, null, 2)}`);
    }
  }

  /**
   * 测试健康检查接口
   */
  async testHealthCheck() {
    console.log('\n🔍 测试健康检查接口...');
    
    try {
      const startTime = Date.now();
      const response = await this.request({ path: '/health' });
      const responseTime = Date.now() - startTime;
      response.responseTime = responseTime;

      if (response.statusCode === 200 && response.body && response.body.status === 'healthy') {
        this.logResult('健康检查', true, `服务健康 (${responseTime}ms)`, response);
        return true;
      } else {
        this.logResult('健康检查', false, '健康检查失败', response);
        return false;
      }
    } catch (error) {
      this.logResult('健康检查', false, `请求失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 测试详细健康检查接口
   */
  async testDetailedHealthCheck() {
    console.log('\n🔍 测试详细健康检查接口...');
    
    try {
      const startTime = Date.now();
      const response = await this.request({ path: '/health/detailed' });
      const responseTime = Date.now() - startTime;
      response.responseTime = responseTime;

      if (response.statusCode === 200 && response.body && response.body.status === 'healthy') {
        this.logResult('详细健康检查', true, `详细信息获取成功 (${responseTime}ms)`, response);
        return true;
      } else {
        this.logResult('详细健康检查', false, '详细健康检查失败', response);
        return false;
      }
    } catch (error) {
      this.logResult('详细健康检查', false, `请求失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 测试智能体聊天接口
   */
  async testAgentChat() {
    console.log('\n🔍 测试智能体聊天接口...');
    
    const testCases = [
      {
        name: '正常聊天请求',
        data: {
          input: '你好，请简单介绍一下自己',
          config: {
            token: 'test_token',
            botId: 'test_bot_id',
            baseURL: 'https://api.coze.cn'
          }
        },
        expectSuccess: false // 因为使用测试 token，预期会失败
      },
      {
        name: '缺少输入参数',
        data: {
          config: {
            token: 'test_token',
            botId: 'test_bot_id'
          }
        },
        expectSuccess: false
      },
      {
        name: '缺少配置参数',
        data: {
          input: '你好'
        },
        expectSuccess: false
      },
      {
        name: '空请求体',
        data: {},
        expectSuccess: false
      }
    ];

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const response = await this.request({
          path: '/api/agent/chat',
          method: 'POST'
        }, testCase.data);
        const responseTime = Date.now() - startTime;
        response.responseTime = responseTime;

        // 检查响应格式
        const hasValidFormat = response.body && 
          typeof response.body === 'object' && 
          'success' in response.body;

        if (hasValidFormat) {
          if (testCase.expectSuccess) {
            const success = response.body.success && response.statusCode === 200;
            this.logResult(testCase.name, success, 
              success ? `请求成功 (${responseTime}ms)` : '请求失败', response);
          } else {
            // 对于预期失败的测试，检查是否正确返回错误
            const success = !response.body.success || response.statusCode !== 200;
            this.logResult(testCase.name, success, 
              success ? `正确处理错误 (${responseTime}ms)` : '错误处理异常', response);
          }
        } else {
          this.logResult(testCase.name, false, '响应格式无效', response);
        }
      } catch (error) {
        this.logResult(testCase.name, false, `请求失败: ${error.message}`);
      }
    }
  }

  /**
   * 测试错误处理
   */
  async testErrorHandling() {
    console.log('\n🔍 测试错误处理...');
    
    try {
      const response = await this.request({ path: '/nonexistent' });
      
      if (response.statusCode === 404) {
        this.logResult('404错误处理', true, '正确返回404状态码', response);
      } else {
        this.logResult('404错误处理', false, '404处理异常', response);
      }
    } catch (error) {
      this.logResult('404错误处理', false, `请求失败: ${error.message}`);
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🚀 开始 AI Agent Service API 测试');
    console.log(`📍 测试目标: ${this.baseUrl}`);
    console.log('=' * 50);

    const startTime = Date.now();

    // 运行测试
    await this.testHealthCheck();
    await this.testDetailedHealthCheck();
    await this.testAgentChat();
    await this.testErrorHandling();

    const totalTime = Date.now() - startTime;

    // 统计结果
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;

    console.log('\n' + '=' * 50);
    console.log('📊 测试结果统计:');
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过: ${passedTests} ✅`);
    console.log(`   失败: ${failedTests} ❌`);
    console.log(`   总耗时: ${totalTime}ms`);
    console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.test}: ${result.message}`);
      });
    }

    console.log('\n🏁 测试完成!');
    return { totalTests, passedTests, failedTests, totalTime };
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args[0] || 'http://localhost:3003';
  
  const tester = new APITester(baseUrl);
  
  try {
    const results = await tester.runAllTests();
    process.exit(results.failedTests > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ 测试执行失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = APITester;