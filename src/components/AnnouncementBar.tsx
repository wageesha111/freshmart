'use client';

import React, { useState } from 'react';

export default function AnnouncementBar() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="announcement-bar" id="announcement-bar">
      <div className="announcement-content">
        <span>
          FREE delivery on orders above ₹499 &nbsp;|&nbsp; Use code <strong>FRESH10</strong> for 10% off your first order!
        </span>
      </div>
      <button
        className="announcement-close"
        onClick={() => setClosed(true)}
        aria-label="Close announcement"
      >
        ✕
      </button>
    </div>
  );
}
