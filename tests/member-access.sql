-- Run with a database owner connection. All fixtures and writes roll back.
begin;
do $$
declare
 admin_id uuid:=gen_random_uuid(); alice uuid:=gen_random_uuid(); bob uuid:=gen_random_uuid();
 shared_id uuid; selected_id uuid; draft_id uuid; blocked boolean; n integer;
begin
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data) values
 (admin_id,'member-admin-'||admin_id||'@example.invalid','{}','{}'),
 (alice,'member-alice-'||alice||'@example.invalid','{"role":"admin"}','{}'),
 (bob,'member-bob-'||bob||'@example.invalid','{}','{}');
 insert into public.user_roles(user_id,role) values(admin_id,'owner') on conflict(user_id) do update set role='owner';
 perform set_config('request.jwt.claims',json_build_object('sub',admin_id,'role','authenticated','is_anonymous',false)::text,true);
 set local role authenticated;
 shared_id:=public.save_member_publication(null,'All members','test-shared-'||admin_id,'','Shared body','article','members','published','{}');
 selected_id:=public.save_member_publication(null,'Alice only','test-selected-'||admin_id,'','Private body','text','selected','published',array[alice]);
 draft_id:=public.save_member_publication(null,'Private draft','test-draft-'||admin_id,'','Draft body','text','members','draft','{}');
 select count(*) into n from public.member_directory('',array[alice,bob],0);
 if n<>2 then raise exception 'Admin directory failed'; end if;
 -- Atomic save: an invalid recipient must not change text or existing grants.
 blocked:=false;
 begin
  perform public.save_member_publication(selected_id,'Broken','test-selected-'||admin_id,'','Leaked body','text','selected','published',array[gen_random_uuid()]);
 exception when foreign_key_violation then blocked:=true;
 end;
 if not blocked or (select body from public.member_publications where id=selected_id)<>'Private body' then raise exception 'Atomic save failed'; end if;
 blocked:=false;
 begin perform public.save_member_publication(null,'Empty recipients','test-empty-'||admin_id,'','Body','text','selected','published','{}'); exception when invalid_parameter_value then blocked:=true; end;
 if not blocked then raise exception 'Empty selected publication allowed'; end if;
 -- Intended recipient can see only shared + assigned, and can save their own item.
 perform set_config('request.jwt.claims',json_build_object('sub',alice,'role','authenticated','is_anonymous',false)::text,true);
 select count(*) into n from public.member_publications where id in(shared_id,selected_id,draft_id);
 if n<>2 then raise exception 'Recipient visibility failed: %',n; end if;
 if public.is_member_admin() then raise exception 'Editable metadata escalated privileges'; end if;
 insert into public.member_bookmarks(user_id,publication_id) values(alice,selected_id);
 blocked:=false;
 begin perform * from public.member_directory(); exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Reader accessed directory'; end if;
 blocked:=false;
 begin perform public.save_member_publication(shared_id,'Tamper','test-shared-'||admin_id,'','Tamper','article','members','published','{}'); exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Reader edited publication'; end if;
 blocked:=false;
 begin insert into public.member_publication_recipients values(draft_id,alice); exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Reader self-assigned access'; end if;
 -- A different account cannot read the assigned body, draft or another bookmark.
 perform set_config('request.jwt.claims',json_build_object('sub',bob,'role','authenticated','is_anonymous',false)::text,true);
 select count(*) into n from public.member_publications where id in(shared_id,selected_id,draft_id);
 if n<>1 then raise exception 'Unassigned reader visibility failed'; end if;
 select count(*) into n from public.member_bookmarks where publication_id=selected_id;
 if n<>0 then raise exception 'Another reader saw bookmark'; end if;
 blocked:=false;
 begin insert into public.member_bookmarks(user_id,publication_id) values(bob,selected_id); exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Unassigned reader bookmarked private text'; end if;
 -- Supabase anonymous auth is not a registered account.
 perform set_config('request.jwt.claims',json_build_object('sub',bob,'role','authenticated','is_anonymous',true)::text,true);
 select count(*) into n from public.member_publications where id in(shared_id,selected_id,draft_id);
 if n<>0 then raise exception 'Anonymous identity accessed member content'; end if;
 -- Revocation is effective for direct reads and saved lists immediately.
 perform set_config('request.jwt.claims',json_build_object('sub',admin_id,'role','authenticated','is_anonymous',false)::text,true);
 perform public.save_member_publication(selected_id,'Alice only','test-selected-'||admin_id,'','Private body','text','selected','published',array[bob]);
 perform set_config('request.jwt.claims',json_build_object('sub',alice,'role','authenticated','is_anonymous',false)::text,true);
 if exists(select 1 from public.member_publications where id=selected_id) or exists(select 1 from public.member_bookmarks where publication_id=selected_id) then raise exception 'Revocation failed'; end if;
 -- Unauthenticated REST role cannot access content or directory.
 perform set_config('request.jwt.claims','{}',true);
 set local role anon;
 blocked:=false;
 begin perform * from public.member_publications; exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Anonymous table grant exists'; end if;
 blocked:=false;
 begin perform * from public.member_directory(); exception when insufficient_privilege then blocked:=true; end;
 if not blocked then raise exception 'Anonymous directory access'; end if;
 reset role;
end $$;
rollback;
select 'PASS: CRUD, recipient isolation, anonymous access, directory protection, privilege escalation, bookmarks, revocation and atomic saves' as result;
