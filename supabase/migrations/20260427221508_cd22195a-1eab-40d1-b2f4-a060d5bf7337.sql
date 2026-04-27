-- ============ PACKS DE CRÉDITOS ============
CREATE TABLE public.credit_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  price_eur NUMERIC(10,2) NOT NULL CHECK (price_eur >= 0),
  badge TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
  ON public.credit_packages FOR SELECT
  USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert packages"
  ON public.credit_packages FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update packages"
  ON public.credit_packages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete packages"
  ON public.credit_packages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed dos packs atuais
INSERT INTO public.credit_packages (name, credits, price_eur, badge, display_order) VALUES
  ('Pack 5', 5, 2.50, NULL, 1),
  ('Pack 10', 10, 4.50, 'popular', 2),
  ('Pack 20', 20, 8.00, NULL, 3);

-- ============ CUPÕES ============
CREATE TYPE public.coupon_discount_type AS ENUM ('percent', 'fixed');

CREATE TABLE public.discount_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type public.coupon_discount_type NOT NULL,
  discount_value NUMERIC(10,2) NOT NULL CHECK (discount_value > 0),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  max_uses_per_user INTEGER CHECK (max_uses_per_user IS NULL OR max_uses_per_user > 0),
  allowed_package_ids UUID[] NOT NULL DEFAULT '{}',
  uses_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_discount_coupons_code ON public.discount_coupons (code);

ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view coupons"
  ON public.discount_coupons FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert coupons"
  ON public.discount_coupons FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update coupons"
  ON public.discount_coupons FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coupons"
  ON public.discount_coupons FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ REDENÇÕES ============
CREATE TABLE public.coupon_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.discount_coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id TEXT,
  package_id UUID REFERENCES public.credit_packages(id) ON DELETE SET NULL,
  discount_applied NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupon_redemptions_user ON public.coupon_redemptions (user_id);
CREATE INDEX idx_coupon_redemptions_coupon ON public.coupon_redemptions (coupon_id);

ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their redemptions"
  ON public.coupon_redemptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "No direct insert on coupon_redemptions"
  ON public.coupon_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct update on coupon_redemptions"
  ON public.coupon_redemptions FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "No direct delete on coupon_redemptions"
  ON public.coupon_redemptions FOR DELETE
  TO authenticated
  USING (false);

-- ============ TRIGGER updated_at ============
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_credit_packages_updated
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TRIGGER trg_discount_coupons_updated
  BEFORE UPDATE ON public.discount_coupons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ FUNÇÃO validate_coupon ============
CREATE OR REPLACE FUNCTION public.validate_coupon(
  _code TEXT,
  _user_id UUID,
  _package_id UUID
)
RETURNS TABLE(
  valid BOOLEAN,
  reason TEXT,
  coupon_id UUID,
  discount_type public.coupon_discount_type,
  discount_value NUMERIC,
  final_price NUMERIC
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.discount_coupons%ROWTYPE;
  pkg public.credit_packages%ROWTYPE;
  v_user_uses INTEGER;
  v_price NUMERIC;
  v_discount NUMERIC;
  v_final NUMERIC;
BEGIN
  SELECT * INTO c FROM public.discount_coupons
   WHERE upper(code) = upper(trim(_code)) LIMIT 1;
  IF NOT FOUND OR NOT c.active THEN
    RETURN QUERY SELECT false, 'invalid'::text, NULL::uuid, NULL::public.coupon_discount_type, NULL::numeric, NULL::numeric;
    RETURN;
  END IF;

  IF c.starts_at IS NOT NULL AND now() < c.starts_at THEN
    RETURN QUERY SELECT false, 'not_yet_valid'::text, c.id, c.discount_type, c.discount_value, NULL::numeric; RETURN;
  END IF;
  IF c.ends_at IS NOT NULL AND now() > c.ends_at THEN
    RETURN QUERY SELECT false, 'expired'::text, c.id, c.discount_type, c.discount_value, NULL::numeric; RETURN;
  END IF;
  IF c.max_uses IS NOT NULL AND c.uses_count >= c.max_uses THEN
    RETURN QUERY SELECT false, 'exhausted'::text, c.id, c.discount_type, c.discount_value, NULL::numeric; RETURN;
  END IF;

  SELECT * INTO pkg FROM public.credit_packages WHERE id = _package_id AND active = true;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'package_invalid'::text, c.id, c.discount_type, c.discount_value, NULL::numeric; RETURN;
  END IF;

  IF array_length(c.allowed_package_ids, 1) IS NOT NULL
     AND NOT (_package_id = ANY(c.allowed_package_ids)) THEN
    RETURN QUERY SELECT false, 'not_applicable'::text, c.id, c.discount_type, c.discount_value, NULL::numeric; RETURN;
  END IF;

  IF c.max_uses_per_user IS NOT NULL THEN
    SELECT count(*) INTO v_user_uses FROM public.coupon_redemptions
     WHERE coupon_id = c.id AND user_id = _user_id;
    IF v_user_uses >= c.max_uses_per_user THEN
      RETURN QUERY SELECT false, 'user_limit'::text, c.id, c.discount_type, c.discount_value, NULL::numeric; RETURN;
    END IF;
  END IF;

  v_price := pkg.price_eur;
  IF c.discount_type = 'percent' THEN
    v_discount := round(v_price * (c.discount_value / 100.0), 2);
  ELSE
    v_discount := c.discount_value;
  END IF;
  v_final := GREATEST(v_price - v_discount, 0);

  RETURN QUERY SELECT true, 'ok'::text, c.id, c.discount_type, c.discount_value, v_final;
END;
$$;