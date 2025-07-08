#!/bin/bash

echo "🔧 Fixing PaymentStatus references in backend..."

# Remove PaymentStatus from order controller
echo "Fixing order controller..."
sed -i '' 's/paymentStatus?: PaymentStatus;/\/\/ Payment status removed/g' backend/src/interfaces/http/controllers/order.controller.ts
sed -i '' 's/PaymentStatus\./COMPLETED/g' backend/src/interfaces/http/controllers/order.controller.ts
sed -i '' '/updatePaymentStatus/d' backend/src/interfaces/http/controllers/order.controller.ts

# Remove PaymentStatus from order repository
echo "Fixing order repository..."
sed -i '' '/updatePaymentStatus/,/^  }/d' backend/src/repositories/order.repository.ts
sed -i '' 's/paymentStatus: PaymentStatus\.COMPLETED/\/\/ Payment status removed/g' backend/src/repositories/order.repository.ts
sed -i '' 's/where\.paymentStatus = filters\.paymentStatus;/\/\/ Payment status removed/g' backend/src/repositories/order.repository.ts
sed -i '' 's/paymentStatus: data\.paymentStatus,/\/\/ Payment status removed/g' backend/src/repositories/order.repository.ts

echo "✅ PaymentStatus references fixed!" 