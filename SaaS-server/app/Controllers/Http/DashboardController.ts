import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import Client from 'App/Models/Client'
import ClientProject from 'App/Models/ClientProject'
import Invoice from 'App/Models/Invoice'
import { DateTime } from 'luxon'

export default class DashboardController {
  public async stats({ response }: HttpContextContract) {
    try {
      const now = DateTime.now()
      const startOfMonth = now.startOf('month').toFormat('yyyy-MM-dd')
      const todayDate = now.toISODate()

      // 1. Single ultra-fast aggregation query for all counts (1 database round-trip)
      const [countsRows] = await Database.rawQuery(`
        SELECT 
          (SELECT COUNT(*) FROM clients) AS total_clients,
          (SELECT COUNT(*) FROM clients WHERE created_at >= ?) AS new_clients_this_month,
          (SELECT COUNT(*) FROM client_projects WHERE status = 'active') AS active_projects,
          (SELECT COUNT(*) FROM client_projects WHERE status = 'on_hold') AS on_hold_projects,
          (SELECT COUNT(*) FROM client_projects) AS total_projects,
          (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress') AS in_progress_tasks,
          (SELECT COUNT(*) FROM tasks WHERE status != 'completed' AND due_date IS NOT NULL AND due_date < ?) AS overdue_tasks,
          (SELECT COUNT(*) FROM tasks WHERE status = 'todo') AS todo_tasks,
          (SELECT COUNT(*) FROM tasks WHERE status = 'completed') AS completed_tasks,
          (SELECT COUNT(*) FROM tasks WHERE status = 'blocked') AS blocked_tasks,
          (SELECT COUNT(*) FROM tasks) AS total_tasks,
          (SELECT COUNT(*) FROM invoices WHERE status != 'paid') AS unpaid_invoices,
          (SELECT COUNT(*) FROM invoices WHERE status = 'draft') AS draft_invoices,
          (SELECT COUNT(*) FROM invoices WHERE status = 'sent') AS sent_invoices,
          (SELECT COUNT(*) FROM invoices WHERE status = 'paid') AS paid_invoices,
          (SELECT COUNT(*) FROM invoices WHERE status != 'paid' AND due_date IS NOT NULL AND due_date < ?) AS overdue_invoices,
          (SELECT COUNT(*) FROM invoices) AS total_invoices
      `, [startOfMonth, todayDate, todayDate])

      const counts = Array.isArray(countsRows) ? countsRows[0] : countsRows

      // 2. Fetch active projects with task progress and client info
      const recentProjects = await ClientProject.query()
        .preload('client')
        .preload('tasks')
        .orderBy('created_at', 'desc')
        .limit(5)

      const projectProgress = recentProjects.map((p) => {
        const tasks = p.tasks || []
        const totalTasks = tasks.length
        const completedTasks = tasks.filter((t) => t.status === 'completed').length
        
        let percentage = 0
        if (totalTasks > 0) {
          percentage = Math.round((completedTasks / totalTasks) * 100)
        } else if (p.status === 'completed') {
          percentage = 100
        } else if (p.status === 'active') {
          percentage = 35 // baseline
        }

        const clientName = p.client?.name || p.client?.companyName || 'General'
        const initials = (p.client?.name || p.client?.companyName || p.title || 'PR')
          .trim()
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word[0].toUpperCase())
          .join('')

        return {
          id: p.id,
          clientId: p.clientId,
          title: p.title,
          clientName: clientName,
          initials: initials || 'PR',
          status: p.status,
          dueDate: p.dueDate ? p.dueDate.toISODate() : null,
          percentage: percentage,
          totalTasks: totalTasks,
          completedTasks: completedTasks,
        }
      })

      // 3. Fetch ALL Clients for the Snapshot with projects, open tasks, and unpaid invoices
      const allClients = await Client.query()
        .preload('projects', (pQ) => {
          pQ.preload('tasks')
        })
        .preload('invoices')
        .orderBy('created_at', 'desc')

      const clientsSnapshot = allClients.map((c) => {
        const projects = c.projects || []
        const projectsCount = projects.length

        let openTasksCount = 0
        projects.forEach((p) => {
          const tasks = p.tasks || []
          openTasksCount += tasks.filter((t) => t.status === 'in_progress').length
        })

        const invoices = c.invoices || []
        const unpaidInvoicesCount = invoices.filter((inv) => inv.status !== 'paid').length

        // Prioritize Client Name over Company Name
        const displayName = c.name || c.companyName || 'Unnamed Client'
        const initials = displayName
          .trim()
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word[0].toUpperCase())
          .join('') || 'CL'

        return {
          id: c.id,
          name: displayName,
          companyName: c.companyName || '',
          initials: initials,
          projectsCount: projectsCount,
          openTasksCount: openTasksCount,
          unpaidInvoicesCount: unpaidInvoicesCount,
        }
      })

      // 4. Fetch Invoice Pipeline recent / priority items
      const pipelineInvoicesQuery = await Invoice.query()
        .preload('client')
        .orderBy('created_at', 'desc')
        .limit(6)

      const pipelineInvoices = pipelineInvoicesQuery.map((inv) => {
        const clientName = inv.client?.name || inv.client?.companyName || 'Unnamed Client'
        const invoiceNum = inv.invoiceNumber || `INV-${String(inv.id).padStart(4, '0')}`

        return {
          id: inv.id,
          invoiceNumber: invoiceNum,
          clientName: clientName,
          status: inv.status,
          dueDate: inv.dueDate ? inv.dueDate.toISODate() : null,
          createdAt: inv.createdAt ? inv.createdAt.toISODate() : null,
          totalAmount: inv.totalAmount,
        }
      })

      // Task distribution overview
      const todoCount = Number(counts?.todo_tasks || 0)
      const inProgressCount = Number(counts?.in_progress_tasks || 0)
      const completedCount = Number(counts?.completed_tasks || 0)
      const blockedCount = Number(counts?.blocked_tasks || 0)
      const totalTasksCount = Number(counts?.total_tasks || 0)

      return response.status(200).json({
        success: true,
        data: {
          clients: {
            total: Number(counts?.total_clients || 0),
            newThisMonth: Number(counts?.new_clients_this_month || 0),
          },
          projects: {
            active: Number(counts?.active_projects || 0),
            onHold: Number(counts?.on_hold_projects || 0),
            total: Number(counts?.total_projects || 0),
          },
          tasks: {
            open: inProgressCount,
            overdue: Number(counts?.overdue_tasks || 0),
            todo: todoCount,
            completed: completedCount,
            blocked: blockedCount,
            total: totalTasksCount,
          },
          invoices: {
            unpaid: Number(counts?.unpaid_invoices || 0),
            overdue: Number(counts?.overdue_invoices || 0),
            total: Number(counts?.total_invoices || 0),
          },
          projectProgress: projectProgress,
          tasksOverview: {
            todo: todoCount,
            inProgress: inProgressCount,
            completed: completedCount,
            blocked: blockedCount,
            total: totalTasksCount,
          },
          clientsSnapshot: clientsSnapshot,
          invoicePipeline: {
            draft: Number(counts?.draft_invoices || 0),
            sent: Number(counts?.sent_invoices || 0),
            overdue: Number(counts?.overdue_invoices || 0),
            paid: Number(counts?.paid_invoices || 0),
            items: pipelineInvoices,
          },
        },
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error.message || error,
      })
    }
  }
}
