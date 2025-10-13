-- Create RPC to create direct conversation and participants atomically
create or replace function public.create_direct_conversation(
  p_user1 uuid,
  p_user2 uuid,
  p_title text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  -- Create conversation
  insert into public.conversations (conversation_type, title)
  values ('direct', coalesce(p_title, 'Direct conversation'))
  returning id into v_conversation_id;

  -- Add both participants
  insert into public.conversation_participants (conversation_id, user_id)
  values (v_conversation_id, p_user1), (v_conversation_id, p_user2);

  return v_conversation_id;
end;
$$;