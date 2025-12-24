import express from 'express';
import auth from '../middleware/auth.js';
import {
  subscribeToPush,
  unsubscribeFromPush,
  getPushConfig,
  getPushSubscriptionCount,
} from '../modules/pushNotifications.js';

const router = express.Router();


// Push notification subscription routes
router.post('/subscribe',auth(), subscribeToPush);
router.delete('/unsubscribe',auth(), unsubscribeFromPush);

// Push configuration (public endpoint)
router.get('/config', getPushConfig);

// Subscription count (requires auth)
router.get('/subscription-count',auth(), getPushSubscriptionCount);

export default router;
