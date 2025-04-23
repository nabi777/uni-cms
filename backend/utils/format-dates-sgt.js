// utils/format-dates-sgt.js

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

// You can configure the timezone here or through environment variables
const SGT_TZ = process.env.DB_TIMEZONE || 'Asia/Singapore';

function formatDatesToSGT(obj) {
  if (Array.isArray(obj)) {
    return obj.map(formatDatesToSGT);
  }

  if (obj !== null && typeof obj === 'object') {
    for (let key in obj) {
      if (obj[key] instanceof Date) {
        obj[key] = dayjs(obj[key])
          .tz(SGT_TZ)
          .format('YYYY-MM-DD HH:mm:ss');
      } else if (typeof obj[key] === 'object') {
        obj[key] = formatDatesToSGT(obj[key]); // Recursive formatting
      }
    }
  }

  return obj;
}

module.exports = formatDatesToSGT;
