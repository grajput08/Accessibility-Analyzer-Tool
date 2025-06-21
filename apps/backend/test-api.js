import fetch from 'node-fetch';

async function testAccessibilityAPI() {
  const baseUrl = 'http://localhost:3001/api/v1';

  console.log('🧪 Testing Accessibility Analyzer API...\n');

  // Test health endpoint
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  // Test accessibility analysis endpoint
  try {
    console.log('\n2. Testing accessibility analysis endpoint...');
    const analysisResponse = await fetch(`${baseUrl}/analyse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com',
        standard: 'WCAG2AA',
        includeWarnings: true,
        includeNotices: true,
      }),
    });

    const analysisData = await analysisResponse.json();

    if (analysisResponse.ok) {
      console.log('✅ Accessibility analysis successful!');
      console.log('📊 Results summary:');
      console.log(`   - Document Title: ${analysisData.documentTitle}`);
      console.log(`   - Page URL: ${analysisData.pageUrl}`);
      console.log(`   - Total Issues: ${analysisData.issues.length}`);
      console.log(
        `   - Errors: ${analysisData.standards.WCAG2AA?.errors || 0}`
      );
      console.log(
        `   - Warnings: ${analysisData.standards.WCAG2AA?.warnings || 0}`
      );
      console.log(
        `   - Notices: ${analysisData.standards.WCAG2AA?.notices || 0}`
      );
    } else {
      console.log('❌ Accessibility analysis failed:', analysisData);
    }
  } catch (error) {
    console.log('❌ Accessibility analysis request failed:', error.message);
  }

  console.log('\n🎉 API testing completed!');
}

// Run the test
testAccessibilityAPI().catch(console.error);
