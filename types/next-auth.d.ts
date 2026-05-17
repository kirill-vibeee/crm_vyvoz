import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    role?: 'ADMIN' | 'MANAGER'
  }

  interface Session {
    user: User & DefaultSession['user']
  }
}
