#!/usr/bin/env node

/**
 * Test script to verify MCP protocol compliance
 * This script checks that only JSON messages go to stdout
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPProtocol() {
  console.log('🔍 Testing MCP Protocol Compliance...');
  
  const serverPath = join(__dirname, 'dist', 'index.js');
  
  console.log('🚀 Starting MCP server...');
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'], // Separate stdin, stdout, stderr
    env: { ...process.env, OPENAI_API_KEY: 'test-key' }
  });

  let stdoutData = '';
  let stderrData = '';
  let jsonMessageCount = 0;
  let protocolValid = true;

  // Collect stdout data
  serverProcess.stdout.on('data', (data) => {
    stdoutData += data.toString();
    
    // Try to parse each line as JSON
    const lines = data.toString().split('\n').filter(line => line.trim());
    for (const line of lines) {
      try {
        JSON.parse(line);
        jsonMessageCount++;
        console.log(`✅ Valid JSON message received: ${line.substring(0, 100)}...`);
      } catch (error) {
        console.error(`❌ Invalid JSON on stdout: ${line}`);
        protocolValid = false;
      }
    }
  });

  // Collect stderr data (this is where logs should go)
  serverProcess.stderr.on('data', (data) => {
    stderrData += data.toString();
    console.log(`📋 Stderr log: ${data.toString().trim()}`);
  });

  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Send a test initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };

  console.log('📤 Sending initialize request...');
  serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

  // Send list tools request
  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };

  console.log('📤 Sending tools/list request...');
  serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  // Wait for responses
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Kill the server
  serverProcess.kill();

  // Analyze results
  console.log('\n📊 Test Results:');
  console.log('═'.repeat(50));
  console.log(`JSON messages received: ${jsonMessageCount}`);
  console.log(`Protocol compliance: ${protocolValid ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Stderr logs: ${stderrData ? '✅ Present' : '❌ Missing'}`);
  
  if (protocolValid && jsonMessageCount >= 2) {
    console.log('\n🎉 MCP Protocol compliance test PASSED!');
    console.log('✅ Only JSON messages sent to stdout');
    console.log('✅ Logs properly sent to stderr');
    return true;
  } else {
    console.log('\n❌ MCP Protocol compliance test FAILED!');
    console.log('Please ensure all logging goes to stderr, not stdout');
    return false;
  }
}

testMCPProtocol()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Test error:', error);
    process.exit(1);
  });
