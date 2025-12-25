import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import PushNotificationService from "./pushNotificationService.js";
import emailService from "./emailService.js";
import { taskAlertTemplate } from "../../templates/emailTemplates.js";

const prisma = new PrismaClient();

class AlertSchedulerService {
  static cronJob = null;

  /**
   * Initialize the scheduler - runs every minute
   * Checks for alerts matching current HH:MM
   */
  static init() {
    try {
      // Run every minute at second 0
      // * * * * * (minute, hour, day of month, month, day of week)
      this.cronJob = cron.schedule("* * * * *", async () => {
        await this.checkAndSendAlerts();
      });

      console.log("[AlertScheduler] Initialized - running every minute");
      return this.cronJob;
    } catch (error) {
      console.error("[AlertScheduler] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * Main function that runs every minute
   * Finds alerts matching current HH:MM:00 to HH:MM:59 and sends notifications
   */
  static async checkAndSendAlerts() {
    try {
      const now = new Date();
      const currentHour = String(now.getHours()).padStart(2, "0");
      const currentMinute = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${currentHour}:${currentMinute}`;

      console.log(
        `[AlertScheduler] Checking for alerts at ${currentTime}:00-59`
      );

      // Create time range for current minute (HH:MM:00 to HH:MM:59)
      const minuteStart = new Date();
      minuteStart.setHours(now.getHours(), now.getMinutes(), 0, 0);

      const minuteEnd = new Date();
      minuteEnd.setHours(now.getHours(), now.getMinutes(), 59, 999);

      // Get all alerts within current minute that are today or in the future
      const matchingAlerts = await prisma.taskAlert.findMany({
        where: {
          alert_date: {
            gte: minuteStart, // From HH:MM:00
            lte: minuteEnd, // To HH:MM:59
          },
        },
        include: {
          task: {
            include: {
              assignee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              reporter: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (matchingAlerts.length === 0) {
        console.log(
          `[AlertScheduler] No alerts found for ${currentTime}:00-59`
        );
        return;
      }

      console.log(
        `[AlertScheduler] Found ${matchingAlerts.length} alerts for ${currentTime}:00-59`
      );

      // Process each matching alert
      for (const alert of matchingAlerts) {
        await this.sendAlertNotification(alert);
      }
    } catch (error) {
      console.error("[AlertScheduler] Error checking alerts:", error);
    }
  }

  /**
   * Send notification for a single alert
   * @param {Object} alert - Alert object with task data
   */
  static async sendAlertNotification(alert) {
    try {
      const { task } = alert;
      const alertDate = new Date(alert.alert_date);
      const alertTime = `${String(alertDate.getHours()).padStart(
        2,
        "0"
      )}:${String(alertDate.getMinutes()).padStart(2, "0")}`;

      console.log(
        `[AlertScheduler] Processing alert ${alert.id} for task "${task.title}" at ${alertTime}`
      );

      // Notify assignee if task is assigned
      if (task.assignee && task.assignee.email) {
        try {
          const assigneeName =
            `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
            "Team Member";

          const emailHtml = taskAlertTemplate(assigneeName, task, alert);

          await emailService.sendEmail({
            to: task.assignee.email,
            subject: `Task Alert: ${task.title}`,
            html: emailHtml,
          });

          console.log(
            `[AlertScheduler] Email sent to assignee (${task.assignee.email})`
          );
        } catch (emailError) {
          console.error(
            `[AlertScheduler] Failed to send email to assignee:`,
            emailError.message
          );
        }

        // Send push notification to assignee
        try {
          await PushNotificationService.sendToUser(task.assignee.id, {
            title: "Task Alert",
            body: `Reminder: ${task.title}`,
            icon: "/icons/notification-icon.png",
            badge: "/icons/notification-badge.png",
            data: {
              taskId: task.id,
              alertId: alert.id,
              action: "taskAlert",
              alertTime: alertTime,
            },
          });

          console.log(
            `[AlertScheduler] Push notification sent to assignee (ID: ${task.assignee.id})`
          );
        } catch (pushError) {
          console.error(
            `[AlertScheduler] Failed to send push to assignee:`,
            pushError.message
          );
        }
      }

      // Notify reporter if different from assignee
      if (
        task.reporter &&
        task.reporter.email &&
        task.reporter.id !== task.assignee?.id
      ) {
        try {
          const reporterName =
            `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
            "Manager";

          const emailHtml = taskAlertTemplate(reporterName, task, alert);

          await emailService.sendEmail({
            to: task.reporter.email,
            subject: `Task Alert: ${task.title}`,
            html: emailHtml,
          });

          console.log(
            `[AlertScheduler] Email sent to reporter (${task.reporter.email})`
          );
        } catch (emailError) {
          console.error(
            `[AlertScheduler] Failed to send email to reporter:`,
            emailError.message
          );
        }

        // Send push notification to reporter
        try {
          await PushNotificationService.sendToUser(task.reporter.id, {
            title: "Task Alert",
            body: `Reminder: ${task.title}`,
            icon: "/icons/notification-icon.png",
            badge: "/icons/notification-badge.png",
            data: {
              taskId: task.id,
              alertId: alert.id,
              action: "taskAlert",
              alertTime: alertTime,
            },
          });

          console.log(
            `[AlertScheduler] Push notification sent to reporter (ID: ${task.reporter.id})`
          );
        } catch (pushError) {
          console.error(
            `[AlertScheduler] Failed to send push to reporter:`,
            pushError.message
          );
        }
      }

      console.log(
        `[AlertScheduler] Alert ${alert.id} processed successfully\n`
      );
    } catch (error) {
      console.error(`[AlertScheduler] Error processing alert:`, error);
    }
  }

  /**
   * Stop the scheduler
   */
  static stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log("[AlertScheduler] Stopped");
    }
  }
}

export default AlertSchedulerService;
