import { join } from 'path'
import { type } from 'os'
import { app } from '@electron/remote'

const userData = app.getPath('appData')

export const HOME_PATH = join(userData, 'aproxy')

export const CERT_DIR_PATH = join(HOME_PATH, 'cert')
export const CERT_FILE_NAME = 'root.pem'
export const CERT_KEY_FILE_NAME = 'root.key'
export const CERT_FILE_PATH = join(CERT_DIR_PATH, CERT_FILE_NAME)
export const CERT_KEY_FILE_PATH = join(CERT_DIR_PATH, CERT_KEY_FILE_NAME)

const systemType = type()
export const SYSTEM_IS_WIN = systemType === 'Windows_NT'
export const SYSTEM_IS_MACOS = systemType === 'Darwin'
export const SYSTEM_IS_LINUX = systemType === 'Linux'
