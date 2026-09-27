import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connect_DB } from './Connect_db/connect_db.js';
import redis from './Connect_db/connect_redis.js';
import Router from './Router/Export_router.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(Router);

async function startServer() {
  try {
    await connect_DB();
    console.log('--- Database Connected ---');

    await redis.connect();
    console.log('✅ Connected to Redis');

    app.listen(process.env.PORT, () => {
      console.log('--- Server is running on port', process.env.PORT, '---');
    });

  } catch (error) {
    console.error('😵 Error starting the server:', error);
    process.exit(1); 
  }
}

startServer();