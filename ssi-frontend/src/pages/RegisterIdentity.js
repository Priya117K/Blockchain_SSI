import React, { useState } from "react";
import { getContract, getAccount } from "../contracts/contract";

function RegisterIdentity() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dateOfBirth: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [did, setDid] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if MetaMask is on the right network (e.g., Localhost 1337)
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== '0x539') { // 0x539 is 1337 in hex
      alert("Please switch MetaMask to Localhost 8545 network!");
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log("STEP 1: Submit clicked");

      // Get contract
      const contract = await getContract();
      console.log("STEP 2: Contract:", contract);
      if (!contract) throw new Error("Contract not connected");

      // Get account
      const account = await getAccount();
      console.log("STEP 3: Account:", account);
      if (!account) throw new Error("No account found");

      // Create method
      const method = contract.methods.registerIdentity(
        formData.name,
        formData.email
      );
      console.log("STEP 4: Method created");

      // 🔍 Step 1: simulate transaction
      await method.call({ from: account });
      console.log("STEP 5: Call success");

      // 🔥 Step 2: send transaction
      const receipt = await method.send({
        from: account,
        gas: 3000000
      });
      console.log("STEP 6: Transaction success:", receipt);

      // Success UI
      const mockDid = `did:ethr:${account}`;
      setDid(mockDid);
      setSuccess(true);

      // Reset form
      setFormData({
        name: '',
        email: '',
        dateOfBirth: '',
        address: ''
      });

    } catch (err) {
      console.error("❌ ERROR:", err);
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Register Identity</h2>
        <p className="page-description">
          Create your decentralized identity on the blockchain
        </p>
      </div>

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          <div>
            <strong>Identity Registered Successfully!</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
              Your DID: <code>{did}</code>
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
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              className="form-input"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="address"
              className="form-textarea"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? "⏳ Registering..." : "🔐 Register Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterIdentity;