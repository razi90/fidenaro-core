import { useState } from 'react';

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  const handlePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <main style={{ padding: '1rem 0' }}>
      <h2>Trade smarter with {globalThis.dAppName}</h2>
    </main>
  );
}
