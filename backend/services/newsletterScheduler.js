const { sendNewsletterCampaign, shouldRunNow } = require('./newsletterCampaignService');

let timer = null;

const startNewsletterScheduler = () => {
  const enabled = process.env.ENABLE_NEWSLETTER_SCHEDULER !== 'false';
  if (!enabled) {
    console.log('Newsletter scheduler disabled by environment');
    return;
  }

  const tick = async () => {
    const now = new Date();
    if (!shouldRunNow(now)) return;

    try {
      const result = await sendNewsletterCampaign({ source: 'scheduler', enforceWeeklyGuard: true });
      if (result.sent) {
        console.log(`Newsletter scheduler sent campaign: week=${result.weekKey} recipients=${result.recipientCount}`);
      } else {
        console.log(`Newsletter scheduler skipped: ${result.reason}`);
      }
    } catch (error) {
      console.error('Newsletter scheduler error:', error.message);
    }
  };

  // Run once on startup in case server restarts at the scheduled hour.
  void tick();
  timer = setInterval(() => {
    void tick();
  }, 60 * 60 * 1000);
};

const stopNewsletterScheduler = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

module.exports = {
  startNewsletterScheduler,
  stopNewsletterScheduler,
};
