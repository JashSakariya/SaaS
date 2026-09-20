import Plan from 'App/Models/Plan'

export interface CreatePlanPayload {
  name: string
  slug?: string
  description?: string
  price: number // in paise (e.g. 49900 = ₹499)
  currency?: string
  billingCycle?: 'monthly' | 'yearly'
  durationDays?: number
  features: string[]
  isPopular?: boolean
  isActive?: boolean
}

export interface UpdatePlanPayload {
  name?: string
  slug?: string
  description?: string
  price?: number
  currency?: string
  billingCycle?: 'monthly' | 'yearly'
  durationDays?: number
  features?: string[]
  isPopular?: boolean
  isActive?: boolean
}

export default class PlanService {
  /**
   * List all active plans, ordered by price
   */
  public static async getAllPlans() {
    const plans = await Plan.query()
      .where('is_active', true)
      .orderBy('price', 'asc')

    return plans.map((plan) => {
      const json = plan.toJSON()
      return {
        ...json,
        priceInRupees: Math.round(plan.price / 100),
        priceFormatted: `₹${(plan.price / 100).toLocaleString('en-IN')}`,
      }
    })
  }

  /**
   * Get single plan by ID
   */
  public static async getPlanById(id: number) {
    const plan = await Plan.query().where('id', id).firstOrFail()
    const json = plan.toJSON()
    return {
      ...json,
      priceInRupees: Math.round(plan.price / 100),
      priceFormatted: `₹${(plan.price / 100).toLocaleString('en-IN')}`,
    }
  }

  /**
   * Create a new plan
   */
  public static async createPlan(data: CreatePlanPayload) {
    const slug = data.slug || data.name.toLowerCase().trim().replace(/\s+/g, '-')

    const plan = new Plan()
    plan.name = data.name
    plan.slug = slug
    plan.description = data.description || null
    plan.price = Number(data.price)
    plan.currency = data.currency || 'INR'
    plan.billingCycle = data.billingCycle || 'monthly'
    plan.durationDays = Number(data.durationDays) || 30
    plan.features = Array.isArray(data.features) ? data.features : []
    plan.isPopular = Boolean(data.isPopular)
    plan.isActive = data.isActive !== undefined ? Boolean(data.isActive) : true

    await plan.save()
    return plan
  }

  /**
   * Update an existing plan
   */
  public static async updatePlan(id: number, data: UpdatePlanPayload) {
    const plan = await Plan.findOrFail(id)

    if (data.name !== undefined) plan.name = data.name
    if (data.slug !== undefined) plan.slug = data.slug
    if (data.description !== undefined) plan.description = data.description
    if (data.price !== undefined) plan.price = Number(data.price)
    if (data.currency !== undefined) plan.currency = data.currency
    if (data.billingCycle !== undefined) plan.billingCycle = data.billingCycle
    if (data.durationDays !== undefined) plan.durationDays = Number(data.durationDays)
    if (data.features !== undefined) plan.features = Array.isArray(data.features) ? data.features : []
    if (data.isPopular !== undefined) plan.isPopular = Boolean(data.isPopular)
    if (data.isActive !== undefined) plan.isActive = Boolean(data.isActive)

    await plan.save()
    return plan
  }

  /**
   * Soft-deactivate or delete a plan
   */
  public static async deletePlan(id: number) {
    const plan = await Plan.findOrFail(id)
    plan.isActive = false
    await plan.save()
    return true
  }
}
