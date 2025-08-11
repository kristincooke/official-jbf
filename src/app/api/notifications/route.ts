import { NextRequest, NextResponse } from 'next/server'
import { notificationsService } from '@/lib/notifications-service'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'list'
    const limit = parseInt(searchParams.get('limit') || '20')
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const type = searchParams.get('type')

    switch (action) {
      case 'list':
        const notifications = await notificationsService.getNotifications(user.id, {
          limit,
          unread_only: unreadOnly,
          type: type || undefined
        })

        return NextResponse.json({
          notifications,
          total: notifications.length,
          unread_count: notifications.filter(n => !n.read).length
        })

      case 'preferences':
        const preferences = await notificationsService.getPreferences(user.id)
        return NextResponse.json({ preferences })

      case 'unread_count':
        const unreadNotifications = await notificationsService.getNotifications(user.id, {
          unread_only: true
        })
        
        return NextResponse.json({
          unread_count: unreadNotifications.length
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'mark_read':
        const { notification_id } = body
        if (!notification_id) {
          return NextResponse.json({ error: 'notification_id is required' }, { status: 400 })
        }

        await notificationsService.markAsRead(notification_id, user.id)
        return NextResponse.json({ message: 'Notification marked as read' })

      case 'mark_all_read':
        await notificationsService.markAllAsRead(user.id)
        return NextResponse.json({ message: 'All notifications marked as read' })

      case 'delete':
        const { notification_id: deleteId } = body
        if (!deleteId) {
          return NextResponse.json({ error: 'notification_id is required' }, { status: 400 })
        }

        await notificationsService.deleteNotification(deleteId, user.id)
        return NextResponse.json({ message: 'Notification deleted' })

      case 'update_preferences':
        const { preferences } = body
        if (!preferences) {
          return NextResponse.json({ error: 'preferences are required' }, { status: 400 })
        }

        await notificationsService.updatePreferences(user.id, preferences)
        return NextResponse.json({ message: 'Preferences updated successfully' })

      case 'test_notification':
        // For testing purposes - send a test notification
        await notificationsService.sendNotification({
          user_id: user.id,
          type: 'system_update',
          title: 'Test Notification',
          message: 'This is a test notification to verify the system is working.',
          read: false
        })

        return NextResponse.json({ message: 'Test notification sent' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notifications API POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and has admin privileges
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (would check user role in database)
    const isAdmin = true // Mock admin check

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'send_bulk':
        const { user_ids, notification } = body
        if (!user_ids || !notification) {
          return NextResponse.json({ error: 'user_ids and notification are required' }, { status: 400 })
        }

        await notificationsService.sendBulkNotifications(user_ids, notification)
        return NextResponse.json({ 
          message: `Bulk notification sent to ${user_ids.length} users` 
        })

      case 'notify_tool_event':
        const { event, tool_data } = body
        if (!event || !tool_data) {
          return NextResponse.json({ error: 'event and tool_data are required' }, { status: 400 })
        }

        await notificationsService.notifyToolEvent(event, tool_data)
        return NextResponse.json({ 
          message: `Tool event notification sent for ${event}` 
        })

      case 'system_announcement':
        const { title, message, expires_at } = body
        if (!title || !message) {
          return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
        }

        // Get all active users (would query from database)
        const activeUserIds = ['user1', 'user2', 'user3'] // Mock user IDs

        await notificationsService.sendBulkNotifications(activeUserIds, {
          type: 'system_update',
          title,
          message,
          expires_at,
          read: false
        })

        return NextResponse.json({ 
          message: `System announcement sent to ${activeUserIds.length} users` 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Notifications API PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
