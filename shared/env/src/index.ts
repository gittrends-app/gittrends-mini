import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
config({ path: `.env` });
