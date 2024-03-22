import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });
config({ path: `.env` });
