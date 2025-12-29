-- ============================================
-- Esquema de Base de Datos: Stripe Subscriptions
-- ============================================
-- 
-- Este archivo crea las tablas necesarias para manejar
-- suscripciones y pagos con Stripe
--
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- Tabla: subscriptions (Suscripciones)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- IDs de Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  
  -- Estado de la suscripción
  status TEXT NOT NULL CHECK (
    status IN (
      'active',
      'canceled',
      'past_due',
      'unpaid',
      'trialing',
      'incomplete',
      'incomplete_expired',
      'paused'
    )
  ),
  
  -- Plan
  plan_id TEXT NOT NULL CHECK (plan_id IN ('basic', 'pro', 'enterprise')),
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10, 2) NOT NULL, -- Precio en MXN
  
  -- Períodos
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  
  -- Cancelación
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: Un usuario solo puede tener una suscripción activa
  CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id)
);

-- Índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions (stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions (stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions (plan_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger si existe antes de crearlo
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- ============================================
-- Tabla: payment_events (Eventos de Pago)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Datos de Stripe
  stripe_event_id TEXT UNIQUE NOT NULL,
  stripe_event_type TEXT NOT NULL,
  
  -- Datos del evento (JSON completo del evento)
  event_data JSONB NOT NULL,
  
  -- Metadata
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para payment_events
CREATE INDEX IF NOT EXISTS idx_payment_events_user_id ON payment_events (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_stripe_event_id ON payment_events (stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_stripe_event_type ON payment_events (stripe_event_type);
CREATE INDEX IF NOT EXISTS idx_payment_events_processed_at ON payment_events (processed_at);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Habilitar RLS en subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "System can manage subscriptions" ON subscriptions;

-- Política: Usuarios solo pueden ver su propia suscripción
CREATE POLICY "Users can view own subscription"
  ON subscriptions
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Política: Solo el sistema puede insertar/actualizar (vía webhooks)
-- Los usuarios no pueden modificar directamente sus suscripciones
CREATE POLICY "System can manage subscriptions"
  ON subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Habilitar RLS en payment_events
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view own payment events" ON payment_events;
DROP POLICY IF EXISTS "System can insert payment events" ON payment_events;

-- Política: Usuarios solo pueden ver sus propios eventos
CREATE POLICY "Users can view own payment events"
  ON payment_events
  FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Política: Solo el sistema puede insertar eventos (vía webhooks)
CREATE POLICY "System can insert payment events"
  ON payment_events
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Comentarios en las tablas (opcional, para documentación)
-- ============================================

COMMENT ON TABLE subscriptions IS 'Almacena las suscripciones de los usuarios con Stripe';
COMMENT ON TABLE payment_events IS 'Registra todos los eventos de webhook recibidos de Stripe para auditoría';

COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'ID del cliente en Stripe';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'ID de la suscripción en Stripe';
COMMENT ON COLUMN subscriptions.status IS 'Estado actual de la suscripción (active, canceled, etc.)';
COMMENT ON COLUMN subscriptions.plan_id IS 'ID del plan (basic, pro, enterprise)';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Si es true, la suscripción se cancelará al final del período actual';

COMMENT ON COLUMN payment_events.stripe_event_id IS 'ID único del evento en Stripe (para idempotencia)';
COMMENT ON COLUMN payment_events.stripe_event_type IS 'Tipo de evento (customer.subscription.created, etc.)';
COMMENT ON COLUMN payment_events.event_data IS 'Datos completos del evento en formato JSON';

-- ============================================
-- Verificación: Mostrar mensaje de éxito
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tablas de suscripciones creadas exitosamente';
  RAISE NOTICE '   - subscriptions';
  RAISE NOTICE '   - payment_events';
  RAISE NOTICE '   - RLS configurado';
  RAISE NOTICE '   - Índices creados';
END $$;



