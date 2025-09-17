import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
  FaSearch, 
  FaBookOpen, 
  FaBookReader,
  FaStar, 
  FaCalendarAlt, 
  FaUserAlt, 
  FaMoon, 
  FaSun, 
  FaTimes,
  FaHistory,
  FaSlidersH,
  FaExclamationTriangle,
  FaSyncAlt,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaGoodreads
} from 'react-icons/fa';
import { BiBookOpen } from 'react-icons/bi';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Load search history and theme preference from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('bookSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
    
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
                     (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
  };
  
  // Save search to history
  const saveToHistory = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const updatedHistory = [
      searchTerm,
      ...searchHistory.filter(term => term.toLowerCase() !== searchTerm.toLowerCase())
    ].slice(0, 10);
    
    setSearchHistory(updatedHistory);
    localStorage.setItem('bookSearchHistory', JSON.stringify(updatedHistory));
  };
  
  // Handle search from history
  const searchFromHistory = (term) => {
    setQuery(term);
    searchBooks({ preventDefault: () => {} });
    setShowHistory(false);
  };

  // Add missing function declarations
  const clearSearch = () => {
    setQuery('');
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('bookSearchHistory');
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    searchBooks({ preventDefault: () => {} });
    setShowHistory(false);
  };

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`
      );
      setBooks(response.data.docs || []);
      setSelectedBook(null);
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBookCoverUrl = (coverId, size = 'M') => {
    return coverId 
      ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
      : 'https://via.placeholder.com/150x200?text=No+Cover';
  };

  const openBookDetails = (book) => {
    setSelectedBook(book);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeBookDetails = () => {
    setSelectedBook(null);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header className="header">
        <div className="header-top">
          <h1><BiBookOpen className="header-icon" /> Book Finder</h1>
          <button 
            onClick={toggleDarkMode} 
            className="theme-toggle"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
        <p className="subtitle">Discover your next favorite book from millions of titles</p>
        
        <div className="search-container">
          <div className="search-input-container">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              onKeyPress={(e) => e.key === 'Enter' && searchBooks(e)}
              className="search-input"
              placeholder="Search for books by title, author, or keyword..."
              aria-label="Search for books"
            />
            {query && (
              <button 
                onClick={clearSearch}
                className="clear-search"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
            {showHistory && searchHistory.length > 0 && (
              <div className="search-history">
                <div className="search-history-header">
                  <h4>Recent Searches</h4>
                  <button 
                    onClick={clearSearchHistory}
                    className="close-history"
                    aria-label="Clear search history"
                  >
                    Clear All
                  </button>
                </div>
                <ul>
                  {searchHistory.map((term, index) => (
                    <li key={index}>
                      <button 
                        onClick={() => handleHistoryClick(term)}
                        className="history-item"
                      >
                        <span className="history-icon">
                          <FaHistory />
                        </span>
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="search-actions">
            <button 
              onClick={searchBooks}
              className="search-button"
              disabled={loading || !query.trim()}
              aria-label="Search books"
            >
              <FaSearch />
              {loading ? 'Searching...' : 'Search'}
            </button>
            <button 
              className={`filter-button ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Filters"
              aria-expanded={showFilters}
            >
              <FaSlidersH />
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label htmlFor="sort-by">Sort By:</label>
              <select id="sort-by" className="filter-select">
                <option value="relevance">Relevance</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="language">Language:</label>
              <select id="language" className="filter-select">
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        )}
      </header>

      <main className="main-content">
        {loading && !books.length ? (
          <div className="loading-spinner">
            <div className="spinner">
              <FaBookReader className="fa-spin" />
            </div>
            <p>Searching for books...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <div className="error-icon">
              <FaExclamationTriangle />
            </div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button 
              onClick={handleSearch} 
              className="retry-button"
              aria-label="Retry search"
            >
              <FaSyncAlt /> Try Again
            </button>
          </div>
        ) : selectedBook ? (
          <div className="book-details">
            <button onClick={closeBookDetails} className="back-button">
              ← Back to results
            </button>
            <div className="book-details-content">
              <div className="book-cover-large">
                <img 
                  src={getBookCoverUrl(selectedBook.cover_i, 'L')} 
                  alt={selectedBook.title} 
                />
              </div>
              <div className="book-info">
                <h2>{selectedBook.title}</h2>
                {selectedBook.author_name && (
                  <p className="author">
                    <FaUserAlt className="icon" />
                    {selectedBook.author_name.join(', ')}
                  </p>
                )}
                {selectedBook.first_publish_year && (
                  <p className="publish-year">
                    <FaCalendarAlt className="icon" />
                    First published in {selectedBook.first_publish_year}
                  </p>
                )}
                {selectedBook.ratings_average && (
                  <div className="rating">
                    <FaStar className="star-icon" />
                    {selectedBook.ratings_average.toFixed(1)} 
                    <span className="rating-count">
                      ({selectedBook.ratings_count || 0} ratings)
                    </span>
                  </div>
                )}
                {selectedBook.publisher && (
                  <p className="publisher">
                    <strong>Publisher:</strong> {Array.isArray(selectedBook.publisher) 
                      ? selectedBook.publisher.join(', ') 
                      : selectedBook.publisher}
                  </p>
                )}
                {selectedBook.subject && (
                  <div className="subjects">
                    <strong>Subjects:</strong>
                    <div className="subject-tags">
                      {selectedBook.subject.slice(0, 5).map((subject, index) => (
                        <span key={index} className="subject-tag">{subject}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedBook.first_sentence && (
                  <div className="first-sentence">
                    <h4>First Sentence:</h4>
                    <p>"{Array.isArray(selectedBook.first_sentence) 
                      ? selectedBook.first_sentence[0] 
                      : selectedBook.first_sentence}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="results-header">
              <h2>Search Results for "{query}"</h2>
              <p className="results-count">{books.length} books found</p>
            </div>
            <div className="book-grid">
              {books.map((book, index) => (
                <div key={`${book.key || book.id || index}`} className="book-card" onClick={() => openBookDetails(book)}>
                  <div className="book-cover">
                    <img 
                      src={getBookCoverUrl(book.cover_i)} 
                      alt={book.title} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150x200?text=No+Cover';
                      }}
                    />
                  </div>
                  <div className="book-card-info">
                    <h3>{book.title}</h3>
                    {book.author_name && (
                      <p className="author">{book.author_name[0]}</p>
                    )}
                    {book.first_publish_year && (
                      <p className="year">{book.first_publish_year}</p>
                    )}
                    {book.ratings_average && (
                      <div className="rating">
                        <FaStar className="star-icon" />
                        {book.ratings_average.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {loading && (
              <div className="loading-more">
                <div className="spinner small"></div>
                <p>Loading more books...</p>
              </div>
            )}
          </>
        ) : query ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaBookOpen />
            </div>
            <h3>No books found</h3>
            <p>We couldn't find any books matching "{query}"</p>
            <div className="suggestions">
              <p>Try these suggestions:</p>
              <ul>
                <li>Check your spelling</li>
                <li>Use more general terms</li>
                <li>Try different keywords</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon">
                <FaBookReader />
              </div>
              <h2>Welcome to Book Finder</h2>
              <p>Discover millions of books from around the world. Search by title, author, or topic to find your next great read.</p>
              
              <div className="featured-categories">
                <h4>Popular Categories</h4>
                <div className="category-tags">
                  {['Fiction', 'Science', 'History', 'Biography', 'Fantasy', 'Mystery', 'Romance', 'Self-Help'].map(category => (
                    <button 
                      key={category}
                      className="category-tag"
                      onClick={() => {
                        setQuery(category);
                        handleSearch();
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="recent-searches">
                {searchHistory.length > 0 && (
                  <>
                    <h4>Recent Searches</h4>
                    <div className="search-tags">
                      {searchHistory.slice(0, 5).map((term, index) => (
                        <button
                          key={index}
                          className="search-tag"
                          onClick={() => {
                            setQuery(term);
                            handleSearch();
                          }}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Book Finder</h4>
            <p>Discover your next great read from our vast collection of books.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <div className="social-links">
              <a href="#twitter" aria-label="Twitter"><FaTwitter /></a>
              <a href="#facebook" aria-label="Facebook"><FaFacebook /></a>
              <a href="#instagram" aria-label="Instagram"><FaInstagram /></a>
              <a href="#goodreads" aria-label="Goodreads"><FaGoodreads /></a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p> 2024 Book Finder. All rights reserved.</p>
          <p>Data provided by <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer">Open Library</a></p>
        </div>
      </footer>
    </div>
  );
}

export default App;
