import 'dotenv/config';
import { recurringWorker } from './recurring.worker';

console.log('Starting Invoxa Background Workers...');

// Just importing the workers initializes them
console.log(`Worker attached to queue: ${recurringWorker.name}`);

// Keep the process alive
process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  await recurringWorker.close();
  process.exit(0);
});
