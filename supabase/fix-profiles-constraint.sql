-- ============================================
-- Script para eliminar constraint problemática en profiles
-- ============================================
-- Este script elimina la foreign key constraint en profiles.id
-- que está causando errores al crear perfiles

-- Eliminar la constraint si existe
DO $$ 
BEGIN
  -- Eliminar foreign key constraint en id si existe
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_id_fkey;
    RAISE NOTICE 'Constraint profiles_id_fkey eliminada exitosamente';
  ELSE
    RAISE NOTICE 'La constraint profiles_id_fkey no existe';
  END IF;
  
  -- Verificar si hay otras constraints problemáticas
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname LIKE 'profiles%' 
    AND contype = 'f'
    AND conrelid = 'profiles'::regclass
    AND confrelid = 'auth.users'::regclass
  ) THEN
    RAISE NOTICE 'Se encontraron otras foreign keys en profiles que referencian auth.users';
  END IF;
END $$;

-- Verificar el estado actual de la tabla
SELECT
    conname AS constraint_name,
    contype AS constraint_type,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE
    conrelid = 'profiles'::regclass
ORDER BY conname;