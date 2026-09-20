import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Plan from 'App/Models/Plan'

export default class AdminPlansController {
  /**
   * GET /admin/plans
   * Render the Edge admin management page
   */
  public async index({ view, request }: HttpContextContract) {
    const rawPlans = await Plan.query().orderBy('id', 'asc')

    const plans = rawPlans.map((plan) => {
      const json = plan.toJSON() as any
      let featureList: string[] = []
      if (Array.isArray(plan.features)) {
        featureList = plan.features
      } else if (typeof plan.features === 'string') {
        try {
          featureList = JSON.parse(plan.features)
        } catch {
          featureList = [plan.features]
        }
      }

      return {
        ...json,
        isActive: plan.isActive,
        isPopular: plan.isPopular,
        priceInRupees: Math.round(plan.price / 100),
        priceFormatted: `₹${(plan.price / 100).toLocaleString('en-IN')}`,
        featuresArray: featureList,
        featuresText: featureList.join('\n'),
      }
    })

    const success = request.input('success')
    const error = request.input('error')

    return view.render('admin/plans/index', {
      plans,
      totalPlans: plans.length,
      activePlans: plans.filter((p: any) => p.is_active || p.isActive).length,
      success,
      error,
    })
  }

  /**
   * POST /admin/plans
   * Create a new plan from the Edge admin form
   */
  public async store({ request, response }: HttpContextContract) {
    try {
      const data = request.all()
      const name = data.name?.trim()
      const priceInRupees = Number(data.price)

      if (!name) {
        return response.redirect('/admin/plans?error=Plan+name+is+required')
      }

      if (isNaN(priceInRupees) || priceInRupees < 0) {
        return response.redirect('/admin/plans?error=Please+enter+a+valid+price')
      }

      const slug = data.slug?.trim() || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

      // Check unique slug
      const existing = await Plan.findBy('slug', slug)
      if (existing) {
        return response.redirect('/admin/plans?error=A+plan+with+this+slug+already+exists')
      }

      // Parse features (from textarea lines)
      const rawFeatures = data.features || ''
      const features = rawFeatures
        .split('\n')
        .map((f: string) => f.trim())
        .filter((f: string) => f.length > 0)

      await Plan.create({
        name,
        slug,
        description: data.description?.trim() || null,
        price: Math.round(priceInRupees * 100), // Convert ₹ to paise
        currency: data.currency || 'INR',
        billingCycle: data.billing_cycle || 'monthly',
        durationDays: Number(data.duration_days) || 30,
        features,
        isPopular: data.is_popular === 'on' || data.is_popular === true || data.is_popular === '1',
        isActive: data.is_active === 'on' || data.is_active === true || data.is_active === '1',
      })

      return response.redirect('/admin/plans?success=Plan+created+successfully!')
    } catch (error) {
      console.error('Error in AdminPlansController.store:', error)
      return response.redirect(`/admin/plans?error=${encodeURIComponent(error.message || 'Failed to create plan')}`)
    }
  }

  /**
   * POST /admin/plans/:id/update
   * Update an existing plan from the Edge admin form
   */
  public async update({ params, request, response }: HttpContextContract) {
    try {
      const plan = await Plan.findOrFail(params.id)
      const data = request.all()

      if (data.name?.trim()) {
        plan.name = data.name.trim()
      }

      if (data.slug?.trim()) {
        plan.slug = data.slug.trim()
      }

      if (data.description !== undefined) {
        plan.description = data.description.trim() || null
      }

      if (data.price !== undefined && !isNaN(Number(data.price))) {
        plan.price = Math.round(Number(data.price) * 100) // Convert ₹ to paise
      }

      if (data.billing_cycle) {
        plan.billingCycle = data.billing_cycle
      }

      if (data.duration_days) {
        plan.durationDays = Number(data.duration_days) || 30
      }

      if (data.features !== undefined) {
        const rawFeatures = String(data.features)
        plan.features = rawFeatures
          .split('\n')
          .map((f: string) => f.trim())
          .filter((f: string) => f.length > 0)
      }

      plan.isPopular = data.is_popular === 'on' || data.is_popular === true || data.is_popular === '1'
      plan.isActive = data.is_active === 'on' || data.is_active === true || data.is_active === '1'

      await plan.save()

      return response.redirect('/admin/plans?success=Plan+updated+successfully!')
    } catch (error) {
      console.error('Error in AdminPlansController.update:', error)
      return response.redirect(`/admin/plans?error=${encodeURIComponent(error.message || 'Failed to update plan')}`)
    }
  }

  /**
   * POST /admin/plans/:id/delete
   * Delete or deactivate a plan
   */
  public async destroy({ params, response }: HttpContextContract) {
    try {
      const plan = await Plan.findOrFail(params.id)
      await plan.delete()

      return response.redirect('/admin/plans?success=Plan+deleted+successfully!')
    } catch (error) {
      console.error('Error in AdminPlansController.destroy:', error)
      return response.redirect(`/admin/plans?error=${encodeURIComponent(error.message || 'Failed to delete plan')}`)
    }
  }
}
