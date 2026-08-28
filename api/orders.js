// DEK-DOEN Order API - Supabase

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function supabase(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  
    if (!response.ok) {
  console.error("SUPABASE RESPONSE:", response.status, data);

  const error = new Error(
    `SUPABASE_ERROR: ${JSON.stringify(data)}`
  );

  error.status = response.status;
  error.data = data;
  throw error;
}
  

  return data;
}

module.exports = async (req, res) => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return json(res, 500, {
      error: "SUPABASE_ENV_MISSING",
    });
  }

  // GET /api/orders
  if (req.method === "GET") {
    try {
      const id = req.query?.id;

      if (id) {
        const data = await supabase(
          `orders?id=eq.${encodeURIComponent(id)}&select=*`
        );

        if (!data || !data.length) {
          return json(res, 404, {
            error: "ORDER_NOT_FOUND",
          });
        }

        return json(res, 200, data[0]);
      }

      const data = await supabase(
        "orders?select=*&order=created_at.desc"
      );

      return json(res, 200, {
        orders: data || [],
      });
    } catch (error) {
      console.error(error);
      return json(res, error.status || 500, {
        error: "GET_ORDERS_FAILED",
        detail: error.data || error.message,
      });
    }
  }

  // POST /api/orders
  if (req.method === "POST") {
    let body = {};

    try {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      body = JSON.parse(
        Buffer.concat(chunks).toString("utf8") || "{}"
      );
    } catch {
      return json(res, 400, {
        error: "INVALID_JSON",
      });
    }

    try {
      const id =
        body.id ||
        `DD-${Date.now().toString().slice(-8)}`;

      const order = {
        id,
        pickup:
          body.pickup ||
          body.stops?.[0]?.address ||
          "",
        dropoff:
          body.dropoff ||
          body.stops?.[body.stops.length - 1]?.address ||
          "",
        item:
          body.item ||
          body.goods ||
          "",
        note: body.note || "",
        price:
          Number(
            body.price ??
            body.deliveryFee ??
            0
          ),
        status:
          body.status ||
          "customer_submitted",
        rider_id:
          body.rider_id ||
          body.riderId ||
          null,
        rider_name:
          body.rider_name ||
          body.riderName ||
          null,
        claimed_at:
          body.claimed_at ||
          null,
      };

      const data = await supabase("orders", {
        method: "POST",
        body: JSON.stringify(order),
      });

      return json(res, 201, data?.[0] || order);
    } catch (error) {
      console.error(error);

      return json(res, error.status || 500, {
        error: "CREATE_ORDER_FAILED",
        detail: error.data || error.message,
      });
    }
  }

  // PATCH /api/orders?id=...
  if (req.method === "PATCH") {
    const id = req.query?.id;

    if (!id) {
      return json(res, 400, {
        error: "ORDER_ID_REQUIRED",
      });
    }

    let body = {};

    try {
      const chunks = [];

      for await (const chunk of req) {
        chunks.push(chunk);
      }

      body = JSON.parse(
        Buffer.concat(chunks).toString("utf8") || "{}"
      );
    } catch {
      return json(res, 400, {
        error: "INVALID_JSON",
      });
    }

    try {
      const allowed = [
        "status",
        "rider_id",
        "rider_name",
        "claimed_at",
        "pickup",
        "dropoff",
        "item",
        "note",
        "price",
      ];

      const update = {};

      for (const key of allowed) {
        if (body[key] !== undefined) {
          update[key] = body[key];
        }
      }

      const data = await supabase(
        `orders?id=eq.${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(update),
        }
      );

      if (!data || !data.length) {
        return json(res, 404, {
          error: "ORDER_NOT_FOUND",
        });
      }

      return json(res, 200, data[0]);
    } catch (error) {
      console.error(error);

      return json(res, error.status || 500, {
        error: "UPDATE_ORDER_FAILED",
        detail: error.data || error.message,
      });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return json(res, 405, {
    error: "METHOD_NOT_ALLOWED",
  });
};
