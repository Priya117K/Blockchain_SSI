import React, { useState } from "react";
import { getContract, getAccount } from "../contracts/contract";

function VerifyCredential() {
  const [credentialId, setCredentialId] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationResult(null);

    try {
      const contract = await getContract();
      if (!contract) throw new Error("Contract not connected");

      // Validate address format for credentialId
      const userAddress = credentialId.trim();
      if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid Ethereum address format. Please enter a valid Ethereum address (0x...).");
      }

      // Get all credentials for the user address
      const credentials = await contract.methods.getCredentials(userAddress).call();

      if (!credentials || credentials.length === 0) {
        setVerificationResult({
          valid: false,
          reason: 'No credentials found for this address on the blockchain'
        });
      } else {
        // Display all credentials for this address
        setVerificationResult({
          valid: true,
          credentials: credentials.map((cred, idx) => ({
            id: idx,
            name: cred.name,
            details: cred.details,
            timestamp: new Date(parseInt(cred.timestamp) * 1000).toLocaleString(),
            status: 'Active'
          }))
        });
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to verify credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Verify Credential</h2>
        <p className="page-description">
          Verify the authenticity of credentials on the blockchain
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="credentialId">User Ethereum Address *</label>
            <input
              type="text"
              id="credentialId"
              name="credentialId"
              className="form-input"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="Enter Ethereum address (0x...)"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '🔄 Verifying on Blockchain...' : '✓ Verify Credential'}
          </button>
        </form>

        {verificationResult && verificationResult.valid && (
          <div style={{ marginTop: '2rem' }}>
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <div>
                <strong>Credentials Found! ({verificationResult.credentials.length})</strong>
              </div>
            </div>

            {verificationResult.credentials.map((cred, idx) => (
              <div key={idx} className="card" style={{ marginBottom: '1rem' }}>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Credential #{idx + 1}</div>
                    <div className="info-value">{cred.name}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Details</div>
                    <div className="info-value">{cred.details}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Issued At</div>
                    <div className="info-value">{cred.timestamp}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Status</div>
                    <div className="info-value" style={{ color: '#22c55e' }}>{cred.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {verificationResult && !verificationResult.valid && (
          <div style={{ marginTop: '2rem' }}>
            <div className="alert alert-error">
              <span className="alert-icon">✗</span>
              <div>
                <strong>Credential is Invalid</strong>
                <p>{verificationResult.reason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyCredential;