import { join } from 'path'
import { type } from 'os'
import { app } from '@electron/remote'

const userData = app.getPath('appData')

export const HOME_PATH = join(userData, 'aproxy')

const systemType = type()
export const SYSTEM_IS_WIN = systemType === 'Windows_NT'
export const SYSTEM_IS_MACOS = systemType === 'Darwin'
export const SYSTEM_IS_LINUX = systemType === 'Linux'
