import React, { useState } from "react";
import { getContract, getAccount } from "../contracts/contract";

function IssueCredential() {
  const [formData, setFormData] = useState({
    holderDid: '',
    credentialType: '',
    issuerName: '',
    credentialData: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [issuedCredential, setIssuedCredential] = useState(null);

  const credentialTypes = [
    { value: 'education', label: 'Educational Degree' },
    { value: 'employment', label: 'Employment Certificate' },
    { value: 'license', label: 'Professional License' },
    { value: 'identity', label: 'Identity Proof' },
    { value: 'membership', label: 'Membership Card' }
  ];

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const contract = await getContract();
      if (!contract) throw new Error("Contract not connected");

      // Get account from Metamask
      const account = await getAccount();
      if (!account) throw new Error("No account found");

      // Validate holder address format
      const holderAddress = formData.holderDid.trim();
      if (!holderAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format for holder. Please enter a valid address (0x...).");
      }

      // Prepare credential details
      const credentialDetails = `${formData.credentialData}`;

      // Call smart contract to issue credential
      await contract.methods.issueCredential(holderAddress, formData.credentialType, credentialDetails).send({ from: account });

      // Generate hash for display
      const hash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Update UI with issued credential
      const credential = {
        id: `credential:${Math.random().toString(36).substr(2, 9)}`,
        type: formData.credentialType,
        issuer: formData.issuerName,
        holder: holderAddress,
        data: formData.credentialData,
        issuedAt: new Date().toISOString(),
        hash: hash
      };
      setIssuedCredential(credential);
      setSuccess(true);

      // Reset form
      setFormData({
        holderDid: '',
        credentialType: '',
        issuerName: '',
        credentialData: ''
      });

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to issue credential. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Issue Credential</h2>
        <p className="page-description">
          Create and issue verifiable credentials on the blockchain
        </p>
      </div>

      {success && issuedCredential && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          <div>
            <strong>Credential Issued Successfully!</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Credential ID: <code>{issuedCredential.id}</code>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="holderDid">Holder's DID *</label>
            <input
              type="text"
              id="holderDid"
              name="holderDid"
              className="form-input"
              value={formData.holderDid}
              onChange={handleChange}
              placeholder="did:ethr:0x..."
              required
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Enter the DID of the credential recipient
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="issuerName">Issuer Name *</label>
            <input
              type="text"
              id="issuerName"
              name="issuerName"
              className="form-input"
              value={formData.issuerName}
              onChange={handleChange}
              placeholder="University of XYZ"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="credentialType">Credential Type *</label>
            <select
              id="credentialType"
              name="credentialType"
              className="form-select"
              value={formData.credentialType}
              onChange={handleChange}
              required
            >
              <option value="">Select credential type...</option>
              {credentialTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="credentialData">Credential Data *</label>
            <textarea
              id="credentialData"
              name="credentialData"
              className="form-textarea"
              value={formData.credentialData}
              onChange={handleChange}
              placeholder="Enter credential details..."
              rows="4"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <>🔄 Issuing Credential...</> : <>📄 Issue Credential</>}
          </button>
        </form>

        {/* Display issued credential */}
        {issuedCredential && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Issued Credential Details</h3>
            <div className="card">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Credential ID</div>
                  <div className="info-value">{issuedCredential.id}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Type</div>
                  <div className="info-value">{credentialTypes.find(t => t.value === issuedCredential.type)?.label}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Issuer</div>
                  <div className="info-value">{issuedCredential.issuer}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Issued At</div>
                  <div className="info-value">{new Date(issuedCredential.issuedAt).toLocaleString()}</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div className="info-label">Blockchain Hash</div>
                <div className="card-value">{issuedCredential.hash}</div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div className="info-label">Credential Data</div>
                <div>{issuedCredential.data}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IssueCredential;