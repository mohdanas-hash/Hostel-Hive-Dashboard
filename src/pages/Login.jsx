import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, ErrorBox, Field, Input } from '../components/ui';
import { errMsg } from '../lib/utils';

export default function Login() {
  const { login, isAuthenticated, isCentralAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (isAuthenticated && isCentralAdmin) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response ? errMsg(err, 'Invalid email or password') : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-5">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Hostel Hive Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in as the central admin</p>
        </div>
        <ErrorBox error={error} />
        <Field label="Email">
          <Input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" loading={busy} className="w-full">Sign in</Button>
      </form>
    </div>
  );
}
