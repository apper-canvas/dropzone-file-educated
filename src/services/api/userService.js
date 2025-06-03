import { delay } from '../index.js'
import usersData from '../mockData/users.json'

let users = [...usersData]

const userService = {
  async getAll() {
    await delay(300)
    return [...users]
  },

  async getById(id) {
    await delay(200)
    const user = users.find(u => u.id === id)
    return user ? { ...user } : null
  },

  async create(userData) {
    await delay(400)
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      storageUsed: 0,
      storageLimit: 5000000000, // 5GB
      uploadHistory: []
    }
    users.push(newUser)
    return { ...newUser }
  },

  async update(id, data) {
    await delay(300)
    const index = users.findIndex(u => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...data }
      return { ...users[index] }
    }
    throw new Error('User not found')
  },

  async delete(id) {
    await delay(250)
    const index = users.findIndex(u => u.id === id)
    if (index !== -1) {
      users.splice(index, 1)
      return true
    }
    throw new Error('User not found')
  }
}

export default userService