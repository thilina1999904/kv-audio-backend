import Order from '../models/order.js';
import Product from '../models/product.js';
import { isItAdmin, isItCustomer } from './userController.js';
import { sendStatusEmail } from '../utills/emailsender.js'; // Email utility එක import කරන්න

// 1. Create Order
export async function createOrder(req, res) {
    const data = req.body;

    if (req.user == null) {
        return res.status(401).json({ message: "Unauthorized Access" });
    }

    const orderInfo = {
        email: req.user.email,
        orderedItems: [],
        days: data.days,
        startingDate: new Date(data.startingDate),
        endDate: new Date(data.endDate)
    };

    const lastOrder = await Order.findOne().sort({ orderId: -1 });

    if (!lastOrder) {
        orderInfo.orderId = "ORD0001";
    } else {
        const lastOrderId = lastOrder.orderId;
        const lastOrderNumber = parseInt(lastOrderId.replace("ORD", ""));
        const currentOrderNumber = lastOrderNumber + 1;
        const formattedNumber = String(currentOrderNumber).padStart(4, '0');
        orderInfo.orderId = "ORD" + formattedNumber;
    }

    let oneDayCost = 0;

    try {
        for (let i = 0; i < data.orderedItems.length; i++) {
            const product = await Product.findOne({ key: data.orderedItems[i].key });

            if (!product) {
                return res.status(400).json({ message: `Product ${data.orderedItems[i].key} Not Found` });
            }

            if (!product.availability) {
                return res.status(400).json({ message: `Product not available: ${product.key}` });
            }

            orderInfo.orderedItems.push({
                product: {
                    key: product.key,
                    name: product.name,
                    image: product.image[0],
                    price: product.price
                },
                quantity: data.orderedItems[i].qty
            });

            oneDayCost += product.price * data.orderedItems[i].qty;
        }

        orderInfo.totalAmount = oneDayCost * data.days;

        const newOrder = new Order(orderInfo);
        const result = await newOrder.save();

        res.json({
            message: "Order Created Successfully",
            order: result
        });

    } catch (e) {
        console.error("Order process error:", e);
        res.status(500).json({
            message: "Order Creation Failed",
            error: e.message
        });
    }
}

// 2. Get Quote (Before ordering)
export async function getQuote(req, res) {
    try {
        const { orderedItems, days } = req.body;

        if (!Array.isArray(orderedItems) || orderedItems.length === 0) {
            return res.status(400).json({ message: "orderedItems must be a non-empty array" });
        }

        if (!days || days < 1) {
            return res.status(400).json({ message: "Invalid number of days" });
        }

        let oneDayCost = 0;

        for (const item of orderedItems) {
            const product = await Product.findOne({ key: item.key });

            if (!product) {
                return res.status(400).json({ message: `Product ${item.key} Not Found` });
            }

            oneDayCost += product.price * item.qty;
        }

        res.status(200).json({
            message: "Quote calculated successfully",
            total: oneDayCost * days
        });

    } catch (e) {
        res.status(500).json({ message: "Order Quote Failed", error: e.message });
    }
}

// 3. Get Orders (Admin and Customer)
export async function getOrders(req, res) {
    if (isItCustomer(req)) {
        try {
            const orders = await Order.find({ email: req.user.email });
            res.json(orders);
        } catch (e) {
            res.status(500).json({ error: "Failed to show orders" });
        }
    } else if (isItAdmin(req)) {
        try {
            const orders = await Order.find();
            res.json(orders);
        } catch (e) {
            res.status(500).json({ error: "Failed to show all orders" });
        }
    } else {
        res.status(404).json({ error: "Unauthorized Access" });
    }
}

// 4. Approve Order (With Email Notification)
export async function approveOrder(req, res) {
    const orderId = req.params.orderId;

    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Unauthorized - Admin access required" });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.isApproved) {
            return res.status(400).json({ error: "Order is already approved" });
        }

        order.isApproved = true;
        order.isDeclined = false; // Reset decline if approving
        await order.save();

        // Customer හට Email එක යැවීම
        await sendStatusEmail(order.email, "Approved", order);

        res.status(200).json({ 
            message: "Order approved and notification email sent",
            order: order 
        });

    } catch (error) {
        console.error("Error approving order:", error);
        res.status(500).json({ error: "Failed to approve order" });
    }
}

// 5. Decline Order (With Email Notification)
export async function declineOrder(req, res) {
    const { orderId } = req.params;

    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Unauthorized - Admin access required" });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.isApproved) {
            return res.status(400).json({ message: "Approved order cannot be declined" });
        }

        order.isDeclined = true;
        order.isApproved = false;
        await order.save();

        // Customer හට Email එක යැවීම
        await sendStatusEmail(order.email, "Declined", order);

        res.status(200).json({ message: "Order declined and notification email sent" });

    } catch (err) {
        console.error("Error declining order:", err);
        res.status(500).json({ message: "Failed to decline order" });
    }
}