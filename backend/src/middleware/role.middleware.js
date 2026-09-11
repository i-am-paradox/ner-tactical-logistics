/**
 * Restricts access to users with authorized roles
 * Usage: requireRole(['admin', 'district_officer'])
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before checking role permissions.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Role '${req.user.role}' is not authorized. Allowed: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

module.exports = {
  requireRole
};
