#!/usr/bin/env node

/**
 * Test Runner Script
 * Runs different test suites based on command line arguments
 */

const { spawn } = require('child_process');
const args = process.argv.slice(2);

const commands = {
  unit: ['npx', ['jest', 'tests/unit']],
  integration: ['npx', ['jest', 'tests/integration']],
  e2e: ['npx', ['playwright', 'test']],
  all: ['npm', ['test']],
  watch: ['npx', ['jest', '--watch']],
  coverage: ['npx', ['jest', '--coverage']],
};

function runCommand(cmd, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(cmd, args, { 
      stdio: 'inherit',
      shell: true 
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const testType = args[0] || 'all';

  if (!commands[testType]) {
    console.error(`Unknown test type: ${testType}`);
    console.log('Available options:');
    console.log('  unit        - Run unit tests only');
    console.log('  integration - Run integration tests only');
    console.log('  e2e         - Run end-to-end tests');
    console.log('  all         - Run all tests');
    console.log('  watch       - Run tests in watch mode');
    console.log('  coverage    - Run tests with coverage report');
    process.exit(1);
  }

  console.log(`\n🧪 Running ${testType} tests...\n`);

  try {
    const [cmd, cmdArgs] = commands[testType];
    await runCommand(cmd, cmdArgs);
    console.log(`\n✅ ${testType} tests completed successfully!\n`);
  } catch (error) {
    console.error(`\n❌ ${testType} tests failed!\n`);
    process.exit(1);
  }
}

main();
