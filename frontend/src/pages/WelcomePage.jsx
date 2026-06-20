import { Link } from 'react-router-dom';
import '../css/AuthPages.css';

const welcomeFeatures = [
  { icon: '🗺️', title: 'Memory Journey Map', desc: 'See your life as an adventure' },
  { icon: '📚', title: 'Collections', desc: 'Organize memories into folders' },
  { icon: '📖', title: 'Personal Diary', desc: 'Write your daily thoughts' },
  { icon: '✍️', title: 'Story Writing', desc: 'Create and save your stories' },
  { icon: '📅', title: 'Calendar Memories', desc: 'Revisit moments by date' },
];

function WelcomePage() {
  return (
    <div className="welcome-page-wrapper">
      <div className="welcome-logo-icon">📖</div>
      <h1 className="welcome-app-name">MemoryVerse</h1>
      <p className="welcome-app-tagline">
        Treasure Your Memories, Every Day.
      </p>

      <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {welcomeFeatures.map((f) => (
          <div key={f.title} style={{ textAlign: 'center', maxWidth: '110px' }}>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>{f.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#3d2c1e' }}>{f.title}</div>
            <div style={{ fontSize: '11px', color: '#9b8ec4', marginTop: '2px' }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="welcome-cta-buttons">
        <Link to="/register" className="welcome-get-started-btn">
          Get Started — It's Free
        </Link>
        <Link to="/login" className="welcome-login-btn">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default WelcomePage;
