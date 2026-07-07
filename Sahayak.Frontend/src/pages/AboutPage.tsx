export default function AboutPage() {
  return (
    <section className="page active">
      <div className="section">
        <div className="wrap" style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 20px' }}>
          <div className="eyebrow" style={{ marginBottom: '16px' }}>
            <span className="dot"></span>
            About Us
          </div>
          <h1 style={{ marginBottom: '24px', lineHeight: 1.1 }}>
            We started this startup to help people with minimal cost and time.
          </h1>
          <p style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: '16px', color: 'var(--ink-soft)' }}>
            If you are busy with your job or business, we will help you by providing services quickly and affordably.
          </p>
          <p style={{ fontSize: '18px', lineHeight: 1.8, marginBottom: '32px', color: 'var(--ink-soft)' }}>
            Whether it's errands, home support, or everyday assistance, our goal is to save you time and reduce your stress.
          </p>
          <div style={{ display: 'grid', gap: '10px', marginBottom: '32px' }}>
            <div style={{ padding: '18px', background: 'rgba(108, 183, 224, 0.08)', borderRadius: '16px' }}>
              <strong>Contact no:</strong> 8884721366
            </div>
            <div style={{ padding: '18px', background: 'rgba(108, 183, 224, 0.08)', borderRadius: '16px' }}>
              <strong>Email:</strong> sahayak85@gmail.com
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
