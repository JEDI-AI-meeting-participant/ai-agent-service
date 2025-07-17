#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 检查环境变量文件
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log('⚠️ 未找到 .env 文件');
    if (fs.existsSync(envExamplePath)) {
      console.log('💡 请复制 .env.example 为 .env 并配置相关参数:');
      console.log('   cp .env.example .env');
    }
    console.log('');
  }
}

// 检查依赖
function checkDependencies() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️ 未找到 node_modules 目录');
    console.log('💡 请先安装依赖: npm install');
    console.log('');
    return false;
  }
  
  return true;
}

// 启动服务
function startService() {
  console.log('🚀 启动 AI Agent Service...');
  console.log('📍 工作目录:', __dirname);
  console.log('🌐 服务地址: http://localhost:' + (process.env.PORT || 3003));
  console.log('❤️ 健康检查: http://localhost:' + (process.env.PORT || 3003) + '/health');
  console.log('');
  
  const servicePath = path.join(__dirname, 'src', 'index.js');
  
  const child = spawn('node', [servicePath], {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env }
  });
  
  child.on('error', (error) => {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  });
  
  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ 服务异常退出，退出码: ${code}`);
      process.exit(code);
    }
  });
  
  // 处理进程信号
  process.on('SIGINT', () => {
    console.log('\n🛑 收到停止信号，正在关闭服务...');
    child.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 收到终止信号，正在关闭服务...');
    child.kill('SIGTERM');
  });
}

// 显示帮助信息
function showHelp() {
  console.log('AI Agent Service 启动脚本');
  console.log('');
  console.log('用法:');
  console.log('  node start.js [选项]');
  console.log('');
  console.log('选项:');
  console.log('  --help, -h     显示帮助信息');
  console.log('  --check, -c    检查环境和依赖');
  console.log('  --test, -t     运行测试');
  console.log('');
  console.log('环境变量:');
  console.log('  PORT           服务端口 (默认: 3003)');
  console.log('  NODE_ENV       运行环境 (默认: development)');
  console.log('');
  console.log('示例:');
  console.log('  node start.js              # 启动服务');
  console.log('  PORT=3004 node start.js    # 在端口 3004 启动服务');
  console.log('  node start.js --test       # 运行测试');
}

// 运行测试
function runTest() {
  console.log('🧪 运行测试...');
  const testPath = path.join(__dirname, 'test.js');
  
  const child = spawn('node', [testPath], {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env }
  });
  
  child.on('exit', (code) => {
    process.exit(code);
  });
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  // 解析命令行参数
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--test') || args.includes('-t')) {
    runTest();
    return;
  }
  
  if (args.includes('--check') || args.includes('-c')) {
    console.log('🔍 检查环境和依赖...');
    checkEnvFile();
    const depsOk = checkDependencies();
    if (depsOk) {
      console.log('✅ 环境检查完成');
    } else {
      console.log('❌ 环境检查失败');
      process.exit(1);
    }
    return;
  }
  
  // 启动前检查
  checkEnvFile();
  const depsOk = checkDependencies();
  
  if (!depsOk) {
    process.exit(1);
  }
  
  // 启动服务
  startService();
}

if (require.main === module) {
  main();
}