-- Sequence to allocate unique reference numbers per sub-entity
CREATE SEQUENCE IF NOT EXISTS public.ifthenpay_reference_seq START WITH 1 INCREMENT BY 1;

-- Function to allocate next reference number atomically
CREATE OR REPLACE FUNCTION public.next_ifthenpay_reference_number()
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT nextval('public.ifthenpay_reference_seq');
$$;