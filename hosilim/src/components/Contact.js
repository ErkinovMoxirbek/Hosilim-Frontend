import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Tez orada sizga qo\'ng\'iroq qilamiz!\n\nTelefon: +998 90 123 45 67\nEmail: info@ferganafruit.uz');
    setFormData({ name: '', phone: '', message: '' });
  };

  return (
    <section className="contact" id="contact">
      <div className="container">
        <h2>Bizga qo'shiling!</h2>
        <p>Farg'ona meva tizimining bir qismi bo'ling va daromadingizni oshiring</p>
        <button className="btn-primary" onClick={handleSubmit}>Hoziroq boshlash</button>
        <div className="contact-info">
          <div className="contact-item">
            <span>📞</span>
            <span>+998 90 123 45 67</span>
          </div>
          <div className="contact-item">
            <span>📧</span>
            <span>info@ferganafruit.uz</span>
          </div>
          <div className="contact-item">
            <span>📍</span>
            <span>Farg'ona, Qo'qon, Marg'ilon</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;