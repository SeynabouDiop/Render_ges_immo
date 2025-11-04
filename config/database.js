const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect('mongodb+srv://sdiop3564_db_user:TFz5pSLAaExJ2jNs@cluster0.fwj0s3o.mongodb.net/immo_angular?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;

