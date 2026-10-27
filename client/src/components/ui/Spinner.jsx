import './Spinner.css';

const Spinner = ({ size = 'md', className = '' }) => {
  return (
    <div className={`spinner-container ${className}`}>
      <div className={`spinner spinner-${size}`}>
        <div className="spinner-ring" />
        <div className="spinner-ring" />
        <div className="spinner-ring" />
      </div>
    </div>
  );
};

export const PageSpinner = () => (
  <div className="page-spinner">
    <Spinner size="lg" />
    <p className="page-spinner-text">Loading...</p>
  </div>
);

export default Spinner;
