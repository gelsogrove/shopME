import { Router } from "express"
import { asyncMiddleware } from "../../../middlewares/async.middleware"
import { CartController } from "../controllers/cart.controller"

const router = Router()
const cartController = new CartController()

/**
 * @swagger
 * /api/cart/{token}:
 *   get:
 *     summary: Get cart data by token
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
 *       404:
 *         description: Cart not found
 */
router.get(
  "/:token",
  asyncMiddleware(cartController.getCartByToken.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}/add:
 *   post:
 *     summary: Add product to cart
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
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       404:
 *         description: Cart or product not found
 */
router.post(
  "/:token/add",
  asyncMiddleware(cartController.addItemToCart.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}/remove:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The cart token
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID to remove
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 *       404:
 *         description: Cart or product not found
 */
router.delete(
  "/:token/remove",
  asyncMiddleware(cartController.removeCartItem.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}/update:
 *   put:
 *     summary: Update cart item quantity
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
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       404:
 *         description: Cart or product not found
 */
router.put(
  "/:token/update",
  asyncMiddleware(cartController.updateCartItem.bind(cartController))
)

/**
 * @swagger
 * /api/cart/{token}/checkout:
 *   post:
 *     summary: Checkout cart and create order
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
 *         description: Order created successfully
 *       404:
 *         description: Cart not found
 */
router.post(
  "/:token/checkout",
  asyncMiddleware(cartController.checkoutByToken.bind(cartController))
)

export { router as cartRouter }
