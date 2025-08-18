#!/usr/bin/env node

/**
 * Order Simulation Test Script
 * 
 * Manual test script to simulate a complete order flow using fixed IDs:
 * - Workspace ID: cm9hjgq9v00014qk8fsdy4ujv
 * - Customer ID: test-customer-123
 * 
 * Usage: node scripts/test-order-simulation.js
 */

const axios = require('axios')

// Fixed IDs from seed.ts
const FIXED_WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'
const FIXED_CUSTOMER_ID = 'test-customer-123'

// Configuration
const BACKEND_URL = 'http://localhost:3001'
const ADMIN_AUTH = 'Basic YWRtaW46YWRtaW4=' // admin:admin

async function testOrderSimulation() {
  console.log('🚀 Starting Order Simulation Test')
  console.log('='.repeat(50))
  console.log(`Workspace ID: ${FIXED_WORKSPACE_ID}`)
  console.log(`Customer ID: ${FIXED_CUSTOMER_ID}`)
  console.log('='.repeat(50))

  try {
    // Step 1: Generate token
    console.log('\n📋 Step 1: Generating token...')
    const tokenResponse = await axios.post(`${BACKEND_URL}/api/internal/generate-token`, {
      customerId: FIXED_CUSTOMER_ID,
      action: 'orders',
      workspaceId: FIXED_WORKSPACE_ID
    }, {
      headers: {
        'Authorization': ADMIN_AUTH,
        'Content-Type': 'application/json'
      }
    })

    if (tokenResponse.data.success) {
      const token = tokenResponse.data.token
      console.log(`✅ Token generated: ${token.substring(0, 20)}...`)
      console.log(`   Link URL: ${tokenResponse.data.linkUrl}`)
      console.log(`   Expires: ${tokenResponse.data.expiresAt}`)

      // Step 2: Access orders page
      console.log('\n🛒 Step 2: Accessing orders page...')
      const ordersResponse = await axios.get(`${BACKEND_URL}/api/orders?token=${token}`)
      
      if (ordersResponse.data.success) {
        const customer = ordersResponse.data.data.customer
        console.log(`✅ Orders page accessed successfully`)
        console.log(`   Customer: ${customer.name} (${customer.email})`)
        console.log(`   Orders count: ${ordersResponse.data.data.orders?.length || 0}`)

        // Step 3: Create order
        console.log('\n📝 Step 3: Creating order...')
        const orderData = {
          workspaceId: FIXED_WORKSPACE_ID,
          customerId: FIXED_CUSTOMER_ID,
          items: [
            {
              itemType: 'PRODUCT',
              id: 'mozzarella-fresca-001',
              name: 'Mozzarella Fresca',
              quantity: 2,
              unitPrice: 4.00
            },
            {
              itemType: 'PRODUCT',
              id: 'vino-rosso-chianti-001',
              name: 'Vino Rosso Chianti',
              quantity: 1,
              unitPrice: 12.00
            }
          ],
          notes: 'Ordine di test manuale con ID fissi'
        }

        const createOrderResponse = await axios.post(`${BACKEND_URL}/api/internal/orders`, orderData, {
          headers: {
            'Authorization': ADMIN_AUTH,
            'Content-Type': 'application/json'
          }
        })

        if (createOrderResponse.data.success) {
          const orderId = createOrderResponse.data.data.orderId
          console.log(`✅ Order created successfully`)
          console.log(`   Order ID: ${orderId}`)
          console.log(`   Message: ${createOrderResponse.data.data.message}`)

          // Step 4: Retrieve order details
          console.log('\n🔍 Step 4: Retrieving order details...')
          const getOrderResponse = await axios.get(`${BACKEND_URL}/api/internal/orders/${orderId}`, {
            headers: {
              'Authorization': ADMIN_AUTH
            },
            params: {
              workspaceId: FIXED_WORKSPACE_ID
            }
          })

          if (getOrderResponse.data.success) {
            const order = getOrderResponse.data.data
            console.log(`✅ Order retrieved successfully`)
            console.log(`   Order Code: ${order.orderCode}`)
            console.log(`   Total Amount: €${order.totalAmount}`)
            console.log(`   Status: ${order.status}`)
            console.log(`   Items: ${order.orderItems?.length || 0}`)

            if (order.orderItems) {
              console.log('\n📦 Order Items:')
              order.orderItems.forEach((item, index) => {
                const productName = item.product?.name || item.service?.name || 'Unknown'
                console.log(`   ${index + 1}. ${productName} - Qty: ${item.quantity} - Price: €${item.unitPrice}`)
              })
            }

            console.log('\n🎉 Order simulation completed successfully!')
            console.log('='.repeat(50))
            console.log('✅ All steps completed without errors')
            console.log('✅ Order flow working correctly with fixed IDs')
            console.log('='.repeat(50))

          } else {
            console.error('❌ Failed to retrieve order:', getOrderResponse.data.message)
          }

        } else {
          console.error('❌ Failed to create order:', createOrderResponse.data.message)
        }

      } else {
        console.error('❌ Failed to access orders page:', ordersResponse.data.message)
      }

    } else {
      console.error('❌ Failed to generate token:', tokenResponse.data.message)
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
    if (error.response) {
      console.error('   Status:', error.response.status)
      console.error('   Data:', error.response.data)
    }
  }
}

async function testErrorCases() {
  console.log('\n🧪 Testing Error Cases...')
  console.log('='.repeat(30))

  try {
    // Test invalid customer ID
    console.log('\n📋 Testing invalid customer ID...')
    const invalidCustomerResponse = await axios.post(`${BACKEND_URL}/api/internal/generate-token`, {
      customerId: 'invalid-customer-id',
      action: 'orders',
      workspaceId: FIXED_WORKSPACE_ID
    }, {
      headers: {
        'Authorization': ADMIN_AUTH,
        'Content-Type': 'application/json'
      }
    })

    console.log('❌ Should have failed but succeeded:', invalidCustomerResponse.data)

  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correctly rejected invalid customer ID')
    } else {
      console.error('❌ Unexpected error:', error.message)
    }
  }

  try {
    // Test invalid token
    console.log('\n🔐 Testing invalid token...')
    const invalidTokenResponse = await axios.get(`${BACKEND_URL}/api/orders?token=invalid-token`)
    console.log('❌ Should have failed but succeeded:', invalidTokenResponse.data)

  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid token')
    } else {
      console.error('❌ Unexpected error:', error.message)
    }
  }
}

// Run the tests
async function runTests() {
  await testOrderSimulation()
  await testErrorCases()
}

// Check if axios is available
try {
  require('axios')
  runTests()
} catch (error) {
  console.error('❌ Axios not found. Please install it:')
  console.error('   npm install axios')
  process.exit(1)
}
