// Simple logging system for Autonomos
const fs = require('fs')
const path = require('path')

const LOG_DIR = process.env.LOG_DIR || path.join(process.env.HOME, '.private', 'logs')
const LOG_LEVELS = { DEBUG: 0, INFO: 1, WARNING: 2, ERROR: 3, CRITICAL: 4 }

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function getLogger(filename: string) {
  const logFile = path.join(LOG_DIR, `autonomos_${filename}.log`)
  
  return {
    debug(message, context = {}) {
      log('DEBUG', message, context, logFile)
    },
    info(message, context = {}) {
      log('INFO', message, context, logFile)
    },
    warning(message, context = {}) {
      log('WARNING', message, context, logFile)
    },
    error(message, context = {}) {
      log('ERROR', message, context, logFile)
      // Also notify on errors
      notifyTelegram(`ERROR: ${message}`, context)
    },
    critical(message, context = {}) {
      log('CRITICAL', message, context, logFile)
      // Always notify on critical
      notifyTelegram(`🚨 CRITICAL: ${message}`, context)
    }
  }
}

function log(level, message, context, file) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  }
  
  const line = JSON.stringify(entry) + '\n'
  fs.appendFileSync(file, line)
  
  // Also log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[${level}] ${message}`, context)
  }
}

function notifyTelegram(message, context) {
  // Could integrate with Telegram bot
  console.log(`[ALERT] ${message}`, context)
}

// Export for use in routes
module.exports = {
  logger: getLogger('api'),
  actionLogger: getLogger('actions'),
  errorLogger: getLogger('errors')
}
