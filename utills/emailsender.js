import nodemailer from 'nodemailer';

export async function sendStatusEmail(customerEmail, status, order) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const isApproved = status === 'Approved';
        
        const mailOptions = {
            from: `"KV AUDIO" <${process.env.EMAIL_USER}>`,
            to: customerEmail,
            subject: `Booking ${status} - Order #${order.orderId}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: ${isApproved ? '#27ae60' : '#e74c3c'};">Booking ${status}</h2>
                    <p>Hello,</p>
                    <p>Your booking <b>#${order.orderId}</b> has been <b>${status.toLowerCase()}</b>.</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;"><b>Total Amount:</b> LKR ${order.totalAmount.toLocaleString()}</p>
                        <p style="margin: 5px 0 0 0;"><b>Dates:</b> ${new Date(order.startingDate).toLocaleDateString()} to ${new Date(order.endDate).toLocaleDateString()}</p>
                    </div>
                    <p>Thank you for choosing KV AUDIO!</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${status} to ${customerEmail}`);
    } catch (error) {
        console.error("Nodemailer Error:", error);
    }
}