CREATE OR REPLACE FUNCTION public.order_is_new(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = _order_id AND o.status = 'new'::order_status
  )
$$;

REVOKE ALL ON FUNCTION public.order_is_new(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.order_is_new(uuid) TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can add items to a new order" ON public.order_items;
CREATE POLICY "Anyone can add items to a new order"
ON public.order_items FOR INSERT TO anon, authenticated
WITH CHECK (public.order_is_new(order_id));