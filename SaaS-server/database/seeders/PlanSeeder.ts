import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Plan from 'App/Models/Plan'

export default class PlanSeeder extends BaseSeeder {
  public async run() {
    await Plan.updateOrCreateMany('slug', [
      {
        name: 'Starter',
        slug: 'starter-monthly',
        description: 'Ideal for freelancers and small teams getting started.',
        price: 49900, // ₹499 in paise
        currency: 'INR',
        billingCycle: 'monthly',
        durationDays: 30,
        features: [
          'Up to 5 Projects',
          '3 Developers / Team Members',
          'Basic Invoice Generator',
          'Email Support',
        ],
        isPopular: false,
        isActive: true,
      },
      {
        name: 'Pro',
        slug: 'pro-monthly',
        description: 'For growing businesses needing unlimited capability & priority features.',
        price: 149900, // ₹1,499 in paise
        currency: 'INR',
        billingCycle: 'monthly',
        durationDays: 30,
        features: [
          'Unlimited Projects',
          'Unlimited Developers / Team Members',
          'Custom Invoice Branding & PDF',
          'Task Comments & Priority Support',
          'Advanced Reports & Analytics',
        ],
        isPopular: true,
        isActive: true,
      },
    ])
  }
}
