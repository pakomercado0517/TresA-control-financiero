-- ============================================
-- Esquema de Base de Datos para EBN Financial Reports
-- ============================================
--
-- Este esquema crea las tablas necesarias para almacenar:
-- - Facturas (invoices)
-- - Gastos (expenses)
-- - Perfiles de usuario (profiles)
--
-- Nota: La tabla 'profiles' es la tabla principal de usuarios
-- ============================================

-- ============================================
-- Tabla: invoices (Facturas)
-- ============================================
-- Eliminar constraints antiguas que referencian auth.users
DO $$ 
BEGIN
  -- Eliminar foreign key constraint antigua si existe y referencia auth.users
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_user_id_fkey'
    AND confrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_user_id_fkey;
    RAISE NOTICE 'Constraint invoices_user_id_fkey (auth.users) eliminada';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  uuid TEXT NOT NULL UNIQUE, -- UUID del CFDI
  fecha TIMESTAMPTZ NOT NULL,
  mes INTEGER NOT NULL,
  año INTEGER NOT NULL,
  total DECIMAL(15, 2) NOT NULL,
  subtotal DECIMAL(15, 2) NOT NULL,
  iva DECIMAL(15, 2) NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL CHECK (tipo IN ('PUE', 'PPD', 'COMPLEMENTO_PAGO')),
  rfc_emisor TEXT NOT NULL,
  nombre_emisor TEXT,
  rfc_receptor TEXT NOT NULL,
  nombre_receptor TEXT,
  concepto TEXT,
  moneda TEXT DEFAULT 'MXN',
  tipo_cambio DECIMAL(10, 4) DEFAULT 1,

-- Datos de pagos (para PPD)
pagos JSONB, -- Array de objetos Pago

-- Complemento de pago
complemento_pago JSONB, -- Objeto ComplementoPago

-- Validación
validacion JSONB, -- Objeto EstadoValidacionCFDI

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Índices
CONSTRAINT invoices_user_uuid_unique UNIQUE (user_id, uuid) );

-- Agregar foreign key después de crear la tabla (si no existe)
DO $$ 
BEGIN
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
END $$;

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices (user_id);

CREATE INDEX IF NOT EXISTS idx_invoices_uuid ON invoices (uuid);

CREATE INDEX IF NOT EXISTS idx_invoices_fecha ON invoices (fecha);

CREATE INDEX IF NOT EXISTS idx_invoices_mes_año ON invoices (mes, año);

CREATE INDEX IF NOT EXISTS idx_invoices_tipo ON invoices (tipo);

CREATE INDEX IF NOT EXISTS idx_invoices_rfc_emisor ON invoices (rfc_emisor);

-- ============================================
-- Tabla: expenses (Gastos)
-- ============================================
-- Eliminar constraints antiguas que referencian auth.users
DO $$ 
BEGIN
  -- Eliminar foreign key constraint antigua si existe y referencia auth.users
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'expenses_user_id_fkey'
    AND confrelid = 'auth.users'::regclass
  ) THEN
    ALTER TABLE expenses DROP CONSTRAINT expenses_user_id_fkey;

RAISE NOTICE 'Constraint expenses_user_id_fkey (auth.users) eliminada';

END IF;

END $$;

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

-- Tipo de origen
tipo_origen TEXT NOT NULL CHECK ( tipo_origen IN ('XML', 'MANUAL') ),

-- Datos comunes
fecha TIMESTAMPTZ NOT NULL,
mes INTEGER NOT NULL,
año INTEGER NOT NULL,
total DECIMAL(15, 2) NOT NULL,
subtotal DECIMAL(15, 2) NOT NULL,
iva DECIMAL(15, 2) NOT NULL DEFAULT 0,
concepto TEXT,
categoria TEXT,

-- Datos específicos de XML
uuid TEXT, -- UUID del CFDI (solo para tipo_origen = 'XML')
tipo TEXT CHECK (
    tipo IN (
        'PUE',
        'PPD',
        'COMPLEMENTO_PAGO'
    )
), -- Solo para XML
rfc_emisor TEXT, -- Solo para XML
nombre_emisor TEXT, -- Solo para XML
rfc_receptor TEXT, -- Solo para XML
nombre_receptor TEXT, -- Solo para XML
moneda TEXT DEFAULT 'MXN',
tipo_cambio DECIMAL(10, 4) DEFAULT 1,

-- Datos de pagos (para PPD)
pagos JSONB, -- Array de objetos Pago

-- Complemento de pago
complemento_pago JSONB, -- Objeto ComplementoPago

-- Validación
validacion JSONB, -- Objeto EstadoValidacionGasto

-- Metadata
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),

-- Constraint: UUID debe ser único por usuario si es XML
CONSTRAINT expenses_user_uuid_unique UNIQUE (user_id, uuid) );

-- Agregar foreign key después de crear la tabla (si no existe)
DO $$ 
BEGIN
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

-- Índices
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_uuid ON expenses (uuid)
WHERE
    uuid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_fecha ON expenses (fecha);

CREATE INDEX IF NOT EXISTS idx_expenses_mes_año ON expenses (mes, año);

CREATE INDEX IF NOT EXISTS idx_expenses_tipo_origen ON expenses (tipo_origen);

CREATE INDEX IF NOT EXISTS idx_expenses_categoria ON expenses (categoria)
WHERE
    categoria IS NOT NULL;

-- ============================================
-- Tabla: profiles (Perfiles de Usuario)
-- ============================================
-- Eliminar constraints problemáticas si existen (de versiones anteriores)
-- Esto debe ejecutarse ANTES de crear la tabla para evitar conflictos
DO $$ 
DECLARE
  r RECORD;
BEGIN
  -- Eliminar foreign key constraint en id si existe
  -- Esta constraint no debería existir, pero puede quedar de versiones anteriores
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

RAISE NOTICE 'Constraint profiles_id_fkey eliminada';

END IF;

-- Eliminar cualquier otra foreign key en profiles.id que referencie auth.users
FOR r IN (
    SELECT conname
    FROM pg_constraint
    WHERE
        conrelid = 'profiles'::regclass
        AND contype = 'f'
        AND confrelid = 'auth.users'::regclass
        AND array_position(
            conkey,
            (
                SELECT attnum
                FROM pg_attribute
                WHERE
                    attrelid = 'profiles'::regclass
                    AND attname = 'id'
            )
        ) IS NOT NULL
) LOOP
EXECUTE format(
    'ALTER TABLE profiles DROP CONSTRAINT IF EXISTS %I',
    r.conname
);

RAISE NOTICE 'Constraint % eliminada', r.conname;

END LOOP;

END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

-- Datos del perfil
nombre TEXT,
rfc TEXT,
tipo_persona TEXT CHECK (
    tipo_persona IN ('FISICA', 'MORAL')
),

-- Configuraciones
validaciones_habilitadas JSONB DEFAULT '{}'::jsonb,

-- Metadata


created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_rfc ON profiles (rfc)
WHERE
    rfc IS NOT NULL;

-- ============================================
-- Row Level Security (RLS)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Políticas RLS para invoices
-- ============================================
-- Eliminar políticas existentes si existen (para permitir re-ejecutar el schema)
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;

-- Los usuarios solo pueden ver sus propias facturas
-- Verifica que el user_id de la factura corresponda a un perfil cuyo user_id (auth) sea igual a auth.uid()
CREATE POLICY "Users can view their own invoices" ON invoices FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = invoices.user_id
                AND profiles.user_id = auth.uid ()
        )
    );

-- Los usuarios solo pueden insertar sus propias facturas
CREATE POLICY "Users can insert their own invoices" ON invoices FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = invoices.user_id
                AND profiles.user_id = auth.uid ()
        )
    );

-- Los usuarios solo pueden actualizar sus propias facturas
CREATE POLICY "Users can update their own invoices" ON invoices
FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = invoices.user_id
                AND profiles.user_id = auth.uid ()
        )
    );

-- Los usuarios solo pueden eliminar sus propias facturas
CREATE POLICY "Users can delete their own invoices" ON invoices FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = invoices.user_id
            AND profiles.user_id = auth.uid ()
    )
);

-- ============================================
-- Políticas RLS para expenses
-- ============================================
-- Eliminar políticas existentes si existen (para permitir re-ejecutar el schema)
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;

DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

-- Los usuarios solo pueden ver sus propios gastos
CREATE POLICY "Users can view their own expenses" ON expenses FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = expenses.user_id
                AND profiles.user_id = auth.uid ()
        )
    );

-- Los usuarios solo pueden insertar sus propios gastos
CREATE POLICY "Users can insert their own expenses" ON expenses FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = expenses.user_id
                AND profiles.user_id = auth.uid ()
        )
    );

-- Los usuarios solo pueden actualizar sus propios gastos
CREATE POLICY "Users can update their own expenses" ON expenses
FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = expenses.user_id
                AND profiles.user_id = auth.uid ()
        )
    );

-- Los usuarios solo pueden eliminar sus propios gastos
CREATE POLICY "Users can delete their own expenses" ON expenses FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = expenses.user_id
            AND profiles.user_id = auth.uid ()
    )
);

-- ============================================
-- Políticas RLS para profiles
-- ============================================
-- Eliminar políticas existentes si existen (para permitir re-ejecutar el schema)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT
WITH
    CHECK (auth.uid () = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE
    USING (auth.uid () = user_id);

-- ============================================
-- Funciones auxiliares
-- ============================================
-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear o actualizar perfil con permisos elevados
-- Esta función permite crear perfiles incluso cuando el usuario no está completamente autenticado
-- Útil durante el proceso de registro cuando se requiere confirmación de email

-- Eliminar la función anterior si existe (necesario si cambia el tipo de retorno)
DROP FUNCTION IF EXISTS create_or_update_profile (UUID, TEXT, TEXT, TEXT, JSONB);

CREATE OR REPLACE FUNCTION create_or_update_profile(
  p_user_id UUID,
  p_nombre TEXT,
  p_rfc TEXT,
  p_tipo_persona TEXT,
  p_validaciones_habilitadas JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_action TEXT;
BEGIN
  -- Verificar si el usuario existe en auth.users
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'El usuario con ID % no existe en auth.users', p_user_id;
  END IF;

  -- Verificar si el perfil ya existe
  SELECT id INTO v_profile_id FROM profiles WHERE user_id = p_user_id;
  
  IF v_profile_id IS NULL THEN
    -- Insertar nuevo perfil
    INSERT INTO profiles (
      id,
      user_id,
      nombre,
      rfc,
      tipo_persona,
      validaciones_habilitadas,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      p_user_id,
      p_nombre,
      p_rfc,
      p_tipo_persona,
      p_validaciones_habilitadas,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_profile_id;
    v_action := 'inserted';
  ELSE
    -- Actualizar perfil existente
    UPDATE profiles SET
      nombre = p_nombre,
      rfc = p_rfc,
      tipo_persona = p_tipo_persona,
      validaciones_habilitadas = p_validaciones_habilitadas,
      updated_at = NOW()
    WHERE user_id = p_user_id;
    v_action := 'updated';
  END IF;

  -- Retornar información sobre la operación
  RETURN jsonb_build_object(
    'success', true,
    'profile_id', v_profile_id,
    'user_id', p_user_id,
    'action', v_action
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Retornar error en formato JSON
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- Otorgar permisos para ejecutar la función
-- Permite que usuarios anónimos y autenticados puedan llamar a esta función
GRANT EXECUTE ON FUNCTION create_or_update_profile TO anon;

GRANT EXECUTE ON FUNCTION create_or_update_profile TO authenticated;

-- Triggers para actualizar updated_at
-- Eliminar triggers existentes si existen (para permitir re-ejecutar el schema)
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();