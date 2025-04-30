// main.js
import { app } from 'electron'
import log from 'electron-log'
import path from 'path'
import pkg from 'sqlite3'
const { verbose } = pkg

const logSQLite = log.create({ logId: 'sqlite' })
logSQLite.transports.file.fileName = 'sqlite.log'
logSQLite.scope.defaultLabel = 'sqlite'
logSQLite.scope.labelPadding = 8

const sqlite3 = verbose()

let db

const createDatabase = function () {
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'mydatabase.db')

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      logSQLite.error('Database opening error:', err)
    } else {
      createTables()
    }
  })
}

function createTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT
    )`)
  })
}

// 启动应用时初始化数据库
app.whenReady().then(() => {
  createDatabase()
})
