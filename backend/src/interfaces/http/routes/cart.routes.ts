import { Router } from "express"
import { asyncMiddleware } from "../../../middlewares/async.middleware"
import { CartController } from "../controllers/cart.controller"

const router = Router()
const cartController = new CartController()

/**
 * @swagger
 * /api/cart/generate-token:
 *   post:
 *     summary: Generate a new cart token for public access
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: string
 *                 description: Customer ID
 *               workspaceId:
 *                 type: string
 *                 description: Workspace ID
 *               expiresInMinutes:
 *                 type: number
 *                 description: Token expiry in minutes (default 60)
 *     responses:
 *       200:
 *         description: Cart token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 expiresAt:
 *                   type: string
 *                 cartId:
 *                   type: string
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Server error
 */
router.post(
  "/generate-token",
  asyncMiddleware(cartController.generateToken.bind(cartController))
)

/**
 * @swagger
 * /api/cart/token:
 *   get:
 *     summary: Validate cart token and get cart data (TOKEN-ONLY)
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart token
 *     responses:
 *       200:
 *         description: Token validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 customer:
 *                   type: object
 *                 cartData:
 *                   type: object
 *                 workspaceId:
 *                   type: string
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */
router.get(
  "/token",
  asyncMiddleware(cartController.validateToken.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}:
 *   get:
 *     summary: Get cart contents by token
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart token
 *     responses:
 *       200:
 *         description: Cart data retrieved successfully
 *       400:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
router.get(
  "/:token",
  asyncMiddleware(cartController.getCartByToken.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}/items:
 *   post:
 *     summary: Add item to cart by token
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item added successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post(
  "/:token/items",
  asyncMiddleware(cartController.addItemToCart.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}/items/{itemId}:
 *   put:
 *     summary: Update cart item by token
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.put(
  "/:token/items/:itemId",
  asyncMiddleware(cartController.updateCartItem.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}/items/{itemId}:
 *   delete:
 *     summary: Remove item from cart by token
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.delete(
  "/:token/items/:itemId",
  asyncMiddleware(cartController.removeCartItem.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}/checkout:
 *   post:
 *     summary: Checkout cart by token
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout completed successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post(
  "/:token/checkout",
  asyncMiddleware(cartController.checkoutByToken.bind(cartController))
)

export { router as cartRouter }