'use client';

import { useState } from 'react';

interface Contributor {
  name: string;
  role: string;
  percentage: number;
  email?: string;
}

interface Props {
  contributors: Contributor[];
  onComplete: (signatures: any) => void;
}

export default function SignatureWorkflow({ contributors, onComplete }: Props) {
  const [signatureMethod, setSignatureMethod] = useState<'basic' | 'enhanced' | 'docusign'>('basic');
  const [processing, setProcessing] = useState(false);

  const handleMethodSelect = (method: 'basic' | 'enhanced' | 'docusign') => {
    setSignatureMethod(method);
  };

  const processSignatures = async () => {
    setProcessing(true);
    
    try {
      const response = await fetch('/api/signatures/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contributors,
          signatureMode: signatureMethod,
          trackData: {
            submissionId: `radio_${Date.now()}`
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Signature processing failed:', error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="signature-workflow space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold">✍️ Signature Confirmation</h3>
        <p>Final step: Sign the SAMRO documentation</p>
      </div>

      <div className="signature-method-selector space-y-3">
        <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="signature-method"
            value="docusign"
            checked={signatureMethod === 'docusign'}
            onChange={() => handleMethodSelect('docusign')}
          />
          <div>
            <div className="font-medium">🏢 DocuSign Professional</div>
            <div className="text-sm text-gray-600">Legal-grade signatures (Recommended for multiple contributors)</div>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="signature-method"
            value="enhanced"
            checked={signatureMethod === 'enhanced'}
            onChange={() => handleMethodSelect('enhanced')}
          />
          <div>
            <div className="font-medium">✍️ Enhanced Digital</div>
            <div className="text-sm text-gray-600">Digital signatures with legal compliance</div>
          </div>
        </label>

        <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="radio"
            name="signature-method"
            value="basic"
            checked={signatureMethod === 'basic'}
            onChange={() => handleMethodSelect('basic')}
          />
          <div>
            <div className="font-medium">📄 Manual Signing</div>
            <div className="text-sm text-gray-600">Export documents for manual signing</div>
          </div>
        </label>
      </div>

      {signatureMethod === 'docusign' && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800">DocuSign Professional Benefits</h4>
          <ul className="text-sm text-green-700 mt-2 space-y-1">
            <li>• Legally binding signatures</li>
            <li>• Automatic email notifications</li>
            <li>• Audit trail and compliance</li>
            <li>• Multi-party signature routing</li>
          </ul>
        </div>
      )}

      <div className="contributors-list">
        <h4 className="font-medium mb-3">Contributors to Sign ({contributors.length})</h4>
        <div className="space-y-2">
          {contributors.map((contributor, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-medium">{contributor.name}</div>
                <div className="text-sm text-gray-600">{contributor.role} - {contributor.percentage}%</div>
              </div>
              <div className="text-sm text-gray-500">
                {contributor.email || 'Email required for DocuSign'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={processSignatures}
          disabled={processing}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {processing ? 'Processing...' : 'Complete Signatures'}
        </button>
        
        <button
          onClick={() => onComplete({ skipped: true })}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Skip Signatures
        </button>
      </div>
    </div>
  );
}