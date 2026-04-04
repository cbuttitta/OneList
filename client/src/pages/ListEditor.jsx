import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";
import PasswordInput from "../components/PasswordInput";

const listEmoji = (type) =>
  type === "christmas" ? "🎄 " : type === "birthday" ? "🎂 " : "";

export default function ListEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [list, setList] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  // Shared form state (used by both add and edit modals)
  const [modalMode, setModalMode] = useState(null); // null | "add" | "edit"
  const [editingItem, setEditingItem] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newBuyLink, setNewBuyLink] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const [importWarning, setImportWarning] = useState("");

  // List settings
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [surpriseMode, setSurpriseMode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [saved, setSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Danger zone modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  useEffect(() => {
    api.lists.getOne(id).then((data) => {
      setList(data);
      setItems(data.items || []);
      setIsPrivate(data.is_private);
      setSurpriseMode(data.surprise_mode);
      setRenameInput(data.name);
    }).catch((e) => setError(e.message));
  }, [id]);

  const resetModal = () => {
    setModalMode(null);
    setEditingItem(null);
    setNewTitle(""); setNewDesc(""); setNewBuyLink(""); setNewImage("");
    setNewPrice(""); setNewPriority(""); setNewQuantity(1);
    setImportUrl(""); setImportError(""); setImporting(false);
  };

  const openAdd = () => {
    resetModal();
    setModalMode("add");
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setNewTitle(item.title || "");
    setNewDesc(item.description || "");
    setNewBuyLink(item.buy_link || "");
    setNewImage(item.image_data || "");
    setNewPrice(item.price || "");
    setNewPriority(item.priority || "");
    setNewQuantity(item.quantity || 1);
    setImportUrl(""); setImportError(""); setImporting(false);
    setModalMode("edit");
  };

  const handleRename = async () => {
    if (!renameInput.trim()) return;
    try {
      const updated = await api.lists.update(id, { name: renameInput.trim() });
      setList(updated);
      setShowRenameModal(false);
    } catch (e) { setError(e.message); }
  };

  const saveSettings = async () => {
    try {
      const body = { name: list.name, is_private: isPrivate, surprise_mode: surpriseMode };
      if (passcode) body.passcode = passcode;
      else if (!isPrivate) body.passcode = null;
      const updated = await api.lists.update(id, body);
      setList(updated);
      setSurpriseMode(updated.surprise_mode);
      setPasscode("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { setError(e.message); }
  };

  const handleImport = async () => {
    if (!importUrl.trim()) return;
    setImporting(true);
    setImportError("");
    setImportWarning("");
    try {
      const data = await api.preview.fetch(importUrl.trim());
      if (data.title) setNewTitle(data.title);
      if (data.description) setNewDesc(data.description);
      if (data.image_url) setNewImage(data.image_url);
      if (data.price) setNewPrice(data.price);
      setNewBuyLink(importUrl.trim());
      setImportUrl("");
      const missing = [!data.title && "Name", !data.description && "Description", !data.image_url && "Image"].filter(Boolean);
      if (missing.length > 0) {
        const joined = missing.length === 1
          ? missing[0]
          : missing.slice(0, -1).join(", ") + " and " + missing[missing.length - 1];
        setImportWarning(`${joined} could not be found, please enter ${missing.length > 1 ? "them" : "it"} manually`);
        setTimeout(() => setImportWarning(""), 3000);
      }
    } catch (e) { setImportError(e.message); }
    finally { setImporting(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result);
    reader.readAsDataURL(file);
  };

  const addItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const item = await api.items.create(id, {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        buy_link: newBuyLink.trim() || undefined,
        image_data: newImage || undefined,
        price: newPrice || undefined,
        priority: newPriority || undefined,
        quantity: parseInt(newQuantity) || 1,
      });
      setItems((prev) => [...prev, item]);
      resetModal();
    } catch (e) { setError(e.message); }
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const item = await api.items.edit(id, editingItem.id, {
        title: newTitle.trim(),
        description: newDesc.trim() || null,
        buy_link: newBuyLink.trim() || null,
        image_data: newImage || null,
        price: newPrice || null,
        priority: newPriority || null,
        quantity: parseInt(newQuantity) || 1,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
      resetModal();
    } catch (e) { setError(e.message); }
  };

  const toggleStatus = async (item) => {
    const status = item.status === "claimed" ? "pending" : "claimed";
    try {
      const updated = await api.items.update(id, item.id, { status });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (e) { setError(e.message); }
  };

  const handleReorder = async (item, direction) => {
    try {
      const reordered = await api.items.reorder(id, item.id, direction);
      setItems(reordered);
    } catch (e) { setError(e.message); }
  };

  const deleteItem = async (itemId) => {
    try {
      await api.items.delete(id, itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async () => {
    try {
      await api.lists.delete(id);
      navigate("/dashboard");
    } catch (e) { setError(e.message); setShowDeleteModal(false); }
  };

  const handleArchive = async () => {
    try {
      await api.lists.archive(id);
      navigate("/dashboard");
    } catch (e) { setError(e.message); setShowArchiveModal(false); }
  };

  const handleDuplicate = async () => {
    try {
      const newList = await api.lists.duplicate(id);
      navigate(`/lists/${newList.id}`);
    } catch (e) { setError(e.message); }
  };

  const shareUrl = list ? `${window.location.origin}/share/${list.share_token}` : "";

  if (!list) return <><Navbar /><p className="loading">Loading&hellip;</p></>;

  const itemForm = (
    <form onSubmit={modalMode === "add" ? addItem : saveEdit} className="add-item-form">
      <div className="import-url-row">
        <input
          type="url"
          placeholder="Paste a product link to auto-fill…"
          value={importUrl}
          onChange={(e) => setImportUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleImport())}
        />
        <button type="button" className="btn btn-import" onClick={handleImport} disabled={importing || !importUrl.trim()}>
          {importing ? "Fetching…" : "Import From Link"}
        </button>
      </div>
      {importError && <p className="error">{importError}</p>}

      <label className="field-label">
        <span>Name <span className="optional">(required)</span></span>
        <input type="text" placeholder="e.g. AirPods Pro" value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)} required autoFocus />
      </label>
      <label className="field-label">
        <span>Description <span className="optional">(optional)</span></span>
        <textarea placeholder="Add a note or description…" value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)} rows={3} />
      </label>
      <label className="field-label">
        <span>Link to buy <span className="optional">(optional)</span></span>
        <input type="url" placeholder="https://…" value={newBuyLink}
          onChange={(e) => setNewBuyLink(e.target.value)} />
      </label>
      <div className="form-row-2">
        <label className="field-label">
          <span>Price <span className="optional">(optional)</span></span>
          <input type="text" placeholder="e.g. $29.99" value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)} />
        </label>
        <label className="field-label">
          <span>Quantity</span>
          <input type="number" min="1" value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)} />
        </label>
      </div>
      <label className="field-label">
        <span>Priority <span className="optional">(optional)</span></span>
        <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
          <option value="">No priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <div className="field-label-row">
        <span>Image</span>
        <span className="optional">(optional)</span>
        <label className="image-upload-label">
          {newImage ? "Change image" : "Upload image"}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>
        {newImage && (
          <button type="button" className="btn-text btn-text-sm" onClick={() => setNewImage("")}>Remove</button>
        )}
        {newImage && <img src={newImage} alt="preview" className="image-preview" />}
      </div>
      <button type="submit" className="btn btn-modal-submit">
        {modalMode === "add" ? "Add item" : "Save changes"}
      </button>
    </form>
  );

  return (
    <>
      <Navbar />
      <main className="list-editor">
        <Link to="/dashboard" className="back-link">⬅ My lists</Link>

        {error && <p className="error">{error}</p>}

        <section className="editor-header">
          <h1>{listEmoji(list.list_type)}{list.name}</h1>
          <div className="editor-header-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleDuplicate}>Duplicate</button>
            <button className="btn btn-sm" onClick={() => { setRenameInput(list.name); setShowRenameModal(true); }}>Rename</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowShareModal(true)}>Share 🔗</button>
          </div>
        </section>

        {/* Share modal */}
        {showShareModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Share settings</h3>
              <label className="checkbox-label">
                <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                Require passcode to view
              </label>
              {isPrivate && (
                <PasswordInput
                  placeholder="Set new passcode (leave blank to keep existing)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              )}
              <label className="checkbox-label">
                <input type="checkbox" checked={surpriseMode} onChange={(e) => setSurpriseMode(e.target.checked)} />
                Surprise mode — hide claimed items from me
              </label>
              <div className="share-row">
                <input readOnly value={shareUrl} className="share-url" />
                <button className="btn btn-secondary btn-sm" onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 1500);
                }}>
                  {linkCopied ? "Copied!" : "Copy link"}
                </button>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowShareModal(false)}>Close</button>
                <button className="btn" onClick={() => { saveSettings(); setShowShareModal(false); }}>
                  {saved ? "Saved!" : "Save settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rename modal */}
        {showRenameModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Rename list</h3>
              <input type="text" value={renameInput}
                onChange={(e) => setRenameInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                autoFocus />
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowRenameModal(false)}>Cancel</button>
                <button className="btn" onClick={handleRename}>Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Add / Edit item modal */}
        {modalMode && (
          <div className="modal-overlay" onClick={resetModal}>
            <div className="modal modal-add-item" onClick={(e) => e.stopPropagation()}>
              {itemForm}
            </div>
          </div>
        )}

        {/* Items section */}
        <section className="items-section">
          <div className="items-header">
            <h2>List Items ({items.length})</h2>
            <button className="btn btn-add-item" onClick={openAdd}>+ Add item</button>
          </div>

          {list.surprise_mode && (
            <p className="surprise-notice">Surprise mode is on — claimed items are hidden from you.</p>
          )}

          {items.length === 0 ? (
            <p className="empty">No items yet.</p>
          ) : (
            <ul className="item-list">
              {items.map((item, idx) => (
                <li key={item.id} className={`item ${item.status === "claimed" ? "claimed" : ""}`}>
                  <div className="reorder-btns">
                    <button className="btn-reorder" onClick={() => handleReorder(item, "up")} disabled={idx === 0} title="Move up">▲</button>
                    <button className="btn-reorder" onClick={() => handleReorder(item, "down")} disabled={idx === items.length - 1} title="Move down">▼</button>
                  </div>
                  {item.image_data && (
                    <img src={item.image_data} alt={item.title} className="item-image" />
                  )}
                  <div className="item-info">
                    <div className="item-title-row">
                      <span className="item-title">{item.title}</span>
                      {item.quantity > 1 && <span className="item-qty">×{item.quantity}</span>}
                      {item.priority && (
                        <span className={`priority-badge priority-${item.priority}`}>{item.priority}</span>
                      )}
                    </div>
                    {item.price && <span className="item-price">{item.price}</span>}
                    {item.description && <span className="item-desc">{item.description}</span>}
                    {item.buy_link && (() => {
                      let host = "", name = "External Vendor";
                      try {
                        host = new URL(item.buy_link).hostname.replace(/^www\./, "");
                        const seg = host.split(".")[0];
                        name = seg.charAt(0).toUpperCase() + seg.slice(1);
                      } catch {}
                      return (
                        <a href={item.buy_link} target="_blank" rel="noopener noreferrer" className="item-buy-link">
                          Purchase from{" "}
                          {host && (
                            <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=16`} alt=""
                              onError={(e) => { e.target.style.display = "none"; }} className="vendor-favicon" />
                          )}
                          {name} ↗
                        </a>
                      );
                    })()}
                    {item.claimer_note && (
                      <span className="claimer-note">Note: {item.claimer_note}</span>
                    )}
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-sm" onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn btn-sm btn-secondary" onClick={() => toggleStatus(item)}>
                      {item.status === "claimed" ? "Unclaim" : "Claim"}
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteItem(item.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Danger zone */}
        <div className="danger-zone">
          <button className="btn btn-secondary" onClick={() => setShowArchiveModal(true)}>
            {list.is_archived ? "Unarchive list" : "Archive list"}
          </button>
          <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
            Delete list
          </button>
        </div>

        {/* Archive modal */}
        {showArchiveModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{list.is_archived ? "Unarchive" : "Archive"} "{list.name}"?</h3>
              <p>{list.is_archived
                ? "This will restore the list to your active lists."
                : "This will hide the list from your dashboard. You can restore it later."}</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowArchiveModal(false)}>Cancel</button>
                <button className="btn" onClick={handleArchive}>Confirm</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete modal */}
        {showDeleteModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Delete "{list.name}"?</h3>
              <p>This will permanently delete the list and all its items. This cannot be undone.</p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}

        {importWarning && <div className="import-warning">{importWarning}</div>}
        {linkCopied && <div className="copied-toast">Link copied!</div>}
      </main>
    </>
  );
}
