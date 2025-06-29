import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@12.18.0'

// Inicializa o cliente Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Cria um cliente Supabase com a chave de serviço para ter acesso admin
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
)

// Webhook secret para validar requisições do Stripe
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

serve(async (req: Request) => {
  try {
    if (req.method === 'POST') {
      const body = await req.text()
      const signature = req.headers.get('stripe-signature')

      if (!signature) {
        return new Response(
          JSON.stringify({ error: 'Assinatura do webhook não fornecida' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Verificar a assinatura do webhook
      let event: Stripe.Event
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return new Response(
          JSON.stringify({ error: `Falha na verificação da assinatura: ${err.message}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Lidar com diferentes eventos do Stripe
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
          break
          
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
          
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
          
        case 'invoice.paid':
          await handleInvoicePaid(event.data.object as Stripe.Invoice)
          break
          
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break
          
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return new Response(
        JSON.stringify({ received: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erro no webhook do Stripe:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

// Handler para evento de checkout.session.completed
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout.session.completed:', session.id)
  
  // Garantir que temos os metadados necessários
  if (!session.metadata?.user_id || !session.metadata?.plan_id) {
    console.error('Metadados necessários não encontrados na sessão:', session.id)
    return
  }

  const userId = session.metadata.user_id
  const planId = session.metadata.plan_id
  const customerId = session.customer as string
  
  try {
    // Verificar se o usuário já tem uma assinatura
    const { data: existingSubscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      
    // Se a sessão de checkout for para uma assinatura
    if (session.mode === 'subscription') {
      // A assinatura real será criada/atualizada quando recebermos o evento customer.subscription.created/updated
      console.log(`Aguardando evento de assinatura para o cliente ${customerId}`)
      
      // Se não tiver uma assinatura, criar uma com status 'processing'
      if (!existingSubscription) {
        await supabaseAdmin
          .from('user_subscriptions')
          .insert({
            user_id: userId,
            plan_id: planId,
            status: 'active', // Temporariamente ativo, será atualizado com o evento da assinatura
            stripe_subscription_id: null // Será atualizado com o evento da assinatura
          })
      } else {
        // Atualizar a assinatura existente
        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            plan_id: planId,
            status: 'active', // Temporariamente ativo, será atualizado com o evento da assinatura
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
      }
    }
    
    // Registrar a ordem no banco de dados
    if (session.payment_intent) {
      await supabaseAdmin
        .from('stripe_orders')
        .insert({
          id: Date.now(), // ID gerado localmente
          checkout_session_id: session.id,
          payment_intent_id: session.payment_intent as string,
          customer_id: customerId,
          amount_subtotal: session.amount_subtotal || 0,
          amount_total: session.amount_total || 0,
          currency: session.currency || 'brl',
          payment_status: session.payment_status || 'unpaid',
          status: 'completed'
        })
    }
    
    // Registrar no log de auditoria
    await supabaseAdmin.from('audit_logs').insert({
      action: 'stripe_checkout_completed',
      target_user_id: userId,
      details: { 
        session_id: session.id,
        plan_id: planId,
        customer_id: customerId
      }
    })
      
    console.log(`Checkout session ${session.id} processada com sucesso`)
  } catch (error) {
    console.error('Erro ao processar checkout.session.completed:', error)
  }
}

// Handler para evento de customer.subscription.created ou customer.subscription.updated
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`Processing subscription update: ${subscription.id}`)
  
  try {
    // Buscar o cliente do Stripe
    const { data: customerData } = await supabaseAdmin
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', subscription.customer as string)
      .single()
      
    if (!customerData) {
      console.error(`Cliente não encontrado para a assinatura ${subscription.id}`)
      return
    }
    
    const userId = customerData.user_id
    
    // Obter detalhes de pagamento, se disponível
    let paymentMethodBrand = null
    let paymentMethodLast4 = null
    
    if (subscription.default_payment_method) {
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(
          subscription.default_payment_method as string
        )
        paymentMethodBrand = paymentMethod.card?.brand || null
        paymentMethodLast4 = paymentMethod.card?.last4 || null
      } catch (error) {
        console.error('Erro ao buscar método de pagamento:', error)
      }
    }
    
    // Atualizar a tabela stripe_subscriptions
    const { error: stripeSubscriptionError } = await supabaseAdmin
      .from('stripe_subscriptions')
      .upsert({
        id: Date.now(),
        customer_id: subscription.customer as string,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0]?.price.id || null,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        payment_method_brand: paymentMethodBrand,
        payment_method_last4: paymentMethodLast4,
        status: subscription.status
      }, { onConflict: 'customer_id' })
      
    if (stripeSubscriptionError) {
      console.error('Erro ao atualizar stripe_subscriptions:', stripeSubscriptionError)
    }
    
    // Buscar o plano correspondente ao price_id do Stripe
    const priceId = subscription.items.data[0]?.price.id
    if (!priceId) {
      console.error('Preço não encontrado na assinatura:', subscription.id)
      return
    }
    
    const { data: planData, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('id')
      .eq('stripe_price_id', priceId)
      .single()
      
    if (planError || !planData) {
      console.error('Plano não encontrado para o price_id:', priceId)
      return
    }
    
    // Mapear status do Stripe para status do nosso sistema
    let systemStatus = 'active'
    if (['incomplete', 'incomplete_expired', 'past_due', 'canceled', 'unpaid'].includes(subscription.status)) {
      systemStatus = subscription.status
    }
    
    // Atualizar a tabela user_subscriptions
    const { error: userSubscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        plan_id: planData.id,
        stripe_subscription_id: subscription.id,
        status: systemStatus,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      
    if (userSubscriptionError) {
      console.error('Erro ao atualizar user_subscriptions:', userSubscriptionError)
    }
    
    // Registrar no log de auditoria
    await supabaseAdmin.from('audit_logs').insert({
      action: 'stripe_subscription_updated',
      target_user_id: userId,
      details: {
        subscription_id: subscription.id,
        status: subscription.status,
        plan_id: planData.id
      }
    })
    
    console.log(`Assinatura ${subscription.id} atualizada com sucesso para o usuário ${userId}`)
  } catch (error) {
    console.error('Erro ao processar atualização de assinatura:', error)
  }
}

// Handler para evento de customer.subscription.deleted
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`Processing subscription deletion: ${subscription.id}`)
  
  try {
    // Buscar o cliente do Stripe
    const { data: customerData } = await supabaseAdmin
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', subscription.customer as string)
      .single()
      
    if (!customerData) {
      console.error(`Cliente não encontrado para a assinatura ${subscription.id}`)
      return
    }
    
    const userId = customerData.user_id
    
    // Atualizar a tabela stripe_subscriptions
    await supabaseAdmin
      .from('stripe_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('subscription_id', subscription.id)
    
    // Atualizar a tabela user_subscriptions
    await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('stripe_subscription_id', subscription.id)
    
    // Registrar no log de auditoria
    await supabaseAdmin.from('audit_logs').insert({
      action: 'stripe_subscription_canceled',
      target_user_id: userId,
      details: {
        subscription_id: subscription.id
      }
    })
    
    console.log(`Assinatura ${subscription.id} cancelada com sucesso para o usuário ${userId}`)
  } catch (error) {
    console.error('Erro ao processar cancelamento de assinatura:', error)
  }
}

// Handler para evento de invoice.paid
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`Processing paid invoice: ${invoice.id}`)
  
  try {
    const customerId = invoice.customer as string
    
    // Buscar o usuário associado ao cliente
    const { data: customerData } = await supabaseAdmin
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .single()
      
    if (!customerData) {
      console.error(`Cliente não encontrado para a fatura ${invoice.id}`)
      return
    }
    
    const userId = customerData.user_id
    
    // Se for uma fatura de assinatura, atualizar o status da assinatura
    if (invoice.subscription) {
      const subscriptionId = invoice.subscription as string
      
      // Atualizar stripe_subscriptions
      await supabaseAdmin
        .from('stripe_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId)
      
      // Atualizar user_subscriptions
      await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId)
    }
    
    // Registrar no log de auditoria
    await supabaseAdmin.from('audit_logs').insert({
      action: 'stripe_payment_succeeded',
      target_user_id: userId,
      details: {
        invoice_id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency
      }
    })
    
    console.log(`Fatura ${invoice.id} processada com sucesso para o usuário ${userId}`)
  } catch (error) {
    console.error('Erro ao processar fatura paga:', error)
  }
}

// Handler para evento de invoice.payment_failed
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`Processing failed invoice: ${invoice.id}`)
  
  try {
    const customerId = invoice.customer as string
    
    // Buscar o usuário associado ao cliente
    const { data: customerData } = await supabaseAdmin
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .single()
      
    if (!customerData) {
      console.error(`Cliente não encontrado para a fatura ${invoice.id}`)
      return
    }
    
    const userId = customerData.user_id
    
    // Se for uma fatura de assinatura, atualizar o status da assinatura
    if (invoice.subscription) {
      const subscriptionId = invoice.subscription as string
      
      // Atualizar stripe_subscriptions
      await supabaseAdmin
        .from('stripe_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('subscription_id', subscriptionId)
      
      // Atualizar user_subscriptions
      await supabaseAdmin
        .from('user_subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', subscriptionId)
    }
    
    // Registrar no log de auditoria
    await supabaseAdmin.from('audit_logs').insert({
      action: 'stripe_payment_failed',
      target_user_id: userId,
      details: {
        invoice_id: invoice.id,
        attempt_count: invoice.attempt_count,
        next_payment_attempt: invoice.next_payment_attempt
      }
    })
    
    console.log(`Falha de pagamento da fatura ${invoice.id} processada para o usuário ${userId}`)
  } catch (error) {
    console.error('Erro ao processar falha de pagamento:', error)
  }
}