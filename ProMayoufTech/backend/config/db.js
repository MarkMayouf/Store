import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const defaultMongoUri = 'mongodb://localhost:27017/promayouftech';
    const mongoUri = process.env.MONGO_URI || defaultMongoUri;
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
