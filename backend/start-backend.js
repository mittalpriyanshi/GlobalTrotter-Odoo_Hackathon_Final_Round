const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 GlobalTrotter Backend Startup Script');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `PORT=5001
MONGO_URI=mongodb+srv://priyadef1234:HFoyBvfZxzqBXik8@cluster0.iaahjnf.mongodb.net/odoo-globetrotter?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created with MongoDB Atlas connection');
} else {
  console.log('✅ .env file already exists');
}

// Test MongoDB connection first
console.log('\n🔍 Testing MongoDB connection...');
const testConnection = spawn('node', ['test-connection.js'], { 
  stdio: 'inherit',
  cwd: __dirname 
});

testConnection.on('close', (code) => {
  if (code === 0) {
    console.log('\n🚀 Starting backend server...');
    console.log('📍 Server will be available at: http://localhost:5001');
    console.log('📍 API endpoints at: http://localhost:5001/api');
    console.log('📍 Health check: http://localhost:5001/api/auth/health');
    console.log('\n💡 To test integration:');
    console.log('   1. Open another terminal');
    console.log('   2. cd ../frontend');
    console.log('   3. npm run dev');
    console.log('   4. Open http://localhost:5173\n');
    
    // Start the development server
    const server = spawn('npm', ['run', 'dev'], { 
      stdio: 'inherit',
      cwd: __dirname,
      shell: true
    });
    
    server.on('close', (code) => {
      console.log(`\n🔴 Server stopped with code ${code}`);
    });
    
    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down server...');
      server.kill('SIGINT');
      process.exit(0);
    });
    
  } else {
    console.log('\n❌ MongoDB connection test failed. Please check your MongoDB setup.');
    console.log('💡 See SETUP.md for troubleshooting tips.');
    process.exit(1);
  }
});

testConnection.on('error', (err) => {
  console.error('❌ Error testing connection:', err.message);
  process.exit(1);
});
