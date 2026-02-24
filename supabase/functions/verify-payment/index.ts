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
    const { invoice_id } = await req.json()

    const apiKey = Deno.env.get('UDDOKTAPAY_API_KEY')
    const baseUrl = Deno.env.get('UDDOKTAPAY_BASE_URL') || 'https://sandbox.uddoktapay.com/api'

    if (!apiKey || !invoice_id) {
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const verifyRes = await fetch(`${baseUrl}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': apiKey,
      },
      body: JSON.stringify({ invoice_id }),
    })

    const verifyData = await verifyRes.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const status = verifyData.status === 'COMPLETED' ? 'completed' : 
                   verifyData.status === 'PENDING' ? 'pending' : 'failed'

    // Update transaction
    await supabase.from('payment_transactions')
      .update({ status, payment_method: verifyData.payment_method, verified_at: new Date().toISOString(), verify_response: verifyData })
      .eq('invoice_id', invoice_id)

    // If completed, update donation status
    if (status === 'completed') {
      const { data: txn } = await supabase.from('payment_transactions')
        .select('donation_id').eq('invoice_id', invoice_id).maybeSingle()
      if (txn?.donation_id) {
        await supabase.from('donations').update({ status: 'completed' }).eq('id', txn.donation_id)
      }
    }

    return new Response(JSON.stringify({ status, data: verifyData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
