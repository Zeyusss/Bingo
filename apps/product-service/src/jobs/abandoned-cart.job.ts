import cron from 'node-cron';
import { processAbandonedCarts } from '../services/abandonedCart.service';

// Run abandoned cart processing every day at 10:00 AM
const abandonedCartJob = cron.schedule('0 10 * * *', async () => {
  console.log('Starting abandoned cart processing job...');
  
  try {
    const result = await processAbandonedCarts();
    console.log(`Abandoned cart job completed. Sent: ${result.sent}, Errors: ${result.errors}`);
  } catch (error) {
    console.error('Error in abandoned cart job:', error);
  }
}, {
  timezone: "UTC"
});

// Also run a second job every 3 days at 2:00 PM for follow-up emails
const followUpAbandonedCartJob = cron.schedule('0 14 */3 * *', async () => {
  console.log('Starting follow-up abandoned cart processing job...');
  
  try {
    // Process carts abandoned for 72+ hours
    const result = await processAbandonedCarts();
    console.log(`Follow-up abandoned cart job completed. Sent: ${result.sent}, Errors: ${result.errors}`);
  } catch (error) {
    console.error('Error in follow-up abandoned cart job:', error);
  }
}, {
  timezone: "UTC"
});

console.log('Abandoned cart cron jobs initialized:');
console.log('- Daily abandoned cart emails: Every day at 10:00 AM UTC');
console.log('- Follow-up emails: Every 3 days at 2:00 PM UTC');

export { abandonedCartJob, followUpAbandonedCartJob };
