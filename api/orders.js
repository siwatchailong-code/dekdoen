// DEK-DERN Order API
// Vercel-ready endpoint contract. For production, replace the in-memory store
// with a persistent database (Supabase/Postgres) without changing the frontend contract.
let orders = globalThis.__DEKDERN_ORDERS || (globalThis.__DEKDERN_ORDERS = new Map());

function json(res, status, body){
  res.statusCode=status;
  res.setHeader("Content-Type","application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

module.exports = async (req,res)=>{
  if(req.method==="GET"){
    const id=(req.query||{}).id;
    if(id){
      const order=orders.get(id);
      return order ? json(res,200,order) : json(res,404,{error:"ORDER_NOT_FOUND"});
    }
    return json(res,200,{orders:[...orders.values()].sort((a,b)=>b.createdAt-a.createdAt)});
  }

  if(req.method==="POST"){
    let body={};
    try{
      const chunks=[];
      for await(const c of req) chunks.push(c);
      body=JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}");
    }catch(e){ return json(res,400,{error:"INVALID_JSON"}); }

    const id=body.id || "DD-"+String(Date.now()).slice(-8);
    const order={
      id,
      status: body.status || "customer_submitted",
      customer: body.customer || {},
      stops: Array.isArray(body.stops) ? body.stops : [],
      deliveryFee: Number(body.deliveryFee||0),
      goodsTotal: Number(body.goodsTotal||0),
      note: body.note || "",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    orders.set(id,order);
    return json(res,201,order);
  }

  if(req.method==="PATCH"){
    const id=(req.query||{}).id;
    if(!id || !orders.has(id)) return json(res,404,{error:"ORDER_NOT_FOUND"});
    let body={};
    try{
      const chunks=[];
      for await(const c of req) chunks.push(c);
      body=JSON.parse(Buffer.concat(chunks).toString("utf8")||"{}");
    }catch(e){ return json(res,400,{error:"INVALID_JSON"}); }
    const order={...orders.get(id),...body,id,updatedAt:Date.now()};
    orders.set(id,order);
    return json(res,200,order);
  }

  return json(res,405,{error:"METHOD_NOT_ALLOWED"});
};
