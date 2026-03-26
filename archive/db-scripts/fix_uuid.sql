-- EMERGENCY SCHEMA FIX: UUID CONVERSION
-- Run this in Supabase SQL Editor

BEGIN;

-- 1. Drop all Foreign Key constraints that reference users_user(id)
ALTER TABLE public.clients_clientprofile DROP CONSTRAINT IF EXISTS clients_clientprofile_user_id_fkey;
ALTER TABLE public.chefs_chefprofile DROP CONSTRAINT IF EXISTS chefs_chefprofile_user_id_fkey;
ALTER TABLE public.chefs_chefonboarding DROP CONSTRAINT IF EXISTS chefs_chefonboarding_user_id_fkey;
ALTER TABLE public.business_members DROP CONSTRAINT IF EXISTS business_members_user_id_fkey;

-- 2. Handle users_user.id (Remove identity and change type)
ALTER TABLE public.users_user ALTER COLUMN id DROP IDENTITY IF EXISTS;
ALTER TABLE public.users_user ALTER COLUMN id SET DATA TYPE uuid USING (md5(id::text)::uuid); -- Safe conversion from bigint to some uuid string representation

-- 3. Ensure other user_id columns are UUID
ALTER TABLE public.clients_clientprofile ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.chefs_chefprofile ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::text::uuid;

-- 4. Restore constraints
ALTER TABLE public.clients_clientprofile ADD CONSTRAINT clients_clientprofile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_user(id) ON DELETE CASCADE;
ALTER TABLE public.chefs_chefprofile ADD CONSTRAINT chefs_chefprofile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users_user(id) ON DELETE CASCADE;

COMMIT;
