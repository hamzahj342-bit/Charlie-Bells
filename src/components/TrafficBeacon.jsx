import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { themeApi } from '../services/themeApi';

const VISITOR_KEY = 'cb_vid';
const PINGED_DAY_KEY = 'cb_vid_pinged';

const ensureVisitorKey = () => {
  try {
    let key = localStorage.getItem(VISITOR_KEY);
    if (!key) {
      key =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `v_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
      localStorage.setItem(VISITOR_KEY, key);
    }
    return key;
  } catch {
    return null;
  }
};

const todayKey = () => new Date().toISOString().slice(0, 10);

/**
 * Records one unique storefront visit per browser per day.
 * Skips admin. Product-page fake "live visitors" are unrelated.
 */
const TrafficBeacon = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname || '';
    if (path.startsWith('/admin')) return;

    const visitorKey = ensureVisitorKey();
    if (!visitorKey) return;

    const day = todayKey();
    try {
      if (sessionStorage.getItem(PINGED_DAY_KEY) === day) return;
    } catch {
      /* ignore */
    }

    let cancelled = false;
    (async () => {
      try {
        await themeApi.pingTraffic(visitorKey);
        if (!cancelled) {
          try {
            sessionStorage.setItem(PINGED_DAY_KEY, day);
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* silent — never block storefront */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  return null;
};

export default TrafficBeacon;
