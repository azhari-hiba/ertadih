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
      <div className="footer-bottom">© {new Date().getFullYear()} إرتديه - جميع الحقوق محفوظة</div>
    </footer>
  )
}
