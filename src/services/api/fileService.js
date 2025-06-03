import { delay } from '../index.js'
import filesData from '../mockData/files.json'

let files = [...filesData]

const fileService = {
  async getAll() {
    await delay(300)
    return [...files]
  },

  async getById(id) {
    await delay(200)
    const file = files.find(f => f.id === id)
    return file ? { ...file } : null
  },

  async create(fileData) {
    await delay(400)
    const newFile = {
      id: Date.now().toString(),
      ...fileData,
      uploadDate: new Date().toISOString(),
      status: 'completed',
      progress: 100
    }
    files.unshift(newFile)
    return { ...newFile }
  },

  async update(id, data) {
    await delay(300)
    const index = files.findIndex(f => f.id === id)
    if (index !== -1) {
      files[index] = { ...files[index], ...data }
      return { ...files[index] }
    }
    throw new Error('File not found')
  },

  async delete(id) {
    await delay(250)
    const index = files.findIndex(f => f.id === id)
    if (index !== -1) {
      files.splice(index, 1)
      return true
    }
    throw new Error('File not found')
  }
}

export default fileService