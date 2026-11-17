import { useEffect, useMemo, useState } from 'react'
import Admin from './Admin.jsx'
import PropertyDetail from './PropertyDetail.jsx'
import { getPropertyImageSrc } from './image-url.js'

const initialHomes = [
 {title:'آپارتمان مدرن در زعفرانیه',city:'تهران',region:'1',neighborhood:'زعفرانیه',place:'تهران، منطقه ۱، زعفرانیه',price:'۱۸٬۵۰۰٬۰۰۰٬۰۰۰',area:'۱۸۵',rooms:'۳',tag:'فروش ویژه',photo:'photo-1600607687939-ce8a6c25118c'},
 {title:'واحد خوش‌نقشه و نورگیر',city:'تهران',region:'2',neighborhood:'سعادت‌آباد',place:'تهران، منطقه ۲، سعادت‌آباد',price:'۹٬۸۰۰٬۰۰۰٬۰۰۰',area:'۱۲۵',rooms:'۲',tag:'قیمت مناسب',photo:'photo-1600566753086-00f18fb6b3ea'}
]
const regions = {
 '1':['زعفرانیه','نیاوران','ولنجک','الهیه','فرمانیه','قیطریه','تجریش','اقدسیه'],
 '2':['سعادت‌آباد','شهرک غرب','گیشا','مرزداران','صادقیه','ستارخان'],
 '3':['اختیاریه','قلهک','دروس','ونک','جردن'],
 '4':['تهرانپارس','حکیمیه','مجیدیه','شمیران‌نو'],
 '5':['پونک','جنت‌آباد','شهران','بلوار فردوس'],
 '6':['یوسف‌آباد','امیرآباد','فاطمی','میدان ولیعصر'],
 '7':['نظام‌آباد','عباس‌آباد','بهار','سهروردی'],
 '8':['نارمک','هفت‌حوض','مجیدیه جنوبی'],
 '9':['مهرآباد','استادمعین','دکترهوشیار'],
 '10':['سلسبیل','هاشمی','جیحون'],
 '11':['منیریه','امیریه','راه‌آهن'],
 '12':['بازار','بهارستان','سنگلج'],
 '13':['پیروزی','نیروی هوایی','صفا'],
 '14':['چهارصد دستگاه','مینابی','نبرد'],
 '15':['افسریه','مسعودیه','مشیریه'],
 '16':['نازی‌آباد','جوادیه','خزانه'],
 '17':['یافت‌آباد','زمزم','ابوذر'],
 '18':['شهرک ولیعصر','یافت‌آباد جنوبی','شادآباد'],
 '19':['خانی‌آبادنو','نعمت‌آباد','دولت‌خواه'],
 '20':['شهرری','دولت‌آباد','صفائیه'],
 '21':['تهرانسر','چیتگر','وردآورد'],
 '22':['دهکده المپیک','شهرک گلستان','زیبادشت']
}
const regionOptions = Array.from({length:22},(_,i)=>String(i+1))
function Icon({type}) {
 const paths={pin:<><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,bed:<><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></>}
 return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>
}
function Home(){
 const [mode,setMode]=useState('خرید'),[region,setRegion]=useState('همه مناطق'),[neighborhood,setNeighborhood]=useState('همه محله‌ها'),[query,setQuery]=useState(''),[menu,setMenu]=useState(false),[showPhones,setShowPhones]=useState(false)
 const [homes,setHomes]=useState(initialHomes)
 useEffect(()=>{fetch('/api/properties').then(r=>r.ok?r.json():Promise.reject()).then(data=>{if(Array.isArray(data.properties))setHomes(data.properties.map(x=>({...x,id:x.id,region:String(x.region),neighborhood:x.neighborhood,place:'تهران، منطقه '+x.region+'، '+x.neighborhood,price:x.price,area:String(x.area),rooms:String(x.rooms),tag:x.deal_type+' جدید',images:Array.isArray(x.images)&&x.images.length?x.images:(x.image_url?[x.image_url]:[]),image_url:(Array.isArray(x.images)&&x.images[0])||x.image_url,photo:'photo-1600607687939-ce8a6c25118c'}))) }).catch(()=>{})},[])
 const neighborhoodOptions=region==='همه مناطق'?['همه محله‌ها',...new Set(Object.values(regions).flat())]:['همه محله‌ها',...(regions[region]||[])]
 const visible=useMemo(()=>homes.filter(x=>(region==='همه مناطق'||x.region===region)&&(neighborhood==='همه محله‌ها'||x.neighborhood===neighborhood)&&((x.title+x.place+x.neighborhood).includes(query))),[region,neighborhood,query])
 const changeRegion=e=>{setRegion(e.target.value);setNeighborhood('همه محله‌ها')}
 return <div className="site" dir="rtl" id="top">
  <header className="topbar"><a className="brand" href="#top" aria-label="Amlak Iran 22 - صفحه اصلی"><img className="brand-logo" src="/logo.svg" alt="لوگوی املاک ایران ۲۲"/><span><b>AMLAK IRAN 22</b><small>املاک ایران ۲۲ | خانه‌ای برای زندگی بهتر</small></span></a><button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-label="باز کردن منو">☰</button><nav className={menu?'nav open':'nav'}><a className="current" href="#top">صفحه اصلی</a><a href="#homes">ملک‌های منتخب</a><a href="#services">خدمات ما</a><a href="#about">درباره ما</a></nav><a className="submit" href="#contact">سپردن ملک <span>↗</span></a></header>
  <main><section className="hero"><div className="hero-bg"/><div className="hero-overlay"/><div className="hero-content"><div className="kicker"><i/> انتخاب هوشمندانه، زندگی دلخواه</div><h1>خانه‌ای که<br/><em>رویای شماست</em>، همین‌جاست.</h1><p>برای پیدا کردن خانه ایده‌آلتان، در مناطق ۲۲ گانه تهران جست‌وجو کنید.</p><div className="searchbox"><div className="tabs">{['خرید','اجاره','رهن'].map(x=><button className={mode===x?'chosen':''} onClick={()=>setMode(x)} key={x}>{x}</button>)}</div><div className="searchrow"><label><small>شهر</small><span><Icon type="pin"/><input value="تهران" readOnly aria-label="شهر تهران"/></span></label><label><small>انتخاب منطقه تهران</small><span><Icon type="pin"/><select value={region} onChange={changeRegion}><option value="همه مناطق">همه مناطق تهران</option>{regionOptions.map(x=><option value={x} key={x}>منطقه {x}</option>)}</select></span></label><label><small>انتخاب محله</small><span><Icon type="pin"/><select value={neighborhood} onChange={e=>setNeighborhood(e.target.value)}>{neighborhoodOptions.map(x=><option key={x}>{x}</option>)}</select></span></label><label className="query"><small>جست‌وجوی ملک</small><span><Icon type="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="نام ملک یا محله..."/></span></label><button className="search-btn" onClick={()=>document.getElementById('homes').scrollIntoView({behavior:'smooth'})}><Icon type="search"/> جست‌وجو</button></div></div><div className="hero-note">✦ جست‌وجوی تخصصی در مناطق ۱ تا ۲۲ تهران</div></div><div className="hero-seal"><b>۲۲</b><span>املاک ایران<br/>انتخاب مطمئن</span></div></section>
  <section className="stats"><div><b>۲٬۴۰۰+</b><small>ملک ثبت‌شده</small></div><i/><div><b>۱٬۸۰۰+</b><small>مشتری راضی</small></div><i/><div><b>۲۲</b><small>منطقه تهران</small></div><i/><div><b>۲۴/۷</b><small>پشتیبانی همراه شما</small></div></section>
  <section className="homes wrap" id="homes"><div className="section-head"><div><small>منتخب املاک ایران ۲۲</small><h2>ملک‌هایی برای <em>زندگی بهتر</em></h2><p>فایل‌های منتخب در مناطق مختلف تهران</p></div><a href="#homes">مشاهده همه فایل‌ها ←</a></div><div className="cards">{visible.map(x=><article className="property" key={x.id || x.title} role="link" tabIndex={0} onClick={() => x.id && (window.location.href='/property/'+x.id)} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && x.id) window.location.href='/property/'+x.id }}><div className="photo"><img className="property-photo-image" src={x.image_url ? getPropertyImageSrc(x.image_url) : ('https://images.unsplash.com/'+x.photo+'?auto=format&fit=crop&w=900&q=85')} alt={x.title} loading="lazy" onError={e=>{const img=e.currentTarget;if(!img.dataset.fallback){img.dataset.fallback='true';img.src='https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85'}else{img.style.display='none'}}}/><label>{x.tag}</label><button aria-label="علاقه‌مندی" onClick={e=>e.stopPropagation()}>♡</button></div><div className="details"><small>⌖ {x.place}</small><h3>{x.title}</h3><div className="features"><span>▣ {x.area} متر</span><span><Icon type="bed"/> {x.rooms} خواب</span></div><div className="price"><small>قیمت کل</small><b>{x.price} <small>تومان</small></b></div><span className="view-property-link">مشاهده جزئیات و تصاویر ←</span></div></article>)}</div>{!visible.length&&<p className="empty">ملکی با این فیلترها پیدا نشد؛ منطقه یا محله دیگری را انتخاب کنید.</p>}</section>
  <section className="services" id="services"><div className="service-inner"><div><small>چرا املاک ایران ۲۲؟</small><h2>مسیر خانه‌دار شدن،<br/><em>با خیال راحت</em></h2><p>از اولین جست‌وجو تا امضای قرارداد، در تمام مراحل کنار شما هستیم.</p><a href="#contact">با مشاوران ما آشنا شوید ←</a></div><div className="benefits"><article><i>✓</i><div><b>فایل‌های بررسی‌شده</b><p>اطلاعات دقیق و شفاف برای انتخابی مطمئن</p></div></article><article><i>⌂</i><div><b>مشاوره تخصصی</b><p>همراهی مشاوران باتجربه در تمام مسیر</p></div></article><article><i>✓</i><div><b>معامله امن و آسان</b><p>شفافیت در جزئیات و آرامش در تصمیم‌گیری</p></div></article></div></div></section>
  <section className="contact wrap" id="contact"><div><small>شروع یک انتخاب تازه</small><h2>دنبال خانه‌ای خاص هستید؟</h2><p>برای مشاوره و ثبت آگهی با ما تماس بگیرید.</p></div><div className={showPhones?'contact-flip is-flipped':'contact-flip'}><div className="contact-flip-inner"><div className="contact-face contact-front"><span className="contact-mark">۲۲</span><b>ارتباط با املاک ایران ۲۲</b><small>برای دریافت مشاوره در خدمت شما هستیم</small><button type="button" onClick={()=>setShowPhones(true)}>تماس با ما <span>↗</span></button></div><div className="contact-face contact-back"><b>با ما در تماس باشید</b><small>شکری | املاک ایران ۲۲</small><a href="tel:09378980462" dir="ltr"><span>۰۹۳۷۸۹۸۰۴۶۲</span><b>شکری</b></a><a href="tel:09129688077" dir="ltr"><span>۰۹۱۲۹۶۸۸۰۷۷</span><b>شکری</b></a><button type="button" className="back-link" onClick={()=>setShowPhones(false)}>بازگشت</button></div></div></div></section></main>
  <footer id="about"><b><img src="/logo.svg" alt=""/> AMLAK IRAN 22</b><span>© تمامی حقوق برای املاک ایران ۲۲ محفوظ است.</span><a href="#top">بازگشت به بالا ↑</a></footer></div>
}


export default function App(){
  if (window.location.pathname.startsWith('/admin')) return <Admin />
  const detailMatch = window.location.pathname.match(/^\/property\/(\d+)\/?$/)
  if (detailMatch) return <PropertyDetail id={detailMatch[1]} />
  return <Home />
}
