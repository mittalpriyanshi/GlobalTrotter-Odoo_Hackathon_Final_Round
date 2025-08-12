const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    // Check if MONGO_URI is set
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/globaltrotter';
    console.log(`📍 Connecting to: ${mongoUri}`);
    
    // Attempt connection
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully!');
    
    // Test basic operations
    console.log('🧪 Testing basic database operations...');
    
    // Create a test collection
    const testSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('ConnectionTest', testSchema);
    
    // Insert a test document
    const testDoc = await TestModel.create({
      name: 'GlobalTrotter Connection Test'
    });
    console.log('✅ Test document created:', testDoc._id);
    
    // Clean up test document
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('🧹 Test document cleaned up');
    
    // List available databases
    const admin = mongoose.connection.db.admin();
    const dbs = await admin.listDatabases();
    console.log('📚 Available databases:', dbs.databases.map(db => db.name));
    
    console.log('✅ All tests passed! MongoDB is ready for GlobalTrotter');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:');
      console.log('1. Make sure MongoDB is installed and running');
      console.log('2. Start MongoDB service:');
      console.log('   - On macOS: brew services start mongodb-community');
      console.log('   - On Ubuntu: sudo systemctl start mongod');
      console.log('   - On Windows: net start MongoDB');
      console.log('3. Check if MongoDB is listening on port 27017');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 Authentication issue:');
      console.log('1. Check your MongoDB username and password');
      console.log('2. Make sure the user has proper permissions');
      console.log('3. Update MONGO_URI in your .env file');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed');
  }
};

// Run the test
testConnection();
