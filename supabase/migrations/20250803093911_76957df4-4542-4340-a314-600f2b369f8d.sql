-- Add funded_by field to tasks table to distinguish between admin and brand funded tasks
ALTER TABLE public.tasks 
ADD COLUMN funded_by text DEFAULT 'admin' CHECK (funded_by IN ('admin', 'brand'));

-- Add budget_allocated field for tracking allocated budget for admin tasks
ALTER TABLE public.tasks 
ADD COLUMN budget_allocated numeric DEFAULT 0;

-- Add comment to explain the new fields
COMMENT ON COLUMN public.tasks.funded_by IS 'Indicates who is funding this task: admin (platform funded) or brand (brand wallet funded)';
COMMENT ON COLUMN public.tasks.budget_allocated IS 'Budget allocated for this task (used for admin-funded tasks tracking)';