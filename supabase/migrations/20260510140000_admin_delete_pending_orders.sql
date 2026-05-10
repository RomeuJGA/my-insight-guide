CREATE POLICY "Admins can delete pending payment orders"
ON public.payment_orders
FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin')
  AND status = 'pending'
);
