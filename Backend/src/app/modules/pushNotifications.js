import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError.js";
import PushNotificationService from "../services/pushNotificationService.js";

// ==================== PUSH NOTIFICATION FUNCTIONS ====================

async function subscribeToPush(req, res, next) {
  try {
    const { subscription } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "User must be authenticated to subscribe to push notifications"
      );
    }

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Valid subscription object is required"
      );
    }

    console.log(subscription.endpoint);

    // Remove any old subscriptions with the same endpoint (handles re-subscription after clearing browser data)
    await PushNotificationService.removeSubscriptionByEndpoint(
      userId,
      subscription.endpoint
    );

    const savedSubscription = await PushNotificationService.saveSubscription(
      userId,
      subscription
    );

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Push notification subscription saved successfully",
      data: {
        id: savedSubscription.id,
        subscriptionCount: await PushNotificationService.getSubscriptionCount(
          userId
        ),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function unsubscribeFromPush(req, res, next) {
  try {
    const { endpoint } = req.body;
    const userId = req.user?.id;
    console.log(endpoint);

    if (!userId) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "User must be authenticated to unsubscribe"
      );
    }

    if (!endpoint) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Subscription endpoint is required"
      );
    }

    await PushNotificationService.removeSubscription(userId, endpoint);

    res.json({
      success: true,
      message: "Push notification subscription removed successfully",
      data: {
        subscriptionCount: await PushNotificationService.getSubscriptionCount(
          userId
        ),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get push notification configuration (VAPID public key)
 * GET /api/v1/push/config
 * Public endpoint (no auth required)
 */
async function getPushConfig(req, res, next) {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;

    if (!publicKey) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Push notification service is not configured"
      );
    }

    res.json({
      success: true,
      data: {
        publicKey,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get subscription count for the current user
 * GET /api/v1/push/subscription-count
 * Also cleans up dead subscriptions (older than 30 days)
 */
async function getPushSubscriptionCount(req, res, next) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "User must be authenticated"
      );
    }

    await PushNotificationService.cleanupDeadSubscriptions(userId, 30);

    const count = await PushNotificationService.getSubscriptionCount(userId);
    const subscriptions = await PushNotificationService.getAllSubscriptions(
      userId
    );

    console.log(req.user.name, count);

    res.json({
      success: true,
      data: {
        subscriptionCount: count,
        subscriptions: subscriptions,
      },
    });
  } catch (error) {
    next(error);
  }
}

export {
  subscribeToPush,
  unsubscribeFromPush,
  getPushConfig,
  getPushSubscriptionCount,
};
