import { useState } from 'react'
import { House, LockKeyhole, Mail, LogIn } from 'lucide-react'

export default function AdminLogin({ onSuccess }) {
  const [identifier, setIdentifier] = useState('admin@amlakiran22.com')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ identifier, password })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ورود انجام نشد.')
      onSuccess()
    } catch (err) {
      setError(err.message || 'ارتباط با سرور برقرار نشد.')
    } finally {
      setBusy(false)
    }
  }

  return <main className="admin-login" dir="rtl">
    <form className="login-card" onSubmit={submit}>
      <div className="login-logo"><House size={27}/></div>
      <span className="admin-eyebrow">AMLAK IRAN 22 · ADMIN</span>
      <h1>ورود به پنل مدیریت</h1>
      <p>برای مدیریت آگهی‌های املاک ایران ۲۲ وارد حساب مدیر شوید.</p>
      {error && <div className="admin-error">{error}</div>}
      <label>نام کاربری یا ایمیل
        <span style={{position:'relative',display:'block'}}>
          <Mail size={16} style={{position:'absolute',right:12,top:14,color:'#94a196'}}/>
          <input autoComplete="username" value={identifier} onChange={e=>setIdentifier(e.target.value)} required style={{paddingRight:38}} placeholder="admin یا ایمیل مدیر"/>
        </span>
      </label>
      <label style={{marginTop:16}}>رمز عبور
        <span style={{position:'relative',display:'block'}}>
          <LockKeyhole size={16} style={{position:'absolute',right:12,top:14,color:'#94a196'}}/>
          <input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required style={{paddingRight:38}} placeholder="رمز عبور مدیر"/>
        </span>
      </label>
      <button className="admin-primary full" disabled={busy}><LogIn size={16}/>{busy ? 'در حال ورود...' : 'ورود به پنل'}</button>
      <a className="back-home" href="/">بازگشت به سایت</a>
    </form>
  </main>
}
