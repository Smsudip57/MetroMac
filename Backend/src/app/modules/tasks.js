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
  taskReporterSupervisionTemplate,
  taskReporterUnassignmentTemplate,
  taskHoldTemplate,
  taskArchiveTemplate,
  taskCommentTemplate,
  taskSubmittedForReviewTemplate,
  taskApprovedTemplate,
  taskInProgressTemplate,
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
      reporter_id,
      start_date,
      end_date,
      status,
      taskAlerts = [],
      alertFrequency,
    } = req.body;

    // Get created_by from authenticated user
    const created_by = req.user?.id;

    // Validation
    if (!title || title.trim() === "") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Task title is required");
    }
    if (!reporter_id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Reporter ID is required");
    }

    if (!start_date || !end_date) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Start date and end date are required",
      );
    }

    // Validate dates
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    if (startDate > endDate) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Start date must be before or equal to end date",
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
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
          role: { select: { id: true, name: true } },
        },
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
            "Alert date is required for all alerts",
          );
        }
        const alertDate = new Date(alert.alert_date);
        if (alertDate < startDate) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Alert date must be equal to or after task start date (${start_date})`,
          );
        }
      }

      // Validate alert frequency
      if (alertFrequency !== undefined) {
        const frequency = parseInt(alertFrequency);
        const currentAlertsCount = taskAlerts.length;

        // If taskAlerts is empty, generate all alerts from start_date to end_date
        if (currentAlertsCount === 0) {
          const startDateObj = new Date(start_date);
          const endDateObj = new Date(end_date);
          const timeDifference = endDateObj.getTime() - startDateObj.getTime();

          // Calculate interval for each alert
          const interval = timeDifference / (frequency + 1);

          // Generate all alerts
          for (let i = 1; i <= frequency; i++) {
            const alertTime = startDateObj.getTime() + interval * i;
            const alertDate = new Date(alertTime);
            taskAlerts.push({
              alert_date: alertDate.toISOString(),
            });
          }
        } else if (frequency > currentAlertsCount) {
          // If frequency > current alerts, generate missing alerts
          const requiredAlerts = frequency - currentAlertsCount;

          // Find the furthest/most future alert date
          const furthestAlert = taskAlerts.reduce((max, current) => {
            const currentDate = new Date(current.alert_date);
            const maxDate = new Date(max.alert_date);
            return currentDate > maxDate ? current : max;
          });

          const furthestAlertDate = new Date(furthestAlert.alert_date);
          const endDateObj = new Date(end_date);

          // Calculate the time difference in milliseconds
          const timeDifference =
            endDateObj.getTime() - furthestAlertDate.getTime();

          // Calculate interval for each required alert
          const interval = timeDifference / (requiredAlerts + 1);

          // Generate required alerts
          for (let i = 1; i <= requiredAlerts; i++) {
            const newAlertTime = furthestAlertDate.getTime() + interval * i;
            const newAlertDate = new Date(newAlertTime);
            taskAlerts.push({
              alert_date: newAlertDate.toISOString(),
            });
          }

          // Sort alerts by date
          taskAlerts.sort(
            (a, b) =>
              new Date(a.alert_date).getTime() -
              new Date(b.alert_date).getTime(),
          );
        }
      }
    }

    // Create task with alerts
    const taskData = {
      title: title.trim(),
      description,
      assigned_to: assigned_to ? parseInt(assigned_to) : null,
      reporter_id: parseInt(reporter_id),
      created_by: parseInt(created_by),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      status: status || "pending",
    };

    // Set submission_date if status is submitted
    if (status === "submitted") {
      taskData.submission_date = new Date();
    }

    // If task is created with completed status, set both submission_date and completion_date to now
    // This handles the case where the creator/issuer directly marks task as completed
    if (status === "completed") {
      const now = new Date();
      taskData.submission_date = now;
      taskData.completion_date = now;
    }

    const task = await prisma.task.create({
      data: {
        ...taskData,
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
      created_by !== task.assigned_to
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
          task,
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
    if (task.assignee && created_by !== task.assigned_to) {
      try {
        await PushNotificationService.notifyTaskCreated(task);
      } catch (pushError) {
        // Log push error but don't fail the task creation
        console.error("Failed to send push notification:", pushError);
      }
    }

    // Send email and push notification to reporter if they're different from creator
    if (created_by !== reporter_id && task.reporter && task.reporter.email) {
      try {
        const reporterName =
          `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
          task.reporter.username;
        const assigneeName = task.assignee
          ? `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
          task.assignee.username
          : "Unassigned";

        const emailHtml = taskReporterSupervisionTemplate(
          reporterName,
          assigneeName,
          task,
        );

        await emailService.sendEmail({
          to: task.reporter.email,
          subject: `Supervision Task: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send reporter supervision email:", emailError);
      }

      // Send push notification to reporter
      try {
        await PushNotificationService.sendToUser(task.reporter_id, {
          title: "New Supervision Task",
          body: `You have been assigned to supervise task "${task.title}"`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            type: "task_supervision",
            taskId: task.id,
          },
        });
      } catch (pushError) {
        console.error(
          "Failed to send reporter supervision push notification:",
          pushError,
        );
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
    const isManager =
      req?.user?.role?.toLowerCase() === "manager" ||
      req?.user?.role?.toLowerCase() === "employee";

    // Base where clause
    const baseWhere = { is_archived: false };

    // Manager role filter - can only see tasks they're reporting or assigned to
    if (isManager) {
      baseWhere.OR = [
        { reporter_id: req.user.id },
        { assigned_to: req.user.id },
        { created_by: req.user.id },
      ];
    }

    const [totalTasks, acknowledgedTasks, completedTasks, overdueTasks] =
      await Promise.all([
        prisma.task.count({ where: baseWhere }),
        prisma.task.count({
          where: {
            ...baseWhere,
            status: { in: ["acknowledged"] },
          },
        }),
        prisma.task.count({
          where: { ...baseWhere, status: "completed" },
        }),
        prisma.task.count({
          where: {
            ...baseWhere,
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
        acknowledgedTasks,
        acknowledgedTasksChange: 0,
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

// ==================== STANDALONE FILTER BUILDER ====================
// Build task filters based on query parameters and user role
// Used by both getTasks endpoint and exportData function
function buildTaskFilters(filters, userId, userRole, userIsSuperUser) {
  let where = { is_archived: false };
  const isManager =
    userRole?.toLowerCase() === "manager" ||
    userRole?.toLowerCase() === "employee";

  // Super users can view archived tasks if requested
  if (filters.showArchived === "true") {
    where.is_archived = true;
  }

  // Manager role filter - can only see tasks they created or are assigned to
  if (isManager && !userIsSuperUser) {
    where.OR = [
      { reporter_id: userId },
      { assigned_to: userId },
      { created_by: userId },
    ];
  }

  // Search filter
  if (filters.search) {
    const searchCondition = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
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
    filters.status &&
    [
      "pending",
      "submitted",
      "acknowledged",
      "on_hold",
      "rework",
      "completed",
      "cancelled",
    ].includes(filters.status)
  ) {
    where.status = filters.status;
  }

  // Assigned to filter
  if (filters.assigned_to) {
    where.assigned_to = parseInt(filters.assigned_to);
  }

  // Assigned by filter (created_by)
  if (filters.assigned_by) {
    where.created_by = parseInt(filters.assigned_by);
  }

  // Reporter filter
  if (filters.reporter_id) {
    where.reporter_id = parseInt(filters.reporter_id);
  }

  // Date range filter (fromDate and toDate)
  if (filters.fromDate || filters.toDate) {
    const andConditions = [];

    if (filters.fromDate) {
      const [year, month, day] = filters.fromDate.split("-");
      const fromDateObj = new Date(
        Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          0,
          0,
          0,
          0,
        ),
      );
      andConditions.push({ start_date: { gte: fromDateObj } });
    }

    if (filters.toDate) {
      const [year, month, day] = filters.toDate.split("-");
      const toDateObj = new Date(
        Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          23,
          59,
          59,
          999,
        ),
      );
      andConditions.push({ end_date: { lte: toDateObj } });
    }

    if (andConditions.length > 0) {
      const currentConditions = [];

      if (where.AND) {
        where.AND.push(...andConditions);
      } else if (where.OR) {
        currentConditions.push({ OR: where.OR });

        if (where.status !== undefined) {
          currentConditions.push({ status: where.status });
          delete where.status;
        }
        if (where.assigned_to !== undefined) {
          currentConditions.push({ assigned_to: where.assigned_to });
          delete where.assigned_to;
        }
        if (where.reporter_id !== undefined) {
          currentConditions.push({ reporter_id: where.reporter_id });
          delete where.reporter_id;
        }

        currentConditions.push(...andConditions);

        where = {
          AND: currentConditions,
        };
      } else {
        currentConditions.push(...andConditions);

        if (where.status !== undefined) {
          currentConditions.push({ status: where.status });
        }
        if (where.assigned_to !== undefined) {
          currentConditions.push({ assigned_to: where.assigned_to });
        }
        if (where.reporter_id !== undefined) {
          currentConditions.push({ reporter_id: where.reporter_id });
        }
        if (where.is_archived !== undefined) {
          currentConditions.push({ is_archived: where.is_archived });
        }

        where = {
          AND: currentConditions,
        };
      }
    }
  }

  return where;
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
      assigned_by,
      reporter_id,
      fromDate,
      toDate,
      sortBy = "created_at",
      sortOrder = "desc",
      showArchived = false,
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Use buildTaskFilters to get consistent filtering logic
    const where = buildTaskFilters(
      { search, status, assigned_to, assigned_by, reporter_id, fromDate, toDate, showArchived },
      req.user.id,
      req.user?.role,
      req.user?.is_super_user,
    );

    // Build orderBy dynamically
    const validSortFields = [
      "title",
      "description",
      "status",
      "start_date",
      "end_date",
      "submission_date",
      "completion_date",
      "created_at",
      "updated_at",
      "assigned_to",
      "assigned_by",
    ];
    const finalSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const finalSortOrder = ["asc", "desc"].includes(sortOrder?.toLowerCase())
      ? sortOrder.toLowerCase()
      : "desc";

    // Map assigned_by to created_by for sorting
    const sortField = finalSortBy === "assigned_by" ? "created_by" : finalSortBy;

    let orderBy = {};

    // For user-based sorting (assigned_to, assigned_by/created_by), sort by firstName
    if (finalSortBy === "assigned_to" || finalSortBy === "assigned_by") {
      const userRelation = finalSortBy === "assigned_to" ? "assignee" : "creator";
      orderBy = [
        { [userRelation]: { firstName: finalSortOrder } },
        { created_at: "desc" }, // Secondary sort by created_at
      ];
    }
    // For description, sort by first character (same as assigned_to/assigned_by pattern)
    // Handle NULL values by using _relevance (Prisma's way) - push empty descriptions to end
    else if (finalSortBy === "description") {
      orderBy = [
        { description: finalSortOrder },
        { created_at: "desc" }, // Secondary sort by created_at
      ];
      // Note: When description is NULL, PostgreSQL sorts them based on direction:
      // ASC: NULL values go first (we'll handle this in post-processing)
      // DESC: NULL values go last (which is what we want)
    }
    // For submission_date and completion_date, handle NULL values properly
    else if (
      sortField === "submission_date" ||
      sortField === "completion_date"
    ) {
      // PostgreSQL: NULL values go last by default in ASC, first in DESC
      // We want NULL values to always go last for better UX
      orderBy = [
        { [sortField]: { sort: finalSortOrder, nulls: "last" } },
        { created_at: "desc" }, // Secondary sort by created_at
      ];
    } else {
      orderBy = { [sortField]: finalSortOrder };
    }

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
          creator: {
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
        orderBy,
      }),
      prisma.task.count({ where }),
    ]);

    // Post-process sorting for description field to handle NULLs properly
    // When sorting description ASC, Postgres puts NULLs first, but we want them last
    if (finalSortBy === "description" && finalSortOrder === "asc") {
      const tasksWithDesc = tasks.filter(t => t.description !== null);
      const tasksWithoutDesc = tasks.filter(t => t.description === null);
      tasks = [...tasksWithDesc, ...tasksWithoutDesc];
    }

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
      reporter_id,
      start_date,
      end_date,
      status,
      hold_reason,
      taskAlerts = [],
      alertFrequency,
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
        creator: {
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

      if (newStartDate > newEndDate) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Start date must be before or equal to end date",
        );
      }
    }

    // Track what changed
    const changes = {};
    if (title !== undefined && title !== currentTask.title)
      changes.title = { old: currentTask.title, new: title };
    if (description !== undefined && description !== currentTask.description)
      changes.description = { old: currentTask.description, new: description };
    if (reporter_id !== undefined && reporter_id !== currentTask.reporter_id)
      changes.reporter_id = { old: currentTask.reporter_id, new: reporter_id };
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

    // Check if reporter exists (if provided)
    let newReporter = null;
    if (reporter_id) {
      newReporter = await prisma.user.findUnique({
        where: { id: parseInt(reporter_id) },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
      if (!newReporter) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Reporter not found");
      }
    }

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
          role: { select: { id: true, name: true } },
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
            "Alert date is required for all alerts",
          );
        }
        const alertDate = new Date(alert.alert_date);
        if (alertDate < finalStartDate) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Alert date must be equal to or after task start date`,
          );
        }
      }

      // Validate alert frequency
      if (alertFrequency !== undefined) {
        const frequency = parseInt(alertFrequency);
        const currentAlertsCount = taskAlerts.length;

        // If taskAlerts is empty, generate all alerts from start_date to end_date
        if (currentAlertsCount === 0) {
          const endDateObj = end_date
            ? new Date(end_date)
            : currentTask.end_date;
          const timeDifference =
            endDateObj.getTime() - finalStartDate.getTime();

          // Calculate interval for each alert
          const interval = timeDifference / (frequency + 1);

          // Generate all alerts
          for (let i = 1; i <= frequency; i++) {
            const alertTime = finalStartDate.getTime() + interval * i;
            const alertDate = new Date(alertTime);
            taskAlerts.push({
              alert_date: alertDate.toISOString(),
            });
          }
        } else if (frequency > currentAlertsCount) {
          // If frequency > current alerts, generate missing alerts
          const requiredAlerts = frequency - currentAlertsCount;

          // Find the furthest/most future alert date
          const furthestAlert = taskAlerts.reduce((max, current) => {
            const currentDate = new Date(current.alert_date);
            const maxDate = new Date(max.alert_date);
            return currentDate > maxDate ? current : max;
          });

          const furthestAlertDate = new Date(furthestAlert.alert_date);
          const endDateObj = end_date
            ? new Date(end_date)
            : currentTask.end_date;

          // Calculate the time difference in milliseconds
          const timeDifference =
            endDateObj.getTime() - furthestAlertDate.getTime();

          // Calculate interval for each required alert
          const interval = timeDifference / (requiredAlerts + 1);

          // Generate required alerts
          for (let i = 1; i <= requiredAlerts; i++) {
            const newAlertTime = furthestAlertDate.getTime() + interval * i;
            const newAlertDate = new Date(newAlertTime);
            taskAlerts.push({
              alert_date: newAlertDate.toISOString(),
            });
          }

          // Sort alerts by date
          taskAlerts.sort(
            (a, b) =>
              new Date(a.alert_date).getTime() -
              new Date(b.alert_date).getTime(),
          );
        }
      }
    }

    const isStatusCompletedUpdate =
      changes.status && changes.status.new === "completed";
    const isStatusAcknowledgedUpdate =
      changes.status && changes.status.new === "acknowledged";
    const isStatusSubmittedUpdate =
      changes.status && changes.status.new === "submitted";
    const isStatusSubmittedorAcknowledged =
      isStatusSubmittedUpdate || isStatusAcknowledgedUpdate;
    const isTryingToUpdateStatus =
      changes.status && changes.status.new !== currentTask.status;
    const isAssigneeTryingToUpdateThatHeDidntCreate =
      req.user?.id === currentTask.assigned_to &&
      req.user?.id !== currentTask.created_by;

    // Check if alerts were modified (compare count and dates)
    const alertsModified =
      taskAlerts.length !== currentTask.taskAlerts.length ||
      (taskAlerts.length > 0 &&
        JSON.stringify(
          taskAlerts
            .map((a) => new Date(a.alert_date).getTime())
            .sort((a, b) => a - b),
        ) !==
        JSON.stringify(
          currentTask.taskAlerts
            .map((a) => new Date(a.alert_date).getTime())
            .sort((a, b) => a - b),
        ));

    // if assignee trys to update more than status and he didn't create that task, block it, but allow if he assigned that task to himself
    if (
      !req.user.is_super_user &&
      ((isTryingToUpdateStatus &&
        isAssigneeTryingToUpdateThatHeDidntCreate &&
        (Object.keys(changes).length > 1 || alertsModified || !isStatusSubmittedorAcknowledged)) ||
        (!isTryingToUpdateStatus &&
          isAssigneeTryingToUpdateThatHeDidntCreate &&
          (Object.keys(changes).length > 0 || alertsModified)))
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "You can only update status to acknowledged or submitted!",
      );
    }

    // Check archive permission - only reporter, creator, or super_user can archive
    let isArchiving = false;
    if (req.body.is_archived !== undefined && req.body.is_archived === true) {
      const canArchive =
        req?.user?.is_super_user || req.user?.role?.toLowerCase() === "manager";

      if (!canArchive) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Only the reporter, task creator, or super user can archive tasks",
        );
      }
      isArchiving = true;
    }

    // Update only provided fields
    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description;
    if (reporter_id !== undefined) data.reporter_id = parseInt(reporter_id);
    if (assigned_to !== undefined)
      data.assigned_to = assigned_to ? parseInt(assigned_to) : null;
    if (start_date !== undefined) data.start_date = new Date(start_date);
    if (end_date !== undefined) data.end_date = new Date(end_date);
    if (status !== undefined) {
      data.status = status;
      // Set submission_date when status changes to submitted
      if (status === "submitted" && currentTask.status !== "submitted") {
        data.submission_date = new Date();
        data.completion_date = null;
      }
      // Set completion_date when status changes to completed
      if (status === "completed" && currentTask.status !== "completed") {
        data.submission_date = new Date();
        data.completion_date = new Date();
      }
      // If status is on_hold, capture hold details
      if (status === "on_hold") {
        if (!hold_reason) {
          throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Hold reason is required when status is set to on_hold",
          );
        }
        data.hold_reason = hold_reason;
      } else {
        data.hold_reason = null;
      }
    }

    // Handle archive
    if (isArchiving) {
      data.is_archived = true;
    }

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
          task,
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
        await PushNotificationService.sendToUser(parseInt(assigned_to), {
          title: "Task Reassigned",
          body: `You have been assigned to task "${task.title}"`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            type: "task_reassigned",
            taskId: task.id,
          },
        });
      } catch (pushError) {
        console.error(
          "Failed to send reassignment push notification:",
          pushError,
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
            },
          });
        } catch (pushError) {
          console.error(
            "Failed to send unassignment push notification:",
            pushError,
          );
        }
      }
    } else if (
      Object.keys(changes).length > 0 &&
      task.assignee &&
      task.assignee.email &&
      req.user?.id !== task.assigned_to &&
      !(isStatusCompletedUpdate && !isAssigneeTryingToUpdateThatHeDidntCreate)
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
        await PushNotificationService.sendToUser(task.assigned_to, {
          title: "Task Updated",
          body: `Task "${task.title}" has been updated`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            type: "task_updated",
            taskId: task.id,
          },
        });
      } catch (pushError) {
        console.error("Failed to send update push notification:", pushError);
      }
    }

    // 2. If reporter changed, send notification to both old and new reporter
    if (changes.reporter_id && newReporter && newReporter.email) {
      // Send email to new reporter about supervision assignment
      try {
        const newReporterName =
          `${newReporter.firstName} ${newReporter.lastName}`.trim() ||
          newReporter.username;
        const assigneeName = task.assignee
          ? `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
          task.assignee.username
          : "Unassigned";

        const emailHtml = taskReporterSupervisionTemplate(
          newReporterName,
          assigneeName,
          task,
        );

        await emailService.sendEmail({
          to: newReporter.email,
          subject: `Supervision Task Assigned: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Failed to send new reporter email:", emailError);
      }

      // Send push notification to new reporter
      try {
        await PushNotificationService.sendToUser(parseInt(reporter_id), {
          title: "New Supervision Task",
          body: `You have been assigned to supervise task "${task.title}"`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            type: "task_supervision",
            taskId: task.id,
          },
        });
      } catch (pushError) {
        console.error(
          "Failed to send new reporter push notification:",
          pushError,
        );
      }

      // Send email to old reporter about being unassigned
      if (currentTask.reporter && currentTask.reporter.email) {
        try {
          const oldReporterName =
            `${currentTask.reporter.firstName} ${currentTask.reporter.lastName}`.trim() ||
            currentTask.reporter.username;

          const emailHtml = taskReporterUnassignmentTemplate(
            oldReporterName,
            newReporter.firstName + " " + newReporter.lastName,
            task,
          );

          await emailService.sendEmail({
            to: currentTask.reporter.email,
            subject: `Supervision Task Reassigned: ${task.title}`,
            html: emailHtml,
          });
        } catch (emailError) {
          console.error("Failed to send old reporter email:", emailError);
        }

        // Send push notification to old reporter
        try {
          await PushNotificationService.sendToUser(currentTask.reporter_id, {
            title: "Supervision Task Reassigned",
            body: `You are no longer supervising task "${task.title}"`,
            icon: "/icons/notification-icon.png",
            badge: "/icons/notification-badge.png",
            data: {
              type: "task_supervision_removed",
              taskId: task.id,
            },
          });
        } catch (pushError) {
          console.error(
            "Failed to send old reporter push notification:",
            pushError,
          );
        }
      }
    }

    // 3. Send notification to reporter if assignee submits the task
    if (
      isStatusSubmittedUpdate &&
      isAssigneeTryingToUpdateThatHeDidntCreate &&
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

        const emailHtml = taskSubmittedForReviewTemplate(
          reporterName,
          assigneeName,
          task,
        );

        await emailService.sendEmail({
          to: task.reporter.email,
          subject: `Task Submitted for Review: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "Failed to send task submission email to reporter:",
          emailError,
        );
      }

      // Send push notification to reporter
      try {
        await PushNotificationService.sendToUser(task.reporter_id, {
          title: "Task Submitted for Review",
          body: `${task.assignee?.firstName || "Someone"
            } has submitted the task "${task.title}" for approval`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            type: "task_submitted",
            taskId: task.id,
          },
        });
      } catch (pushError) {
        console.error(
          "Failed to send task submission push notification:",
          pushError,
        );
      }
    }

    // 3a. Send notification to assignee if reporter completes/approves the submitted task
    if (
      isStatusCompletedUpdate &&
      !isAssigneeTryingToUpdateThatHeDidntCreate &&
      task.assignee &&
      task.assignee.email
    ) {
      try {
        const assigneeName =
          `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
          task.assignee.username ||
          "Team Member";
        const reporterName =
          `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
          task.reporter.username;

        const emailHtml = taskApprovedTemplate(
          assigneeName,
          reporterName,
          task,
        );

        await emailService.sendEmail({
          to: task.assignee.email,
          subject: `Task Approved: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "Failed to send task approval email to assignee:",
          emailError,
        );
      }

      // Send push notification to assignee
      try {
        await PushNotificationService.sendToUser(task.assigned_to, {
          title: "Task Approved",
          body: `Your submitted task "${task.title}" has been approved`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            type: "task_approved",
            taskId: task.id,
          },
        });
      } catch (pushError) {
        console.error(
          "Failed to send task approval push notification:",
          pushError,
        );
      }
    }

    // 4. Send notification when task is put on hold (to reporter/supervisor)
    if (
      changes.status &&
      changes.status.new === "on_hold" &&
      task.hold_reason &&
      isAssigneeTryingToUpdateThatHeDidntCreate
    ) {
      // Send email and push to reporter (supervisor) only
      if (task.reporter && task.reporter.email) {
        try {
          const reporterName =
            `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
            task.reporter.username;

          const emailHtml = taskHoldTemplate(reporterName, task);

          await emailService.sendEmail({
            to: task.reporter.email,
            subject: `Task Put on Hold: ${task.title}`,
            html: emailHtml,
          });
        } catch (emailError) {
          console.error(
            "Failed to send hold notification email to reporter:",
            emailError,
          );
        }

        // Send push notification to reporter
        try {
          await PushNotificationService.sendToUser(task.reporter_id, {
            title: "Task Put on Hold",
            body: `Task "${task.title}" has been put on hold. Reason: ${task.hold_reason}`,
            icon: "/icons/notification-icon.png",
            badge: "/icons/notification-badge.png",
            data: {
              type: "task_on_hold",
              taskId: task.id,
            },
          });
        } catch (pushError) {
          console.error(
            "Failed to send hold push notification to reporter:",
            pushError,
          );
        }
      }
    }

    // 4a. Send notification to reporter when assignee changes status to acknowledged
    if (
      isStatusAcknowledgedUpdate &&
      isAssigneeTryingToUpdateThatHeDidntCreate &&
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

        const emailHtml = taskInProgressTemplate(
          reporterName,
          assigneeName,
          task,
        );

        await emailService.sendEmail({
          to: task.reporter.email,
          subject: `Task Acknowledged: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "Failed to send task acknowledged email to reporter:",
          emailError,
        );
      }

      // Send push notification to reporter
      try {
        await PushNotificationService.sendToUser(task.reporter_id, {
          title: "Task Acknowledged",
          body: `${task.assignee?.firstName || "Someone"
            } has acknowledged "${task.title}"`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            type: "task_acknowledged",
            taskId: task.id,
          },
        });
      } catch (pushError) {
        console.error(
          "Failed to send task acknowledged push notification:",
          pushError,
        );
      }
    }

    // 5. Send notification when task is archived (to assignee)
    if (isArchiving && task.assignee && task.assignee.email) {
      try {
        const assigneeName =
          `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
          task.assignee.username;

        const emailHtml = taskArchiveTemplate(assigneeName, task);

        await emailService.sendEmail({
          to: task.assignee.email,
          subject: `Task Archived: ${task.title}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error(
          "Failed to send task archive email to assignee:",
          emailError,
        );
      }

      // Send push notification to assignee
      if (task.assignee) {
        try {
          await PushNotificationService.sendToUser(task.assigned_to, {
            title: "Task Archived",
            body: `Task "${task.title}" has been archived and removed from your active tasks`,
            icon: "/icons/notification-icon.png",
            badge: "/icons/notification-badge.png",
            data: {
              type: "task_archived",
              taskId: task.id,
            },
          });
        } catch (pushError) {
          console.error(
            "Failed to send task archive push notification:",
            pushError,
          );
        }
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

    if (req.user?.role?.toLowerCase() === "employee") {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Not authorized to delete this task",
      );
    }

    // Check if task is archived before allowing deletion
    if (!task.is_archived) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Only archived tasks can be deleted. Please archive the task first.",
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
        "Not authorized to add alert to this task",
      );
    }

    const alertDate = new Date(alert_date);
    if (alertDate < task.start_date) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Alert date must be equal to or after task start date (${task.start_date.toISOString().split("T")[0]
        })`,
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
        "Not authorized to delete alert from this task",
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
        "User must be authenticated to comment",
      );
    }

    if (!content || content.trim() === "") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Comment text is required");
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
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

    // Determine who commented and send notification accordingly
    const isReporterCommenting = user_id === task.reporter_id;
    const isAssigneeCommenting = user_id === task.assigned_to;

    // If reporter commented, notify assignee/employee
    if (isReporterCommenting && task.assignee && task.assignee.email) {
      try {
        const assigneeName =
          `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
          "Team Member";
        const commenterName =
          `${comment.user.firstName} ${comment.user.lastName}`.trim() ||
          comment.user.username;

        const emailHtml = taskCommentTemplate(
          assigneeName,
          commenterName,
          task,
          content.trim(),
          false,
        );

        await emailService.sendEmail({
          to: task.assignee.email,
          subject: `New Comment on Task: ${task.title}`,
          html: emailHtml,
        });

        console.log(
          `[CommentNotif] Email sent to assignee (${task.assignee.email})`,
        );
      } catch (emailError) {
        console.error(
          "[CommentNotif] Failed to send email to assignee:",
          emailError.message,
        );
      }

      // Send push notification to assignee
      try {
        await PushNotificationService.sendToUser(task.assigned_to, {
          title: "New Comment on Task",
          body: `"${task.title}" - ${commenterName} commented`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            taskId: task.id,
            action: "commentAdded",
            taskTitle: task.title,
            commenterName: commenterName,
          },
        });

        console.log(
          `[CommentNotif] Push notification sent to assignee (ID: ${task.assigned_to})`,
        );
      } catch (pushError) {
        console.error(
          "[CommentNotif] Failed to send push to assignee:",
          pushError.message,
        );
      }
    }

    // If assignee commented, notify reporter only
    if (isAssigneeCommenting && task.reporter && task.reporter.email) {
      try {
        const reporterName =
          `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
          "Manager";
        const commenterName =
          `${comment.user.firstName} ${comment.user.lastName}`.trim() ||
          comment.user.username;

        const emailHtml = taskCommentTemplate(
          reporterName,
          commenterName,
          task,
          content.trim(),
          true,
        );

        await emailService.sendEmail({
          to: task.reporter.email,
          subject: `New Comment on Task: ${task.title}`,
          html: emailHtml,
        });

        console.log(
          `[CommentNotif] Email sent to reporter (${task.reporter.email})`,
        );
      } catch (emailError) {
        console.error(
          "[CommentNotif] Failed to send email to reporter:",
          emailError.message,
        );
      }

      // Send push notification to reporter
      try {
        await PushNotificationService.sendToUser(task.reporter_id, {
          title: "New Comment on Task",
          body: `"${task.title}" - ${commenterName} commented`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            taskId: task.id,
            action: "commentAdded",
            taskTitle: task.title,
            commenterName: commenterName,
          },
        });

        console.log(
          `[CommentNotif] Push notification sent to reporter (ID: ${task.reporter_id})`,
        );
      } catch (pushError) {
        console.error(
          "[CommentNotif] Failed to send push to reporter:",
          pushError.message,
        );
      }
    }

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
        "User must be authenticated",
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
        "You can only delete your own comments",
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
        "User must be authenticated to attach files",
      );
    }

    if (!file_url || !file_name) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "File URL and file name are required",
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
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

    // Determine who attached the file and send notification accordingly
    const isReporterAttaching = req.user.id === task.reporter_id;
    const isAssigneeAttaching = req.user.id === task.assigned_to;

    // If reporter attached file, notify assignee/employee
    if (isReporterAttaching && task.assignee && task.assignee.email) {
      try {
        const assigneeName =
          `${task.assignee.firstName} ${task.assignee.lastName}`.trim() ||
          "Team Member";

        const emailSubject = `New File Attached to Task: ${task.title}`;
        const emailHtml = `
          <p>Hello ${assigneeName},</p>
          <p>A file has been attached to your task:</p>
          <p><strong>Task:</strong> ${task.title}</p>
          <p><strong>File:</strong> ${file_name}</p>
          <p>Please check the task details for more information.</p>
        `;

        await emailService.sendEmail({
          to: task.assignee.email,
          subject: emailSubject,
          html: emailHtml,
        });

        console.log(
          `[AttachmentNotif] Email sent to assignee (${task.assignee.email})`,
        );
      } catch (emailError) {
        console.error(
          "[AttachmentNotif] Failed to send email to assignee:",
          emailError.message,
        );
      }

      // Send push notification to assignee
      try {
        await PushNotificationService.sendToUser(task.assigned_to, {
          title: "File Attached to Task",
          body: `"${task.title}" - ${file_name}`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            taskId: task.id,
            action: "fileAttached",
            taskTitle: task.title,
            fileName: file_name,
          },
        });

        console.log(
          `[AttachmentNotif] Push notification sent to assignee (ID: ${task.assigned_to})`,
        );
      } catch (pushError) {
        console.error(
          "[AttachmentNotif] Failed to send push to assignee:",
          pushError.message,
        );
      }
    }

    // If assignee attached file, notify reporter
    if (isAssigneeAttaching && task.reporter && task.reporter.email) {
      try {
        const reporterName =
          `${task.reporter.firstName} ${task.reporter.lastName}`.trim() ||
          "Manager";

        const emailSubject = `New File Attached to Task: ${task.title}`;
        const emailHtml = `
          <p>Hello ${reporterName},</p>
          <p>A file has been attached to a task you created:</p>
          <p><strong>Task:</strong> ${task.title}</p>
          <p><strong>File:</strong> ${file_name}</p>
          <p>Please check the task details for more information.</p>
        `;

        await emailService.sendEmail({
          to: task.reporter.email,
          subject: emailSubject,
          html: emailHtml,
        });

        console.log(
          `[AttachmentNotif] Email sent to reporter (${task.reporter.email})`,
        );
      } catch (emailError) {
        console.error(
          "[AttachmentNotif] Failed to send email to reporter:",
          emailError.message,
        );
      }

      // Send push notification to reporter
      try {
        await PushNotificationService.sendToUser(task.reporter_id, {
          title: "File Attached to Task",
          body: `"${task.title}" - ${file_name}`,
          icon: "/icons/notification-icon.png",
          badge: "/icons/notification-badge.png",
          data: {
            taskId: task.id,
            action: "fileAttached",
            taskTitle: task.title,
            fileName: file_name,
          },
        });

        console.log(
          `[AttachmentNotif] Push notification sent to reporter (ID: ${task.reporter_id})`,
        );
      } catch (pushError) {
        console.error(
          "[AttachmentNotif] Failed to send push to reporter:",
          pushError.message,
        );
      }
    }

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
  buildTaskFilters,
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
