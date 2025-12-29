-- ============================================
-- Esquema de Base de Datos para EBN Financial Reports
-- VERSIÓN CORREGIDA - Orden correcto de creación
-- ============================================
-- 
-- Este esquema crea las tablas en el orden correcto:
-- 1. profiles (primero, porque otras tablas la referencian)
-- 2. invoices
-- 3. expenses
-- 4. subscriptions (si aplica)
-- 5. payment_events (si aplica)
-- ============================================

-- ============================================
-- PASO 1: Tabla: profiles (Perfiles de Usuario)
-- DEBE CREARSE PRIMERO porque otras tablas la referencian
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Datos del perfil
  nombre TEXT,
  rfc TEXT,
  tipo_persona TEXT CHECK (tipo_persona IN ('FISICA', 'MORAL')),
  
  -- Configuraciones
  validaciones_habilitadas JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_rfc ON profiles (rfc) WHERE rfc IS NOT NULL;

-- ============================================
-- PASO 2: Tabla: invoices (Facturas)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uuid TEXT NOT NULL,
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
  pagos JSONB,
  
  -- Complemento de pago
  complemento_pago JSONB,
  
  -- Validación
  validacion JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: UUID debe ser único por usuario
  CONSTRAINT invoices_user_uuid_unique UNIQUE (user_id, uuid)
);

-- Índices para invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_uuid ON invoices (uuid);
CREATE INDEX IF NOT EXISTS idx_invoices_fecha ON invoices (fecha);
CREATE INDEX IF NOT EXISTS idx_invoices_mes_año ON invoices (mes, año);
CREATE INDEX IF NOT EXISTS idx_invoices_tipo ON invoices (tipo);
CREATE INDEX IF NOT EXISTS idx_invoices_rfc_emisor ON invoices (rfc_emisor);

-- ============================================
-- PASO 3: Tabla: expenses (Gastos)
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tipo de origen
  tipo_origen TEXT NOT NULL CHECK (tipo_origen IN ('XML', 'MANUAL')),
  
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
  uuid TEXT,
  tipo TEXT CHECK (tipo IN ('PUE', 'PPD', 'COMPLEMENTO_PAGO')),
  rfc_emisor TEXT,
  nombre_emisor TEXT,
  rfc_receptor TEXT,
  nombre_receptor TEXT,
  moneda TEXT DEFAULT 'MXN',
  tipo_cambio DECIMAL(10, 4) DEFAULT 1,
  
  -- Datos de pagos (para PPD)
  pagos JSONB,
  
  -- Complemento de pago
  complemento_pago JSONB,
  
  -- Validación
  validacion JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: UUID debe ser único por usuario si es XML
  CONSTRAINT expenses_user_uuid_unique UNIQUE (user_id, uuid)
);

-- Índices para expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_uuid ON expenses (uuid) WHERE uuid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_expenses_fecha ON expenses (fecha);
CREATE INDEX IF NOT EXISTS idx_expenses_mes_año ON expenses (mes, año);
CREATE INDEX IF NOT EXISTS idx_expenses_tipo_origen ON expenses (tipo_origen);
CREATE INDEX IF NOT EXISTS idx_expenses_categoria ON expenses (categoria) WHERE categoria IS NOT NULL;

-- ============================================
-- PASO 4: Funciones auxiliares
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
DROP FUNCTION IF EXISTS create_or_update_profile(UUID, TEXT, TEXT, TEXT, JSONB);

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
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE
    );
END;
$$;

-- Otorgar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION create_or_update_profile TO anon;
GRANT EXECUTE ON FUNCTION create_or_update_profile TO authenticated;

-- ============================================
-- PASO 5: Triggers para updated_at
-- ============================================
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

-- ============================================
-- PASO 6: Row Level Security (RLS)
-- ============================================
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = invoices.user_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own invoices" ON invoices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = invoices.user_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = invoices.user_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own invoices" ON invoices
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = invoices.user_id
        AND profiles.user_id = auth.uid()
    )
  );

-- Políticas RLS para expenses
CREATE POLICY "Users can view their own expenses" ON expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = expenses.user_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own expenses" ON expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = expenses.user_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own expenses" ON expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = expenses.user_id
        AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own expenses" ON expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = expenses.user_id
        AND profiles.user_id = auth.uid()
    )
  );

-- ============================================
-- Mensaje de éxito
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Schema principal creado exitosamente';
  RAISE NOTICE '   - Tabla profiles';
  RAISE NOTICE '   - Tabla invoices';
  RAISE NOTICE '   - Tabla expenses';
  RAISE NOTICE '   - Funciones y triggers';
  RAISE NOTICE '   - RLS configurado';
END $$;

