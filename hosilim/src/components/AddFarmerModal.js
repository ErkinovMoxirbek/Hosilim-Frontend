import React, { useState } from 'react';
import Modal from './Modal';

const AddFarmerModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');

  const handleSave = async () => {
    try {
      await fetch('https://api.hosilim.uz/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, village }),
      });
      onClose(); // Close and refresh data
    } catch (err) {
      // Handle error
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi dehqon qo'shish">
      <form>
        <div className="form-group">
          <label className="form-label">Ism</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="form-control" placeholder="Ali Valiyev" />
        </div>
        {/* Similar for phone and village */}
      </form>
    </Modal>
  );
};

export default AddFarmerModal;