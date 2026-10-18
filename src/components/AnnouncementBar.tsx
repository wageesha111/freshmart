'use client';

import React, { useState } from 'react';

export default function AnnouncementBar() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="announcement-bar" id="announcement-bar">
      <div className="announcement-content">
        <span>
          FREE delivery on orders above Rs. 499 &nbsp;|&nbsp; Hotline: <strong>071 418 2326</strong> &nbsp;|&nbsp; Use code <strong>FRESH10</strong> for 10% off!
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
