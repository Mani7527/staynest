import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/client.js';
import { STAY_TYPES } from '../../utils/format.js';

const empty = {
  title: '',
  description: '',
  type: 'homestay',
  city: '',
  state: '',
  address: '',
  pricePerNight: '',
  maxGuests: 2,
  bedrooms: 1,
  amenities: '',
  imageUrl: '',
};

export default function ListingForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`).then(({ data }) =>
      setForm({
        ...empty,
        ...data,
        amenities: data.amenities.join(', '),
        imageUrl: data.images[0] || '',
      })
    );
  }, [id, isEdit]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const handleBlur = (key) => () => setTouched((prev) => ({ ...prev, [key]: true }));

  const isValidUrl = (str) => {
    if (!str) return true;
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const getTitleError = () => {
    if (!touched.title && !form.title) return '';
    const len = form.title.trim().length;
    if (len < 10) return 'Title must be between 10 and 100 characters (min 10)';
    if (len > 100) return 'Title cannot exceed 100 characters';
    return '';
  };

  const getDescriptionError = () => {
    if (!touched.description && !form.description) return '';
    const len = form.description.trim().length;
    if (len < 30) return `Description must be at least 30 characters (${len}/30)`;
    return '';
  };

  const getPriceError = () => {
    if (!touched.pricePerNight && !form.pricePerNight) return '';
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
      return 'Price must be greater than 0';
    }
    return '';
  };

  const getImageUrlError = () => {
    if (!form.imageUrl) return '';
    if (!isValidUrl(form.imageUrl)) {
      return 'Image URL must be a valid URL (starting with http:// or https://)';
    }
    return '';
  };

  const titleError = getTitleError();
  const descriptionError = getDescriptionError();
  const priceError = getPriceError();
  const imageUrlError = getImageUrlError();

  const hasErrors =
    form.title.trim().length < 10 ||
    form.title.trim().length > 100 ||
    form.description.trim().length < 30 ||
    !form.pricePerNight ||
    Number(form.pricePerNight) <= 0 ||
    (Boolean(form.imageUrl) && !isValidUrl(form.imageUrl));

  // TODO: replace the image URL field with real image upload (Cloudinary / multer).
  const submit = async (e) => {
    e.preventDefault();
    if (hasErrors) return;
    setError('');
    const { title, description, type, city, state, address, imageUrl, amenities } = form;
    const payload = {
      title,
      description,
      type,
      city,
      state,
      address,
      pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests),
      bedrooms: Number(form.bedrooms),
      amenities: amenities.split(',').map((a) => a.trim()).filter(Boolean),
    };
    if (imageUrl) payload.images = [imageUrl];
    try {
      if (isEdit) await api.put(`/listings/${id}`, payload);
      else await api.post('/listings', payload);
      navigate('/host');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form className="card form wide" onSubmit={submit}>
      <h1>{isEdit ? 'Edit listing' : 'Create a new listing'}</h1>
      <div>
        <input
          required
          placeholder="Title (10-100 characters)"
          value={form.title}
          onChange={set('title')}
          onBlur={handleBlur('title')}
        />
        {titleError && <p className="error small" style={{ margin: '4px 0 0' }}>{titleError}</p>}
      </div>

      <div>
        <textarea
          required
          placeholder="Describe your place (min 30 characters)"
          value={form.description}
          onChange={set('description')}
          onBlur={handleBlur('description')}
        />
        {descriptionError && <p className="error small" style={{ margin: '4px 0 0' }}>{descriptionError}</p>}
      </div>

      <div className="row">
        <select value={form.type} onChange={set('type')}>
          {STAY_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <div style={{ flex: 1 }}>
          <input
            required
            type="number"
            min="1"
            placeholder="Price per night (₹)"
            value={form.pricePerNight}
            onChange={set('pricePerNight')}
            onBlur={handleBlur('pricePerNight')}
          />
          {priceError && <p className="error small" style={{ margin: '4px 0 0' }}>{priceError}</p>}
        </div>
      </div>

      <div className="row">
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="State" value={form.state} onChange={set('state')} />
      </div>
      <input required placeholder="Address" value={form.address} onChange={set('address')} />
      <div className="row">
        <label className="grow">Max guests
          <input type="number" min="1" value={form.maxGuests} onChange={set('maxGuests')} />
        </label>
        <label className="grow">Bedrooms
          <input type="number" min="0" value={form.bedrooms} onChange={set('bedrooms')} />
        </label>
      </div>
      <input placeholder="Amenities (comma separated: WiFi, AC, Parking)" value={form.amenities} onChange={set('amenities')} />
      <div>
        <input
          placeholder="Image URL (optional)"
          value={form.imageUrl}
          onChange={set('imageUrl')}
          onBlur={handleBlur('imageUrl')}
        />
        {imageUrlError && <p className="error small" style={{ margin: '4px 0 0' }}>{imageUrlError}</p>}
      </div>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={hasErrors}>{isEdit ? 'Save changes' : 'Publish listing'}</button>
    </form>
  );
}
