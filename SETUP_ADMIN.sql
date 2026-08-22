insert into public.user_roles (user_id, role)
select id, 'owner'
from auth.users
where email = 'jouw-email@example.com'
on conflict (user_id) do update set role = excluded.role;
