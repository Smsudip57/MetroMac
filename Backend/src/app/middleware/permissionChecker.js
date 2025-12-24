import ApiError from "../../errors/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Map HTTP methods to permission actions
const methodToActionMap = {
  GET: "view",
  POST: "create",
  PUT: "edit",
  PATCH: "edit",
  DELETE: "delete",
};

// Helper function to find a module by name in the module tree (including children)
function findModuleInTree(modules, moduleName) {
  for (const module of modules) {
    if (module.name.toLowerCase() === moduleName.toLowerCase()) {
      return module;
    }
    if (module.children && module.children.length > 0) {
      const found = findModuleInTree(module.children, moduleName);
      if (found) return found;
    }
  }
  return null;
}

const checkPermission = (moduleName) => {
  return async (req, res, next) => {
    try {
      // Check if user exists (should be set by auth middleware)
      if (!req.user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
      }

      // Check if user is super user - they bypass all checks
      if (req.user.is_super_user) {
        return next();
      }

      // Get the action from HTTP method
      const action = methodToActionMap[req.method];

      if (!action) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Invalid HTTP method for permission check"
        );
      }

      // Get user's modules (attached by auth middleware)
      const userModules = req.user.modules || [];

      // Find the specific module in user's permissions (recursively search tree)
      const targetModule = findModuleInTree(userModules, moduleName);

      if (!targetModule) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Access denied. ${moduleName} module not available.`
        );
      }

      // Check if user has the required action in THIS specific module
      const hasAction = targetModule.actions.includes(action);

      if (!hasAction) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Access denied. You do not have ${action} permission for ${moduleName}.`
        );
      }

      // User has permission, allow access
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default checkPermission;
