const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });

        console.log(`Database connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Connection error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;