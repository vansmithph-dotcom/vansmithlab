export default function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <a href="/" className="logo">
          VAN SMITH LAB
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="/knowledge">Knowledge</a>
          <a href="/research">Research</a>
          <a href="/collections">Collections</a>
          <a href="/gallery">Gallery</a>
          <a href="/search">Search</a>
          <a href="/about">About</a>
        </nav>
      </div>
    </header>
  );
}