import { delay } from '../index.js'
import uploadSessionsData from '../mockData/uploadSessions.json'

let uploadSessions = [...uploadSessionsData]

const uploadSessionService = {
  async getAll() {
    await delay(250)
    return [...uploadSessions]
  },

  async getById(id) {
    await delay(200)
    const session = uploadSessions.find(s => s.id === id)
    return session ? { ...session } : null
  },

  async create(sessionData) {
    await delay(300)
    const newSession = {
      id: Date.now().toString(),
      ...sessionData,
      startTime: new Date().toISOString(),
      completedSize: 0
    }
    uploadSessions.unshift(newSession)
    return { ...newSession }
  },

  async update(id, data) {
    await delay(200)
    const index = uploadSessions.findIndex(s => s.id === id)
    if (index !== -1) {
      uploadSessions[index] = { ...uploadSessions[index], ...data }
      return { ...uploadSessions[index] }
    }
    throw new Error('Upload session not found')
  },

  async delete(id) {
    await delay(250)
    const index = uploadSessions.findIndex(s => s.id === id)
    if (index !== -1) {
      uploadSessions.splice(index, 1)
      return true
    }
    throw new Error('Upload session not found')
  }
}

export default uploadSessionService