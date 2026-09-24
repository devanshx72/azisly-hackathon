import React, { useState } from 'react';
import { KeyRound, X, Check, Copy } from 'lucide-react';
import { getDeviceId, getIdentityMode } from '../api/client';

interface RestoreSessionModalProps {
  isOpen: boolean;
  onRestore: (uuidKey: string) => void;
  onClose: () => void;
}

export const RestoreSessionModal: React.FC<RestoreSessionModalProps> = ({
  isOpen,
  onRestore,
  onClose,
}) => {
  const [inputKey, setInputKey] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const currentDeviceId = getDeviceId();
  const identityMode = getIdentityMode();

  const handleCopyCurrentKey = () => {
    navigator.clipboard.writeText(currentDeviceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = inputKey.trim();
    if (!clean) {
      setError('Please paste or enter an existing UUID key.');
      return;
    }

    try {
      onRestore(clean);
      setInputKey('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid key provided.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 agrone-modal-backdrop animate-fade-in">
      <div className="bg-[#F9F7F2] rounded-[36px] max-w-md w-full p-6 sm:p-8 agrone-card-shadow border border-[#E6E1D7] text-[#132B20] relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#132B20]/5 hover:bg-[#132B20]/15 flex items-center justify-center text-[#132B20]/70 hover:text-[#132B20] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3.5 pr-8">
          <div className="w-10 h-10 rounded-full bg-[#E3EDE5] border border-[#C8D9CB] text-[#132B20] flex items-center justify-center flex-shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#132B20]/60">
              Account &amp; Session Recovery
            </span>
            <h2 className="text-xl font-bold text-[#132B20] tracking-tight">
              Restore Existing Session
            </h2>
          </div>
        </div>

        {/* Current Identity info box */}
        <div className="bg-[#F0ECE1] rounded-2xl p-3.5 border border-[#E6E1D7] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#132B20]/60">
              Active Identity Key ({identityMode})
            </span>
            <button
              type="button"
              onClick={handleCopyCurrentKey}
              className="inline-flex items-center space-x-1 text-[10px] font-bold text-[#132B20] hover:text-[#74C043] transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#74C043]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>
          <code className="block bg-white p-2 rounded-xl text-xs font-mono text-[#132B20] border border-[#E6E1D7] truncate">
            {currentDeviceId}
          </code>
        </div>

        {/* Restore Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#132B20]/70 mb-1.5">
              Paste Existing Device UUID
            </label>
            <input
              type="text"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="e.g. 8a9b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
              className="agrone-input w-full px-4 py-2.5 rounded-2xl text-xs font-mono text-[#132B20]"
            />
            <p className="text-[11px] text-[#132B20]/60 mt-1">
              Pasting an existing UUID key instantly restores your logged activities and weekly budget targets without credentials.
            </p>
          </div>

          {error && <p className="text-xs text-[#8C6824] font-bold">{error}</p>}

          <div className="pt-2 flex justify-end space-x-2 border-t border-[#E6E1D7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#132B20]/20 text-xs font-semibold hover:bg-[#132B20]/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#132B20] hover:bg-[#1f4331] text-white text-xs font-bold px-5 py-2 rounded-full agrone-pill-shadow transition cursor-pointer"
            >
              Restore &amp; Load Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
