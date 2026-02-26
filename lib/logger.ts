// Simple logging system for Autonomos
import fs from 'fs'
import path from 'path'

const LOG_DIR = process.env.LOG_DIR || path.join(process.env.HOME || '', '.private', 'logs')
const LOG_LEVELS: Record<string, number> = { DEBUG: 0, INFO: 1, WARNING: 2, ERROR: 3, CRITICAL: 4 }

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

function getLogger(filename: string) {
  const logFile = path.join(LOG_DIR, `autonomos_${filename}.log`)
  
  return {
    debug(message: string, context: Record<string, unknown> = {}) {
      log('DEBUG', message, context, logFile)
    },
    info(message: string, context: Record<string, unknown> = {}) {
      log('INFO', message, context, logFile)
    },
    warning(message: string, context: Record<string, unknown> = {}) {
      log('WARNING', message, context, logFile)
    },
    error(message: string, context: Record<string, unknown> = {}) {
      log('ERROR', message, context, logFile)
    },
    critical(message: string, context: Record<string, unknown> = {}) {
      log('CRITICAL', message, context, logFile)
    }
  }
}

function log(level: string, message: string, context: Record<string, unknown>, file: string) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context
  }
  
  const line = JSON.stringify(entry) + '\n'
  fs.appendFileSync(file, line)
}

export const logger = getLogger('api')
export const actionLogger = getLogger('actions')
export const errorLogger = getLogger('errors')
