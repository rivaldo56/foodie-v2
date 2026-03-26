-- FINAL SCHEMA ALIGNMENT FOR FOODIE LIVE
-- Run this in your Supabase SQL Editor

-- 1. Fix User Table (Django side)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users_user' AND column_name='onboarding_status') THEN
        ALTER TABLE public.users_user ADD COLUMN onboarding_status character varying(20) DEFAULT 'not_started';
    END IF;
END $$;

-- 2. Fix ChefProfile (chefs_chefprofile)
ALTER TABLE public.chefs_chefprofile DROP CONSTRAINT IF EXISTS chefs_chefprofile_user_id_key;
ALTER TABLE public.chefs_chefprofile ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.chefs_chefprofile ADD CONSTRAINT chefs_chefprofile_user_id_key UNIQUE (user_id);

-- 3. Fix ChefOnboarding (chefs_chefonboarding)
ALTER TABLE public.chefs_chefonboarding DROP CONSTRAINT IF EXISTS chefs_chefonboarding_user_id_key;
ALTER TABLE public.chefs_chefonboarding ALTER COLUMN user_id SET DATA TYPE uuid USING user_id::text::uuid;
ALTER TABLE public.chefs_chefonboarding ADD CONSTRAINT chefs_chefonboarding_user_id_key UNIQUE (user_id);

-- 4. Fix Payments (payments_payment)
ALTER TABLE public.payments_payment ALTER COLUMN client_id SET DATA TYPE uuid USING client_id::text::uuid;

-- 5. Grant Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
