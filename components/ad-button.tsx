"use client"

export function AdButton() {
  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <button
        id="smart-ad-link-btn"
        style={{
          background: '#ffb300',
          color: '#222',
          border: 'none',
          borderRadius: 8,
          padding: '12px 20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
        onClick={() => {
          const btn = document.getElementById('smart-ad-link-btn');
          if (btn && !btn.hasAttribute('data-clicked')) {
            window.open('https://www.revenuecpmgate.com/pfnd5823n?key=3194dc9047c523ced93d92719c82dc02', '_blank', 'noopener');
            btn.setAttribute('data-clicked', 'true');
            btn.setAttribute('disabled', 'true');
            btn.style.opacity = '0.5';
            btn.textContent = 'Ad Opened';
          }
        }}
      >
        Sponsored Ad
      </button>
    </div>
  )
}
