import React from 'react'

// for mobile/web compat
// TODO more intelligent
// TODO drag??
export default ({children, onClick}) => (
  <div onTouchStart={(e) => {e.preventDefault()}} onTouchEnd={onClick} onClick={onClick} style={{
    cursor: 'pointer',
  }}>
    {children}
  </div>
)
