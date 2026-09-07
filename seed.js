// seed.js
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Because mockData.ts is TypeScript and we don't have ts-node readily available,
// we will just instruct the user to hit a new /api/seed endpoint we'll create temporarily.
