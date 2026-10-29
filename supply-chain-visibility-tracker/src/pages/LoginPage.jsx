import LoginForm from '../components/auth/LoginForm'

export default function LoginPage({ userType, onBack, onLogin }) {
  return (
    <main className="login-page">
      <header className="login-header">
        <a className="brand" href="#" aria-label="Trackline home">
          <span className="brand-mark">t</span>
          <span>trackline<span className="brand-period">.</span></span>
        </a>
        <span className="secure-label"><span aria-hidden="true">●</span> Demo sign-in</span>
      </header>

      <section className="login-card" aria-labelledby="login-title">
        <span className="login-emblem" aria-hidden="true">↗</span>
        <p className="eyebrow">DEMO SIGN-IN</p>
        <h1 id="login-title">Sign in as {userType.name}</h1>
        <p className="login-description">
          Use any email and password to continue to the {userType.name} workspace.
        </p>
        <LoginForm onLogin={onLogin} />
        <button className="login-back-button" onClick={onBack}>
          ← Choose a different user type
        </button>
        <p className="login-help">This temporary sign-in is for frontend preview only.</p>
      </section>

      <footer className="login-footer">
        Trackline <span aria-hidden="true">·</span> Supply chain visibility
      </footer>
    </main>
  )
}
