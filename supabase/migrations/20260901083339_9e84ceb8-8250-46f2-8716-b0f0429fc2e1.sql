-- 1. Remove public write access to orders / order_items
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
DROP POLICY IF EXISTS "Anyone can add items to a new order" ON public.order_items;

REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
REVOKE INSERT ON public.orders FROM authenticated;
REVOKE INSERT ON public.order_items FROM authenticated;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.order_items TO service_role;

DROP FUNCTION IF EXISTS public.order_is_new(uuid);

-- 2. Atomic order creation, callable only by the trusted server role
CREATE OR REPLACE FUNCTION public.place_order(p_order jsonb, p_items jsonb)
RETURNS TABLE (order_id uuid, order_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_number text;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'order must contain at least one item';
  END IF;

  INSERT INTO public.orders (
    order_number, customer_name, customer_phone, customer_email,
    order_type, fulfillment_type, store_id, delivery_address,
    payment_method, subtotal, delivery_fee, total, status, notes
  )
  VALUES (
    p_order->>'order_number',
    p_order->>'customer_name',
    p_order->>'customer_phone',
    NULLIF(p_order->>'customer_email', ''),
    (p_order->>'order_type')::order_type,
    (p_order->>'fulfillment_type')::fulfillment_type,
    NULLIF(p_order->>'store_id', '')::uuid,
    NULLIF(p_order->>'delivery_address', ''),
    NULLIF(p_order->>'payment_method', ''),
    (p_order->>'subtotal')::numeric,
    COALESCE((p_order->>'delivery_fee')::numeric, 0),
    (p_order->>'total')::numeric,
    'new'::order_status,
    NULLIF(p_order->>'notes', '')
  )
  RETURNING id, orders.order_number INTO v_id, v_number;

  INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
  SELECT v_id,
         NULLIF(i->>'product_id', '')::uuid,
         i->>'product_name',
         (i->>'quantity')::numeric,
         (i->>'unit_price')::numeric,
         (i->>'subtotal')::numeric
  FROM jsonb_array_elements(p_items) AS i;

  RETURN QUERY SELECT v_id, v_number;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb) TO service_role;