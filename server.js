const mongoose = require('mongoose');
const dotenv = require('dotenv');

const app = require('./app');

process.on('unhandledRejections', (err) => {
  console.error('Unhandled Rejections:', err.name, err.message);
  console.error('SHUTTING DOWN!');
  server.close(() => {
    process.exit(1);
  });
});

dotenv.config({ path: './config.env' });

// Connectig to the database
const DB = process.env.DATABASE_URI.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

// Setting the port (Listen)
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.name, err.message);
  console.error('SHUTTING DOWN!');
  server.close(() => {
    process.exit(1);
  });
});
