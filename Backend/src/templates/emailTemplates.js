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

export {
  taskAssignmentTemplate,
  taskReassignmentTemplate,
  taskUpdateTemplate,
  taskCompletionTemplate,
};
