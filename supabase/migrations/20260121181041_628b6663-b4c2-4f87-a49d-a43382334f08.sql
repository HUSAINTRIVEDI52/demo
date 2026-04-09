-- Add 'starter' to the plan_type enum
ALTER TYPE plan_type ADD VALUE IF NOT EXISTS 'starter' AFTER 'free';