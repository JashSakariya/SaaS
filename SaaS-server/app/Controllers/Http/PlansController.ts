import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PlanService, { CreatePlanPayload, UpdatePlanPayload } from 'App/Services/PlanService'

export default class PlansController {
  /**
   * GET /plans
   * List all active plans for frontend
   */
  public async index({ response }: HttpContextContract) {
    try {
      const plans = await PlanService.getAllPlans()

      return response.status(200).json({
        success: true,
        message: 'Plans fetched successfully',
        data: plans,
      })
    } catch (error) {
      console.error('Error fetching plans:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch plans',
        error: error.message || error,
      })
    }
  }

  /**
   * GET /plans/:id
   * Get single plan by ID
   */
  public async show({ params, response }: HttpContextContract) {
    try {
      const plan = await PlanService.getPlanById(params.id)

      return response.status(200).json({
        success: true,
        message: 'Plan fetched successfully',
        data: plan,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          message: `Plan with ID ${params.id} not found`,
        })
      }

      console.error('Error fetching plan:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to fetch plan',
        error: error.message || error,
      })
    }
  }

  /**
   * POST /plans
   * Create a new plan (with validation)
   */
  public async store({ request, response }: HttpContextContract) {
    try {
      const { name, price, features } = request.all()

      // Basic validation
      if (!name || typeof name !== 'string' || !name.trim()) {
        return response.status(400).json({
          success: false,
          message: 'Plan name is required',
        })
      }

      if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
        return response.status(400).json({
          success: false,
          message: 'Valid plan price in paise is required',
        })
      }

      if (!features || !Array.isArray(features)) {
        return response.status(400).json({
          success: false,
          message: 'Features must be an array of strings',
        })
      }

      const data = request.all() as CreatePlanPayload
      const plan = await PlanService.createPlan(data)

      return response.status(201).json({
        success: true,
        message: 'Plan created successfully',
        data: plan,
      })
    } catch (error) {
      console.error('Error creating plan:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to create plan',
        error: error.message || error,
      })
    }
  }

  /**
   * PUT /plans/:id
   * Update an existing plan
   */
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const data = request.all() as UpdatePlanPayload
      const plan = await PlanService.updatePlan(params.id, data)

      return response.status(200).json({
        success: true,
        message: 'Plan updated successfully',
        data: plan,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          message: `Plan with ID ${params.id} not found`,
        })
      }

      console.error('Error updating plan:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to update plan',
        error: error.message || error,
      })
    }
  }

  /**
   * DELETE /plans/:id
   * Deactivate a plan
   */
  public async destroy({ params, response }: HttpContextContract) {
    try {
      await PlanService.deletePlan(params.id)

      return response.status(200).json({
        success: true,
        message: 'Plan deactivated successfully',
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND') {
        return response.status(404).json({
          success: false,
          message: `Plan with ID ${params.id} not found`,
        })
      }

      console.error('Error deleting plan:', error)
      return response.status(500).json({
        success: false,
        message: 'Failed to delete plan',
        error: error.message || error,
      })
    }
  }
}
