import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { getErrorMessage } from '../api/client.js';
import Loader from '../components/Loader.jsx';
import { formatDate, formatINR } from '../utils/format.js';

export default function Trips() {
  const location = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api
      .get('/bookings/mine')
      .then(({ data }) => setBookings(data))
      .catch((err) => setError(getErrorMessage(err)));

  useEffect(() => {
    load();
  }, []);

  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const confirmCancel = async (id) => {
    setCancelLoading(true);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      setCancellingBooking(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCancelLoading(false);
    }
  };

  if (!bookings && !error) return <Loader />;

  return (
    <section>
      <h1>My Trips</h1>
      {location.state?.booked && <p className="success">Booking request sent to the host!</p>}
      {error && <p className="error">{error}</p>}
      {bookings?.length === 0 && (
        <p className="muted">No trips yet. <Link to="/">Find a stay</Link></p>
      )}
      <div className="trip-list">
        {bookings?.map((b) => (
          <div key={b._id} className="card trip">
            <img src={b.listing?.images?.[0]} alt={b.listing?.title} />
            <div className="grow">
              <Link to={`/stays/${b.listing?._id}`}><strong>{b.listing?.title}</strong></Link>
              <p className="muted">{b.listing?.city}</p>
              <p>
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} night{b.nights > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}
              </p>
            </div>
            <div className="trip-side">
              <span className={`status status-${b.status}`}>{b.status}</span>
              <strong>{formatINR(b.totalPrice)}</strong>
              {['pending', 'confirmed'].includes(b.status) && (
                <button className="btn btn-danger" onClick={() => setCancellingBooking(b)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {cancellingBooking && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div className="card" style={{ maxWidth: 480, width: '100%', padding: 24 }}>
            <h3 id="cancel-dialog-title" style={{ margin: '0 0 12px' }}>Confirm Cancellation</h3>
            <p>
              Are you sure you want to cancel your trip to <strong>{cancellingBooking.listing?.title || 'this stay'}</strong>?
            </p>
            <p className="muted small" style={{ margin: '8px 0 20px' }}>
              Dates: {formatDate(cancellingBooking.checkIn)} → {formatDate(cancellingBooking.checkOut)} ({cancellingBooking.nights} night{cancellingBooking.nights > 1 ? 's' : ''})
            </p>
            <div className="row" style={{ justifyContent: 'flex-end', gap: 12 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setCancellingBooking(null)}
                disabled={cancelLoading}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => confirmCancel(cancellingBooking._id)}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Trip'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
