-- Adiciona badge de lançamento aos packs sem badge
UPDATE public.credit_packages
SET badge = 'Lançamento'
WHERE display_order IN (1, 3) AND badge IS NULL;
