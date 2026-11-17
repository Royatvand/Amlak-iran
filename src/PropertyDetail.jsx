import { useEffect, useState } from 'react'
import { ArrowRight, BedDouble, MapPin, Ruler, ChevronLeft, ChevronRight, House, Image as ImageIcon } from 'lucide-react'
import './property-detail.css'
import { getPropertyImageSrc } from './image-url.js'

function formatPrice(value) {
  return String(value || '').replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬')
}

export default function PropertyDetail({ id }) {
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    let alive = true
    fetch('/api/properties')
      .then(response => {
        if (!response.ok) throw new Error('دریافت اطلاعات ملک ناموفق بود.')
        return response.json()
      })
      .then(data => {
        if (!alive) return
        const found = (data.properties || []).find(item => String(item.id) === String(id))
        if (!found) setError('این آگهی پیدا نشد یا دیگر منتشر نیست.')
        else setProperty(found)
      })
      .catch(err => alive && setError(err.message || 'خطا در دریافت اطلاعات ملک.'))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [id])

  const images = property ? (Array.isArray(property.images) && property.images.length ? property.images : property.image_url ? [property.image_url] : []) : []
  const changeImage = direction => setActiveImage(current => (current + direction + images.length) % images.length)

  if (loading) return <main className="property-detail-page" dir="rtl"><div className="detail-state">در حال بارگذاری اطلاعات ملک...</div></main>
  if (error || !property) return <main className="property-detail-page" dir="rtl"><div className="detail-state"><p>{error || 'ملک پیدا نشد.'}</p><a href="/">بازگشت به صفحه اصلی</a></div></main>

  return <main className="property-detail-page" dir="rtl">
    <header className="detail-topbar"><a href="/" className="detail-brand"><House size={22}/><span>املاک ایران ۲۲</span></a><a href="/" className="detail-back"><ArrowRight size={17}/> بازگشت به آگهی‌ها</a></header>
    <div className="property-detail-wrap">
      <div className="detail-heading"><div><span className="detail-kicker">{property.deal_type || 'ملک'} · منطقه {Number(property.region).toLocaleString('fa-IR')}</span><h1>{property.title}</h1><p><MapPin size={16}/>{property.neighborhood}، تهران</p></div><span className="detail-status">{property.deal_type || 'فروش'}</span></div>
      <section className="detail-gallery">
        {images.length ? <>
          <div className="detail-main-image">
            <img src={getPropertyImageSrc(images[activeImage])} alt={property.title + ' - تصویر ' + (activeImage + 1)} />
            {images.length > 1 && <><button className="gallery-arrow previous" onClick={() => changeImage(-1)} aria-label="تصویر قبلی"><ChevronRight/></button><button className="gallery-arrow next" onClick={() => changeImage(1)} aria-label="تصویر بعدی"><ChevronLeft/></button><span className="gallery-counter">{(activeImage + 1).toLocaleString('fa-IR')} / {images.length.toLocaleString('fa-IR')}</span></>}
          </div>
          {images.length > 1 && <div className="detail-thumbnails">{images.map((url,index)=><button key={url+index} className={index===activeImage?'selected':''} onClick={()=>setActiveImage(index)} aria-label={'نمایش تصویر '+(index+1)}><img src={getPropertyImageSrc(url)} alt=""/></button>)}</div>}
        </> : <div className="detail-no-image"><ImageIcon size={42}/><span>تصویری برای این ملک ثبت نشده است.</span></div>}
      </section>
      <div className="detail-content-grid">
        <section className="detail-description"><h2>درباره این ملک</h2><p>{property.description || 'توضیحاتی برای این ملک ثبت نشده است.'}</p></section>
        <aside className="detail-facts"><h2>مشخصات ملک</h2><div><span><Ruler size={17}/> متراژ</span><b>{Number(property.area).toLocaleString('fa-IR')} متر</b></div><div><span><BedDouble size={17}/> اتاق خواب</span><b>{Number(property.rooms || 0).toLocaleString('fa-IR')}</b></div><div><span><MapPin size={17}/> محله</span><b>{property.neighborhood}</b></div><div className="detail-price"><span>قیمت کل</span><b>{formatPrice(property.price)} <small>تومان</small></b></div></aside>
      </div>
    </div>
    <footer className="detail-footer"><span>AMLAK IRAN 22</span><a href="/">بازگشت به صفحه اصلی</a></footer>
  </main>
}
