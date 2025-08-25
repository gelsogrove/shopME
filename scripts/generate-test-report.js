#!/usr/bin/env node

/**
 * Test Report Generator
 * Generates comprehensive reports from Jest test results
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateTestReport() {
  log('📊 Generating Test Report...', 'cyan');
  
  const testResultsDir = path.join(__dirname, '../test-results');
  const coverageDir = path.join(__dirname, '../coverage');
  
  // Check if test results exist
  if (!fs.existsSync(testResultsDir)) {
    log('❌ No test results found. Run tests first with: npm run test:integration:report', 'red');
    return;
  }
  
  // Read Jest results
  const jestResultsFile = path.join(testResultsDir, 'integration-test-results.xml');
  let testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    failures: []
  };
  
  if (fs.existsSync(jestResultsFile)) {
    try {
      const xmlContent = fs.readFileSync(jestResultsFile, 'utf8');
      const testSuites = xmlContent.match(/<testsuite[^>]*>/g) || [];
      const testCases = xmlContent.match(/<testcase[^>]*>/g) || [];
      const failures = xmlContent.match(/<failure[^>]*>([\s\S]*?)<\/failure>/g) || [];
      
      testResults.total = testCases.length;
      testResults.passed = testCases.filter(tc => !tc.includes('failure')).length;
      testResults.failed = failures.length;
      testResults.skipped = testCases.filter(tc => tc.includes('skipped')).length;
      
      // Extract failure details
      failures.forEach((failure, index) => {
        const failureMatch = failure.match(/<failure[^>]*>([\s\S]*?)<\/failure>/);
        if (failureMatch) {
          testResults.failures.push({
            id: index + 1,
            message: failureMatch[1].trim()
          });
        }
      });
    } catch (error) {
      log(`❌ Error reading test results: ${error.message}`, 'red');
    }
  }
  
  // Generate summary report
  const summary = `
# 🧪 Integration Test Report

## 📊 Summary
- **Total Tests**: ${testResults.total}
- **Passed**: ${colors.green}${testResults.passed}${colors.reset}
- **Failed**: ${colors.red}${testResults.failed}${colors.reset}
- **Skipped**: ${colors.yellow}${testResults.skipped}${colors.reset}
- **Success Rate**: ${testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0}%

## 📁 Reports Generated
- **JUnit XML**: \`test-results/integration-test-results.xml\`
- **HTML Report**: \`test-results/integration-test-report.html\`
- **Coverage Report**: \`coverage/lcov-report/index.html\`

## ❌ Failed Tests
${testResults.failures.length > 0 ? testResults.failures.map(f => `### Failure ${f.id}\n\`\`\`\n${f.message}\n\`\`\``).join('\n\n') : 'No failures found!'}

## 🚀 Next Steps
1. Review the HTML report for detailed test results
2. Check coverage report for code coverage analysis
3. Fix failing tests and re-run: \`npm run test:integration:report\`
4. For coverage analysis: \`npm run test:integration:coverage\`

---
*Report generated on ${new Date().toLocaleString()}*
`;

  // Save report to file
  const reportFile = path.join(testResultsDir, 'test-report.md');
  fs.writeFileSync(reportFile, summary);
  
  // Display summary in console
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 INTEGRATION TEST REPORT SUMMARY', 'bright');
  log('='.repeat(60), 'cyan');
  
  log(`📊 Total Tests: ${testResults.total}`, 'blue');
  log(`✅ Passed: ${testResults.passed}`, 'green');
  log(`❌ Failed: ${testResults.failed}`, 'red');
  log(`⏭️ Skipped: ${testResults.skipped}`, 'yellow');
  
  const successRate = testResults.total > 0 ? Math.round((testResults.passed / testResults.total) * 100) : 0;
  log(`📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 60 ? 'yellow' : 'red');
  
  if (testResults.failures.length > 0) {
    log('\n❌ FAILED TESTS:', 'red');
    testResults.failures.forEach((failure, index) => {
      log(`  ${index + 1}. ${failure.message.split('\n')[0]}`, 'red');
    });
  }
  
  log('\n📁 Reports saved to:', 'cyan');
  log(`  • Markdown: ${reportFile}`, 'blue');
  log(`  • HTML: ${path.join(testResultsDir, 'integration-test-report.html')}`, 'blue');
  log(`  • Coverage: ${path.join(coverageDir, 'lcov-report/index.html')}`, 'blue');
  
  log('\n' + '='.repeat(60), 'cyan');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the report generator
if (require.main === module) {
  generateTestReport();
}

module.exports = { generateTestReport };
