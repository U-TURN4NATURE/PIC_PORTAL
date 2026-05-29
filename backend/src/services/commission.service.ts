import prisma from '../config/database';
import { sendCommissionEmail } from './email.service';
import { OrderStatus } from '@prisma/client';

// ─────────────────────────────────────────────────
// Commission Calculation Logic
// ─────────────────────────────────────────────────

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE || '5.0'); // 5% default

export const calculateCommission = (orderAmount: number): number => {
  return (orderAmount * COMMISSION_RATE) / 100;
};

/**
 * Handle new order paid webhook from Shopify
 */
export const processOrderPaid = async (orderData: any) => {
  const shopifyOrderId = String(orderData.id);
  
  // Check if order already processed
  const existingOrder = await prisma.order.findUnique({ where: { shopifyOrderId } });
  if (existingOrder && existingOrder.status === OrderStatus.PAID) {
    return { message: 'Order already processed' };
  }

  // 1. Detect Referral Code
  let referralCode = null;

  // Check discount codes first (Method 2)
  if (orderData.discount_codes && orderData.discount_codes.length > 0) {
    referralCode = orderData.discount_codes[0].code;
  }
  
  // Check order attributes (cart notes) if no discount code (Method 1)
  if (!referralCode && orderData.note_attributes && orderData.note_attributes.length > 0) {
    const refAttribute = orderData.note_attributes.find((attr: any) => attr.name === 'referral_code');
    if (refAttribute) {
      referralCode = refAttribute.value;
    }
  }

  const orderAmount = parseFloat(orderData.total_price);
  let commissionAmount = 0;
  let picId = null;
  let pic = null;

  // 2. Find PIC and Calculate Commission
  if (referralCode) {
    pic = await prisma.pICPartner.findUnique({ where: { referralCode } });
    if (pic) {
      picId = pic.id;
      commissionAmount = calculateCommission(orderAmount);
    }
  }

  // 3. Save Order and Update Wallet in Transaction
  await prisma.$transaction(async (tx) => {
    // Upsert the order
    await tx.order.upsert({
      where: { shopifyOrderId },
      create: {
        shopifyOrderId,
        shopifyOrderNum: String(orderData.order_number),
        picId,
        referralCode,
        customerName: `${orderData.customer?.first_name || ''} ${orderData.customer?.last_name || ''}`.trim(),
        customerEmail: orderData.customer?.email,
        orderAmount,
        commissionRate: picId ? COMMISSION_RATE : 0,
        commissionAmount,
        status: OrderStatus.PAID,
        shopifyData: orderData,
      },
      update: {
        status: OrderStatus.PAID,
        shopifyData: orderData,
      },
    });

    // If PIC was found, update wallet and notify
    if (picId && commissionAmount > 0) {
      await tx.wallet.update({
        where: { picId },
        data: {
          totalEarnings: { increment: commissionAmount },
          availableBalance: { increment: commissionAmount },
        },
      });

      await tx.notification.create({
        data: {
          picId,
          type: 'NEW_COMMISSION',
          title: 'New Commission Earned! 🎉',
          message: `You earned ₹${commissionAmount.toFixed(2)} from order #${orderData.order_number}.`,
          metadata: { orderId: orderData.order_number, amount: commissionAmount },
        },
      });

      // Also notify admin
      await tx.notification.create({
        data: {
          type: 'SYSTEM',
          title: 'Referral Order Processed',
          message: `Order #${orderData.order_number} processed for PIC ${pic?.fullName} (₹${commissionAmount.toFixed(2)} commission).`,
        },
      });
    }
  });

  // 4. Send Email Notification (non-blocking)
  if (pic && commissionAmount > 0) {
    sendCommissionEmail(
      pic.email,
      pic.fullName,
      orderAmount,
      commissionAmount,
      String(orderData.order_number)
    ).catch(console.error);
  }

  return { message: 'Order processed successfully' };
};
