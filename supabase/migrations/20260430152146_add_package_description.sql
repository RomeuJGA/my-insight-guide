ALTER TABLE public.credit_packages ADD COLUMN IF NOT EXISTS description TEXT;

UPDATE public.credit_packages
SET description = 'Uma mensagem para o momento presente.'
WHERE display_order = 1;

UPDATE public.credit_packages
SET description = 'Tempo para pensar com mais profundidade.'
WHERE display_order = 2;

UPDATE public.credit_packages
SET description = 'Para quem quer uma jornada de descoberta.'
WHERE display_order = 3;
