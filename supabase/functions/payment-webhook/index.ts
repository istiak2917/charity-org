import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    // Validate webhook origin
    const apiKeyHeader = req.headers.get('RT-UDDOKTAPAY-API-KEY')
    const expectedKey = Deno.env.get('UDDOKTAPAY_API_KEY')

    if (!apiKeyHeader || apiKeyHeader !== expectedKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const body = await req.json()
    const { invoice_id, status, payment_method, amount } = body

    if (!invoice_id) {
      return new Response(JSON.stringify({ error: 'Missing invoice_id' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const txnStatus = status === 'COMPLETED' ? 'completed' : 
                      status === 'PENDING' ? 'pending' : 'failed'

    // Update payment transaction
    await supabase.from('payment_transactions').update({
      status: txnStatus,
      payment_method,
      webhook_received_at: new Date().toISOString(),
      webhook_payload: body,
    }).eq('invoice_id', invoice_id)

    // Update linked donation
    if (txnStatus === 'completed') {
      const { data: txn } = await supabase.from('payment_transactions')
        .select('donation_id').eq('invoice_id', invoice_id).maybeSingle()
      if (txn?.donation_id) {
        await supabase.from('donations').update({ status: 'completed' }).eq('id', txn.donation_id)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
