import { DateTime } from 'luxon'
import Database from '@ioc:Adonis/Lucid/Database'
import View from '@ioc:Adonis/Core/View'
import puppeteer from 'puppeteer'
import Invoice from 'App/Models/Invoice'
import InvoiceLineItem from 'App/Models/InvoiceLineItem'

// Type definitions for method payloads
export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export interface LineItemPayload {
  description: string
  quantity: number
  unitPrice: number
}

export interface CreateInvoicePayload {
  clientId: number
  invoice_number?: string
  invoiceNumber?: string
  dueDate: string
  notes?: string
  status?: InvoiceStatus
  lineItems: LineItemPayload[]
}

export interface UpdateInvoicePayload {
  clientId?: number
  invoice_number?: string
  invoiceNumber?: string
  dueDate?: string
  notes?: string
  status?: InvoiceStatus
  lineItems?: LineItemPayload[]
}

export default class InvoiceService {
  /**
   * List all invoices (with optional filters/pagination)
   */
  public static async getAllInvoices() {
    return await Invoice.query()
      .preload('client', (clientQuery) => {
        clientQuery.select('id', 'name')
      })
      .preload('lineItems')
      .orderBy('createdAt', 'desc')
  }

  /**
   * Find a single invoice by ID
   */
  public static async getInvoiceById(id: number) {
    return await Invoice.query()
      .where('id', id)
      .preload('client')
      .preload('lineItems')
      .firstOrFail()
  }

  /**
   * Create invoice + line items in a database transaction
   */
  public static async createInvoice(data: CreateInvoicePayload) {
    const trx = await Database.transaction()

    try {
      // 1. Compute totalAmount and line item amounts
      let totalAmount = 0
      const formattedLineItems = (data.lineItems || []).map((item) => {
        const qty = Number(item.quantity) || 1
        const price = Number(item.unitPrice) || 0
        const lineAmount = qty * price
        totalAmount += lineAmount

        return {
          description: item.description,
          quantity: qty,
          unitPrice: price,
          amount: lineAmount,
        }
      })

      // 2. Create the Invoice record
      const invoice = new Invoice()
      invoice.clientId = data.clientId
      invoice.invoiceNumber = data.invoice_number || data.invoiceNumber || `INV-${Date.now()}`
      invoice.dueDate = typeof data.dueDate === 'string' ? DateTime.fromISO(data.dueDate) : data.dueDate
      invoice.status = data.status || 'draft'
      invoice.totalAmount = totalAmount
      invoice.notes = data.notes || null

      invoice.useTransaction(trx)
      await invoice.save()

      // 3. Create associated line items
      if (formattedLineItems.length > 0) {
        await invoice.related('lineItems').createMany(formattedLineItems)
      }

      // 4. Commit transaction
      await trx.commit()

      // 5. Preload relationships for response
      await invoice.load('client')
      await invoice.load('lineItems')

      return invoice
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Update invoice details and line items in a transaction
   */
  public static async updateInvoice(id: number, data: UpdateInvoicePayload) {
    const trx = await Database.transaction()

    try {
      const invoice = await Invoice.findOrFail(id)

      if (data.clientId !== undefined) {
        invoice.clientId = data.clientId
      }
      if (data.invoice_number !== undefined || data.invoiceNumber !== undefined) {
        invoice.invoiceNumber = data.invoice_number || data.invoiceNumber || invoice.invoiceNumber
      }
      if (data.dueDate !== undefined) {
        invoice.dueDate = typeof data.dueDate === 'string' ? DateTime.fromISO(data.dueDate) : data.dueDate
      }
      if (data.notes !== undefined) {
        invoice.notes = data.notes
      }
      if (data.status !== undefined) {
        invoice.status = data.status
      }

      // Recreate line items and recalculate total
      if (data.lineItems && Array.isArray(data.lineItems)) {
        let totalAmount = 0
        const formattedLineItems = data.lineItems.map((item) => {
          const qty = Number(item.quantity) || 1
          const price = Number(item.unitPrice) || 0
          const lineAmount = qty * price
          totalAmount += lineAmount

          return {
            description: item.description,
            quantity: qty,
            unitPrice: price,
            amount: lineAmount,
          }
        })

        invoice.totalAmount = totalAmount

        // Delete existing line items for this invoice
        await InvoiceLineItem.query().useTransaction(trx).where('invoice_id', id).delete()

        // Create new line items
        if (formattedLineItems.length > 0) {
          await invoice.related('lineItems').createMany(formattedLineItems)
        }
      }

      invoice.useTransaction(trx)
      await invoice.save()

      await trx.commit()

      await invoice.load('client')
      await invoice.load('lineItems')

      return invoice
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Update only the invoice status ('draft' | 'sent' | 'paid')
   */
  public static async updateStatus(id: number, status: InvoiceStatus) {
    const invoice = await Invoice.findOrFail(id)
    invoice.status = status
    await invoice.save()

    await invoice.load('client')
    await invoice.load('lineItems')

    return invoice
  }

  /**
   * Delete invoice and cascade line items
   */
  public static async deleteInvoice(id: number) {
    const invoice = await Invoice.findOrFail(id)
    await invoice.delete()
    return true
  }

  /**
   * Generate / download PDF stream or buffer
   */
  public static async generatePdf(id: number): Promise<Buffer> {
    const invoice = await Invoice.query()
      .where('id', id)
      .preload('client')
      .preload('lineItems')
      .firstOrFail()

    const formattedInvoice = {
      ...invoice.toJSON(),
      invoiceNumber: invoice.invoiceNumber || `INV-${invoice.id}`,
      issueDate: invoice.createdAt ? invoice.createdAt.toFormat('yyyy-LL-dd') : '—',
      createdAtFormatted: invoice.createdAt ? invoice.createdAt.toFormat('yyyy-LL-dd') : '—',
      dueDateFormatted: invoice.dueDate ? (typeof invoice.dueDate === 'string' ? invoice.dueDate : invoice.dueDate.toFormat('yyyy-LL-dd')) : '—',
      status: invoice.status,
      totalAmountFormatted: Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      notes: invoice.notes,
    }

    const formattedLineItems = (invoice.lineItems || []).map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unitPriceFormatted: Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amount: item.amount,
      amountFormatted: Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    }))

    const clientData = invoice.client ? invoice.client.toJSON() : { name: 'Valued Client' }

    const html = await View.render('invoices/pdf', {
      invoice: formattedInvoice,
      client: clientData,
      lineItems: formattedLineItems,
      business: {
        name: 'Business Name',
        email: 'business@example.com',
        phone: '+91 9876543210',
      },
    })

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'domcontentloaded' })
      const pdfUint8Array = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      })
      return Buffer.from(pdfUint8Array)
    } finally {
      await browser.close()
    }
  }

  /**
   * Send invoice email to client
   */
  public async sendInvoiceEmail(id: number) {
    // TODO: Load invoice with client details, attach PDF, send via Mailer
  }
}
