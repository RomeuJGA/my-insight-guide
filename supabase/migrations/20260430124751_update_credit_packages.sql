-- Atualiza nomes, créditos e preços dos packs de créditos
UPDATE public.credit_packages
SET name = 'Momento', credits = 3, price_eur = 1.99, badge = NULL
WHERE display_order = 1;

UPDATE public.credit_packages
SET name = 'Reflexão', credits = 10, price_eur = 4.99, badge = 'popular'
WHERE display_order = 2;

UPDATE public.credit_packages
SET name = 'Caminho', credits = 30, price_eur = 12.99, badge = NULL
WHERE display_order = 3;
