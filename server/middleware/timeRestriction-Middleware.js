const { DateTime } = require("luxon");

module.exports = (req, res, next) => {
  // Get current time in Nigeria (Africa/Lagos)
  const now = DateTime.now().setZone("Africa/Lagos");

  const day = now.weekday; // 1 = Monday, 7 = Sunday
  const hour = now.hour;   // 0 - 23

  const isWeekday = day >= 1 && day <= 5;
  const isWorkingHours = hour >= 9 && hour < 17;

  if (isWeekday && isWorkingHours) {
    return next();
  }

  return res.status(403).json({
    message: "Submissions are only allowed on weekdays between 9 AM and 5 PM.",
  });
};