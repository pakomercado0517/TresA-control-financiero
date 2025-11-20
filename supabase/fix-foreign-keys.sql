-- ============================================
-- Script para corregir Foreign Keys en invoices y expenses
-- ============================================
-- Este script elimina las foreign keys antiguas que referencian auth.users
-- y las recrea para que referencien profiles(id)

-- Eliminar foreign keys antiguas que referencian auth.users
DO $$ 
BEGIN
  -- Eliminar foreign key de invoices si referencia auth.users
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_user_id_fkey'
    AND confrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_user_id_fkey;
    RAISE NOTICE 'Constraint invoices_user_id_fkey (auth.users) eliminada';
  END IF;

  -- Eliminar foreign key de expenses si referencia auth.users
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'expenses_user_id_fkey'
    AND confrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE expenses DROP CONSTRAINT expenses_user_id_fkey;
    RAISE NOTICE 'Constraint expenses_user_id_fkey (auth.users) eliminada';
  END IF;
END $$;

-- Recrear foreign keys correctas que referencian profiles(id)
-- Solo si no existen ya
DO $$ 
BEGIN
  -- Crear foreign key para invoices si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_user_id_fkey'
    AND confrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT invoices_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    RAISE NOTICE 'Constraint invoices_user_id_fkey (profiles) creada';
  END IF;

  -- Crear foreign key para expenses si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'expenses_user_id_fkey'
    AND confrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE expenses 
    ADD CONSTRAINT expenses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    RAISE NOTICE 'Constraint expenses_user_id_fkey (profiles) creada';
  END IF;
END $$;

-- Verificar el estado actual de las constraints
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition,
    CASE
        WHEN confrelid = 'profiles'::regclass THEN 'profiles (CORRECTO)'
        WHEN confrelid = 'auth.users'::regclass THEN 'auth.users (INCORRECTO)'
        ELSE 'otra tabla'
    END AS referencia
FROM pg_constraint
WHERE (
        conname = 'invoices_user_id_fkey'
        OR conname = 'expenses_user_id_fkey'
    )
    AND contype = 'f'
ORDER BY conname;