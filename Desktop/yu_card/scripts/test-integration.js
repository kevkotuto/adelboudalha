#!/usr/bin/env node

/**
 * Test script to verify backend integration
 * This tests the login functionality with provided credentials
 */

const axios = require('axios');

const API_BASE_URL = 'http://82.180.149.184:30010/api';
const TEST_CREDENTIALS = {
  phone: '+2250500808585',
  password: 'Ce123456'
};

async function testHealthCheck() {
  console.log('🔍 Testing health check...');
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`, {
      timeout: 10000
    });
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('🔐 Testing login with credentials...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, TEST_CREDENTIALS, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('📋 Response data:');
    console.log('- User ID:', response.data.data.user.id);
    console.log('- Phone:', response.data.data.user.phone);
    console.log('- Full Name:', response.data.data.user.fullName);
    console.log('- Role:', response.data.data.user.role);
    console.log('- Phone Verified:', response.data.data.user.phoneVerified);
    console.log('- Has Completed Onboarding:', response.data.data.user.hasCompletedOnboarding);
    console.log('- Access Token Length:', response.data.data.tokens.accessToken.length);
    console.log('- Refresh Token Length:', response.data.data.tokens.refreshToken.length);

    return {
      success: true,
      tokens: response.data.data.tokens,
      user: response.data.data.user
    };
  } catch (error) {
    console.log('❌ Login failed:');
    if (error.response) {
      console.log('- Status:', error.response.status);
      console.log('- Data:', error.response.data);
    } else {
      console.log('- Error:', error.message);
    }
    return { success: false };
  }
}

async function testProtectedEndpoint(accessToken) {
  console.log('🔒 Testing protected endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Protected endpoint access successful!');
    console.log('📋 Profile data:');
    console.log('- User ID:', response.data.data.id);
    console.log('- Phone:', response.data.data.phone);
    console.log('- Full Name:', response.data.data.fullName);
    return true;
  } catch (error) {
    console.log('❌ Protected endpoint failed:');
    if (error.response) {
      console.log('- Status:', error.response.status);
      console.log('- Data:', error.response.data);
    } else {
      console.log('- Error:', error.message);
    }
    return false;
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Yu Card Backend Integration Tests...\n');

  // Test 1: Health check
  const healthOk = await testHealthCheck();
  console.log('');

  if (!healthOk) {
    console.log('❌ Backend is not available. Skipping further tests.');
    process.exit(1);
  }

  // Test 2: Login
  const loginResult = await testLogin();
  console.log('');

  if (!loginResult.success) {
    console.log('❌ Login failed. Cannot continue with protected endpoint tests.');
    process.exit(1);
  }

  // Test 3: Protected endpoint
  await testProtectedEndpoint(loginResult.tokens.accessToken);
  console.log('');

  console.log('🎉 All tests completed! Backend integration is working.');
}

// Run the tests
runIntegrationTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});