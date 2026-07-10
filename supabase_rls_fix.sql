-- Admin panel ke liye RLS policies — anon key ko UPDATE/DELETE ki permission do
-- Isse admin.html direct Supabase se orders update/delete kar payega

CREATE POLICY "anon can update orders"
ON public.orders
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "anon can delete orders"
ON public.orders
FOR DELETE
TO anon
USING (true);

CREATE POLICY "anon can update saved_addresses"
ON public.saved_addresses
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "anon can delete saved_addresses"
ON public.saved_addresses
FOR DELETE
TO anon
USING (true);
