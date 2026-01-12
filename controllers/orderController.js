import Order from '../models/order.js';
import Product from '../models/product.js';

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
    // -----------------------------------------

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