import webpush from "web-push";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:example@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class PushNotificationService {
  static async sendToUser(userId, notification) {
    try {
      console.log("[PushService] Sending notification to user:", userId);

      const subscriptions = await prisma.pushSubscription.findMany({
        where: { user_id: userId },
      });

      console.log(
        `[PushService] Found ${subscriptions.length} subscriptions for user ${userId}`
      );

      if (subscriptions.length === 0) {
        console.log(`No subscriptions found for user ${userId}`);
        return { sent: 0, failed: 0 };
      }

      const results = await Promise.allSettled(
        subscriptions.map((sub) => this.sendNotification(sub, notification))
      );

      const sent = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      // Remove failed subscriptions (likely expired)
      const failedIndices = results
        .map((r, i) => (r.status === "rejected" ? i : -1))
        .filter((i) => i !== -1);

      for (const index of failedIndices) {
        await prisma.pushSubscription
          .delete({
            where: { id: subscriptions[index].id },
          })
          .catch((err) => console.error("Failed to delete subscription:", err));
      }

      return { sent, failed };
    } catch (error) {
      console.error("Error sending push notification to user:", error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Send push notification to a single subscription
   * @param {Object} subscription - The subscription object from database
   * @param {Object} notification - The notification payload
   * @returns {Promise<void>}
   */
  static async sendNotification(subscription, notification) {
    try {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.auth,
          p256dh: subscription.p256dh,
        },
      };

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || "/icons/notification-icon.png",
        badge: notification.badge || "/icons/notification-badge.png",
        data: notification.data || {},
      });

      await webpush.sendNotification(pushSubscription, payload);
    } catch (error) {
      // Throw error to be caught by caller
      throw error;
    }
  }

  /**
   * Remove invalid/expired subscription
   * @param {number} subscriptionId - The subscription ID to remove
   * @returns {Promise<void>}
   */
  static async removeInvalidSubscription(subscriptionId) {
    try {
      await prisma.pushSubscription.delete({
        where: { id: subscriptionId },
      });
    } catch (error) {
      console.error("Error removing subscription:", error);
    }
  }

  /**
   * Get subscription count for a user
   * @param {number} userId - The user ID
   * @returns {Promise<number>}
   */
  static async getSubscriptionCount(userId) {
    try {
      return await prisma.pushSubscription.count({
        where: { user_id: userId },
      });
    } catch (error) {
      console.error("Error getting subscription count:", error);
      return 0;
    }
  }

  static async getAllSubscriptions(userId) {
    try {
      return await prisma.pushSubscription.findMany({
        where: { user_id: userId },
        select: {
          id: true,
          endpoint: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (error) {
      console.error("Error getting all subscriptions:", error);
      return [];
    }
  }

  static async saveSubscription(userId, subscription) {
    try {
      return await prisma.pushSubscription.upsert({
        where: {
          user_id_endpoint: {
            user_id: userId,
            endpoint: subscription.endpoint,
          },
        },
        update: {
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          updated_at: new Date(),
        },
        create: {
          user_id: userId,
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
        },
      });
    } catch (error) {
      console.error("Error saving subscription:", error);
      throw error;
    }
  }

  static async removeSubscriptionByEndpoint(userId, endpoint) {
    try {
      return await prisma.pushSubscription.deleteMany({
        where: {
          user_id: userId,
          endpoint,
        },
      });
    } catch (error) {
      console.error("Error removing subscription by endpoint:", error);
      // Don't throw - allow subscription to proceed even if delete fails
      return { count: 0 };
    }
  }

  static async cleanupDeadSubscriptions(userId, daysOld = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.pushSubscription.deleteMany({
        where: {
          user_id: userId,
          updated_at: {
            lt: cutoffDate,
          },
        },
      });

      if (result.count > 0) {
        console.log(
          `[PushService] Cleaned up ${result.count} dead subscriptions for user ${userId}`
        );
      }

      return result;
    } catch (error) {
      console.error("Error cleaning up dead subscriptions:", error);
      return { count: 0 };
    }
  }

  /**
   * Remove a subscription for a user
   * @param {number} userId - The user ID
   * @param {string} endpoint - The subscription endpoint
   * @returns {Promise<void>}
   */
  static async removeSubscription(userId, endpoint) {
    try {
      await prisma.pushSubscription.delete({
        where: {
          user_id_endpoint: {
            user_id: userId,
            endpoint,
          },
        },
      });
    } catch (error) {
      console.error("Error removing subscription:", error);
    }
  }

  /**
   * Send task creation notification
   * @param {Object} task - The task object
   * @returns {Promise<Object>}
   */
  static async notifyTaskCreated(task) {
    if (!task.assigned_to) {
      return { sent: 0, failed: 0 };
    }

    return this.sendToUser(task.assigned_to, {
      title: "New Task Assigned",
      body: `${task.title}`,
      data: {
        taskId: task.id,
        action: "taskCreated",
        taskTitle: task.title,
      },
    });
  }

  /**
   * Send task update notification
   * @param {Object} task - The task object
   * @param {string} changeType - Type of change: 'reassigned' or 'updated'
   * @returns {Promise<Object>}
   */
  static async notifyTaskUpdated(task, changeType = "updated") {
    if (!task.assigned_to) {
      return { sent: 0, failed: 0 };
    }

    const titleMap = {
      reassigned: "Task Reassigned To You",
      updated: "Task Updated",
    };

    return this.sendToUser(task.assigned_to, {
      title: titleMap[changeType] || "Task Updated",
      body: `${task.title}`,
      data: {
        taskId: task.id,
        action: "taskUpdated",
        taskTitle: task.title,
        changeType,
      },
    });
  }
}

export default PushNotificationService;
