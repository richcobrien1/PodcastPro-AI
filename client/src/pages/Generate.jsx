import { useState } from 'react';
import { 
  Video, 
  Music, 
  Image, 
  Clock, 
  Plus, 
  Trash2, 
  Save,
  Play,
  FileText,
  Wand2
} from 'lucide-react';

export default function Generate() {
  const [config, setConfig] = useState({
    title: '',
    description: '',
    background: null,
    audio: null,
    promoInserts: [],
    outro: null,
    metadata: {
      keywords: '',
      summary: '',
      topics: '',
      timeline: '',
      tags: ''
    }
  });

  const [showMetadataForm, setShowMetadataForm] = useState(false);

  const addPromoInsert = () => {
    setConfig(prev => ({
      ...prev,
      promoInserts: [
        ...prev.promoInserts,
        { id: Date.now(), timestamp: '00:00', type: 'video', asset: null }
      ]
    }));
  };

  const removePromoInsert = (id) => {
    setConfig(prev => ({
      ...prev,
      promoInserts: prev.promoInserts.filter(p => p.id !== id)
    }));
  };

  const updatePromoInsert = (id, field, value) => {
    setConfig(prev => ({
      ...prev,
      promoInserts: prev.promoInserts.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const handleGenerate = () => {
    console.log('Generating video with config:', config);
    // Will integrate with FFmpeg/API later
    alert('Video generation coming soon! Configuration saved.');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Generate Video</h1>
        <p className="text-white/70">Configure your podcast video composition</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <FileText className="mr-2" size={20} />
              Episode Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Episode Title
                </label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({...config, title: e.target.value})}
                  placeholder="January 10, 2026, AI-Now - Topic with Alex and Jessica"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Episode Description
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig({...config, description: e.target.value})}
                  placeholder="Brief description of the episode..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent"
                />
              </div>
            </div>
          </div>

          {/* Media Assets */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Video className="mr-2" size={20} />
              Media Assets
            </h2>

            <div className="space-y-4">
              {/* Background */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2 flex items-center">
                  <Image className="mr-2" size={16} />
                  Background Media
                </label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent">
                  <option value="">Select background...</option>
                  <option value="bg1">Background 1</option>
                  <option value="bg2">Background 2</option>
                </select>
                <p className="text-white/40 text-xs mt-1">This will loop throughout the video</p>
              </div>

              {/* Audio */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2 flex items-center">
                  <Music className="mr-2" size={16} />
                  Audio Track
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-accent file:text-white file:cursor-pointer"
                />
                <p className="text-white/40 text-xs mt-1">Primary podcast audio</p>
              </div>

              {/* Outro */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2 flex items-center">
                  <Video className="mr-2" size={16} />
                  Outro Video (5 seconds)
                </label>
                <select className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-accent">
                  <option value="">Select outro...</option>
                  <option value="outro1">Outro 1</option>
                  <option value="outro2">Outro 2</option>
                </select>
                <p className="text-white/40 text-xs mt-1">Branded ending with fade effects</p>
              </div>
            </div>
          </div>

          {/* Promo Inserts */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Clock className="mr-2" size={20} />
                Promo Inserts
              </h2>
              <button
                onClick={addPromoInsert}
                className="flex items-center space-x-2 px-4 py-2 bg-accent rounded-lg text-white hover:opacity-90 transition"
              >
                <Plus size={16} />
                <span>Add Insert</span>
              </button>
            </div>

            {config.promoInserts.length === 0 ? (
              <p className="text-white/40 text-sm py-4">No promo inserts added yet</p>
            ) : (
              <div className="space-y-3">
                {config.promoInserts.map((insert) => (
                  <div key={insert.id} className="bg-white/5 rounded-lg p-4 flex items-center gap-4">
                    <input
                      type="text"
                      value={insert.timestamp}
                      onChange={(e) => updatePromoInsert(insert.id, 'timestamp', e.target.value)}
                      placeholder="MM:SS"
                      className="w-24 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-center focus:outline-none focus:border-accent"
                    />
                    
                    <select
                      value={insert.type}
                      onChange={(e) => updatePromoInsert(insert.id, 'type', e.target.value)}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-accent"
                    >
                      <option value="video">Video + Audio</option>
                      <option value="audio">Audio Only</option>
                      <option value="visual">Visual Only</option>
                    </select>

                    <select className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-accent">
                      <option value="">Select asset...</option>
                      <option value="promo1">Promo 1</option>
                      <option value="promo2">Promo 2</option>
                    </select>

                    <button
                      onClick={() => removePromoInsert(insert.id)}
                      className="p-2 bg-red-500/20 rounded hover:bg-red-500/30 transition"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Episode Metadata</h2>
              <button
                onClick={() => setShowMetadataForm(!showMetadataForm)}
                className="text-accent hover:text-accent-dark transition text-sm"
              >
                {showMetadataForm ? 'Hide' : 'Show'} Details
              </button>
            </div>

            {showMetadataForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={config.metadata.keywords}
                    onChange={(e) => setConfig({...config, metadata: {...config.metadata, keywords: e.target.value}})}
                    placeholder="AI, Robotics, Technology..."
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Summary
                  </label>
                  <textarea
                    value={config.metadata.summary}
                    onChange={(e) => setConfig({...config, metadata: {...config.metadata, summary: e.target.value}})}
                    placeholder="Episode summary with key points..."
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Timeline/Chapters
                  </label>
                  <textarea
                    value={config.metadata.timeline}
                    onChange={(e) => setConfig({...config, metadata: {...config.metadata, timeline: e.target.value}})}
                    placeholder="0:00 - Introduction&#10;2:15 - Topic 1&#10;15:53 - Closing"
                    rows={4}
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Tags/Hashtags
                  </label>
                  <input
                    type="text"
                    value={config.metadata.tags}
                    onChange={(e) => setConfig({...config, metadata: {...config.metadata, tags: e.target.value}})}
                    placeholder="#AI #Technology #Podcast"
                    className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Actions & Preview */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 sticky top-24">
            <h3 className="text-lg font-bold text-white mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-accent to-accent-dark text-white font-semibold rounded-lg hover:opacity-90 transition shadow-lg"
              >
                <Wand2 size={18} />
                <span>Generate Video</span>
              </button>

              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition border border-white/20">
                <Save size={18} />
                <span>Save Template</span>
              </button>

              <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition border border-white/20">
                <Play size={18} />
                <span>Preview</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <h4 className="text-sm font-semibold text-white/80 mb-2">Configuration Summary</h4>
              <div className="space-y-2 text-sm text-white/60">
                <div className="flex justify-between">
                  <span>Title:</span>
                  <span className="text-white/80">{config.title ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Background:</span>
                  <span className="text-white/80">{config.background ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio:</span>
                  <span className="text-white/80">{config.audio ? '✓' : '✗'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Promo Inserts:</span>
                  <span className="text-white/80">{config.promoInserts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Outro:</span>
                  <span className="text-white/80">{config.outro ? '✓' : '✗'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
