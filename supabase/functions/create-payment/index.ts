import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { amount, donor_name, donor_email, donor_phone, donation_id, metadata } = await req.json()

    const apiKey = Deno.env.get('UDDOKTAPAY_API_KEY')
    const baseUrl = Deno.env.get('UDDOKTAPAY_BASE_URL') || 'https://sandbox.uddoktapay.com/api'
    const siteUrl = Deno.env.get('SITE_URL') || 'https://shishuful.org'

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create payment via UddoktaPay checkout-v2
    const paymentRes = await fetch(`${baseUrl}/checkout-v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': apiKey,
      },
      body: JSON.stringify({
        full_name: donor_name || 'Anonymous',
        email: donor_email || 'anonymous@example.com',
        amount: String(amount),
        metadata: {
          donation_id: donation_id || '',
          ...metadata,
        },
        redirect_url: `${siteUrl}/payment/success`,
        cancel_url: `${siteUrl}/payment/cancel`,
        webhook_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      }),
    })

    const paymentData = await paymentRes.json()

    if (!paymentRes.ok) {
      return new Response(JSON.stringify({ error: paymentData.message || 'Payment creation failed' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Store transaction in database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    await supabase.from('payment_transactions').insert({
      invoice_id: paymentData.invoice_id,
      amount: parseFloat(amount),
      donor_name,
      donor_email,
      donor_phone,
      donation_id,
      status: 'pending',
      gateway: 'uddoktapay',
      metadata: paymentData,
    })

    return new Response(JSON.stringify({
      payment_url: paymentData.payment_url,
      invoice_id: paymentData.invoice_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
