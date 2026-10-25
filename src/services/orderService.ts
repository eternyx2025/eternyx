import { query } from '@/lib/db';
import { Order, OrderItem } from '@/lib/types';

export const orderService = {
  getAll: async (status?: string): Promise<Order[]> => {
    try {
      let sql = `
        SELECT o.*, c.phone as customer_phone 
        FROM orders o 
        LEFT JOIN customers c ON (o.customer_id = c.id OR (o.customer_id IS NULL AND o.customer_email = c.email AND o.customer_email != ''))
      `;
      const params: any[] = [];
      if (status && status !== 'all') {
        sql += ' WHERE o.status = ?';
        params.push(status);
      }
      sql += ' ORDER BY o.created_at DESC';

      const orders = await query<any[]>(sql, params);
      if (orders.length === 0) return [];
      
      // Fetch all items for all orders in a SINGLE batched query (fixes N+1 database bottleneck)
      const orderIds = orders.map((o) => o.id);
      const placeholders = orderIds.map(() => '?').join(',');
      const allItems = await query<any[]>(
        `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
        orderIds
      );

      const itemsByOrderId = new Map<string, OrderItem[]>();
      for (const item of allItems) {
        const list = itemsByOrderId.get(item.order_id) || [];
        list.push(item);
        itemsByOrderId.set(item.order_id, list);
      }

      const ordersWithItems = orders.map((o) => {
        const items = itemsByOrderId.get(o.id) || [];
        return {
          ...o,
          customer: {
            id: o.customer_id || '',
            name: o.customer_name || '',
            email: o.customer_email || '',
            phone: o.customer_phone || '',
            spent: 0,
            orders: 0,
            lastActive: '',
          },
          shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
          items,
          items_count: items.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0),
        };
      });
      
      return ordersWithItems;
    } catch (e) {
      console.error('Failed to get all orders:', e);
      return [];
    }
  },

  getById: async (id: string): Promise<Order | null> => {
    try {
      const orders = await query<any[]>(`
        SELECT o.*, c.phone as customer_phone 
        FROM orders o 
        LEFT JOIN customers c ON (o.customer_id = c.id OR (o.customer_id IS NULL AND o.customer_email = c.email AND o.customer_email != ''))
        WHERE o.id = ?
      `, [id]);
      if (orders.length === 0) return null;
      
      const o = orders[0];
      const items = await query<OrderItem[]>('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      
      return {
        ...o,
        customer: {
          id: o.customer_id || '',
          name: o.customer_name || '',
          email: o.customer_email || '',
          phone: o.customer_phone || '',
          spent: 0,
          orders: 0,
          lastActive: '',
        },
        shipping_address: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : o.shipping_address,
        items,
        items_count: items.reduce((acc, curr) => acc + curr.quantity, 0),
      };
    } catch (e) {
      console.error(`Failed to get order ${id}:`, e);
      return null;
    }
  },

  getByRazorpayOrderId: async (razorpayOrderId: string): Promise<Order | null> => {
    try {
      const orders = await query<any[]>('SELECT id FROM orders WHERE razorpay_order_id = ?', [razorpayOrderId]);
      if (orders.length === 0) return null;
      return await orderService.getById(orders[0].id);
    } catch (e) {
      console.error(`Failed to get order by Razorpay Order ID ${razorpayOrderId}:`, e);
      return null;
    }
  },

  create: async (o: Omit<Order, 'items_count'>): Promise<Order | null> => {
    try {
      const address = JSON.stringify(o.shipping_address);
      const now = new Date().toISOString();
      const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      await query(
        `INSERT INTO orders (id, customer_id, customer_name, customer_email, total, status, payment_status, payment_method, razorpay_order_id, razorpay_payment_id, razorpay_signature, shipping_address, discount_code, created_at, date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          o.id,
          o.customer_id || null,
          o.customer_name || '',
          o.customer_email || '',
          o.total,
          o.status || 'Pending',
          o.payment_status || 'Pending',
          o.payment_method || 'Prepaid',
          o.razorpay_order_id || null,
          o.razorpay_payment_id || null,
          o.razorpay_signature || null,
          address,
          o.discount_code || null,
          o.created_at || now,
          o.date || dateStr
        ]
      );

      // Fast single multi-row batch insert for all order items
      if (Array.isArray(o.items) && o.items.length > 0) {
        const itemValues: any[] = [];
        const placeholders = o.items.map((item) => {
          itemValues.push(
            o.id,
            null,
            item.name,
            item.size || '',
            item.price,
            item.quantity || 1,
            item.image || ''
          );
          return '(?, ?, ?, ?, ?, ?, ?)';
        }).join(', ');

        await query(
          `INSERT INTO order_items (order_id, product_id, name, size, price, quantity, image)
           VALUES ${placeholders}`,
          itemValues
        );
      }

      return await orderService.getById(o.id);
    } catch (e) {
      console.error('Failed to create order:', e);
      return null;
    }
  },

  updateStatus: async (id: string, status: string): Promise<Order | null> => {
    try {
      await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
      return await orderService.getById(id);
    } catch (e) {
      console.error(`Failed to update order status ${id}:`, e);
      return null;
    }
  },

  confirmPayment: async (
    id: string, 
    paymentStatus: string, 
    metadata: { razorpayPaymentId: string; razorpaySignature: string }
  ): Promise<Order | null> => {
    try {
      await query(
        `UPDATE orders 
         SET payment_status = ?, 
             razorpay_payment_id = ?, 
             razorpay_signature = ?, 
             status = ? 
         WHERE id = ?`,
        [
          paymentStatus, 
          metadata.razorpayPaymentId, 
          metadata.razorpaySignature, 
          paymentStatus === 'Paid' ? 'Processing' : 'Pending', 
          id
        ]
      );
      return await orderService.getById(id);
    } catch (e) {
      console.error(`Failed to confirm payment for order ${id}:`, e);
      return null;
    }
  },

  updateShippingInfo: async (
    id: string,
    carrier: string,
    trackingId: string,
    labelUrl: string,
    cost: number
  ): Promise<Order | null> => {
    try {
      await query(
        `UPDATE orders 
         SET shipping_carrier = ?, 
             shipping_tracking_id = ?, 
             shipping_label_url = ?, 
             shipping_cost = ?, 
             status = 'Shipped' 
         WHERE id = ?`,
        [carrier, trackingId, labelUrl, cost, id]
      );
      return await orderService.getById(id);
    } catch (e) {
      console.error(`Failed to update shipping info for order ${id}:`, e);
      return null;
    }
  },

  /**
   * Automatically normalizes and updates delivery status in MySQL if changed
   */
  syncDeliveryStatus: async (orderIdOrAwb: string, rawCourierStatus: string): Promise<string> => {
    try {
      if (!orderIdOrAwb || !rawCourierStatus) return '';
      const s = String(rawCourierStatus).toLowerCase();
      let normalized = '';

      if (s.includes('out for delivery') || s.includes('out for')) {
        normalized = 'Out for Delivery';
      } else if (s.includes('deliver') || s.includes('completed')) {
        normalized = 'Delivered';
      } else if (
        s.includes('transit') ||
        s.includes('shipped') ||
        s.includes('dispatch') ||
        s.includes('pickup') ||
        s.includes('picked up') ||
        s.includes('in-transit')
      ) {
        normalized = 'Shipped';
      } else if (s.includes('rto') || s.includes('return') || s.includes('cancel')) {
        normalized = 'Cancelled';
      }

      if (normalized) {
        if (normalized === 'Delivered') {
          // If COD order is delivered, courier has collected cash, so mark Paid
          await query(
            `UPDATE orders 
             SET status = 'Delivered',
                 payment_status = CASE WHEN payment_method = 'COD' THEN 'Paid' ELSE payment_status END
             WHERE (id = ? OR shipping_tracking_id = ?)`,
            [orderIdOrAwb, orderIdOrAwb]
          );
        } else {
          await query(
            `UPDATE orders 
             SET status = ? 
             WHERE (id = ? OR shipping_tracking_id = ?) 
               AND status != ? 
               AND status != 'Delivered'`,
            [normalized, orderIdOrAwb, orderIdOrAwb, normalized]
          );
        }
      }
      return normalized;
    } catch (e) {
      console.error(`Failed to sync delivery status for ${orderIdOrAwb}:`, e);
      return '';
    }
  },

  /**
   * Retrieves all orders that have been shipped but not yet delivered
   */
  getActiveInTransitOrders: async (): Promise<any[]> => {
    try {
      return await query<any[]>(
        `SELECT id, shipping_tracking_id, shipping_carrier, status, customer_name, customer_email, date 
         FROM orders 
         WHERE shipping_tracking_id IS NOT NULL 
           AND shipping_tracking_id != '' 
           AND status NOT IN ('Delivered', 'Cancelled')
         ORDER BY created_at DESC`
      );
    } catch (e) {
      console.error('Failed to get active in-transit orders:', e);
      return [];
    }
  }
};

