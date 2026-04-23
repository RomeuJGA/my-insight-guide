CREATE OR REPLACE FUNCTION public.replace_all_messages(_rows jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  inserted_count INTEGER;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  IF _rows IS NULL OR jsonb_typeof(_rows) <> 'array' THEN
    RAISE EXCEPTION 'Invalid payload: expected JSON array';
  END IF;

  TRUNCATE TABLE public.messages;

  INSERT INTO public.messages (id, content)
  SELECT (elem->>'id')::INTEGER, elem->>'content'
  FROM jsonb_array_elements(_rows) AS elem;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$function$;