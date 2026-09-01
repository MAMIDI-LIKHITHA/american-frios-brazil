INSERT INTO public.stores (name, address, phone, opening_hours, active)
SELECT 'Loja 305 Sul', 'Av. LO 5, Q. 205 Sul, Alameda 1, 11 - Plano Diretor Sul, Palmas - TO, 77015-000', '+5563984021014', '8h às 19h, todos os dias', true
WHERE NOT EXISTS (SELECT 1 FROM public.stores WHERE name = 'Loja 305 Sul');

INSERT INTO public.stores (name, address, phone, opening_hours, active)
SELECT 'Loja 903 Sul', 'Alameda 11, Q. 903 Sul - Plano Diretor Sul, Palmas - TO, 77017-282', '+5563984021014', '8h às 19h, todos os dias', true
WHERE NOT EXISTS (SELECT 1 FROM public.stores WHERE name = 'Loja 903 Sul');