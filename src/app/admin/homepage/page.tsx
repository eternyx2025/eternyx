'use client';

import { useState, useEffect } from 'react';
import { compressImage } from '@/lib/compressImage';
import {
  HomepageAnnouncement,
  HomepageCategoryPill,
  HomepagePopup,
  HomepagePressItem,
  HomepageBundleCard,
  HomepageNoteProfile,
  HomepageRetailPartner,
  HomepagePromise,
  HomepageInstagramPost,
  HomepageTitles,
} from '@/lib/types';
import {
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_CATEGORY_PILLS,
  DEFAULT_POPUP,
  DEFAULT_PRESS,
  DEFAULT_BUNDLES,
  DEFAULT_NOTE_PROFILES,
  DEFAULT_RETAIL_PARTNERS,
  DEFAULT_PROMISES,
  DEFAULT_INSTAGRAM,
  DEFAULT_TITLES,
} from '@/lib/homepageDefaults';

type Tab =
  | 'announcements'
  | 'categoryPills'
  | 'popup'
  | 'press'
  | 'bundles'
  | 'noteProfiles'
  | 'retailPartners'
  | 'promises'
  | 'instagram'
  | 'titles';

export default function AdminHomepageBuilderPage() {
  const [activeTab, setActiveTab] = useState<Tab>('announcements');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Section States
  const [announcements, setAnnouncements] = useState<HomepageAnnouncement[]>(DEFAULT_ANNOUNCEMENTS);
  const [categoryPills, setCategoryPills] = useState<HomepageCategoryPill[]>(DEFAULT_CATEGORY_PILLS);
  const [popup, setPopup] = useState<HomepagePopup>(DEFAULT_POPUP);
  const [press, setPress] = useState<HomepagePressItem[]>(DEFAULT_PRESS);
  const [bundles, setBundles] = useState<HomepageBundleCard[]>(DEFAULT_BUNDLES);
  const [noteProfiles, setNoteProfiles] = useState<HomepageNoteProfile[]>(DEFAULT_NOTE_PROFILES);
  const [retailPartners, setRetailPartners] = useState<HomepageRetailPartner[]>(DEFAULT_RETAIL_PARTNERS);
  const [promises, setPromises] = useState<HomepagePromise[]>(DEFAULT_PROMISES);
  const [instagram, setInstagram] = useState<HomepageInstagramPost[]>(DEFAULT_INSTAGRAM);
  const [titles, setTitles] = useState<HomepageTitles>(DEFAULT_TITLES);

  // Uploading state
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/homepage');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          if (json.data.announcements) setAnnouncements(json.data.announcements);
          if (json.data.categoryPills) setCategoryPills(json.data.categoryPills);
          if (json.data.popup) setPopup(json.data.popup);
          if (json.data.press) setPress(json.data.press);
          if (json.data.bundles) setBundles(json.data.bundles);
          if (json.data.noteProfiles) setNoteProfiles(json.data.noteProfiles);
          if (json.data.retailPartners) setRetailPartners(json.data.retailPartners);
          if (json.data.promises) setPromises(json.data.promises);
          if (json.data.instagram) setInstagram(json.data.instagram);
          if (json.data.titles) setTitles(json.data.titles);
        }
      }
    } catch (err) {
      console.error('Failed to load homepage settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section: Tab, data: any) => {
    try {
      setSaving(true);
      setSaveSuccessMsg('');
      const res = await fetch('/api/admin/homepage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data }),
      });

      if (res.ok) {
        setSaveSuccessMsg(`Saved changes to ${section}!`);
        setTimeout(() => setSaveSuccessMsg(''), 3500);
      } else {
        alert('Failed to save settings. Please try again.');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: string,
    onSuccess: (url: string) => void
  ) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploadingField(fieldKey);

    try {
      const file = await compressImage(rawFile, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
        mimeType: 'image/webp',
      });

      const res = await fetch(`/api/admin/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'image/webp',
          'x-filename': file.name,
        },
        body: file,
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.url);
      } else {
        alert('Upload failed.');
      }
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  return (
    <div className="admin-homepage-builder">
      <div className="builder-header">
        <div>
          <h1 className="builder-title">Homepage &amp; Storefront Builder</h1>
          <p className="builder-subtitle">
            Configure every section of the Fraganote-style storefront. 100% dynamic, zero hardcoding.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="preview-store-btn">
          View Live Storefront ↗
        </a>
      </div>

      {saveSuccessMsg && <div className="success-banner">{saveSuccessMsg}</div>}

      {/* Navigation Tabs */}
      <div className="builder-tabs">
        <button
          className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          1. Announcements
        </button>
        <button
          className={`tab-btn ${activeTab === 'categoryPills' ? 'active' : ''}`}
          onClick={() => setActiveTab('categoryPills')}
        >
          2. Category Capsules
        </button>
        <button
          className={`tab-btn ${activeTab === 'popup' ? 'active' : ''}`}
          onClick={() => setActiveTab('popup')}
        >
          3. Sale Popup Modal
        </button>
        <button
          className={`tab-btn ${activeTab === 'press' ? 'active' : ''}`}
          onClick={() => setActiveTab('press')}
        >
          4. Press Logos
        </button>
        <button
          className={`tab-btn ${activeTab === 'bundles' ? 'active' : ''}`}
          onClick={() => setActiveTab('bundles')}
        >
          5. Bundle Cards
        </button>
        <button
          className={`tab-btn ${activeTab === 'noteProfiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('noteProfiles')}
        >
          6. Note Profiles
        </button>
        <button
          className={`tab-btn ${activeTab === 'retailPartners' ? 'active' : ''}`}
          onClick={() => setActiveTab('retailPartners')}
        >
          7. Retail Partners
        </button>
        <button
          className={`tab-btn ${activeTab === 'promises' ? 'active' : ''}`}
          onClick={() => setActiveTab('promises')}
        >
          8. Trust Promises
        </button>
        <button
          className={`tab-btn ${activeTab === 'instagram' ? 'active' : ''}`}
          onClick={() => setActiveTab('instagram')}
        >
          9. Instagram Feed
        </button>
        <button
          className={`tab-btn ${activeTab === 'titles' ? 'active' : ''}`}
          onClick={() => setActiveTab('titles')}
        >
          10. Section Headings
        </button>
      </div>

      <div className="tab-card">
        {loading ? (
          <div className="builder-loading">Loading homepage settings...</div>
        ) : (
          <>
            {/* 1. Announcements */}
            {activeTab === 'announcements' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>Top Announcement Marquee Items</h3>
                  <p>Items scroll in the top black ticker bar. Users can click coupon codes to copy and auto-apply.</p>
                </div>

                <div className="items-list">
                  {announcements.map((item, idx) => (
                    <div key={idx} className="item-row">
                      <div className="field-group flex-2">
                        <label>Announcement Text</label>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => {
                            const updated = [...announcements];
                            updated[idx].text = e.target.value;
                            setAnnouncements(updated);
                          }}
                          placeholder="e.g. Free Express Shipping Across India"
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Coupon Code (Optional)</label>
                        <input
                          type="text"
                          value={item.code || ''}
                          onChange={(e) => {
                            const updated = [...announcements];
                            updated[idx].code = e.target.value.toUpperCase();
                            setAnnouncements(updated);
                          }}
                          placeholder="e.g. FESTIVE50"
                        />
                      </div>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => {
                          setAnnouncements(announcements.filter((_, i) => i !== idx));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => {
                      setAnnouncements([...announcements, { text: '', code: '', link: '/shop' }]);
                    }}
                  >
                    + Add New Announcement
                  </button>
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('announcements', announcements)}
                  >
                    {saving ? 'Saving...' : 'Save Announcements'}
                  </button>
                </div>
              </div>
            )}

            {/* 2. Category Capsules */}
            {activeTab === 'categoryPills' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>Category Capsule Bar (Directly Under Header)</h3>
                  <p>Horizontal pills that allow visitors to filter scents instantly.</p>
                </div>

                <div className="items-list">
                  {categoryPills.map((pill, idx) => (
                    <div key={pill.id || idx} className="item-row">
                      <div className="field-group flex-1">
                        <label>Pill Label</label>
                        <input
                          type="text"
                          value={pill.label}
                          onChange={(e) => {
                            const updated = [...categoryPills];
                            updated[idx].label = e.target.value;
                            setCategoryPills(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Filter Slug</label>
                        <input
                          type="text"
                          value={pill.slug}
                          onChange={(e) => {
                            const updated = [...categoryPills];
                            updated[idx].slug = e.target.value.toLowerCase().trim();
                            setCategoryPills(updated);
                          }}
                        />
                      </div>
                      <div className="field-group toggle-group">
                        <label>Active</label>
                        <input
                          type="checkbox"
                          checked={pill.active !== false}
                          onChange={(e) => {
                            const updated = [...categoryPills];
                            updated[idx].active = e.target.checked;
                            setCategoryPills(updated);
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => {
                          setCategoryPills(categoryPills.filter((_, i) => i !== idx));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => {
                      const id = `pill-${Date.now()}`;
                      setCategoryPills([...categoryPills, { id, label: 'New Tag', slug: 'new-tag', active: true }]);
                    }}
                  >
                    + Add New Pill
                  </button>
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('categoryPills', categoryPills)}
                  >
                    {saving ? 'Saving...' : 'Save Category Capsules'}
                  </button>
                </div>
              </div>
            )}

            {/* 3. Sale Popup Modal */}
            {activeTab === 'popup' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>Promotional Welcome Popup</h3>
                  <p>Displays an exclusive sale or gift set modal to new visitors with 24-hour dismissal memory.</p>
                </div>

                <div className="form-grid">
                  <div className="form-field checkbox-field">
                    <label>
                      <input
                        type="checkbox"
                        checked={popup.enabled}
                        onChange={(e) => setPopup({ ...popup, enabled: e.target.checked })}
                      />
                      Enable Welcome Popup on Storefront
                    </label>
                  </div>

                  <div className="form-field">
                    <label>Headline</label>
                    <input
                      type="text"
                      value={popup.title}
                      onChange={(e) => setPopup({ ...popup, title: e.target.value })}
                      placeholder="e.g. Festive Sale is Live!"
                    />
                  </div>

                  <div className="form-field full-width">
                    <label>Subtitle / Body Copy</label>
                    <textarea
                      rows={3}
                      value={popup.subtitle}
                      onChange={(e) => setPopup({ ...popup, subtitle: e.target.value })}
                      placeholder="We're making your festive shopping extra special with exclusive gifts on orders."
                    />
                  </div>

                  <div className="form-field">
                    <label>CTA Button Text</label>
                    <input
                      type="text"
                      value={popup.buttonText}
                      onChange={(e) => setPopup({ ...popup, buttonText: e.target.value })}
                      placeholder="Explore Now"
                    />
                  </div>

                  <div className="form-field">
                    <label>CTA Destination Link</label>
                    <input
                      type="text"
                      value={popup.buttonUrl}
                      onChange={(e) => setPopup({ ...popup, buttonUrl: e.target.value })}
                      placeholder="/shop"
                    />
                  </div>

                  <div className="form-field">
                    <label>Popup Image</label>
                    <div className="upload-box">
                      {popup.imageUrl && (
                        <img src={popup.imageUrl} alt="Popup preview" className="preview-thumb" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e, 'popup', (url) => setPopup({ ...popup, imageUrl: url }))
                        }
                      />
                      {uploadingField === 'popup' && <span>Uploading image...</span>}
                    </div>
                  </div>
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('popup', popup)}
                  >
                    {saving ? 'Saving...' : 'Save Popup Settings'}
                  </button>
                </div>
              </div>
            )}

            {/* 4. Press Logos */}
            {activeTab === 'press' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>"FEATURED IN" Media &amp; Press Marquee</h3>
                  <p>Continuous marquee of magazine and news brand logos.</p>
                </div>

                <div className="items-list">
                  {press.map((item, idx) => (
                    <div key={item.id || idx} className="item-row">
                      <div className="field-group flex-1">
                        <label>Publication Name / Wordmark</label>
                        <input
                          type="text"
                          value={item.text || item.name}
                          onChange={(e) => {
                            const updated = [...press];
                            updated[idx].text = e.target.value;
                            updated[idx].name = e.target.value;
                            setPress(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Logo Image Upload (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, `press-${idx}`, (url) => {
                              const updated = [...press];
                              updated[idx].logoUrl = url;
                              setPress(updated);
                            })
                          }
                        />
                        {item.logoUrl && (
                          <img src={item.logoUrl} alt="Logo" className="mini-thumb" />
                        )}
                      </div>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => {
                          setPress(press.filter((_, i) => i !== idx));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => {
                      setPress([...press, { id: `press-${Date.now()}`, name: 'New Press', text: 'NEW PUBLICATION', url: '#' }]);
                    }}
                  >
                    + Add Press Logo
                  </button>
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('press', press)}
                  >
                    {saving ? 'Saving...' : 'Save Press Logos'}
                  </button>
                </div>
              </div>
            )}

            {/* 5. Bundle Promo Cards */}
            {activeTab === 'bundles' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>"BUILD YOUR BUNDLE" 2-Card Promo Grid</h3>
                  <p>Prominent lifestyle cards offering bundle builder deals.</p>
                </div>

                <div className="cards-edit-grid">
                  {bundles.map((bundle, idx) => (
                    <div key={bundle.id || idx} className="bundle-edit-box">
                      <h4>Bundle Card {idx + 1}</h4>
                      <div className="form-field">
                        <label>Headline</label>
                        <input
                          type="text"
                          value={bundle.title}
                          onChange={(e) => {
                            const updated = [...bundles];
                            updated[idx].title = e.target.value;
                            setBundles(updated);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Subtitle / Discount Tag</label>
                        <input
                          type="text"
                          value={bundle.subtitle}
                          onChange={(e) => {
                            const updated = [...bundles];
                            updated[idx].subtitle = e.target.value;
                            setBundles(updated);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Button Text</label>
                        <input
                          type="text"
                          value={bundle.buttonText}
                          onChange={(e) => {
                            const updated = [...bundles];
                            updated[idx].buttonText = e.target.value;
                            setBundles(updated);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Button Link</label>
                        <input
                          type="text"
                          value={bundle.buttonUrl}
                          onChange={(e) => {
                            const updated = [...bundles];
                            updated[idx].buttonUrl = e.target.value;
                            setBundles(updated);
                          }}
                        />
                      </div>
                      <div className="form-field">
                        <label>Background Image</label>
                        <div className="upload-box">
                          {bundle.imageUrl && (
                            <img src={bundle.imageUrl} alt="Card preview" className="preview-thumb" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, `bundle-${idx}`, (url) => {
                                const updated = [...bundles];
                                updated[idx].imageUrl = url;
                                setBundles(updated);
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('bundles', bundles)}
                  >
                    {saving ? 'Saving...' : 'Save Bundle Cards'}
                  </button>
                </div>
              </div>
            )}

            {/* 6. Note Profiles */}
            {activeTab === 'noteProfiles' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>"SHOP BY NOTE PROFILE" Olfactory Avatars</h3>
                  <p>Visual squircle avatars (Gourmand, Floral, Fruity, Fresh, Woody) with authentic photography.</p>
                </div>

                <div className="items-list">
                  {noteProfiles.map((note, idx) => (
                    <div key={note.id || idx} className="item-row">
                      <div className="avatar-preview-box">
                        {note.imageUrl ? (
                          <img src={note.imageUrl} alt={note.name} className="note-avatar-preview" />
                        ) : (
                          <div className="avatar-placeholder" />
                        )}
                      </div>
                      <div className="field-group flex-1">
                        <label>Note Name</label>
                        <input
                          type="text"
                          value={note.name}
                          onChange={(e) => {
                            const updated = [...noteProfiles];
                            updated[idx].name = e.target.value;
                            setNoteProfiles(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Filter Tag</label>
                        <input
                          type="text"
                          value={note.tag}
                          onChange={(e) => {
                            const updated = [...noteProfiles];
                            updated[idx].tag = e.target.value;
                            setNoteProfiles(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Change Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, `note-${idx}`, (url) => {
                              const updated = [...noteProfiles];
                              updated[idx].imageUrl = url;
                              setNoteProfiles(updated);
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('noteProfiles', noteProfiles)}
                  >
                    {saving ? 'Saving...' : 'Save Note Profiles'}
                  </button>
                </div>
              </div>
            )}

            {/* 7. Retail Partners */}
            {activeTab === 'retailPartners' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>"WE'RE ALSO AVAILABLE AT" Quick-Commerce Partners</h3>
                  <p>Zepto, Blinkit, Instamart, Nykaa, Myntra, Amazon partners.</p>
                </div>

                <div className="items-list">
                  {retailPartners.map((partner, idx) => (
                    <div key={partner.id || idx} className="item-row">
                      <div className="field-group flex-1">
                        <label>Partner Brand Name</label>
                        <input
                          type="text"
                          value={partner.name}
                          onChange={(e) => {
                            const updated = [...retailPartners];
                            updated[idx].name = e.target.value;
                            updated[idx].text = e.target.value;
                            setRetailPartners(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Store Link</label>
                        <input
                          type="text"
                          value={partner.url || ''}
                          onChange={(e) => {
                            const updated = [...retailPartners];
                            updated[idx].url = e.target.value;
                            setRetailPartners(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Logo Upload (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, `partner-${idx}`, (url) => {
                              const updated = [...retailPartners];
                              updated[idx].logoUrl = url;
                              setRetailPartners(updated);
                            })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => {
                          setRetailPartners(retailPartners.filter((_, i) => i !== idx));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => {
                      setRetailPartners([
                        ...retailPartners,
                        { id: `partner-${Date.now()}`, name: 'New Partner', text: 'new partner', url: '#' },
                      ]);
                    }}
                  >
                    + Add Partner
                  </button>
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('retailPartners', retailPartners)}
                  >
                    {saving ? 'Saving...' : 'Save Retail Partners'}
                  </button>
                </div>
              </div>
            )}

            {/* 8. Trust Promises */}
            {activeTab === 'promises' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>"OUR PROMISES" Trust Badge Seals</h3>
                  <p>Circular badges certifying safety, purity, and craftsmanship.</p>
                </div>

                <div className="items-list">
                  {promises.map((promise, idx) => (
                    <div key={promise.id || idx} className="item-row" style={{ alignItems: 'flex-start' }}>
                      <div className="field-group flex-1">
                        <label>Seal Title</label>
                        <input
                          type="text"
                          value={promise.title}
                          placeholder="e.g. IFRA CERTIFIED"
                          onChange={(e) => {
                            const updated = [...promises];
                            updated[idx].title = e.target.value;
                            setPromises(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Label / Subtitle</label>
                        <input
                          type="text"
                          value={promise.description || ''}
                          placeholder="e.g. IFRA Certified"
                          onChange={(e) => {
                            const updated = [...promises];
                            updated[idx].description = e.target.value;
                            setPromises(updated);
                          }}
                        />
                      </div>
                      <div className="field-group" style={{ width: '180px' }}>
                        <label>Icon Image (Optional)</label>
                        <div className="upload-box" style={{ padding: '6px' }}>
                          {promise.iconUrl && (
                            <img src={promise.iconUrl} alt="Icon preview" className="preview-thumb" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, `promise-${idx}`, (url) => {
                                const updated = [...promises];
                                updated[idx].iconUrl = url;
                                setPromises(updated);
                              })
                            }
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        className="delete-item-btn"
                        style={{ marginTop: '24px' }}
                        onClick={() => {
                          setPromises(promises.filter((_, i) => i !== idx));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => {
                      setPromises([
                        ...promises,
                        { id: `promise-${Date.now()}`, title: 'New Certified Seal', description: 'Certified' },
                      ]);
                    }}
                  >
                    + Add Promise Badge
                  </button>
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('promises', promises)}
                  >
                    {saving ? 'Saving...' : 'Save Promises'}
                  </button>
                </div>
              </div>
            )}

            {/* 9. Instagram Feed */}
            {activeTab === 'instagram' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>"OUR INSTAGRAM" Lifestyle Photo Slider</h3>
                  <p>Community lifestyle photos linked to your Instagram feed.</p>
                </div>

                <div className="items-list">
                  {instagram.map((post, idx) => (
                    <div key={post.id || idx} className="item-row">
                      <div className="avatar-preview-box">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt="Post" className="note-avatar-preview" />
                        ) : (
                          <div className="avatar-placeholder" />
                        )}
                      </div>
                      <div className="field-group flex-2">
                        <label>Hover Caption</label>
                        <input
                          type="text"
                          value={post.caption}
                          onChange={(e) => {
                            const updated = [...instagram];
                            updated[idx].caption = e.target.value;
                            setInstagram(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Instagram URL</label>
                        <input
                          type="text"
                          value={post.url}
                          onChange={(e) => {
                            const updated = [...instagram];
                            updated[idx].url = e.target.value;
                            setInstagram(updated);
                          }}
                        />
                      </div>
                      <div className="field-group flex-1">
                        <label>Replace Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileUpload(e, `insta-${idx}`, (url) => {
                              const updated = [...instagram];
                              updated[idx].imageUrl = url;
                              setInstagram(updated);
                            })
                          }
                        />
                      </div>
                      <button
                        type="button"
                        className="delete-item-btn"
                        onClick={() => {
                          setInstagram(instagram.filter((_, i) => i !== idx));
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="add-item-btn"
                    onClick={() => {
                      setInstagram([
                        ...instagram,
                        {
                          id: `insta-${Date.now()}`,
                          imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
                          caption: 'Discover luxury.',
                          url: 'https://instagram.com',
                        },
                      ]);
                    }}
                  >
                    + Add Instagram Photo
                  </button>
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('instagram', instagram)}
                  >
                    {saving ? 'Saving...' : 'Save Instagram Feed'}
                  </button>
                </div>
              </div>
            )}

            {/* 10. Titles & Headings */}
            {activeTab === 'titles' && (
              <div className="section-editor">
                <div className="editor-intro">
                  <h3>Section Headings &amp; Wordmark Customization</h3>
                  <p>Control the title text displayed above each storefront section.</p>
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label>Shop The Moment Section Title</label>
                    <input
                      type="text"
                      value={titles.shopMomentTitle}
                      onChange={(e) => setTitles({ ...titles, shopMomentTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Shop By Gender Section Title</label>
                    <input
                      type="text"
                      value={titles.genderTitle}
                      onChange={(e) => setTitles({ ...titles, genderTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Shoppable Reels Title</label>
                    <input
                      type="text"
                      value={titles.hypeTitle}
                      onChange={(e) => setTitles({ ...titles, hypeTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Note Profile Section Title</label>
                    <input
                      type="text"
                      value={titles.noteProfileTitle}
                      onChange={(e) => setTitles({ ...titles, noteProfileTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Gifting Edit Title</label>
                    <input
                      type="text"
                      value={titles.giftingTitle}
                      onChange={(e) => setTitles({ ...titles, giftingTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Promises Title</label>
                    <input
                      type="text"
                      value={titles.promisesTitle}
                      onChange={(e) => setTitles({ ...titles, promisesTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Reviews Headline</label>
                    <input
                      type="text"
                      value={titles.customerCountTitle}
                      onChange={(e) => setTitles({ ...titles, customerCountTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Instagram Gallery Title</label>
                    <input
                      type="text"
                      value={titles.instagramTitle}
                      onChange={(e) => setTitles({ ...titles, instagramTitle: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Brand Wordmark</label>
                    <input
                      type="text"
                      value={titles.brandWordmark}
                      onChange={(e) => setTitles({ ...titles, brandWordmark: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Brand Tagline</label>
                    <input
                      type="text"
                      value={titles.brandTagline}
                      onChange={(e) => setTitles({ ...titles, brandTagline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="editor-actions">
                  <button
                    type="button"
                    className="save-btn"
                    disabled={saving}
                    onClick={() => handleSaveSection('titles', titles)}
                  >
                    {saving ? 'Saving...' : 'Save Headings'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .admin-homepage-builder {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          color: #ffffff;
        }
        .builder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .builder-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 6px 0;
        }
        .builder-subtitle {
          font-size: 0.9rem;
          color: #888888;
          margin: 0;
        }
        .preview-store-btn {
          background: #d4af37;
          color: #000000;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .preview-store-btn:hover {
          opacity: 0.9;
        }
        .success-banner {
          background: rgba(46, 204, 113, 0.15);
          border: 1px solid #2ecc71;
          color: #2ecc71;
          padding: 12px 18px;
          border-radius: 8px;
          font-size: 0.88rem;
          margin-bottom: 20px;
        }
        .builder-tabs {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .tab-btn {
          background: rgba(255, 255, 255, 0.05);
          color: #aaaaaa;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        .tab-btn.active {
          background: #d4af37;
          color: #000000;
          border-color: #d4af37;
        }
        .tab-card {
          background: #141414;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 28px;
        }
        .builder-loading {
          padding: 40px;
          text-align: center;
          color: #888888;
        }
        .editor-intro {
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 16px;
        }
        .editor-intro h3 {
          font-size: 1.25rem;
          color: #ffffff;
          margin: 0 0 6px 0;
        }
        .editor-intro p {
          font-size: 0.85rem;
          color: #888888;
          margin: 0;
        }
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }
        .item-row {
          display: flex;
          align-items: flex-end;
          gap: 14px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 14px 18px;
          border-radius: 10px;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .flex-1 {
          flex: 1;
        }
        .flex-2 {
          flex: 2;
        }
        .field-group label {
          font-size: 0.75rem;
          color: #aaaaaa;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .field-group input[type='text'],
        .form-field input[type='text'],
        .form-field textarea {
          background: #1f1f1f;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 9px 12px;
          color: #ffffff;
          font-size: 0.88rem;
          outline: none;
        }
        .field-group input[type='text']:focus,
        .form-field input[type='text']:focus,
        .form-field textarea:focus {
          border-color: #d4af37;
        }
        .toggle-group {
          align-items: center;
          justify-content: center;
          padding: 0 10px;
        }
        .delete-item-btn {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 6px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }
        .delete-item-btn:hover {
          background: rgba(239, 68, 68, 0.35);
        }
        .editor-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 24px;
        }
        .add-item-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 10px 18px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .add-item-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .save-btn {
          background: #d4af37;
          color: #000000;
          border: none;
          border-radius: 8px;
          padding: 11px 26px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .save-btn:hover {
          opacity: 0.9;
        }
        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .full-width {
          grid-column: span 2;
        }
        .form-field label {
          font-size: 0.78rem;
          color: #aaaaaa;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .checkbox-field {
          grid-column: span 2;
          flex-direction: row;
          align-items: center;
        }
        .checkbox-field label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .upload-box {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .preview-thumb {
          width: 80px;
          height: 60px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .mini-thumb {
          width: 50px;
          height: 30px;
          object-fit: contain;
          margin-top: 4px;
        }
        .cards-edit-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .bundle-edit-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .bundle-edit-box h4 {
          margin: 0 0 6px 0;
          color: #d4af37;
        }
        .avatar-preview-box {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          overflow: hidden;
          background: #222;
          flex-shrink: 0;
        }
        .note-avatar-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}
