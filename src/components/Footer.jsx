import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>إرتديه</h3>
          <p>أناقة و حشمة في كل التفاصيل</p>
          <p>حجابات عصرية، عباءات أنيقة، وعطور وأمساك بلمسة راقية.</p>
        </div>

        <div>
          <h4>التواصل</h4>
          <p>الطلب عبر الخاص أو عبر الواتساب</p>
          <a href="tel:0634775653">0634775653</a>
          <br /> 
          <a href="https://www.instagram.com/ertadih" target="_blank" rel="noreferrer">
            Instagram: @ertadih
          </a>
        </div>

        <div>
          <h4>التوصيل</h4>
          <p>التوصيل متوفر لجميع المدن المغربية.</p>
          <p>يتم احتساب ثمن التوصيل حسب المدينة عند إتمام الطلب.</p>
        </div>
      </div>

     <div className="footer-bottom" style={{ 
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px 0',
  borderTop: '1px solid rgba(255,255,255,0.1)',
  direction: 'rtl',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  gap: '10px'
}}>
  
  <div style={{ textAlign: 'center' }}>
    جميع الحقوق محفوظة - 
    <Link 
      to="/admin-login" 
      style={{ 
        textDecoration: 'none', 
        color: 'inherit', 
        cursor: 'default', 
        fontWeight: 'normal',
        display: 'inline'
      }}
    >
      إرتديه
    </Link> 
    <span> {new Date().getFullYear()} ©</span>
  </div>

  <div style={{ 
    fontSize: '11px', 
    opacity: 0.6, 
    direction: 'ltr',
    display: 'flex',
    gap: '4px',
    alignItems: 'center'
  }}>
    <span>Developed by</span>
    <a 
      href="https://www.instagram.com/hipatyadev_agency?igsh=cXBqaTh5bW9yeXN0" 
      target="_blank" 
      rel="noreferrer"
      style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}
    >
      HIPATYADEV
    </a>
  </div>

</div>
    </footer>
  )
}