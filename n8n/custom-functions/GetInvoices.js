/**
 * 🧾 GET INVOICES - N8N Custom Function
 * 
 * DESCRIPTION:
 * Retrieves customer invoices and generates secure access link
 * 
 * PARAMETERS:
 * - customerId: string (required)
 * - workspaceId: string (required)
 * - customerPhone: string (required)
 * - sessionToken: string (required)
 * 
 * RETURNS:
 * - invoiceListUrl: secure link to view invoices
 * - totalInvoices: number of invoices found
 * - summary: payment summary
 * - customerName: customer name
 * 
 * USAGE:
 * GetInvoices("customer-123", "workspace-456", "+393123456789", "session-token-abc")
 */

async function GetInvoices(customerId, workspaceId, customerPhone, sessionToken) {
  try {
    console.log(`[N8N GetInvoices] 🧾 Getting invoices for customer ${customerId}`)
    
    // Validate required parameters
    if (!customerId || !workspaceId || !customerPhone || !sessionToken) {
      throw new Error('Missing required parameters: customerId, workspaceId, customerPhone, sessionToken')
    }

    // 🔐 Step 1: Validate session token
    const tokenValidation = await fetch('http://backend:3001/api/internal/validate-secure-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: sessionToken,
        type: 'session',
        workspaceId: workspaceId
      })
    })

    const tokenResult = await tokenValidation.json()
    
    if (!tokenResult.valid) {
      console.error(`[N8N GetInvoices] ❌ Invalid session token`)
      throw new Error('Invalid or expired session token')
    }

    console.log(`[N8N GetInvoices] ✅ Session token validated`)

    // 🧾 Step 2: Generate invoice access token
    const invoiceTokenResponse = await fetch('http://backend:3001/api/internal/generate-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'invoice',
        customerId: customerId,
        workspaceId: workspaceId,
        metadata: {
          purpose: 'invoice_access',
          requestedBy: 'n8n_getinvoices',
          customerPhone: customerPhone,
          generatedAt: new Date().toISOString()
        }
      })
    })

    const invoiceTokenData = await invoiceTokenResponse.json()
    
    if (!invoiceTokenData.success) {
      console.error(`[N8N GetInvoices] ❌ Failed to generate invoice token:`, invoiceTokenData.error)
      throw new Error(`Failed to generate invoice access token: ${invoiceTokenData.error}`)
    }

    const invoiceToken = invoiceTokenData.token
    const invoiceUrl = invoiceTokenData.linkUrl

    console.log(`[N8N GetInvoices] 🔑 Generated invoice token: ${invoiceToken.substring(0, 12)}...`)

    // 📊 Step 3: Get invoice summary (optional - for immediate stats)
    try {
      const invoiceDataResponse = await fetch(`http://backend:3001/api/internal/invoices/${invoiceToken}`)
      const invoiceData = await invoiceDataResponse.json()
      
      if (invoiceData.success) {
        const summary = invoiceData.data.summary
        const customer = invoiceData.data.customer
        
        console.log(`[N8N GetInvoices] 📋 Found ${summary.totalInvoices} invoices for ${customer.name}`)
        
        return {
          success: true,
          invoiceListUrl: invoiceUrl,
          totalInvoices: summary.totalInvoices,
          totalPaid: summary.totalPaid,
          totalPending: summary.totalPending,
          totalOverdue: summary.totalOverdue,
          customerName: customer.name,
          customerEmail: customer.email,
          message: `Ecco le tue fatture! Ho trovato ${summary.totalInvoices} fatture. Clicca il link per visualizzarle.`,
          tokenExpiry: invoiceTokenData.expiresAt
        }
      }
    } catch (summaryError) {
      console.warn(`[N8N GetInvoices] ⚠️ Could not fetch invoice summary, but link is valid:`, summaryError.message)
    }

    // Return minimal response if summary fetch failed
    return {
      success: true,
      invoiceListUrl: invoiceUrl,
      message: "Ecco il link per visualizzare le tue fatture elettroniche. Il link è valido per 24 ore.",
      tokenExpiry: invoiceTokenData.expiresAt
    }

  } catch (error) {
    console.error(`[N8N GetInvoices] ❌ Error:`, error.message)
    
    return {
      success: false,
      error: error.message,
      message: "Ops! Non riesco al momento a recuperare le tue fatture. Riprova più tardi o contatta il supporto."
    }
  }
}

// Export for N8N
return GetInvoices(customerId, workspaceId, customerPhone, sessionToken)