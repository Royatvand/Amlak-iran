import { useEffect, useMemo, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { LayoutDashboard, Building2, Plus, Search, Pencil, Trash2, Eye, EyeOff, X, Menu, House, MapPin, BedDouble, Ruler, ImagePlus, CheckCircle2, Clock3, LogOut } from 'lucide-react'
import AdminLogin from './AdminLogin.jsx'
import { isClosed, closedLabel } from './listing.js'
import './admin.css'

const emptyForm = { title: '', deal_type: 'خرید', region: '1', neighborhood: '', price: '', area: '', rooms: '0', description: '', images: [], image_url: '', status: 'draft', deposit: '', monthly_rent: '', availability: 'available', floor: '', building_age: '', parking: false, elevator: false, storage: false }
const neighborhoods = {
  1: ['زعفرانیه','نیاوران','ولنجک','الهیه','فرمانیه','قیطریه','تجریش','اقدسیه'],
  2: ['سعادت‌آباد','شهرک غرب','گیشا','مرزداران','صادقیه','ستارخان'],
  3: ['اختیاریه','قلهک','دروس','ونک','جردن'],
  4: ['تهرانپارس','حکیمیه','مجیدیه','شمیران‌نو'],
  5: ['پونک','جنت‌آباد','شهران','بلوار فردوس'],
  6: ['یوسف‌آباد','امیرآباد','فاطمی','میدان ولیعصر'],
  7: ['نظام‌آباد','عباس‌آباد','بهار','سهروردی'],
  8: ['نارمک','هفت‌حوض','مجیدیه جنوبی'],
  9: ['مهرآباد','استادمعین','دکترهوشیار'],
  10: ['سلسبیل','هاشمی','جیحون'],
  11: ['منیریه','امیریه','راه‌آهن'],
  12: ['بازار','بهارستان','سنگلج'],
  13: ['پیروزی','نیروی هوایی','صفا'],
  14: ['چهارصد دستگاه','مینابی','نبرد'],
  15: ['افسریه','مسعودیه','مشیریه'],
  16: ['نازی‌آباد','جوادیه','خزانه'],
  17: ['یافت‌آباد','زمزم','ابوذر'],
  18: ['شهرک ولیعصر','یافت‌آباد جنوبی','شادآباد'],
  19: ['خانی‌آبادنو','نعمت‌آباد','دولت‌خواه'],
  20: ['شهرری','دولت‌آباد','صفائیه'],
  21: ['تهرانسر','چیتگر','وردآورد'],
  22: ['دهکده المپیک','شهرک گلستان','زیبادشت']
}

function formatPrice(value) {
  return String(value || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬')
}

export default function Admin() {
  const [properties, setProperties] = useState([])
  const [page, setPage] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [busy, setBusy] = useState(false)
  const [uploadBusy, setUploadBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [authorized, setAuthorized] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  async function loadProperties() {
    const response = await fetch('/api/admin/properties', { credentials: 'same-origin' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'دریافت آگهی‌ها ناموفق بود.')
    setProperties(data.properties || [])
  }

  useEffect(() => {
    fetch('/api/admin/me', { credentials: 'same-origin', cache: 'no-store' })
      .then(response => response.json())
      .then(data => setAuthorized(Boolean(data.authenticated)))
      .catch(() => setAuthorized(false))
      .finally(() => setAuthChecked(true))
  }, [])

  useEffect(() => {
    if (authorized) loadProperties().catch(err => setError(err.message))
  }, [authorized])

  function openCreate() { setEditing(null); setForm(emptyForm); setError(''); setPage('form') }
  function openEdit(item) {
    setEditing(item)
    const images = Array.isArray(item.images) && item.images.length ? item.images : (item.image_url ? [item.image_url] : [])
    setForm({ title: item.title || '', deal_type: item.deal_type || 'خرید', region: String(item.region), neighborhood: item.neighborhood || '', price: item.price || '', area: String(item.area || ''), rooms: String(item.rooms || 0), description: item.description || '', images, image_url: images[0] || '', status: item.status || 'draft', deposit: item.deposit || (item.deal_type && item.deal_type !== 'خرید' ? item.price || '' : ''), monthly_rent: item.monthly_rent || '', availability: item.availability === 'closed' ? 'closed' : 'available', floor: item.floor ?? '', building_age: item.building_age ?? '', parking: Boolean(item.parking), elevator: Boolean(item.elevator), storage: Boolean(item.storage) })
    setError(''); setPage('form')
  }

  async function uploadImages(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    const remaining = 10 - form.images.length
    if (remaining <= 0) { setError('برای هر آگهی حداکثر ۱۰ تصویر می‌توانید ثبت کنید.'); return }
    if (files.length > remaining) { setError('حداکثر ' + remaining + ' تصویر دیگر می‌توانید اضافه کنید.'); return }
    const invalid = files.find(file => !['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)
    if (invalid) { setError('همه تصاویر باید JPG، PNG یا WEBP و حداکثر ۵ مگابایت باشند.'); return }
    setUploadBusy(true); setError('')
    try {
      const uploaded = await Promise.all(files.map(async (file, index) => {
        const blob = await upload('properties/' + Date.now() + '-' + index + '-' + file.name.replace(/[^a-zA-Z0-9._-]/g, '-'), file, { access: 'public', handleUploadUrl: '/api/admin/upload' })
        return blob.url
      }))
      setForm(current => {
        const images = [...current.images, ...uploaded]
        return { ...current, images, image_url: images[0] || '' }
      })
      setNotice(files.length.toLocaleString('fa-IR') + ' تصویر با موفقیت آپلود شد.')
    } catch (err) { setError(err.message || 'آپلود تصاویر انجام نشد.') } finally { setUploadBusy(false) }
  }

  function removeImage(index) {
    setForm(current => {
      const images = current.images.filter((_, i) => i !== index)
      return { ...current, images, image_url: images[0] || '' }
    })
  }

  function setMainImage(index) {
    setForm(current => {
      const images = [...current.images]
      const [main] = images.splice(index, 1)
      images.unshift(main)
      return { ...current, images, image_url: images[0] || '' }
    })
  }

  async function saveProperty(event) {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const url = editing ? '/api/admin/property?id=' + editing.id : '/api/admin/properties'
      const response = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, image_url: form.images[0] || '', images: form.images }), credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'ذخیره آگهی انجام نشد.')
      await loadProperties(); setNotice(editing ? 'آگهی با موفقیت ویرایش شد.' : 'آگهی جدید ثبت شد.')
      setPage('properties'); setEditing(null)
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  async function deleteProperty(item) {
    if (!window.confirm('آگهی «' + item.title + '» حذف شود؟ این عملیات قابل بازگشت نیست.')) return
    try {
      const response = await fetch('/api/admin/property?id=' + item.id, { method: 'DELETE', credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'حذف آگهی انجام نشد.')
      setProperties(current => current.filter(x => x.id !== item.id)); setNotice('آگهی حذف شد.')
    } catch (err) { setError(err.message) }
  }

  async function togglePublish(item) {
    const next = { ...item, status: item.status === 'published' ? 'draft' : 'published' }
    try {
      const response = await fetch('/api/admin/property?id=' + item.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next), credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'تغییر وضعیت انجام نشد.')
      setProperties(current => current.map(x => x.id === item.id ? data.property : x))
      setNotice(next.status === 'published' ? 'آگهی در سایت منتشر شد.' : 'آگهی از سایت خارج شد.')
    } catch (err) { setError(err.message) }
  }

  async function toggleClosed(item) {
    const next = { ...item, availability: isClosed(item) ? 'available' : 'closed' }
    try {
      const response = await fetch('/api/admin/property?id=' + item.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next), credentials: 'same-origin' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'تغییر وضعیت ملک انجام نشد.')
      setProperties(current => current.map(x => x.id === item.id ? data.property : x))
      setNotice(isClosed(next) ? 'آگهی با برچسب «' + closedLabel(next) + '» در سایت می‌ماند.' : 'آگهی دوباره «موجود» شد.')
    } catch (err) { setError(err.message) }
  }

  const published = properties.filter(x => x.status === 'published').length
  const drafts = properties.length - published
  const filtered = useMemo(() => properties.filter(x => (statusFilter === 'all' || (statusFilter === 'closed' ? isClosed(x) : x.status === statusFilter)) && (x.title + x.neighborhood + x.region).toLowerCase().includes(search.toLowerCase())), [properties, statusFilter, search])

  if (!authChecked) return <main className="admin-login" dir="rtl"><div className="login-card">در حال بررسی دسترسی...</div></main>
  if (!authorized) return <AdminLogin onSuccess={() => { setAuthorized(true); setError('') }} />

  return <div className="admin-shell" dir="rtl">
    <aside className={'admin-sidebar ' + (mobileNav ? 'mobile-open' : '')}>
      <a href="/" className="admin-brand"><span className="admin-brand-mark"><House size={22}/></span><span><b>AMLAK IRAN 22</b><small>پنل مدیریت</small></span></a>
      <div className="sidebar-caption">مدیریت</div>
      <button className={page === 'dashboard' ? 'side-link active' : 'side-link'} onClick={() => {setPage('dashboard');setMobileNav(false)}}><LayoutDashboard size={18}/> داشبورد</button>
      <button className={page === 'properties' ? 'side-link active' : 'side-link'} onClick={() => {setPage('properties');setMobileNav(false)}}><Building2 size={18}/> آگهی‌های املاک</button>
      <button className="side-link" onClick={openCreate}><Plus size={18}/> ثبت آگهی جدید</button>
      <div className="sidebar-bottom"><a href="/" className="side-link"><House size={18}/> مشاهده سایت</a><button className="side-link logout" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }); setAuthorized(false); setProperties([]) }}><LogOut size={18}/> خروج از پنل</button><span className="side-link"><CheckCircle2 size={18}/> دسترسی مدیریت فعال</span></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><button className="admin-menu-toggle" onClick={() => setMobileNav(!mobileNav)}><Menu/></button><div><span className="admin-breadcrumb">املاک ایران ۲۲</span><b>{page === 'dashboard' ? 'داشبورد' : page === 'properties' ? 'مدیریت آگهی‌ها' : editing ? 'ویرایش آگهی' : 'ثبت آگهی جدید'}</b></div><a href="/" className="view-site">مشاهده سایت <span>↗</span></a></header>
      <div className="admin-content">
        {notice && <div className="admin-notice"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice('')}><X size={15}/></button></div>}
        {error && <div className="admin-error inline-error">{error}<button onClick={() => setError('')}><X size={15}/></button></div>}
        {page === 'dashboard' && <><div className="admin-page-heading"><div><span className="admin-eyebrow">OVERVIEW</span><h1>خوش آمدید 👋</h1><p>وضعیت آگهی‌های املاک ایران ۲۲ را از اینجا مدیریت کنید.</p></div><button className="admin-primary" onClick={openCreate}><Plus size={18}/> ثبت آگهی جدید</button></div>
          <div className="admin-stats"><article><span className="stat-icon"><Building2/></span><small>کل آگهی‌ها</small><b>{properties.length.toLocaleString('fa-IR')}</b><em>تمام فایل‌های ثبت‌شده</em></article><article><span className="stat-icon green"><CheckCircle2/></span><small>آگهی‌های منتشرشده</small><b>{published.toLocaleString('fa-IR')}</b><em>قابل مشاهده در سایت</em></article><article><span className="stat-icon amber"><Clock3/></span><small>پیش‌نویس‌ها</small><b>{drafts.toLocaleString('fa-IR')}</b><em>منتظر انتشار</em></article></div>
          <section className="admin-panel"><div className="panel-heading"><div><h2>آخرین آگهی‌ها</h2><p>جدیدترین فایل‌های ثبت‌شده</p></div><button className="text-action" onClick={() => setPage('properties')}>مشاهده همه</button></div>{properties.length ? <PropertyTable items={properties.slice(0,5)} onEdit={openEdit} onDelete={deleteProperty} onToggle={togglePublish}/> : <EmptyState onCreate={openCreate}/>}</section>
        </>}
        {page === 'properties' && <><div className="admin-page-heading"><div><span className="admin-eyebrow">PROPERTY MANAGEMENT</span><h1>آگهی‌های املاک</h1><p>آگهی‌ها را ثبت، ویرایش، منتشر یا حذف کنید.</p></div><button className="admin-primary" onClick={openCreate}><Plus size={18}/> ثبت آگهی</button></div>
          <section className="admin-panel"><div className="property-toolbar"><div className="admin-search"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="جست‌وجوی عنوان، محله یا منطقه..."/></div><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="all">همه وضعیت‌ها</option><option value="published">منتشرشده</option><option value="draft">پیش‌نویس</option><option value="closed">فروخته‌شده / اجاره رفته</option></select></div><PropertyTable items={filtered} onEdit={openEdit} onDelete={deleteProperty} onToggle={togglePublish} onClosed={toggleClosed}/>{!filtered.length && <div className="empty-admin">آگهی‌ای مطابق جست‌وجوی شما پیدا نشد.</div>}</section>
        </>}
        {page === 'form' && <><div className="admin-page-heading"><div><span className="admin-eyebrow">PROPERTY DETAILS</span><h1>{editing ? 'ویرایش آگهی' : 'ثبت آگهی جدید'}</h1><p>اطلاعات ملک را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.</p></div></div>
          <form className="admin-panel property-form" onSubmit={saveProperty}>
            <div className="form-section-title"><Building2 size={19}/><div><b>اطلاعات اصلی ملک</b><small>مشخصات پایه آگهی</small></div></div>
            <div className="form-grid"><label className="wide">عنوان آگهی *<input required value={form.title} onChange={e => setForm({...form,title:e.target.value})} placeholder="مثلاً آپارتمان نورگیر در زعفرانیه"/></label>
              <label>نوع معامله *<select value={form.deal_type} onChange={e => setForm({...form,deal_type:e.target.value})}><option>خرید</option><option>اجاره</option><option>رهن</option></select></label>
              <label>منطقه تهران *<select value={form.region} onChange={e => setForm({...form,region:e.target.value,neighborhood:''})}>{Array.from({length:22},(_,i)=><option value={i+1} key={i}>منطقه {i+1}</option>)}</select></label>
              <label>محله *<select required value={form.neighborhood} onChange={e => setForm({...form,neighborhood:e.target.value})}><option value="">انتخاب محله</option>{(neighborhoods[form.region] || []).map(n=><option key={n}>{n}</option>)}</select></label>
              {form.deal_type === 'خرید'
                ? <label>قیمت (تومان) *<input required value={form.price} onChange={e => setForm({...form,price:e.target.value})} placeholder="مثلاً ۱۸٬۵۰۰٬۰۰۰٬۰۰۰"/></label>
                : <label>{form.deal_type === 'رهن' ? 'مبلغ رهن (تومان) *' : 'مبلغ ودیعه (تومان) *'}<input required value={form.deposit} onChange={e => setForm({...form,deposit:e.target.value})} placeholder="مثلاً ۵۰٬۰۰۰٬۰۰۰٬۰۰۰"/></label>}
              {form.deal_type === 'اجاره' && <label>اجارهٔ ماهانه (تومان) *<input required value={form.monthly_rent} onChange={e => setForm({...form,monthly_rent:e.target.value})} placeholder="مثلاً ۱۵٬۰۰۰٬۰۰۰"/></label>}
              <label>متراژ (متر) *<input required type="number" min="1" value={form.area} onChange={e => setForm({...form,area:e.target.value})} placeholder="مثلاً ۱۲۵"/></label>
              <label>تعداد اتاق خواب<input type="number" min="0" max="20" value={form.rooms} onChange={e => setForm({...form,rooms:e.target.value})}/></label>
              <label>طبقه<input type="number" min="-5" max="100" value={form.floor} onChange={e => setForm({...form,floor:e.target.value})} placeholder="۰ = همکف"/></label>
              <label>سن بنا (سال)<input type="number" min="0" max="100" value={form.building_age} onChange={e => setForm({...form,building_age:e.target.value})} placeholder="۰ = نوساز"/></label>
              <div className="wide amenity-checks"><span>امکانات</span>{[['parking','پارکینگ'],['elevator','آسانسور'],['storage','انباری']].map(([key,label]) => <label key={key} className="check-option"><input type="checkbox" checked={Boolean(form[key])} onChange={e => setForm({...form,[key]:e.target.checked})}/>{label}</label>)}</div>
              <label className="wide">تصاویر ملک
                <div className="upload-row">
                  <span className="image-count">{form.images.length.toLocaleString('fa-IR')} از ۱۰ تصویر</span>
                  <label className="upload-button"><ImagePlus size={16}/>{uploadBusy ? 'در حال آپلود...' : 'انتخاب چند تصویر'}<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={uploadBusy || form.images.length >= 10} onChange={e => { uploadImages(e.target.files); e.target.value = '' }}/></label>
                </div>
                <small className="field-hint">فرمت‌های JPG، PNG و WEBP · حداکثر ۵ مگابایت برای هر تصویر · تصویر اول، عکس اصلی آگهی است.</small>
                {form.images.length > 0 && <div className="image-preview-grid">{form.images.map((url, index) => <div className={'image-preview-item ' + (index === 0 ? 'is-main' : '')} key={url + index}>
                  <img src={url} alt={'تصویر ملک ' + (index + 1)}/>
                  {index === 0 && <span className="main-image-label">تصویر اصلی</span>}
                  <div className="image-preview-actions">
                    {index !== 0 && <button type="button" onClick={() => setMainImage(index)}>انتخاب به‌عنوان اصلی</button>}
                    <button type="button" className="remove-image" onClick={() => removeImage(index)} aria-label="حذف تصویر"><Trash2 size={14}/></button>
                  </div>
                </div>)}</div>}
              </label>
              <label className="wide">توضیحات ملک<textarea rows="4" value={form.description} onChange={e => setForm({...form,description:e.target.value})} placeholder="توضیحات کامل ملک..."/></label>
              <label>وضعیت انتشار<select value={form.status} onChange={e => setForm({...form,status:e.target.value})}><option value="draft">پیش‌نویس</option><option value="published">انتشار در سایت</option></select></label>
              <label>وضعیت ملک<select value={form.availability} onChange={e => setForm({...form,availability:e.target.value})}><option value="available">موجود</option><option value="closed">{closedLabel(form)}</option></select></label>
            </div>
            <div className="form-actions"><button type="button" className="admin-secondary" onClick={() => setPage('properties')}>انصراف</button><button className="admin-primary" disabled={busy}>{busy ? 'در حال ذخیره...' : editing ? 'ذخیره تغییرات' : 'ثبت آگهی'}</button></div>
          </form>
        </>}
      </div>
    </main>
  </div>
}

function EmptyState({ onCreate }) {
  return <div className="empty-admin"><span><Building2 size={26}/></span><b>هنوز آگهی‌ای ثبت نشده است</b><p>اولین ملک را ثبت کنید تا در این بخش نمایش داده شود.</p><button className="admin-primary" onClick={onCreate}><Plus size={17}/> ثبت اولین آگهی</button></div>
}

function PropertyTable({ items, onEdit, onDelete, onToggle, onClosed }) {
  if (!items.length) return <div className="empty-admin">هنوز آگهی‌ای ثبت نشده است.</div>
  return <div className="table-scroll"><table className="properties-table"><thead><tr><th>ملک</th><th>منطقه</th><th>قیمت</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody>{items.map(item => <tr key={item.id}><td><div className="property-cell"><div className="property-thumb">{item.image_url ? <img src={item.image_url} alt="" onError={e => {e.currentTarget.style.display='none'}}/> : <House size={19}/>}</div><div><b>{item.title}</b><small>{item.neighborhood} · {item.area} متر</small></div></div></td><td>منطقه {Number(item.region).toLocaleString('fa-IR')}</td><td>{item.deal_type === 'اجاره' ? <>{formatPrice(item.deposit || item.price)} <small>ودیعه</small><br/>{formatPrice(item.monthly_rent)} <small>اجاره ماهانه</small></> : <>{formatPrice(item.price)} <small>تومان</small></>}</td><td><span className={'status-pill ' + (item.status === 'published' ? 'is-published' : 'is-draft')}>{item.status === 'published' ? 'منتشرشده' : 'پیش‌نویس'}</span>{isClosed(item) && <> <span className="status-pill is-closed">{closedLabel(item)}</span></>}</td><td><div className="row-actions"><button title={isClosed(item) ? 'برگرداندن به «موجود»' : 'علامت‌گذاری «' + closedLabel(item) + '»'} onClick={() => onClosed(item)}>{isClosed(item) ? <Clock3 size={17}/> : <CheckCircle2 size={17}/>}</button><button title={item.status === 'published' ? 'خارج کردن از انتشار' : 'انتشار'} onClick={() => onToggle(item)}>{item.status === 'published' ? <EyeOff size={17}/> : <Eye size={17}/>}</button><button title="ویرایش" onClick={() => onEdit(item)}><Pencil size={17}/></button><button className="delete-action" title="حذف" onClick={() => onDelete(item)}><Trash2 size={17}/></button></div></td></tr>)}</tbody></table></div>
}
