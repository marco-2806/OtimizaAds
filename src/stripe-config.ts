// Stripe product configuration
export const STRIPE_PRODUCTS = {
  freeTrial: {
    name: 'Gratuito',
    description: 'Plano gratuito com recursos limitados',
    price_monthly: 0,
    features: {
      generations: 5,
      diagnostics: 3,
      funnel_analysis: 1,
      models: 'basic',
      support: 'email'
    }
  },
  basicPlan: {
    id: 'prod_SOXxuGXLhfwrHs',
    priceId: 'price_1RaPvxAK3IULnjbOyRSzqEIO',
    name: 'Plano Básico',
    description: 'Assinatura Plano Básico OtimizaAds',
    mode: 'subscription' as const, 
    price_monthly: 2990,
    features: {
      generations: 100,
      diagnostics: 50,
      funnel_analysis: 10,
      models: 'basic',
      support: 'email',
      optimization: true,
      performance_analysis: true
    }
  },
  intermediatePlan: {
    id: 'prod_SOXxvHYMigxsSt',
    priceId: 'price_1RaPwzAK3IULnjbOzTUzqFJP',
    name: 'Plano Intermediário',
    description: 'Assinatura Plano Intermediário OtimizaAds',
    mode: 'subscription' as const,
    price_monthly: 5990,
    features: {
      generations: 250,
      diagnostics: 100,
      funnel_analysis: 30,
      models: 'all',
      support: 'priority',
      optimization: true,
      performance_analysis: true,
      competitor_analysis: true,
      premium_templates: true,
      detailed_reports: true,
      priority_support: true
    }
  },
  premiumPlan: {
    id: 'prod_SOXxwIZNjhytTu',
    priceId: 'price_1RaPxzAK3IULnjbP0UVzrGKQ',
    name: 'Plano Premium',
    description: 'Assinatura Plano Premium OtimizaAds',
    mode: 'subscription' as const,
    price_monthly: 9990,
    features: {
      generations: -1, // -1 significa ilimitado
      diagnostics: -1,
      funnel_analysis: -1,
      models: 'all',
      support: 'dedicated',
      optimization: true,
      performance_analysis: true,
      competitor_analysis: true,
      premium_templates: true,
      detailed_reports: true,
      priority_support: true,
      custom_ai: true,
      multiple_accounts: true,
      api_access: true,
      dedicated_support: true,
      custom_training: true
    }
  },
};

// URLs for checkout success and cancel
const CHECKOUT_SUCCESS_URL = `${window.location.origin}/app/assinatura?success=true`;
const CHECKOUT_CANCEL_URL = `${window.location.origin}/app/assinatura?canceled=true`;

// Stripe Elements configuration
const STRIPE_ELEMENTS_OPTIONS = {
  locale: 'pt-BR',
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    }
  ],
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#0070f3',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      spacingUnit: '4px',
      borderRadius: '4px',
    },
  },
};

export { STRIPE_ELEMENTS_OPTIONS };