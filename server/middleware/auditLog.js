const AuditLog = require('../models/AuditLog');

/**
 * Middleware to automatically log API mutations
 * Attach to routes that modify data (POST, PUT, DELETE)
 */
const auditLog = (action, resource) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Only log successful mutations
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        AuditLog.create({
          user: req.user._id,
          action,
          resource,
          resourceId: req.params.id || data?.data?._id,
          newValue: req.body,
          description: `${action} ${resource}`,
          ip: req.ip || req.connection?.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
        }).catch((err) => console.error('Audit log error:', err));
      }

      return originalJson(data);
    };

    next();
  };
};

module.exports = { auditLog };
