'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { validarFormatoRFC, normalizarRFC, determinarTipoPersona } from '@/lib/utils/rfc-validator';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rfc, setRfc] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar RFC
    if (!rfc.trim()) {
      toast.error('El RFC es requerido');
      return;
    }

    if (!validarFormatoRFC(rfc)) {
      toast.error('El RFC no tiene un formato válido');
      return;
    }

    if (!nombre.trim()) {
      toast.error('El nombre o razón social es requerido');
      return;
    }

    setLoading(true);

    try {
      // Normalizar RFC y determinar tipo de persona
      const rfcNormalizado = normalizarRFC(rfc);
      const tipoPersona = determinarTipoPersona(rfcNormalizado);

      if (!tipoPersona) {
        toast.error('No se pudo determinar el tipo de persona del RFC');
        setLoading(false);
        return;
      }

      const { error, data } = await signUp(email, password, {
        nombre: nombre.trim(),
        rfc: rfcNormalizado,
        tipoPersona,
      });

      if (error) {
        toast.error('Error al crear cuenta', {
          description: error.message,
        });
        return;
      }

      toast.success('Cuenta creada correctamente', {
        description: 'Revisa tu correo para confirmar tu cuenta',
      });
      router.push('/auth/login');
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Por favor, intenta de nuevo',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre o Razón Social</Label>
          <Input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="mt-1"
            placeholder="Nombre completo o razón social"
          />
        </div>
        <div>
          <Label htmlFor="rfc">RFC</Label>
          <Input
            id="rfc"
            name="rfc"
            type="text"
            autoComplete="off"
            required
            value={rfc}
            onChange={(e) => setRfc(e.target.value.toUpperCase())}
            className="mt-1"
            placeholder="ABCD123456EF7"
            maxLength={13}
          />
          <p className="text-xs text-gray-500 mt-1">
            {rfc && determinarTipoPersona(normalizarRFC(rfc))
              ? `Tipo: ${determinarTipoPersona(normalizarRFC(rfc)) === 'FISICA' ? 'Persona Física' : 'Persona Moral'}`
              : 'Ingresa tu RFC'}
          </p>
        </div>
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1"
            placeholder="Repite tu contraseña"
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </Button>
    </form>
  );
}

