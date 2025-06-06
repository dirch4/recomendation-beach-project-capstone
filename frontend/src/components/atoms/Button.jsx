export const Button = ({ children, className = '', ...props }) => (
  <button {...props} className={`px-5 py-2 rounded-md transition-colors ${className}`}>
    {children}
  </button>
);