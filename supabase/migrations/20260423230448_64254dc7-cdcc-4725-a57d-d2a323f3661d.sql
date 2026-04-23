-- Tabela: 1 mensagem aleatória gratuita por utilizador por dia
CREATE TABLE public.daily_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  message_id integer NOT NULL,
  shown_date date NOT NULL DEFAULT (now() AT TIME ZONE 'Europe/Lisbon')::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, shown_date)
);

CREATE INDEX idx_daily_messages_user_date ON public.daily_messages(user_id, shown_date DESC);

ALTER TABLE public.daily_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily message"
  ON public.daily_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all daily messages"
  ON public.daily_messages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No direct insert on daily_messages"
  ON public.daily_messages FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update on daily_messages"
  ON public.daily_messages FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No direct delete on daily_messages"
  ON public.daily_messages FOR DELETE
  TO authenticated
  USING (false);

-- RPC: devolve apenas o CONTEÚDO (sem message_id) — id fica server-side
-- Usa fuso Europe/Lisbon para consistência com utilizadores PT.
CREATE OR REPLACE FUNCTION public.get_or_create_daily_message(_user_id uuid)
RETURNS TABLE (content text, shown_date date)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date := (now() AT TIME ZONE 'Europe/Lisbon')::date;
  v_message_id integer;
  v_content text;
BEGIN
  -- Já existe para hoje?
  SELECT dm.message_id INTO v_message_id
  FROM public.daily_messages dm
  WHERE dm.user_id = _user_id AND dm.shown_date = v_today;

  IF v_message_id IS NULL THEN
    -- Escolher mensagem aleatória
    SELECT m.id INTO v_message_id
    FROM public.messages m
    ORDER BY random()
    LIMIT 1;

    IF v_message_id IS NULL THEN
      RAISE EXCEPTION 'Nenhuma mensagem disponível.';
    END IF;

    -- INSERT idempotente — em caso de race condition (duplo clique simultâneo)
    -- a UNIQUE constraint impede duplicar e devolvemos o registo existente.
    INSERT INTO public.daily_messages (user_id, message_id, shown_date)
    VALUES (_user_id, v_message_id, v_today)
    ON CONFLICT (user_id, shown_date) DO NOTHING;

    -- Reler para garantir consistência (o INSERT pode ter sido ignorado)
    SELECT dm.message_id INTO v_message_id
    FROM public.daily_messages dm
    WHERE dm.user_id = _user_id AND dm.shown_date = v_today;
  END IF;

  SELECT m.content INTO v_content
  FROM public.messages m
  WHERE m.id = v_message_id;

  RETURN QUERY SELECT v_content, v_today;
END;
$$;