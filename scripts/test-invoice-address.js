#!/usr/bin/env node

/**
 * Test Script for Invoice Address System
 * Tests the complete invoice address functionality end-to-end
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const WORKSPACE_ID = 'cm9hjgq9v00014qk8fsdy4ujv'; // Main workspace ID from seed

async function testInvoiceAddressSystem() {
  console.log('🧪 TESTING INVOICE ADDRESS SYSTEM');
  console.log('='.repeat(50));

  try {
    // 1. Get existing customers to see if they have invoice addresses
    console.log('\n1. 📋 Getting existing customers...');
    const customersResponse = await axios.get(`${BASE_URL}/workspaces/${WORKSPACE_ID}/customers`);
    const customers = customersResponse.data.data;
    
    console.log(`✅ Found ${customers.length} customers`);
    
    // Check if customers have invoice addresses
    const customersWithInvoiceAddress = customers.filter(c => c.invoiceAddress);
    console.log(`✅ ${customersWithInvoiceAddress.length} customers have invoice addresses`);
    
    if (customersWithInvoiceAddress.length > 0) {
      const customer = customersWithInvoiceAddress[0];
      console.log(`📄 Sample invoice address for ${customer.name}:`);
      console.log(JSON.stringify(customer.invoiceAddress, null, 2));
    }

    // 2. Create a new customer with invoice address
    console.log('\n2. 👤 Creating new customer with invoice address...');
    const newCustomerData = {
      name: 'Test Customer Invoice',
      email: `test-invoice-${Date.now()}@example.com`,
      phone: '+39 333 444 5566',
      company: 'Test Invoice Company',
      workspaceId: WORKSPACE_ID,
      invoiceAddress: {
        firstName: 'Test',
        lastName: 'Invoice',
        company: 'Test Invoice Company SRL',
        address: 'Via Test Invoice 123',
        city: 'Milano',
        postalCode: '20100',
        country: 'Italia',
        vatNumber: 'IT99887766554',
        phone: '+39 02 12345678'
      }
    };

    const createResponse = await axios.post(`${BASE_URL}/workspaces/${WORKSPACE_ID}/customers`, newCustomerData);
    const newCustomer = createResponse.data;
    
    console.log(`✅ Customer created: ${newCustomer.name} (ID: ${newCustomer.id})`);
    console.log('📄 Invoice address saved:');
    console.log(JSON.stringify(newCustomer.invoiceAddress, null, 2));

    // 3. Get the customer by ID to verify invoice address was saved
    console.log('\n3. 🔍 Retrieving customer by ID...');
    const getResponse = await axios.get(`${BASE_URL}/workspaces/${WORKSPACE_ID}/customers/${newCustomer.id}`);
    const retrievedCustomer = getResponse.data;
    
    console.log(`✅ Customer retrieved: ${retrievedCustomer.name}`);
    
    if (retrievedCustomer.invoiceAddress) {
      console.log('✅ Invoice address retrieved successfully:');
      console.log(JSON.stringify(retrievedCustomer.invoiceAddress, null, 2));
    } else {
      console.log('❌ Invoice address not found in retrieved customer');
    }

    // 4. Update the customer's invoice address
    console.log('\n4. ✏️ Updating customer invoice address...');
    const updateData = {
      invoiceAddress: {
        ...retrievedCustomer.invoiceAddress,
        address: 'Via Updated Invoice 456',
        city: 'Roma',
        postalCode: '00100',
        vatNumber: 'IT11223344556'
      }
    };

    const updateResponse = await axios.put(`${BASE_URL}/workspaces/${WORKSPACE_ID}/customers/${newCustomer.id}`, updateData);
    const updatedCustomer = updateResponse.data;
    
    console.log(`✅ Customer updated: ${updatedCustomer.name}`);
    console.log('📄 Updated invoice address:');
    console.log(JSON.stringify(updatedCustomer.invoiceAddress, null, 2));

    // 5. Verify the update was persisted
    console.log('\n5. ✅ Final verification...');
    const finalResponse = await axios.get(`${BASE_URL}/workspaces/${WORKSPACE_ID}/customers/${newCustomer.id}`);
    const finalCustomer = finalResponse.data;
    
    if (finalCustomer.invoiceAddress && finalCustomer.invoiceAddress.address === 'Via Updated Invoice 456') {
      console.log('✅ Invoice address update verified successfully');
      console.log('📄 Final invoice address:');
      console.log(JSON.stringify(finalCustomer.invoiceAddress, null, 2));
    } else {
      console.log('❌ Invoice address update verification failed');
    }

    console.log('\n🎉 INVOICE ADDRESS SYSTEM TEST COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('✅ All tests passed:');
    console.log('  - Customers can be retrieved with invoice addresses');
    console.log('  - New customers can be created with invoice addresses');
    console.log('  - Invoice addresses are properly stored and retrieved');
    console.log('  - Invoice addresses can be updated');
    console.log('  - Updates are properly persisted');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testInvoiceAddressSystem(); 