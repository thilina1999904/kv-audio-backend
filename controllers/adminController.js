import User from "../models/user.js";
import Order from "../models/order.js";
import Product from "../models/product.js";

export async function getAdminStats(req, res) {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalItems = await Product.countDocuments();

        
        const revenueResult = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalAmount" } 
                }
            }
        ]);

        const revenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        res.json({
            totalUsers,
            totalOrders,
            totalItems,
            revenue
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Dashboard stats failed" });
    }
}