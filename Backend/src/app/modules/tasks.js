import { PrismaClient } from "@prisma/client";
import ApiError from "../../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { FileManager } from "../../helpers/FilleManager.js";
import emailService from "../services/emailService.js";
import PushNotificationService from "../services/pushNotificationService.js";
import {
  taskAssignmentTemplate,
  taskReassignmentTemplate,
  taskUpdateTemplate,
  taskCompletionTemplate,
} from "../../templates/emailTemplates.js";

const prisma = new PrismaClient();

// ==================== TASK FUNCTIONS ====================

// Create a new task with alerts
async function createTask(req, res, next) {
  try {
    const {
      title,
      description,
      assigned_to,
      start_date,
      end_date,
      status,
      taskAlerts = [],
    } = req.body;

    // Get reporter_id from authenticated user
    const reporter_id = req.user?.id;

    // Validation
    if (!title || title.trim() === "") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Task title is required");
    }
    if (!reporter_id) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "User must be authenticated to create tasks"
      );
    }
    if (!start_date || !end_date) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Start date and end date are required"
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (startDate >= endDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Start date must be before end date"
      );
    }

    // Check if reporter exists
    const reporter = await prisma.user.findUnique({
      where: { id: parseInt(reporter_id) },
    });
    if (!reporter) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Reporter not found");
    }

    // Check if assignee exists (if provided)
    if (assigned_to) {
      const assignee = await prisma.user.findUnique({
        where: { id: parseInt(assigned_to) },
      });
      if (!assignee) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Assignee not found");
      }
    }

    // Validate alerts
    if (Array.isArray(taskAlerts)) {
      for (const alert of taskAlerts) {
        if (!alert.alert_date) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Alert date is required for all alerts"
          );
        }
        const alertDate = new Date(alert.alert_date);
        if (alertDate < startDate) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Alert date must be equal to or after task start date (${start_date})`
          );
        }
      }
    }

    // Create task with alerts
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description,
        assigned_to: assigned_to ? parseInt(assigned_to) : null,
        reporter_id: parseInt(reporter_id),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        status: status || "pending",
        taskAlerts: {
          create: taskAlerts.map((alert) => ({
            alert_date: new Date(alert.alert_date),
          })),
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reporter: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
        taskAlerts: true,
        comments: true,
        attachments: true,
      },
    });

    // Send email notification to assignee
    if (
      task.assignee &&
      task.assignee.email &&
      req.user?.id !== task.assigned_to
    ) {
      try {
        const assigneeName =
          `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
          task.assignee.username;
        const reporterName =
          `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
          task.reporter.username;

        const emailHtml = taskAssignmentTemplate(
          assigneeName,
          reporterName,
          task
        );

        await emailService.sendEmail({
          to: task.assignee.email,
          subject: `New Task Assigned: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        // Log email error but don't fail the task creation
        console.error("Failed to send task assignment email:", emailError);
      }
    }

    // Send push notification to assignee
    if (task.assignee && req.user?.id !== task.assigned_to) {
      try {
        await PushNotificationService.notifyTaskCreated(task);
      } catch (pushError) {
        // Log push error but don't fail the task creation
        console.error("Failed to send push notification:", pushError);
      }
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

// Get task statistics
async function getTaskStats(req, res, next) {
  try {
    const [totalTasks, activeTasks, completedTasks, overdueTasks] =
      await Promise.all([
        prisma.task.count(),
        prisma.task.count({ where: { status: "active" } }),
        prisma.task.count({ where: { status: "completed" } }),
        prisma.task.count({
          where: {
            status: { not: "completed" },
            end_date: { lt: new Date() },
          },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalTasks,
        totalTasksChange: 0,
        activeTasks,
        activeTasksChange: 0,
        completedTasks,
        completedTasksChange: 0,
        overdueTasks,
        overdueTasksChange: 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get all tasks with pagination and filtering
async function getTasks(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      assigned_to,
      reporter_id,
      sortBy = "created_at",
      sortOrder = "desc",
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let where = {};
    const isManager =
      req?.user?.role?.toLowerCase() === "manager" ||
      req?.user?.role?.toLowerCase() === "employee";

    // Manager role filter - can only see tasks they created or are assigned to
    if (isManager) {
      where.OR = [{ reporter_id: req.user.id }, { assigned_to: req.user.id }];
    }

    // Search filter
    if (search) {
      const searchCondition = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];

      if (where.OR) {
        // Manager filter exists, combine search with manager filter using AND
        where = {
          AND: [{ OR: where.OR }, { OR: searchCondition }],
        };
      } else {
        where.OR = searchCondition;
      }
    }

    // Status filter
    if (
      status &&
      ["pending", "active", "on_hold", "completed", "cancelled"].includes(
        status
      )
    ) {
      where.status = status;
    }

    // Assigned to filter (skip for managers to prevent bypass)
    if (assigned_to && !isManager) {
      where.assigned_to = parseInt(assigned_to);
    }

    // Reporter filter (skip for managers to prevent bypass)
    if (reporter_id && !isManager) {
      where.reporter_id = parseInt(reporter_id);
    }

    // Build orderBy dynamically
    const validSortFields = [
      "title",
      "status",
      "start_date",
      "end_date",
      "created_at",
      "updated_at",
    ];
    const finalSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const finalSortOrder = ["asc", "desc"].includes(sortOrder?.toLowerCase())
      ? sortOrder.toLowerCase()
      : "desc";

    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          assignee: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              email: true,
            },
          },
          reporter: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              email: true,
            },
          },
          taskAlerts: true,
          comments: { select: { id: true } },
          attachments: { select: { id: true } },
        },
        orderBy: { [finalSortBy]: finalSortOrder },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + parseInt(limit) < totalCount,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Get single task by ID
async function getTaskById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Task ID is required");
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            email: true,
          },
        },
        reporter: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            email: true,
          },
        },
        taskAlerts: {
          orderBy: { alert_date: "asc" },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          orderBy: { created_at: "asc" },
        },
        attachments: {
          include: {
            uploader: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

// Update task with alerts
async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      assigned_to,
      start_date,
      end_date,
      status,
      taskAlerts = [],
    } = req.body;

    // Get current task with full details
    const currentTask = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: {
        taskAlerts: true,
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reporter: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
      },
    });

    if (!currentTask) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
    }

    // Validate new dates
    if (start_date || end_date) {
      const newStartDate = start_date
        ? new Date(start_date)
        : currentTask.start_date;
      const newEndDate = end_date ? new Date(end_date) : currentTask.end_date;

      if (newStartDate >= newEndDate) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Start date must be before end date"
        );
      }
    }

    // Track what changed
    const changes = {};
    if (title !== undefined && title !== currentTask.title)
      changes.title = { old: currentTask.title, new: title };
    if (description !== undefined && description !== currentTask.description)
      changes.description = { old: currentTask.description, new: description };
    if (assigned_to !== undefined && assigned_to !== currentTask.assigned_to)
      changes.assigned_to = { old: currentTask.assigned_to, new: assigned_to };
    if (
      start_date !== undefined &&
      new Date(start_date).getTime() !== currentTask.start_date.getTime()
    )
      changes.start_date = { old: currentTask.start_date, new: start_date };
    if (
      end_date !== undefined &&
      new Date(end_date).getTime() !== currentTask.end_date.getTime()
    )
      changes.end_date = { old: currentTask.end_date, new: end_date };
    if (status !== undefined && status !== currentTask.status)
      changes.status = { old: currentTask.status, new: status };

    // Check if assignee exists (if provided)
    let newAssignee = null;
    if (assigned_to) {
      newAssignee = await prisma.user.findUnique({
        where: { id: parseInt(assigned_to) },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
      if (!newAssignee) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Assignee not found");
      }
    }

    // Validate alerts
    const finalStartDate = start_date
      ? new Date(start_date)
      : currentTask.start_date;
    if (Array.isArray(taskAlerts)) {
      for (const alert of taskAlerts) {
        if (!alert.alert_date) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Alert date is required for all alerts"
          );
        }
        const alertDate = new Date(alert.alert_date);
        if (alertDate < finalStartDate) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Alert date must be equal to or after task start date`
          );
        }
      }
    }

    const isStatusCompletedUpdate =
      changes.status && changes.status.new === "completed";
    const isAssigneeTryingToUpdateThatHeDidntAssign =
      req.user?.id === currentTask.assigned_to &&
      req.user?.id !== currentTask.reporter_id;

    // Check if alerts were modified (compare count and dates)
    const alertsModified =
      taskAlerts.length !== currentTask.taskAlerts.length ||
      (taskAlerts.length > 0 &&
        JSON.stringify(
          taskAlerts
            .map((a) => new Date(a.alert_date).getTime())
            .sort((a, b) => a - b)
        ) !==
          JSON.stringify(
            currentTask.taskAlerts
              .map((a) => new Date(a.alert_date).getTime())
              .sort((a, b) => a - b)
          ));

    // if assignee trys to update more than status to completed, block it, but allow if he assigned that task to himself
    if (
      !req.user.is_super_user &&
      ((isStatusCompletedUpdate &&
        isAssigneeTryingToUpdateThatHeDidntAssign &&
        (Object.keys(changes).length > 1 || alertsModified)) ||
        (!isStatusCompletedUpdate &&
          isAssigneeTryingToUpdateThatHeDidntAssign &&
          (Object.keys(changes).length > 0 || alertsModified)))
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You can only update status: completed!"
      );
    }

    // Update only provided fields
    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (assigned_to !== undefined)
      data.assigned_to = assigned_to ? parseInt(assigned_to) : null;
    if (start_date !== undefined) data.start_date = new Date(start_date);
    if (end_date !== undefined) data.end_date = new Date(end_date);
    if (status !== undefined) data.status = status;

    const task = await prisma.task.update({
      where: { id: parseInt(id) },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reporter: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        taskAlerts: true,
        comments: true,
        attachments: true,
      },
    });

    // Update alerts if provided
    if (Array.isArray(taskAlerts)) {
      // Delete existing alerts
      await prisma.taskAlert.deleteMany({
        where: { task_id: parseInt(id) },
      });

      // Create new alerts
      if (taskAlerts.length > 0) {
        await prisma.taskAlert.createMany({
          data: taskAlerts.map((alert) => ({
            task_id: parseInt(id),
            alert_date: new Date(alert.alert_date),
          })),
        });

        // Fetch updated alerts
        task.taskAlerts = await prisma.taskAlert.findMany({
          where: { task_id: parseInt(id) },
          orderBy: { alert_date: "asc" },
        });
      } else {
        task.taskAlerts = [];
      }
    }

    // Send email notifications
    // 1. If assigned_to changed, send new assignment email to new assignee
    if (changes.assigned_to && newAssignee && newAssignee.email) {
      try {
        const assigneeName =
          `${newAssignee.firstName} ${newAssignee.lastName}`.trim() ||
          newAssignee.username;
        const reporterName =
          `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
          task.reporter.username;

        const emailHtml = taskReassignmentTemplate(
          assigneeName,
          reporterName,
          task
        );

        await emailService.sendEmail({
          to: newAssignee.email,
          subject: `Task Reassigned to You: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send task reassignment email:", emailError);
      }
      try {
        // Reassignment notification
        await PushNotificationService.notifyTaskUpdated(task, "reassigned");
      } catch (pushError) {
        console.error(
          "Failed to send reassignment push notification:",
          pushError
        );
      }

      // Send notification to previous assignee about unassignment
      if (currentTask.assignee && currentTask.assignee.email) {
        try {
          const previousAssigneeName =
            `${currentTask.assignee.firstName} ${currentTask.assignee.lastName}`.trim() ||
            currentTask.assignee.username;

          await emailService.sendEmail({
            to: currentTask.assignee.email,
            subject: `Task Unassigned: ${task.title}`,
            html: `
              <p>Hi ${previousAssigneeName},</p>
              <p>You have been unassigned from the task <strong>"${task.title}"</strong>.</p>
              <p>It has been reassigned to <strong>${newAssignee.firstName} ${newAssignee.lastName}</strong>.</p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send unassignment email:", emailError);
        }

        try {
          await PushNotificationService.sendToUser(currentTask.assignee.id, {
            title: "Task Unassigned",
            body: `You have been unassigned from "${task.title}"`,
            icon: "/icons/notification-icon.png",
            badge: "/icons/notification-badge.png",
            data: {
              type: "task_unassigned",
              taskId: task.id,
              action: `/dashboard/tasks/${task.id}`,
            },
          });
        } catch (pushError) {
          console.error(
            "Failed to send unassignment push notification:",
            pushError
          );
        }
      }
    } else if (
      Object.keys(changes).length > 0 &&
      task.assignee &&
      task.assignee.email &&
      req.user?.id !== task.assigned_to
    ) {
      try {
        const assigneeName =
          `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
          task.assignee.username;

        // Build change details HTML
        let changesHtml = "";
        Object.keys(changes).forEach((field) => {
          const change = changes[field];
          let oldValue = change.old;
          let newValue = change.new;

          // Format dates nicely
          if (field.includes("date")) {
            oldValue = new Date(oldValue).toLocaleDateString();
            newValue = new Date(newValue).toLocaleDateString();
          }

          // Format field name
          const fieldLabel = field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          changesHtml += `
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333; width: 120px;">${fieldLabel}:</td>
              <td style="padding: 12px 0; color: #666;">
                <span style="text-decoration: line-through; color: #999;">${oldValue}</span>
                <span style="margin: 0 10px; color: #999;">→</span>
                <span style="color: #6157ff; font-weight: bold;">${newValue}</span>
              </td>
            </tr>
          `;
        });

        const emailHtml = taskUpdateTemplate(assigneeName, task, changesHtml);

        await emailService.sendEmail({
          to: task.assignee.email,
          subject: `Task Updated: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send task update email:", emailError);
      }
      try {
        // Regular update notification
        await PushNotificationService.notifyTaskUpdated(task, "updated");
      } catch (pushError) {
        console.error("Failed to send update push notification:", pushError);
      }
    }

    // 3. Send notification to reporter if task is marked as completed by assignee
    if (
      isStatusCompletedUpdate &&
      isAssigneeTryingToUpdateThatHeDidntAssign &&
      task.reporter &&
      task.reporter.email
    ) {
      try {
        const assigneeName =
          `${task.assignee?.firstName} ${task.assignee?.lastName}`.trim() ||
          task.assignee?.username ||
          "Someone";
        const reporterName =
          `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
          task.reporter.username;

        const emailHtml = taskCompletionTemplate(
          assigneeName,
          reporterName,
          task
        );

        await emailService.sendEmail({
          to: task.reporter.email,
          subject: `Task Completed: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "Failed to send task completion email to reporter:",
          emailError
        );
      }

      // Send push notification to reporter
      try {
        await PushNotificationService.sendToUser(task.reporter_id, {
          title: "Task Completed",
          body: `${
            task.assignee?.firstName || "Someone"
          } has completed the task "${task.title}"`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            type: "task_completed",
            taskId: task.id,
            action: `/dashboard/tasks/${task.id}`,
          },
        });
      } catch (pushError) {
        console.error(
          "Failed to send task completion push notification:",
          pushError
        );
      }
    }

    res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

// Delete task
async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
    }

    if (!req.user.is_super_user && req.user.id !== task.reporter_id) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Not authorized to delete this task"
      );
    }

    // Delete task (alerts will cascade delete)
    await prisma.task.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Bulk delete tasks
async function bulkDeleteTasks(req, res, next) {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Task IDs array is required");
    }

    const deletedCount = await prisma.task.deleteMany({
      where: { id: { in: ids.map((id) => parseInt(id)) } },
    });

    res.json({
      success: true,
      message: `${deletedCount.count} task(s) deleted successfully`,
      data: { deletedCount: deletedCount.count },
    });
  } catch (error) {
    next(error);
  }
}

// Get task alerts
async function getTaskAlerts(req, res, next) {
  try {
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
    }

    const alerts = await prisma.taskAlert.findMany({
      where: { task_id: parseInt(taskId) },
      orderBy: { alert_date: "asc" },
    });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
}

// Add alert to task
async function addTaskAlert(req, res, next) {
  try {
    const { taskId } = req.params;
    const { alert_date } = req.body;

    if (!alert_date) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Alert date is required");
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
    }

    if (!req.user.is_super_user && req.user.id !== task.reporter_id) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Not authorized to add alert to this task"
      );
    }

    const alertDate = new Date(alert_date);
    if (alertDate < task.start_date) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Alert date must be equal to or after task start date (${
          task.start_date.toISOString().split("T")[0]
        })`
      );
    }

    const alert = await prisma.taskAlert.create({
      data: {
        task_id: parseInt(taskId),
        alert_date: alertDate,
      },
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Alert added successfully",
      data: alert,
    });
  } catch (error) {
    next(error);
  }
}

// Delete task alert
async function deleteTaskAlert(req, res, next) {
  try {
    const { alertId } = req.params;
    console.log(alertId);

    const alert = await prisma.taskAlert.findUnique({
      where: { id: parseInt(alertId) },
    });

    if (!alert) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Alert not found");
    }
    const task = await prisma.task.findUnique({
      where: { id: alert.task_id },
    });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
    }
    if (!req.user.is_super_user && req.user.id !== task.reporter_id) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Not authorized to delete alert from this task"
      );
    }

    await prisma.taskAlert.delete({
      where: { id: parseInt(alertId) },
    });

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Add comment to task
async function addTaskComment(req, res, next) {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "User must be authenticated to comment"
      );
    }

    if (!content || content.trim() === "") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Comment text is required");
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
    }

    const comment = await prisma.taskComment.create({
      data: {
        task_id: parseInt(taskId),
        user_id: parseInt(user_id),
        content: content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    next(error);
  }
}

// Delete task comment
async function deleteTaskComment(req, res, next) {
  try {
    const { commentId } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "User must be authenticated"
      );
    }

    const comment = await prisma.taskComment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!comment) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Comment not found");
    }

    // Check if user is the comment owner or admin
    if (comment.user_id !== parseInt(user_id)) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You can only delete your own comments"
      );
    }

    await prisma.taskComment.delete({
      where: { id: parseInt(commentId) },
    });

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// Attach file to task
async function attachAttachmentToTask(req, res, next) {
  try {
    const { taskId } = req.params;
    const { file_url, file_name, file_size, file_type } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "User must be authenticated to attach files"
      );
    }

    if (!file_url || !file_name) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "File URL and file name are required"
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Task not found");
    }

    // Move file from temp to permanent storage
    const movedFile = await FileManager.normal({
      url: file_url,
    });

    // Extract filename from path
    const filenameParts = file_name.split(".");
    const extension = filenameParts[filenameParts.length - 1];
    const generatedFilename = `${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}.${extension}`;

    // Create task file record
    const attachment = await prisma.taskFile.create({
      data: {
        task_id: parseInt(taskId),
        filename: generatedFilename,
        original_name: file_name,
        file_path: movedFile.url,
        file_size: file_size || 0,
        uploaded_by: parseInt(user_id),
      },
      include: {
        uploader: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "File attached to task successfully",
      data: attachment,
    });
  } catch (error) {
    next(error);
  }
}

export {
  createTask,
  getTasks,
  getTaskById,
  getTaskStats,
  updateTask,
  deleteTask,
  bulkDeleteTasks,
  getTaskAlerts,
  addTaskAlert,
  deleteTaskAlert,
  addTaskComment,
  deleteTaskComment,
  attachAttachmentToTask,
};
