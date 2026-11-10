import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Shield, Heart, Bike, Gift } from 'lucide-react';
import TopBar from '../components/TopBar';
import ThemeFooter from '../components/ThemeFooter';
import SideDrawer from '../components/SideDrawer';
import { setPageSeo, SITE_NAME } from '../utils/seo';
import '../assets/css/BellPurpose.css';

const PURPOSE_CARDS = [
  {
    icon: Shield,
    title: 'Road protection',
    text: 'Guardian bells are hung on a motorcycle to ward off road hazards and bad luck — a long-standing gift among riders who look out for one another.',
  },
  {
    icon: Heart,
    title: 'A gift of care',
    text: 'Tradition says the bell works best when it is given to you. Buying one for a fellow rider is a way to say: ride safe, we want you home.',
  },
  {
    icon: Bike,
    title: 'Made for the ride',
    text: 'Charlie Bells designs decorative motorcycle bells that look at home on a bike — solid feel, clear ring, and details that stand up to the road.',
  },
  {
    icon: Gift,
    title: 'More than hardware',
    text: 'Whether it is a first bike, a long trip, or just because, a bell is a small piece of rider culture with a big meaning.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Receive it as a gift',
    text: 'Many riders believe a guardian bell should be given by someone who cares about you — a partner, friend, or club member.',
  },
  {
    step: '02',
    title: 'Hang it low',
    text: 'Mount the bell low on the frame or near the ground so it can “catch” road spirits before they cause trouble — and so you hear that familiar ring.',
  },
  {
    step: '03',
    title: 'Ride with intention',
    text: 'Every time it sounds, it is a reminder: stay alert, respect the road, and come back safe.',
  },
];

const BellPurpose = () => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);

  useEffect(() => {
    setPageSeo({
      title: "A Bell's Purpose",
      description:
        'Learn why motorcycle guardian bells matter — tradition, protection, and the rider gift culture behind Charlie Bells.',
      path: '/bell-purpose',
    });
  }, []);

  return (
    <div className="bp-page">
      <header className="modern-header">
        <TopBar onMenuToggle={() => setSideDrawerOpen(true)} />
      </header>
      <SideDrawer isOpen={sideDrawerOpen} onClose={() => setSideDrawerOpen(false)} />

      <section className="bp-hero">
        <div className="container bp-hero-inner">
          <p className="bp-eyebrow">
            <Bell size={14} /> Rider tradition
          </p>
          <h1 className="bp-title">A Bell&apos;s Purpose</h1>
          <p className="bp-lead">
            {SITE_NAME} is a motorcycle bell store. Our bells follow the guardian-bell tradition —
            small charms hung on bikes for luck, awareness, and the bond between riders.
          </p>
          <Link to="/all-products" className="bp-cta">
            Shop bells
          </Link>
        </div>
      </section>

      <section className="bp-section">
        <div className="container">
          <h2 className="bp-section-title">Why riders hang a bell</h2>
          <p className="bp-section-desc">
            Across American motorcycle culture, a “gremlin bell” or guardian bell is more than decoration.
            It is a good-luck charm meant to keep evil road spirits away and bring the rider home safely.
          </p>
          <div className="bp-card-grid">
            {PURPOSE_CARDS.map((card) => (
              <article key={card.title} className="bp-card">
                <div className="bp-card-icon">
                  <card.icon size={22} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bp-section bp-section-alt">
        <div className="container">
          <h2 className="bp-section-title">How the tradition works</h2>
          <p className="bp-section-desc">
            Stories vary by club and region, but the heart of the ritual stays the same: the bell is a
            reminder that someone cares whether you make it home.
          </p>
          <div className="bp-steps">
            {STEPS.map((item) => (
              <div key={item.step} className="bp-step">
                <span className="bp-step-num">{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bp-section">
        <div className="container bp-story">
          <div>
            <h2 className="bp-section-title">Built for bikers</h2>
            <p>
              Charlie Bells focuses on decorative motorcycle bells and rider accents — pieces you can
              gift, hang, and ride with. We keep the meaning clear and the craftsmanship solid so every
              bell feels worthy of the bike it belongs on.
            </p>
            <p>
              Looking for a gift for a new rider, a long-distance friend, or your own machine? Browse the
              shop and find a bell that fits the ride.
            </p>
            <Link to="/all-products" className="bp-cta bp-cta-secondary">
              Explore the collection
            </Link>
          </div>
          <aside className="bp-aside">
            <h3>Quick facts</h3>
            <ul>
              <li>Rooted in motorcycle guardian-bell folklore</li>
              <li>Often gifted — not always bought for yourself</li>
              <li>Hung low on the bike for luck and presence</li>
              <li>A small symbol with a lasting rider meaning</li>
            </ul>
          </aside>
        </div>
      </section>

      <ThemeFooter />
    </div>
  );
};

export default BellPurpose;
