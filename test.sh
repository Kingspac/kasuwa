#!/data/data/com.termux/files/usr/bin/bash
API=localhost:5000/api
js() { node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log($1)"; }

echo "1) categories:"
curl -s $API/products/categories; echo

EMAIL="buyer$RANDOM@example.com"
TOKEN=$(curl -s -X POST $API/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Test Buyer","email":"'"$EMAIL"'","password":"123456"}' | js "d.token")
echo "2) token length: ${#TOKEN} (expect about 171)"

PID=$(curl -s "$API/products?search=bracelet" | js "d.products[0]._id")
BEFORE=$(curl -s $API/products/$PID | js "d.stock")
echo "3) bracelet stock before: $BEFORE"

echo "4) order (expect subtotal 7000, shipping 2500, total 9500):"
curl -s -X POST $API/orders -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"items":[{"productId":"'"$PID"'","qty":2}],"shipping":{"fullName":"Test Buyer","phone":"08012345678","address":"12 Market Road","city":"Kaduna","state":"Kaduna"},"paymentMethod":"cod"}' \
  | js "d.message || 'subtotal '+d.subtotal+', shipping '+d.shippingFee+', total '+d.total"

AFTER=$(curl -s $API/products/$PID | js "d.stock")
echo "5) bracelet stock after: $AFTER (expect $((BEFORE-2)))"

echo "6) customer on admin route (expect: Admins only):"
curl -s $API/orders -H "Authorization: Bearer $TOKEN" | js "d.message"

echo "7) admin login role (expect: admin):"
curl -s -X POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@kasuwa.test","password":"Admin12345"}' | js "d.user ? d.user.role : d.message"
