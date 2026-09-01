INSERT INTO public.user_roles (user_id, role)
VALUES ('e3278cc9-931e-4660-9707-b57b97419e89', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;