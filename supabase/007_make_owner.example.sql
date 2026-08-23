insert into public.user_roles (user_id, role)
select id, 'owner' from auth.users where email='jouw-email@example.com'
on conflict (user_id) do update set role='owner', updated_at=now();

select u.email, r.role from auth.users u join public.user_roles r on r.user_id=u.id
where u.email='jouw-email@example.com';
