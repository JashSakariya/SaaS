import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Task from 'App/Models/Task'
import ClientProject from 'App/Models/ClientProject'
import Invoice from 'App/Models/Invoice'
import { DateTime } from 'luxon'

export default class CalendarController {
  public async index({ request, response }: HttpContextContract) {
    try {
      const month = request.input('month') ? Number(request.input('month')) : null
      const year = request.input('year') ? Number(request.input('year')) : null
      const fromDate = request.input('from') || null
      const toDate = request.input('to') || null
      const typeFilter = request.input('types') || request.input('type') || 'all'

      const typesList = typeFilter === 'all'
        ? ['task', 'project', 'invoice']
        : String(typeFilter).split(',').map((t) => t.trim().toLowerCase())

      const includeTasks = typesList.includes('task') || typesList.includes('tasks')
      const includeProjects = typesList.includes('project') || typesList.includes('projects')
      const includeInvoices = typesList.includes('invoice') || typesList.includes('invoices')

      const today = DateTime.now().startOf('day')

      const events: any[] = []

      // Helper function to safely format dates to YYYY-MM-DD
      const formatToIsoDate = (val: any): string | null => {
        if (!val) return null
        if (typeof val === 'string') {
          return val.includes('T') ? val.split('T')[0] : val
        }
        if (typeof val.toISODate === 'function') {
          return val.toISODate()
        }
        try {
          const dt = DateTime.fromISO(String(val))
          return dt.isValid ? dt.toISODate() : String(val).slice(0, 10)
        } catch {
          return String(val).slice(0, 10)
        }
      }

      // 1. Fetch Tasks
      if (includeTasks) {
        const tasksQuery = Task.query()
          .preload('project', (pQ) => {
            pQ.preload('client')
          })
          .preload('developer')

        const tasks = await tasksQuery

        tasks.forEach((task) => {
          const dueDateStr = formatToIsoDate(task.dueDate)
          const createdAtStr = formatToIsoDate(task.createdAt)
          const eventDate = dueDateStr || createdAtStr

          if (!eventDate) return

          // Optional month/year or range filter
          if (year && month) {
            const dt = DateTime.fromISO(eventDate)
            if (dt.isValid && (dt.year !== year || dt.month !== month)) {
              return
            }
          } else if (fromDate && toDate) {
            if (eventDate < fromDate || eventDate > toDate) {
              return
            }
          }

          const client = task.project?.client
          const clientName = client?.name || client?.companyName || 'General'
          const clientId = task.project?.clientId || null
          const projectId = task.projectId
          const projectTitle = task.project?.title || null
          const assigneeName = task.developer?.name || task.assignee || 'Unassigned'

          const isOverdue = dueDateStr && task.status !== 'completed' && DateTime.fromISO(dueDateStr) < today

          events.push({
            id: `task-${task.id}`,
            originalId: task.id,
            type: 'task',
            category: 'Tasks',
            title: task.title,
            date: eventDate,
            dueDate: dueDateStr,
            createdAt: createdAtStr,
            status: task.status,
            isOverdue: !!isOverdue,
            clientName: clientName,
            clientId: clientId,
            projectId: projectId,
            projectTitle: projectTitle,
            assignee: assigneeName,
            developerCategory: task.developer?.category || null,
            url: clientId && projectId ? `/clients/${clientId}/projects/${projectId}/tasks/${task.id}` : '/clients',
            metadata: {
              taskStatus: task.status,
              assignee: assigneeName,
              projectTitle: projectTitle,
            },
          })
        })
      }

      // 2. Fetch Projects
      if (includeProjects) {
        const projectsQuery = ClientProject.query()
          .preload('client')
          .preload('tasks')

        const projects = await projectsQuery

        projects.forEach((project) => {
          const dueDateStr = formatToIsoDate(project.dueDate)
          const createdAtStr = formatToIsoDate(project.createdAt)
          const eventDate = dueDateStr || createdAtStr

          if (!eventDate) return

          if (year && month) {
            const dt = DateTime.fromISO(eventDate)
            if (dt.isValid && (dt.year !== year || dt.month !== month)) {
              return
            }
          } else if (fromDate && toDate) {
            if (eventDate < fromDate || eventDate > toDate) {
              return
            }
          }

          const clientName = project.client?.name || project.client?.companyName || 'General'
          const totalTasks = project.tasks?.length || 0
          const completedTasks = project.tasks?.filter((t) => t.status === 'completed').length || 0

          const isOverdue = dueDateStr && project.status !== 'completed' && DateTime.fromISO(dueDateStr) < today

          events.push({
            id: `project-${project.id}`,
            originalId: project.id,
            type: 'project',
            category: 'Projects',
            title: project.title,
            date: eventDate,
            dueDate: dueDateStr,
            createdAt: createdAtStr,
            status: project.status,
            isOverdue: !!isOverdue,
            clientName: clientName,
            clientId: project.clientId,
            projectId: project.id,
            projectTitle: project.title,
            description: project.description,
            url: `/clients/${project.clientId}/projects/${project.id}`,
            metadata: {
              totalTasks,
              completedTasks,
              progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            },
          })
        })
      }

      // 3. Fetch Invoices
      if (includeInvoices) {
        const invoicesQuery = Invoice.query().preload('client')

        const invoices = await invoicesQuery

        invoices.forEach((invoice) => {
          const dueDateStr = formatToIsoDate(invoice.dueDate)
          const createdAtStr = formatToIsoDate(invoice.createdAt)
          const eventDate = dueDateStr || createdAtStr

          if (!eventDate) return

          if (year && month) {
            const dt = DateTime.fromISO(eventDate)
            if (dt.isValid && (dt.year !== year || dt.month !== month)) {
              return
            }
          } else if (fromDate && toDate) {
            if (eventDate < fromDate || eventDate > toDate) {
              return
            }
          }

          const clientName = invoice.client?.name || invoice.client?.companyName || 'General'
          const invNumber = invoice.invoiceNumber || `INV-${String(invoice.id).padStart(4, '0')}`

          const isOverdue = dueDateStr && invoice.status !== 'paid' && DateTime.fromISO(dueDateStr) < today

          events.push({
            id: `invoice-${invoice.id}`,
            originalId: invoice.id,
            type: 'invoice',
            category: 'Invoices',
            title: `${invNumber} - ${clientName}`,
            invoiceNumber: invNumber,
            date: eventDate,
            dueDate: dueDateStr,
            createdAt: createdAtStr,
            status: invoice.status,
            isOverdue: !!isOverdue,
            amount: Number(invoice.totalAmount || 0),
            clientName: clientName,
            clientId: invoice.clientId,
            url: '/invoices',
            metadata: {
              invoiceNumber: invNumber,
              amount: Number(invoice.totalAmount || 0),
              status: invoice.status,
            },
          })
        })
      }

      // Sort events by date ascending
      events.sort((a, b) => (a.date > b.date ? 1 : -1))

      // Compute statistics
      const stats = {
        total: events.length,
        tasks: events.filter((e) => e.type === 'task').length,
        projects: events.filter((e) => e.type === 'project').length,
        invoices: events.filter((e) => e.type === 'invoice').length,
        overdue: events.filter((e) => e.isOverdue).length,
      }

      return response.status(200).json({
        success: true,
        message: 'Calendar events fetched successfully',
        data: {
          events,
          stats,
        },
      })
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch calendar events',
        error: error.message || error,
      })
    }
  }
}
