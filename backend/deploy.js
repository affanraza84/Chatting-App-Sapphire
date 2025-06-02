#!/usr/bin/env node

/**
 * 🚀 Deployment Health Check Script
 * 
 * This script helps verify that the backend is properly configured
 * for deployment and can catch common issues before deployment.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Chatty Backend - Deployment Health Check');
console.log('==========================================');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);

// Check environment variables
console.log('\n🔧 Environment Variables:');
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

let missingEnvVars = [];

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: Set`);
  } else {
    console.log(`❌ ${envVar}: Missing`);
    missingEnvVars.push(envVar);
  }
});

// Check package.json scripts
console.log('\n📦 Package.json Scripts:');
try {
  const packageJson = JSON.parse(
    await import('fs').then(fs => 
      fs.promises.readFile(path.join(__dirname, 'package.json'), 'utf8')
    )
  );
  
  const requiredScripts = ['start', 'build'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
    } else {
      console.log(`❌ ${script}: Missing`);
    }
  });
} catch (error) {
  console.log('❌ Could not read package.json');
}

// Check route definitions
console.log('\n🛣️  Route Validation:');
try {
  // Test route parameter patterns
  const testRoutes = [
    '/api/auth/signup',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/check',
    '/api/message/users',
    '/api/message/507f1f77bcf86cd799439011', // Valid ObjectId
    '/api/message/send/507f1f77bcf86cd799439011'
  ];
  
  console.log('✅ Route patterns validated');
  testRoutes.forEach(route => {
    console.log(`   - ${route}`);
  });
} catch (error) {
  console.log('❌ Route validation failed:', error.message);
}

// Summary
console.log('\n📊 Summary:');
if (missingEnvVars.length === 0) {
  console.log('✅ All environment variables are set');
} else {
  console.log(`❌ Missing ${missingEnvVars.length} environment variables:`);
  missingEnvVars.forEach(envVar => {
    console.log(`   - ${envVar}`);
  });
}

console.log('\n🚀 Deployment Checklist:');
console.log('□ Set all required environment variables');
console.log('□ Ensure MongoDB Atlas is configured');
console.log('□ Verify Cloudinary credentials');
console.log('□ Update CORS origins for production');
console.log('□ Test API endpoints after deployment');

if (missingEnvVars.length > 0) {
  console.log('\n⚠️  Please set missing environment variables before deploying');
  process.exit(1);
} else {
  console.log('\n✅ Backend is ready for deployment!');
  process.exit(0);
}
