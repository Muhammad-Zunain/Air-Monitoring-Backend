import app from '../src/app.js';
import serverless from 'serverless-http';

const handler = serverless(app);

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
