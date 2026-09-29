export interface CourierRate {
  courier_id: number;
  courier_name: string;
  shipping_cost: number;
  expected_days: string;
  mode: 'Air' | 'Surface' | 'Hyperlocal';
}

export interface BookingResult {
  success: boolean;
  tracking_id: string;
  carrier: string;
  label_url: string;
  cost: number;
  shipment_id?: number | string;
  error?: string;
}

export interface TrackingCheckpoint {
  time: string;
  location: string;
  description: string;
}

export interface TrackingResult {
  status: string;
  tracking_id: string;
  checkpoints: TrackingCheckpoint[];
}

let cachedToken: string | null = null;
let tokenExpiry = 0; // Epoch timestamp

// Safe JSON parser in case of unexpected HTML, notices, or warnings
function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error('Invalid JSON format from iCarry: ' + text.slice(0, 150));
  }
}

// 2-Letter State Codes defined in iCarry API Document v17.0 (Appendix, page 51)
const STATE_CODES: Record<string, string> = {
  'andaman and nicobar islands': 'AN',
  'andhra pradesh': 'AP',
  'arunachal pradesh': 'AR',
  'assam': 'AS',
  'bihar': 'BI',
  'chandigarh': 'CH',
  'dadra and nagar haveli': 'DA',
  'daman and diu': 'DM',
  'delhi': 'DE',
  'new delhi': 'DE',
  'goa': 'GO',
  'gujarat': 'GU',
  'haryana': 'HA',
  'himachal pradesh': 'HP',
  'jammu and kashmir': 'JA',
  'karnataka': 'KA',
  'kerala': 'KE',
  'lakshadweep islands': 'LI',
  'madhya pradesh': 'MP',
  'maharashtra': 'MA',
  'manipur': 'MN',
  'meghalaya': 'ME',
  'mizoram': 'MI',
  'nagaland': 'NA',
  'odisha': 'OD',
  'orissa': 'OD',
  'puducherry': 'PO',
  'pondicherry': 'PO',
  'punjab': 'PU',
  'rajasthan': 'RA',
  'sikkim': 'SI',
  'tamil nadu': 'TN',
  'tripura': 'TR',
  'uttar pradesh': 'UP',
  'west bengal': 'WB',
  'telangana': 'TS',
  'jharkhand': 'JH',
  'uttarakhand': 'UK',
  'uttaranchal': 'UK',
  'chhattisgarh': 'CG',
  'chattisgarh': 'CG',
  'ladakh': 'LA',
};

export function resolveStateCode(stateName?: string, pincode?: string): string {
  if (stateName && stateName.trim()) {
    const norm = stateName.trim().toLowerCase();
    if (STATE_CODES[norm]) return STATE_CODES[norm];
    const upper = stateName.trim().toUpperCase();
    if (Object.values(STATE_CODES).includes(upper)) return upper;
  }

  // Derive by Indian PIN Code series if state name not explicitly supplied
  const pin = String(pincode || '').replace(/\D/g, '');
  if (pin.length >= 2) {
    const p2 = parseInt(pin.slice(0, 2), 10);
    const p3 = parseInt(pin.slice(0, 3), 10);
    if (p2 === 11) return 'DE';
    if (p2 >= 12 && p2 <= 13) return 'HA';
    if (p2 >= 14 && p2 <= 15) return 'PU';
    if (p2 === 16) return 'CH';
    if (p2 === 17) return 'HP';
    if (p2 >= 18 && p2 <= 19) return 'JA';
    if ((p3 >= 246 && p3 <= 249) || (p3 >= 262 && p3 <= 263)) return 'UK';
    if (p2 >= 20 && p2 <= 28) return 'UP';
    if (p2 >= 30 && p2 <= 34) return 'RA';
    if (p2 >= 36 && p2 <= 39) return 'GU';
    if (p2 >= 40 && p2 <= 44) return 'MA';
    if (p2 >= 45 && p2 <= 48) return 'MP';
    if (p2 === 49) return 'CG';
    if (p2 >= 50 && p2 <= 53) return 'TS';
    if (p2 >= 56 && p2 <= 59) return 'KA';
    if (p2 >= 60 && p2 <= 64) return 'TN';
    if (p2 >= 67 && p2 <= 69) return 'KE';
    if (p2 >= 70 && p2 <= 74) return 'WB';
    if (p2 >= 75 && p2 <= 77) return 'OD';
    if (p2 === 78 || p2 === 79) return 'AS';
    if (p3 >= 825 && p3 <= 835) return 'JH';
    if (p2 >= 80 && p2 <= 85) return 'BI';
  }
  return 'JH';
}

export function sanitizeMobile(phone: string): string {
  let clean = (phone || '').replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('91')) {
    clean = clean.slice(2);
  } else if (clean.length === 11 && clean.startsWith('0')) {
    clean = clean.slice(1);
  }
  if (clean.length === 10 && /^[6-9]/.test(clean)) {
    return clean;
  }
  return clean.slice(-10) || '9876543210';
}

export const icarryService = {
  // Check if we are in Mock/Sandbox Mode
  isMockMode: (): boolean => {
    const username = process.env.ICARRY_USERNAME;
    const apiKey = process.env.ICARRY_API_KEY;
    return !username || !apiKey || username.includes('your_') || apiKey.includes('your_');
  },

  // Authenticate and retrieve token (Valid for 60 minutes)
  login: async (): Promise<string | null> => {
    if (icarryService.isMockMode()) {
      return 'mock_token_icarry_123';
    }

    const now = Date.now();
    if (cachedToken && now < tokenExpiry) {
      return cachedToken;
    }

    try {
      const username = process.env.ICARRY_USERNAME;
      const apiKey = process.env.ICARRY_API_KEY;

      const res = await fetch('https://www.icarry.in/api_login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          key: apiKey,
        }),
      });

      const rawText = await res.text();
      const data = safeJsonParse(rawText);
      const token = data.api_token || data.api_token_id;
      if (res.ok && token) {
        cachedToken = token;
        tokenExpiry = now + 50 * 60 * 1000; // 50 mins
        return cachedToken;
      }
      console.error('iCarry login failed:', data);
      return null;
    } catch (e) {
      console.error('iCarry login request error:', e);
      return null;
    }
  },

  // Calculate courier shipping rates and serviceability
  getEstimate: async (
    destPincode: string,
    weightGrams: number,
    shipmentMode: 'E' | 'S' | 'H' = 'S'
  ): Promise<CourierRate[]> => {
    const originPincode = process.env.ICARRY_ORIGIN_PINCODE || '829122';

    if (icarryService.isMockMode()) {
      const costFactor = shipmentMode === 'E' ? 1.4 : 1.0;
      return [
        {
          courier_id: 177,
          courier_name: 'Amazon Shipping (Surface)',
          shipping_cost: Math.round(85 * costFactor),
          expected_days: '3-4 Days',
          mode: 'Surface',
        },
        {
          courier_id: 101,
          courier_name: 'Delhivery Surface Express',
          shipping_cost: Math.round(95 * costFactor),
          expected_days: '2-4 Days',
          mode: 'Surface',
        },
        {
          courier_id: 102,
          courier_name: 'BlueDart Express Ground',
          shipping_cost: Math.round(115 * costFactor),
          expected_days: '2-3 Days',
          mode: 'Surface',
        },
      ];
    }

    const token = await icarryService.login();
    if (!token) {
      return [
        {
          courier_id: 177,
          courier_name: 'Amazon Shipping (Surface)',
          shipping_cost: 85,
          expected_days: '3-4 Days',
          mode: 'Surface',
        },
      ];
    }

    try {
      const fetchEstimateForMode = async (mode: string): Promise<CourierRate[] | null> => {
        const url = `https://www.icarry.in/api_get_estimate?api_token=${token}`;
        const payload = {
          origin_pincode: originPincode,
          destination_pincode: destPincode,
          origin_country_code: 'IN',
          destination_country_code: 'IN',
          weight: Math.max(weightGrams, 100),
          length: 15,
          breadth: 10,
          height: 10,
          shipment_mode: mode,
          shipment_type: 'P',
          shipment_value: 1299,
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const rawText = await res.text();
        const data = safeJsonParse(rawText);
        const rawRates = data.estimate || data.rates || [];
        if (Array.isArray(rawRates) && rawRates.length > 0) {
          return rawRates.map((r: any): CourierRate => ({
            courier_id: Number(r.courier_id),
            courier_name: r.courier_name,
            shipping_cost: Number(r.courier_cost || r.freight_cost || r.shipping_cost || 0),
            expected_days: r.expected_days || '3-4 Days',
            mode: (r.courier_group_name?.includes('Air') ? 'Air' : 'Surface') as 'Air' | 'Surface',
          }));
        }
        return null;
      };

      // Try requested mode first
      let rates = await fetchEstimateForMode(shipmentMode || 'S');
      if (!rates && shipmentMode === 'E') {
        rates = await fetchEstimateForMode('S');
      }

      if (rates && rates.length > 0) {
        return rates;
      }

      return [
        {
          courier_id: 177,
          courier_name: 'Amazon Shipping (Surface)',
          shipping_cost: 85,
          expected_days: '3-4 Days',
          mode: 'Surface',
        },
        {
          courier_id: 101,
          courier_name: 'Delhivery Surface Logistics',
          shipping_cost: 95,
          expected_days: '3-5 Days',
          mode: 'Surface',
        },
      ];
    } catch (e) {
      console.error('iCarry get estimate request error:', e);
      return [
        {
          courier_id: 177,
          courier_name: 'Amazon Shipping (Surface)',
          shipping_cost: 85,
          expected_days: '3-4 Days',
          mode: 'Surface',
        },
      ];
    }
  },

  // Book Courier / Shipment creation according to iCarry API Document v17.0
  bookShipment: async (
    orderId: string,
    recipient: { 
      name: string; 
      email: string; 
      phone: string; 
      address: string; 
      city: string; 
      zip: string;
      state?: string;
    },
    weightGrams: number,
    shipmentMode: 'E' | 'S' | 'H' = 'S',
    courierId?: number,
    courierName?: string,
    orderValue?: number
  ): Promise<BookingResult> => {
    const pickupAddressId = process.env.ICARRY_PICKUP_ADDRESS_ID || '85126';

    if (icarryService.isMockMode()) {
      const trackingId = `AWB-MOCK-${Math.floor(100000 + Math.random() * 900000)}`;
      const selectedCarrier = courierName || 'Delhivery Express (Demo)';
      return {
        success: true,
        tracking_id: trackingId,
        carrier: selectedCarrier,
        label_url: `/api/admin/icarry/mock-label?order_id=${orderId}&carrier=${encodeURIComponent(selectedCarrier)}&awb=${trackingId}`,
        cost: courierId === 102 ? 115 : 85,
      };
    }

    const token = await icarryService.login();
    if (!token) {
      return {
        success: false,
        tracking_id: '',
        carrier: courierName || 'iCarry Partner',
        label_url: '',
        cost: 0,
        error: 'Failed to authenticate with iCarry server. Please verify ICARRY_USERNAME and ICARRY_API_KEY.',
      };
    }

    const cleanMobile = sanitizeMobile(recipient.phone);
    const stateCode = resolveStateCode(recipient.state, recipient.zip);

    // Build payload according to iCarry v17.0 specification (pages 14-18)
    const payload: any = {
      pickup_address_id: Number(pickupAddressId),
      client_order_id: orderId,
      consignee: {
        name: recipient.name || 'Valued Customer',
        mobile: cleanMobile,
        email: recipient.email || '',
        address: recipient.address || 'Address on file',
        city: recipient.city || 'City',
        pincode: recipient.zip,
        state: stateCode,
        country_code: 'IN',
      },
      parcel: {
        type: 'Prepaid',
        value: Number(orderValue || 1299),
        currency: 'INR',
        contents: 'Luxury Perfume / Fragrance',
        dimensions: {
          length: 15,
          breadth: 10,
          height: 10,
          unit: 'cm',
        },
        weight: {
          weight: Math.max(weightGrams || 250, 100),
          unit: 'gm',
        },
      },
    };

    if (courierId) {
      payload.courier_id = Number(courierId);
    }

    // Try booking with selected mode (Surface / Air)
    const executeBooking = async (mode: 'E' | 'S'): Promise<any> => {
      const endpoint = mode === 'E' 
        ? `https://www.icarry.in/api_add_shipment_air?api_token=${token}`
        : `https://www.icarry.in/api_add_shipment_surface?api_token=${token}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      return safeJsonParse(rawText);
    };

    try {
      const targetMode = shipmentMode === 'E' ? 'E' : 'S';
      let data = await executeBooking(targetMode);

      // If Air booking failed (fragrances / liquid restrictions), automatically attempt Surface
      if (data.error && targetMode === 'E') {
        console.warn('Air booking returned error, retrying via Surface:', data.error);
        data = await executeBooking('S');
      }

      // Check for errors returned by iCarry (e.g. low balance, invalid phone, etc.)
      if (data.error) {
        console.error('iCarry book shipment error response:', data.error);
        return {
          success: false,
          tracking_id: '',
          carrier: courierName || 'iCarry Partner',
          label_url: '',
          cost: 0,
          error: typeof data.error === 'string' ? data.error : JSON.stringify(data.error),
        };
      }

      // Successful shipment creation in iCarry
      if (data.shipment_id || data.success) {
        const shipmentId = data.shipment_id;
        const trackingId = String(data.awb || shipmentId || '');
        const carrier = data.courier_name || courierName || 'iCarry Courier Partner';
        const cost = Number(data.cost_estimate || data.shipping_cost || 85);

        // Fetch real courier barcode shipping label PDF from iCarry (page 41)
        let labelUrl = data.tracking_url || '';
        try {
          const printRes = await fetch(`https://www.icarry.in/api_print_shipment_label?api_token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              shipment_id: Number(shipmentId),
              paper_size: 'A4',
            }),
          });
          const printRaw = await printRes.text();
          const printData = safeJsonParse(printRaw);
          if (Array.isArray(printData.shipment_label) && printData.shipment_label[0]?.url) {
            labelUrl = printData.shipment_label[0].url;
          }
        } catch (labelErr) {
          console.warn('Could not immediately retrieve PDF label from iCarry:', labelErr);
        }

        if (!labelUrl) {
          labelUrl = `/api/admin/icarry/mock-label?order_id=${orderId}&carrier=${encodeURIComponent(carrier)}&awb=${trackingId}`;
        }

        return {
          success: true,
          tracking_id: trackingId,
          carrier,
          label_url: labelUrl,
          cost,
          shipment_id: shipmentId,
        };
      }

      return {
        success: false,
        tracking_id: '',
        carrier: courierName || 'iCarry Partner',
        label_url: '',
        cost: 0,
        error: data.error || 'Failed to book shipment on iCarry server.',
      };
    } catch (e: any) {
      console.error('iCarry book shipment error:', e);
      return {
        success: false,
        tracking_id: '',
        carrier: courierName || 'iCarry Partner',
        label_url: '',
        cost: 0,
        error: e.message || 'Network error communicating with iCarry server.',
      };
    }
  },

  // Retrieve Tracking timeline checkpoints
  trackShipment: async (trackingRef: string): Promise<TrackingResult> => {
    if (icarryService.isMockMode() || trackingRef.startsWith('AWB-MOCK-')) {
      const now = new Date();
      const formatTime = (hoursOffset: number) => {
        const d = new Date(now.getTime() - hoursOffset * 60 * 60 * 1000);
        return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      };

      return {
        status: 'In Transit',
        tracking_id: trackingRef,
        checkpoints: [
          {
            time: formatTime(6),
            location: 'Warehouse (Pincode: 829122)',
            description: 'Shipment booked and packed. Awaiting pickup.',
          },
          {
            time: formatTime(4),
            location: 'Dispatch Office',
            description: 'Courier picked up package and processed at dispatch hub.',
          },
          {
            time: formatTime(1),
            location: 'In Transit Hub',
            description: 'Shipment is currently in transit to recipient destination.',
          },
        ],
      };
    }

    const token = await icarryService.login();
    if (!token) {
      return { status: 'Pending Pickup', tracking_id: trackingRef, checkpoints: [] };
    }

    try {
      // Official iCarry tracking endpoint (page 28)
      const isNumeric = /^\d+$/.test(trackingRef);
      const url = `https://www.icarry.in/api_track_shipment?api_token=${token}`;
      const payload = isNumeric ? { shipment_id: Number(trackingRef) } : { tracking_id: trackingRef };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      const data = safeJsonParse(rawText);

      if (data.details && Array.isArray(data.details)) {
        return {
          status: data.status || 'In Transit',
          tracking_id: trackingRef,
          checkpoints: data.details.map((d: any) => ({
            time: d.datetime || '',
            location: d.location || '',
            description: d.notes || d.description || '',
          })),
        };
      }

      return { status: data.status || 'Pending Pickup', tracking_id: trackingRef, checkpoints: [] };
    } catch (e) {
      console.error('iCarry track shipment error:', e);
      return { status: 'Pending Pickup', tracking_id: trackingRef, checkpoints: [] };
    }
  },
};
