import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import InvoiceService, { CreateInvoicePayload, UpdateInvoicePayload, InvoiceStatus } from 'App/Services/InvoiceService'

export default class InvoicesController {
    public async index({ response }: HttpContextContract) {
        try {
            const invoices = await InvoiceService.getAllInvoices()

            return response.status(200).json({
                success: true,
                message: 'Invoices fetched successfully',
                data: invoices,
            })
        } catch (error) {
            console.error('Error fetching invoices:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch invoices',
                error: error.message || error,
            })
        }
    }

    public async show({ params, response }: HttpContextContract) {
        try {
            const invoice = await InvoiceService.getInvoiceById(params.id)

            return response.status(200).json({
                success: true,
                message: 'Invoice fetched successfully',
                data: invoice,
            })
        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).json({
                    success: false,
                    message: `Invoice with ID ${params.id} not found`,
                })
            }

            console.error('Error fetching invoice:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to fetch invoice',
                error: error.message || error,
            })
        }
    }

    public async store({ request, response }: HttpContextContract) {
        try {
            const data = request.body() as CreateInvoicePayload
            const invoice = await InvoiceService.createInvoice(data)

            return response.status(201).json({
                success: true,
                message: 'Invoice created successfully',
                data: invoice,
            })
        } catch (error) {
            console.error('Error creating invoice:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to create invoice',
                error: error.message || error,
            })
        }
    }

    public async update({ params, request, response }: HttpContextContract) {
        try {
            const data = request.body() as UpdateInvoicePayload
            const invoice = await InvoiceService.updateInvoice(params.id, data)

            return response.status(200).json({
                success: true,
                message: 'Invoice updated successfully',
                data: invoice,
            })
        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).json({
                    success: false,
                    message: `Invoice with ID ${params.id} not found`,
                })
            }

            console.error('Error updating invoice:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to update invoice',
                error: error.message || error,
            })
        }
    }

    public async updateStatus({ params, request, response }: HttpContextContract) {
        try {
            const status = request.input('status') as InvoiceStatus
            if (!status || !['draft', 'sent', 'paid'].includes(status)) {
                return response.status(400).json({
                    success: false,
                    message: 'Invalid status. Status must be draft, sent, or paid',
                })
            }

            const invoice = await InvoiceService.updateStatus(params.id, status)

            return response.status(200).json({
                success: true,
                message: 'Invoice status updated successfully',
                data: invoice,
            })
        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).json({
                    success: false,
                    message: `Invoice with ID ${params.id} not found`,
                })
            }

            console.error('Error updating invoice status:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to update invoice status',
                error: error.message || error,
            })
        }
    }

    public async destroy({ params, response }: HttpContextContract) {
        try {
            await InvoiceService.deleteInvoice(params.id)

            return response.status(200).json({
                success: true,
                message: 'Invoice deleted successfully',
            })
        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).json({
                    success: false,
                    message: `Invoice with ID ${params.id} not found`,
                })
            }

            console.error('Error deleting invoice:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to delete invoice',
                error: error.message || error,
            })
        }
    }

    public async downloadPdf({ params, response }: HttpContextContract) {
        try {
            const invoice = await InvoiceService.getInvoiceById(params.id)
            const pdfBuffer = await InvoiceService.generatePdf(params.id)

            const filename = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`
            response.header('Content-Type', 'application/pdf')
            response.header('Content-Disposition', `attachment; filename="${filename}"`)

            return response.send(pdfBuffer)
        } catch (error) {
            if (error.code === 'E_ROW_NOT_FOUND') {
                return response.status(404).json({
                    success: false,
                    message: `Invoice with ID ${params.id} not found`,
                })
            }

            console.error('Error generating invoice PDF:', error)
            return response.status(500).json({
                success: false,
                message: 'Failed to generate invoice PDF',
                error: error.message || error,
            })
        }
    }
}

