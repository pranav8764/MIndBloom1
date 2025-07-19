import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Track Your Mental Health Journey</h1>
          <p>Gamified tracking, challenges, and rewards to help you build positive habits and improve your wellbeing.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/learn-more" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            {/* Image placeholder - would be replaced with actual image */}
            <div className="placeholder-text">Mindfulness Illustration</div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon journal-icon"></div>
            <h3>Daily Journaling</h3>
            <p>Guided journaling prompts to help you reflect on your day and track your mood over time.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon challenge-icon"></div>
            <h3>Wellness Challenges</h3>
            <p>Join public or private challenge rooms to build habits with friends or the community.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon dashboard-icon"></div>
            <h3>Visual Progress</h3>
            <p>Interactive charts and visualizations to track your mood trends and habit consistency.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon rewards-icon"></div>
            <h3>Achievements & Rewards</h3>
            <p>Earn XP, level up, and unlock customizations as you maintain streaks and reach milestones.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Account</h3>
            <p>Sign up and customize your profile to start your mental wellness journey.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Daily Check-ins</h3>
            <p>Log your mood, complete journal entries, and track your daily habits.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Join Challenges</h3>
            <p>Participate in challenges to build consistency and connect with others.</p>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <h3>Earn & Grow</h3>
            <p>Gain XP, unlock achievements, and watch your progress visualized over time.</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Transform Your Mental Wellness Journey?</h2>
        <p>Join thousands of users who are gamifying their path to better mental health.</p>
        <Link to="/register" className="btn btn-primary">Start Your Journey</Link>
      </section>
    </div>
  );
};

export default Home;