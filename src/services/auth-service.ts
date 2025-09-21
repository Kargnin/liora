import type { User, UserType, LoginCredentials } from '@/types/user'

/**
 * Authentication service for handling login/logout operations
 * This is a simplified version for the hackathon - in production this would
 * integrate with a real authentication backend
 */
export class AuthService {
  /**
   * Simulate login with name-only authentication
   */
  static async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create user object
    const user: User = {
      id: `${credentials.userType}-${Date.now()}`,
      name: credentials.name.trim(),
      type: credentials.userType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileComplete: false,
    }

    return user
  }

  /**
   * Simulate logout
   */
  static async logout(): Promise<void> {
    // In a real app, this would invalidate tokens on the server
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  /**
   * Check if user is authenticated (client-side only for now)
   */
  static isAuthenticated(): boolean {
    // This would typically check for valid tokens
    // For now, we rely on Zustand store state
    return false
  }

  /**
   * Validate user type
   */
  static isValidUserType(type: string): type is UserType {
    return type === 'founder' || type === 'investor'
  }

  /**
   * Generate user initials for avatar
   */
  static getUserInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
}