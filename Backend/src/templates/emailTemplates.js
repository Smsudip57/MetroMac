// Email template functions for task notifications

/**
 * Generate task assignment email HTML
 */
function taskAssignmentTemplate(assigneeName, reporterName, task) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">New Task Assigned</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${assigneeName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          A new task has been assigned to you by <strong>${reporterName}</strong>. Here are the details:
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #6157ff; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Description:</td>
              <td style="padding: 12px 0; color: #666;">${
                task.description || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Status:</td>
              <td style="padding: 12px 0; color: #666; text-transform: capitalize;">${
                task.status
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Start Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.start_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">End Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.end_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Assigned By:</td>
              <td style="padding: 12px 0; color: #666;">${reporterName}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view more details and manage this task.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate task reassignment email HTML
 */
function taskReassignmentTemplate(assigneeName, reporterName, task) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Task Reassigned to You</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${assigneeName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          A task has been reassigned to you by <strong>${reporterName}</strong>. Here are the details:
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #6157ff; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Description:</td>
              <td style="padding: 12px 0; color: #666;">${
                task.description || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Status:</td>
              <td style="padding: 12px 0; color: #666; text-transform: capitalize;">${
                task.status
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Start Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.start_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">End Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.end_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Assigned By:</td>
              <td style="padding: 12px 0; color: #666;">${reporterName}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view more details and manage this task.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate task update email HTML
 */
function taskUpdateTemplate(assigneeName, task, changesHtml) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Task Updated</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${assigneeName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          The following changes have been made to your task <strong>"${
            task.title
          }"</strong>:
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #ff9800; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            ${changesHtml}
          </table>
        </div>
        
        <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">Current Task Details:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 8px 0; font-weight: bold; color: #333; width: 100px;">Title:</td>
              <td style="padding: 8px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 8px 0; font-weight: bold; color: #333;">Status:</td>
              <td style="padding: 8px 0; color: #666; text-transform: capitalize;">${
                task.status
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 8px 0; font-weight: bold; color: #333;">Start Date:</td>
              <td style="padding: 8px 0; color: #666;">${new Date(
                task.start_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #333;">End Date:</td>
              <td style="padding: 8px 0; color: #666;">${new Date(
                task.end_date
              ).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view more details.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate task completion email HTML
 */
function taskCompletionTemplate(assigneeName, reporterName, task) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #27ae60; margin-bottom: 20px;">✓ Task Completed</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${reporterName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          Good news! <strong>${assigneeName}</strong> has completed the task <strong>"${
    task.title
  }"</strong> that was assigned to them.
        </p>
        
        <div style="background-color: #f0f7f0; padding: 20px; border-left: 4px solid #27ae60; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Completed By:</td>
              <td style="padding: 12px 0; color: #666;">${assigneeName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Status:</td>
              <td style="padding: 12px 0; color: #27ae60; text-transform: capitalize; font-weight: bold;">✓ Completed</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Description:</td>
              <td style="padding: 12px 0; color: #666;">${
                task.description || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Start Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.start_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #333;">End Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.end_date
              ).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view more details.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate task alert notification email HTML
 */
function taskAlertTemplate(recipientName, task, alert) {
  const alertDate = new Date(alert.alert_date);
  const alertTime = `${String(alertDate.getHours()).padStart(2, "0")}:${String(
    alertDate.getMinutes()
  ).padStart(2, "0")}`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid #ff9800;">
        <h2 style="color: #ff9800; margin-bottom: 20px;">Task Alert Reminder</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${recipientName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          This is a reminder about an upcoming task. Here are the details:
        </p>
        
        <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin-bottom: 30px; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #f0e5a0;">
              <td style="padding: 12px 0; font-weight: bold; color: #856404; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #856404;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0e5a0;">
              <td style="padding: 12px 0; font-weight: bold; color: #856404;">Description:</td>
              <td style="padding: 12px 0; color: #856404;">${
                task.description || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0e5a0;">
              <td style="padding: 12px 0; font-weight: bold; color: #856404;">Status:</td>
              <td style="padding: 12px 0; color: #856404; text-transform: capitalize;">${
                task.status
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0e5a0;">
              <td style="padding: 12px 0; font-weight: bold; color: #856404;">Start Date:</td>
              <td style="padding: 12px 0; color: #856404;">${new Date(
                task.start_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f0e5a0;">
              <td style="padding: 12px 0; font-weight: bold; color: #856404;">End Date:</td>
              <td style="padding: 12px 0; color: #856404;">${new Date(
                task.end_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #d39e00;">Alert Time:</td>
              <td style="padding: 12px 0; color: #d39e00;"><strong>${alertTime}</strong></td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; border-radius: 4px; margin-bottom: 30px;">
          <p style="color: #0d47a1; font-size: 13px; margin: 0;">
            ⏰ <strong>This is an automated reminder.</strong> The alert was set for <strong>${alertTime}</strong> on <strong>${alertDate.toLocaleDateString()}</strong>.
          </p>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view more details and mark the task as complete.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate reporter supervision email HTML
 */
function taskReporterSupervisionTemplate(reporterName, assigneeName, task) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">New Supervision Task</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${reporterName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          You have been assigned as the supervisor for a new task. Please monitor the progress and ensure the assignee completes it on time. Here are the details:
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #ff9800; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Description:</td>
              <td style="padding: 12px 0; color: #666;">${
                task.description || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Assignee:</td>
              <td style="padding: 12px 0; color: #666;"><strong>${assigneeName}</strong></td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Status:</td>
              <td style="padding: 12px 0; color: #666; text-transform: capitalize;">${
                task.status
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Start Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.start_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #333;">End Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.end_date
              ).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin-bottom: 20px;">
          <p style="color: #e65100; font-size: 13px; margin: 0;">
            📋 As the supervisor, you are responsible for monitoring this task's progress and ensuring timely completion by the assignee.
          </p>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view more details and monitor the task progress.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate reporter reassignment email HTML (old reporter)
 */
function taskReporterUnassignmentTemplate(reporterName, newReporterName, task) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">Supervision Task Reassigned</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${reporterName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          You are no longer the supervisor for the following task. It has been reassigned to <strong>${newReporterName}</strong>.
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #2196F3; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">New Supervisor:</td>
              <td style="padding: 12px 0; color: #666;"><strong>${newReporterName}</strong></td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Status:</td>
              <td style="padding: 12px 0; color: #666; text-transform: capitalize;">${task.status}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          If you have any questions, please log in to the system to view more details.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate task hold notification email HTML
 */
function taskHoldTemplate(recipientName, task) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #d32f2f; margin-bottom: 20px;">⏸️ Task Put on Hold</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${recipientName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          A task you are working on has been put on hold. Here are the details:
        </p>
        
        <div style="background-color: #ffebee; padding: 20px; border-left: 4px solid #d32f2f; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ef5350;">
              <td style="padding: 12px 0; font-weight: bold; color: #333; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #ef5350;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Description:</td>
              <td style="padding: 12px 0; color: #666;">${
                task.description || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #ef5350;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Hold Reason:</td>
              <td style="padding: 12px 0; color: #d32f2f; font-weight: bold;">${
                task.hold_reason || "Not specified"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #ef5350;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Start Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.start_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #333;">End Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.end_date
              ).toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin-bottom: 20px;">
          <p style="color: #e65100; font-size: 13px; margin: 0;">
            ⚠️ This task is temporarily on hold. Please wait for further instructions before resuming work.
          </p>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view more details about this task.
        </p>
      </div>
    </div>
  `;
}

function taskArchiveTemplate(assigneeName, task) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #d32f2f; margin-bottom: 20px;">Task Archived</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${assigneeName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          A task you were working on has been archived and is no longer visible in your active tasks list. Here are the details:
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #d32f2f; margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Description:</td>
              <td style="padding: 12px 0; color: #666;">${
                task.description || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Last Status:</td>
              <td style="padding: 12px 0; color: #666; text-transform: capitalize;">${
                task.status
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Start Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.start_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 12px 0; font-weight: bold; color: #333;">End Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date(
                task.end_date
              ).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #333;">Archived Date:</td>
              <td style="padding: 12px 0; color: #666;">${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #ffebee; padding: 15px; border-left: 4px solid #d32f2f; margin-bottom: 20px;">
          <p style="color: #c62828; font-size: 13px; margin: 0;">
            📦 This task has been archived and moved out of your active task list. You can still access it if needed through the archive section.
          </p>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system if you need to view archived tasks.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate task overdue notification email HTML
 */
function taskOverdueTemplate(recipientName, task, isReporter = false) {
  const endDate = new Date(task.end_date);
  const formattedEndDate = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headerMessage = isReporter
    ? `The following assigned task is now overdue:`
    : `The following task is now overdue:`;

  const actionMessage = isReporter
    ? `Please follow up on this overdue task.`
    : `Please take action on this task immediately.`;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); border-top: 4px solid #dc2626;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">⚠️ Task Overdue</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${recipientName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          ${headerMessage}
        </p>
        
        <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin-bottom: 30px; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #fecaca;">
              <td style="padding: 12px 0; font-weight: bold; color: #991b1b; width: 120px;">Task Title:</td>
              <td style="padding: 12px 0; color: #666;">${task.title}</td>
            </tr>
            <tr style="border-bottom: 1px solid #fecaca;">
              <td style="padding: 12px 0; font-weight: bold; color: #991b1b;">Description:</td>
              <td style="padding: 12px 0; color: #666;">${
                task.description || "N/A"
              }</td>
            </tr>
            <tr style="border-bottom: 1px solid #fecaca;">
              <td style="padding: 12px 0; font-weight: bold; color: #991b1b;">End Date:</td>
              <td style="padding: 12px 0; color: #dc2626; font-weight: bold;">${formattedEndDate}</td>
            </tr>
            ${
              isReporter
                ? `<tr style="border-bottom: 1px solid #fecaca;">
              <td style="padding: 12px 0; font-weight: bold; color: #991b1b;">Assigned To:</td>
              <td style="padding: 12px 0; color: #666;">${
                `${task.assignee?.firstName} ${task.assignee?.lastName}`.trim() ||
                "N/A"
              }</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #991b1b;">Status:</td>
              <td style="padding: 12px 0; color: #666; text-transform: capitalize;">${
                task.status
              }</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; border-radius: 4px; margin-bottom: 30px;">
          <p style="color: #991b1b; font-size: 13px; margin: 0; font-weight: bold;">
            ${actionMessage}
          </p>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view more details and update the task status.
        </p>
      </div>
    </div>
  `;
}

/**
 * Generate task comment notification email HTML
 */
function taskCommentTemplate(
  recipientName,
  commenterName,
  task,
  comment,
  isReporter = false
) {
  const headerMessage = isReporter
    ? `${commenterName} has commented on a task you created:`
    : `${commenterName} has commented on your task:`;

  const titlePrefix = isReporter
    ? "New Comment on Task"
    : "New Comment on Your Task";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-bottom: 20px;">${titlePrefix}</h2>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
          Hello <strong>${recipientName}</strong>,
        </p>
        
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          ${headerMessage}
        </p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-left: 4px solid #2196F3; margin-bottom: 30px; border-radius: 4px;">
          <p style="margin: 0 0 15px 0; font-weight: bold; color: #333;">Task: ${task.title}</p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; border-left: 3px solid #2196F3;">
            <p style="margin: 0; color: #666; line-height: 1.6;">${comment}</p>
          </div>
        </div>
        
        <p style="color: #666; font-size: 13px; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          Please log in to the system to view and reply to this comment.
        </p>
      </div>
    </div>
  `;
}

export {
  taskAssignmentTemplate,
  taskReassignmentTemplate,
  taskUpdateTemplate,
  taskCompletionTemplate,
  taskAlertTemplate,
  taskReporterSupervisionTemplate,
  taskReporterUnassignmentTemplate,
  taskHoldTemplate,
  taskArchiveTemplate,
  taskOverdueTemplate,
  taskCommentTemplate,
};
