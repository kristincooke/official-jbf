interface Notification {
  id: string
  user_id: string
  type: 'tool_approved' | 'tool_rejected' | 'review_reply' | 'new_tool_in_category' | 'trending_tool' | 'system_update'
  title: string
  message: string
  data?: Record<string, any>
  read: boolean
  created_at: string
  expires_at?: string
}

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  tool_approvals: boolean
  review_replies: boolean
  category_updates: boolean
  trending_alerts: boolean
  system_updates: boolean
}

class NotificationsService {
  private subscribers: Map<string, Set<(notification: Notification) => void>> = new Map()

  /**
   * Subscribe to real-time notifications for a user
   */
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set())
    }
    
    this.subscribers.get(userId)!.add(callback)

    // Return unsubscribe function
    return () => {
      const userSubscribers = this.subscribers.get(userId)
      if (userSubscribers) {
        userSubscribers.delete(callback)
        if (userSubscribers.size === 0) {
          this.subscribers.delete(userId)
        }
      }
    }
  }

  /**
   * Send notification to user
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    const fullNotification: Notification = {
      ...notification,
      id: this.generateId(),
      created_at: new Date().toISOString()
    }

    // Store notification in database (would use Supabase)
    await this.storeNotification(fullNotification)

    // Send to real-time subscribers
    const userSubscribers = this.subscribers.get(notification.user_id)
    if (userSubscribers) {
      userSubscribers.forEach(callback => callback(fullNotification))
    }

    // Send push notification if enabled
    await this.sendPushNotification(fullNotification)
  }

  /**
   * Get notifications for user
   */
  async getNotifications(
    userId: string, 
    options: {
      limit?: number
      unread_only?: boolean
      type?: string
    } = {}
  ): Promise<Notification[]> {
    // Mock implementation - would query Supabase
    const mockNotifications: Notification[] = [
      {
        id: '1',
        user_id: userId,
        type: 'tool_approved',
        title: 'Tool Approved!',
        message: 'Your submitted tool "React DevTools" has been approved and is now live.',
        data: { tool_id: '123', tool_name: 'React DevTools' },
        read: false,
        created_at: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: '2',
        user_id: userId,
        type: 'new_tool_in_category',
        title: 'New Tool in Frontend Frameworks',
        message: 'A new tool "Svelte Kit" was added to your favorite category.',
        data: { tool_id: '124', category: 'Frontend Frameworks' },
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: '3',
        user_id: userId,
        type: 'trending_tool',
        title: 'Trending Tool Alert',
        message: 'TypeScript is trending this week with 50+ new reviews!',
        data: { tool_id: '125', trend_score: 95 },
        read: true,
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]

    let filtered = mockNotifications

    if (options.unread_only) {
      filtered = filtered.filter(n => !n.read)
    }

    if (options.type) {
      filtered = filtered.filter(n => n.type === options.type)
    }

    return filtered.slice(0, options.limit || 50)
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Would update in Supabase
    console.log(`Marking notification ${notificationId} as read for user ${userId}`)
  }

  /**
   * Mark all notifications as read for user
   */
  async markAllAsRead(userId: string): Promise<void> {
    // Would update all unread notifications in Supabase
    console.log(`Marking all notifications as read for user ${userId}`)
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    // Would delete from Supabase
    console.log(`Deleting notification ${notificationId} for user ${userId}`)
  }

  /**
   * Get notification preferences for user
   */
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    // Mock preferences - would fetch from Supabase
    return {
      email_notifications: true,
      push_notifications: true,
      tool_approvals: true,
      review_replies: true,
      category_updates: true,
      trending_alerts: false,
      system_updates: true
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    // Would update in Supabase
    console.log(`Updating preferences for user ${userId}:`, preferences)
  }

  /**
   * Send bulk notifications (for system-wide updates)
   */
  async sendBulkNotifications(
    userIds: string[],
    notification: Omit<Notification, 'id' | 'user_id' | 'created_at'>
  ): Promise<void> {
    const promises = userIds.map(userId => 
      this.sendNotification({ ...notification, user_id: userId })
    )
    
    await Promise.all(promises)
  }

  /**
   * Create notifications for tool events
   */
  async notifyToolEvent(
    event: 'approved' | 'rejected' | 'trending' | 'new_review',
    toolData: {
      id: string
      name: string
      category?: string
      submitter_id?: string
      reviewer_id?: string
    }
  ): Promise<void> {
    switch (event) {
      case 'approved':
        if (toolData.submitter_id) {
          await this.sendNotification({
            user_id: toolData.submitter_id,
            type: 'tool_approved',
            title: 'Tool Approved! 🎉',
            message: `Your submitted tool "${toolData.name}" has been approved and is now live.`,
            data: { tool_id: toolData.id, tool_name: toolData.name },
            read: false
          })
        }
        break

      case 'rejected':
        if (toolData.submitter_id) {
          await this.sendNotification({
            user_id: toolData.submitter_id,
            type: 'tool_rejected',
            title: 'Tool Needs Updates',
            message: `Your submitted tool "${toolData.name}" needs some updates before approval.`,
            data: { tool_id: toolData.id, tool_name: toolData.name },
            read: false
          })
        }
        break

      case 'trending':
        // Notify users interested in this category
        if (toolData.category) {
          const interestedUsers = await this.getUsersInterestedInCategory(toolData.category)
          await this.sendBulkNotifications(interestedUsers, {
            type: 'trending_tool',
            title: 'Trending Tool Alert 📈',
            message: `${toolData.name} is trending in ${toolData.category}!`,
            data: { tool_id: toolData.id, category: toolData.category },
            read: false
          })
        }
        break

      case 'new_review':
        if (toolData.submitter_id && toolData.reviewer_id !== toolData.submitter_id) {
          await this.sendNotification({
            user_id: toolData.submitter_id,
            type: 'review_reply',
            title: 'New Review on Your Tool',
            message: `Someone reviewed your tool "${toolData.name}".`,
            data: { tool_id: toolData.id, tool_name: toolData.name },
            read: false
          })
        }
        break
    }
  }

  /**
   * Private helper methods
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private async storeNotification(notification: Notification): Promise<void> {
    // Would insert into Supabase notifications table
    console.log('Storing notification:', notification)
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Would integrate with push notification service (FCM, etc.)
    console.log('Sending push notification:', notification.title)
  }

  private async getUsersInterestedInCategory(category: string): Promise<string[]> {
    // Would query users who have this category in their preferences
    return ['user1', 'user2', 'user3'] // Mock user IDs
  }

  /**
   * Initialize real-time listeners (would use Supabase real-time)
   */
  initializeRealTime(): void {
    // Would set up Supabase real-time subscriptions
    console.log('Initializing real-time notifications...')
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.subscribers.clear()
  }
}

// Export singleton instance
export const notificationsService = new NotificationsService()
export type { Notification, NotificationPreferences }
