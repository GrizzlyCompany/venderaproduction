-- Crear bucket para imágenes de proyectos
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

-- Crear bucket para PDFs de proyectos
insert into storage.buckets (id, name, public)
values ('project-pdfs', 'project-pdfs', true)
on conflict (id) do nothing;

-- Opcional: puedes agregar reglas RLS o policies según la seguridad que requieras.
