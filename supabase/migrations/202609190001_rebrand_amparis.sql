-- Avera is now Amparis. Keep the existing platform ID and all publication links.
-- The full domain has not been confirmed; never guess or overwrite its origin.
update public.publishing_sites
set label = 'Amparis'
where id = 'avera';
