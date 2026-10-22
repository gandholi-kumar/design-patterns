import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  KeyRound,
  ExternalLink,
  Trash2,
  X,
  Zap,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  CloudCheck,
} from 'lucide-react';
import { type AIProvider, type AIProviderConfig, testAndDiscoverAIProvider } from './ai-service';
import { AppTooltip } from '../../components/ui/app-tooltip';

interface BYOKModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIProviderConfig;
  onSaveConfig: (cfg: AIProviderConfig) => void;
  onPurgeConfig: () => void;
}

export function BYOKModal({ isOpen, onClose, config, onSaveConfig, onPurgeConfig }: BYOKModalProps) {
  const [activeTab, setActiveTab] = useState<'managed' | 'byok'>(
    config.provider === 'managed' ? 'managed' : 'byok'
  );
  const [provider, setProvider] = useState<Exclude<AIProvider, 'managed'>>(
    config.provider === 'managed' ? 'gemini' : config.provider || 'gemini'
  );
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [customModel, setCustomModel] = useState(config.model || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(config.provider === 'managed' ? 'managed' : 'byok');
      setProvider(config.provider === 'managed' ? 'gemini' : config.provider || 'gemini');
      setApiKey(config.apiKey || '');
      setCustomModel(config.model || '');
      setShowKey(false);
      setIsTesting(false);
      setTestError(null);
      setTestSuccessMsg(null);
    }
  }, [isOpen, config]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isTesting) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isTesting]);

  if (!isOpen) return null;

  const handleActivateManaged = () => {
    onSaveConfig({
      provider: 'managed',
      apiKey: '',
      model: 'gemini-2.5-flash',
    });
    onClose();
  };

  const handleVerifyAndConnect = async () => {
    if (provider !== 'ollama' && !apiKey.trim()) {
      setTestError('Please enter an API key.');
      return;
    }

    setIsTesting(true);
    setTestError(null);
    setTestSuccessMsg(null);

    const result = await testAndDiscoverAIProvider({
      provider,
      apiKey: apiKey.trim(),
      model: customModel.trim() || undefined,
      customEndpoint: provider === 'ollama' ? (customModel.trim() || undefined) : undefined,
    });

    setIsTesting(false);

    if (!result.success) {
      setTestError(result.message);
      return;
    }

    setTestSuccessMsg(result.message);
    const chosenModel = result.selectedModel || customModel.trim() || undefined;
    if (chosenModel) {
      setCustomModel(chosenModel);
    }

    onSaveConfig({
      provider,
      apiKey: apiKey.trim(),
      model: chosenModel,
    });

    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setApiKey('');
    setTestError(null);
    setTestSuccessMsg(null);
    onPurgeConfig();
    onClose();
  };

  const providerLinks: Record<Exclude<AIProvider, 'managed'>, { name: string; url: string; freeInfo: string }> = {
    gemini: {
      name: 'Google AI Studio',
      url: 'https://aistudio.google.com/app/apikey',
      freeInfo: 'Free tier available (15 RPM). Dynamically discovers latest Flash models in RAM.',
    },
    openai: {
      name: 'OpenAI Platform',
      url: 'https://platform.openai.com/api-keys',
      freeInfo: 'Pay-as-you-go. Zero-disk in-memory execution.',
    },
    groq: {
      name: 'Groq Cloud Console',
      url: 'https://console.groq.com/keys',
      freeInfo: 'Ultra-fast open models (Llama 3.3 70B Versatile).',
    },
    ollama: {
      name: 'Local Ollama Instance',
      url: 'https://ollama.com',
      freeInfo: '100% private, runs entirely on your local machine.',
    },
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="byok-title">
      <div className="byok-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="byok-header">
          <div className="byok-title-group">
            <div className="byok-icon">
              {activeTab === 'managed' ? <Sparkles size={20} /> : <KeyRound size={20} />}
            </div>
            <div>
              <span className="eyebrow">AI ARCHITECT ENGINE</span>
              <h3 id="byok-title">
                {activeTab === 'managed' ? 'Built-in Pro AI Architect' : 'Zero-Trust BYOK Key Manager'}
              </h3>
            </div>
          </div>
          <AppTooltip content="Close dialog" shortcut="Esc">
            <button type="button" className="icon-close-btn" onClick={onClose} aria-label="Close dialog" disabled={isTesting}>
              <X size={18} />
            </button>
          </AppTooltip>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1.25rem', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('managed')}
            style={{
              padding: '0.625rem 0.875rem',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: activeTab === 'managed' ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottom: activeTab === 'managed' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Sparkles size={14} />
            <span>Built-in Pro AI (No Key)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('byok')}
            style={{
              padding: '0.625rem 0.875rem',
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: activeTab === 'byok' ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottom: activeTab === 'byok' ? '2px solid var(--primary)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <KeyRound size={14} />
            <span>Bring Your Own Key (BYOK)</span>
          </button>
        </div>

        {activeTab === 'managed' ? (
          <div className="byok-form-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <Sparkles size={20} style={{ color: '#2563eb', flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.8125rem', lineHeight: '1.45' }}>
                <div style={{ fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.25rem' }}>
                  Zero Friction · Instant GoF Architectural Consultations
                </div>
                <div>
                  No Google Cloud, OpenAI, or billing account required. The backend handles inference securely using server-managed Gemini 2.5 Flash models.
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                <span>Automatic cloud synchronization with your PostgreSQL Decision Ledger.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                <span>Zero keys to configure, paste, or rotate.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={15} style={{ color: '#16a34a' }} />
                <span>Requires member sign-in session.</span>
              </div>
            </div>

            <div className="byok-footer" style={{ marginTop: '0.5rem', padding: 0 }}>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" className="subtle-modal-btn" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn byok-save-btn"
                  onClick={handleActivateManaged}
                >
                  <Zap size={15} />
                  <span>Use Built-in Pro AI Engine</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="byok-privacy-notice">
              <ShieldCheck size={18} />
              <p>
                <b>Zero-Disk Guarantee:</b> Your API key is stored <b>strictly in browser RAM</b>. It is never saved to localStorage, cookies, or backend servers, and is permanently purged when this tab is closed.
              </p>
            </div>

            <div className="byok-form-body">
              <div className="form-group">
                <label className="byok-label" htmlFor="provider-select">Select AI Provider</label>
                <div className="provider-grid" id="provider-select">
                  {(['gemini', 'openai', 'groq', 'ollama'] as Array<Exclude<AIProvider, 'managed'>>).map((p) => (
                    <button
                      type="button"
                      key={p}
                      className={`provider-chip ${provider === p ? 'active' : ''}`}
                      onClick={() => {
                        setProvider(p);
                        setTestError(null);
                        setTestSuccessMsg(null);
                      }}
                      disabled={isTesting}
                    >
                      <span className="provider-dot" />
                      <span className="capitalize">
                        {p === 'gemini' ? 'Google Gemini' : p === 'openai' ? 'OpenAI GPT-4o' : p === 'groq' ? 'Groq Cloud' : 'Local Ollama'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {provider !== 'ollama' ? (
                <div className="form-group">
                  <div className="label-row">
                    <label className="byok-label" htmlFor="api-key-input">API Key</label>
                    <a
                      href={providerLinks[provider].url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="byok-helper-link"
                    >
                      Get key on {providerLinks[provider].name} <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="key-input-wrapper">
                    <input
                      id="api-key-input"
                      type={showKey ? 'text' : 'password'}
                      className="byok-input"
                      placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setTestError(null);
                        setTestSuccessMsg(null);
                      }}
                      autoComplete="off"
                      spellCheck="false"
                      disabled={isTesting}
                    />
                    <button
                      type="button"
                      className="show-key-btn"
                      onClick={() => setShowKey(!showKey)}
                      aria-label={showKey ? 'Hide key' : 'Show key'}
                      disabled={isTesting}
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="field-hint">{providerLinks[provider].freeInfo}</p>
                </div>
              ) : (
                <div className="form-group">
                  <label className="byok-label" htmlFor="ollama-endpoint">Local Ollama Endpoint</label>
                  <input
                    id="ollama-endpoint"
                    type="text"
                    className="byok-input"
                    placeholder="http://localhost:11434/api/chat"
                    value={customModel || 'http://localhost:11434/api/chat'}
                    onChange={(e) => {
                      setCustomModel(e.target.value);
                      setTestError(null);
                      setTestSuccessMsg(null);
                    }}
                    disabled={isTesting}
                  />
                  <p className="field-hint">Ensure Ollama is running (`ollama serve`) with CORS enabled.</p>
                </div>
              )}

              {/* Dry Run Feedback Banners */}
              {isTesting && (
                <div className="byok-test-banner probing">
                  <Loader2 size={16} className="animate-spin shrink-0" />
                  <span>Validating API key and discovering available models dynamically...</span>
                </div>
              )}

              {testError && (
                <div className="byok-test-banner error">
                  <AlertTriangle size={16} className="shrink-0" />
                  <div>
                    <b>Connection Test Failed:</b>
                    <div>{testError}</div>
                  </div>
                </div>
              )}

              {testSuccessMsg && (
                <div className="byok-test-banner success">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <div>
                    <b>Dry-Run Verified:</b>
                    <div>{testSuccessMsg}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="byok-footer">
              {config.apiKey && (
                <button type="button" className="danger-text-btn" onClick={handleClear} disabled={isTesting}>
                  <Trash2 size={15} /> Disconnect & Purge
                </button>
              )}
              <div className="byok-action-btns">
                <button type="button" className="subtle-modal-btn" onClick={onClose} disabled={isTesting}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary-btn byok-save-btn"
                  onClick={handleVerifyAndConnect}
                  disabled={isTesting || (provider !== 'ollama' && !apiKey.trim())}
                >
                  {isTesting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Zap size={16} /> Verify & Connect
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
