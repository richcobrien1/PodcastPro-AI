import { useState } from 'react';
import { 
  Upload, 
  Image, 
  Video, 
  Music, 
  Trash2,
  Eye,
  FolderPlus
} from 'lucide-react';

export default function Assets() {
  const [activeTab, setActiveTab] = useState('backgrounds');
  const [assets, setAssets] = useState({
    backgrounds: [],
    promoVideos: [],
    promoAudio: [],
    outros: []
  });
  const [uploading, setUploading] = useState(false);

  const tabs = [
    { id: 'backgrounds', label: 'Backgrounds', icon: Image, accept: 'image/*,video/*' },
    { id: 'promoVideos', label: 'Promo Videos', icon: Video, accept: 'video/*' },
    { id: 'promoAudio', label: 'Promo Audio', icon: Music, accept: 'audio/*' },
    { id: 'outros', label: 'Outros', icon: Video, accept: 'video/*' }
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    // Simulate upload (replace with actual R2 upload)
    setTimeout(() => {
      const newAssets = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString()
      }));

      setAssets(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], ...newAssets]
      }));
      setUploading(false);
    }, 1000);
  };

  const deleteAsset = (id) => {
    setAssets(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(asset => asset.id !== id)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const currentTab = tabs.find(t => t.id === activeTab);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Asset Library</h1>
        <p className="text-white/70">Manage your backgrounds, promos, and outros</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition ${
              activeTab === id
                ? 'bg-white/20 text-white border-2 border-accent'
                : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border-2 border-transparent'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs">
              {assets[id].length}
            </span>
          </button>
        ))}
      </div>

      {/* Upload Area */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border-2 border-dashed border-white/30 p-8 mb-6">
        <label className="cursor-pointer block">
          <input
            type="file"
            multiple
            accept={currentTab.accept}
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <div className="text-center">
            <Upload className="mx-auto mb-4 text-white/70" size={48} />
            <p className="text-white text-lg font-medium mb-2">
              {uploading ? 'Uploading...' : `Upload ${currentTab.label}`}
            </p>
            <p className="text-white/60 text-sm">
              Click to browse or drag and drop files here
            </p>
            <p className="text-white/40 text-xs mt-2">
              Accepted: {currentTab.accept}
            </p>
          </div>
        </label>
      </div>

      {/* Asset Grid */}
      {assets[activeTab].length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets[activeTab].map((asset) => (
            <div
              key={asset.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20 hover:border-accent/50 transition group"
            >
              {/* Preview */}
              <div className="aspect-video bg-black/30 flex items-center justify-center relative">
                {asset.type.startsWith('image') && (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                )}
                {asset.type.startsWith('video') && (
                  <video src={asset.url} className="w-full h-full object-cover" muted />
                )}
                {asset.type.startsWith('audio') && (
                  <Music size={48} className="text-white/50" />
                )}
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-3">
                  <button className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition">
                    <Eye size={20} className="text-white" />
                  </button>
                  <button
                    onClick={() => deleteAsset(asset.id)}
                    className="p-3 bg-red-500/80 rounded-lg hover:bg-red-600 transition"
                  >
                    <Trash2 size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-medium truncate mb-1">{asset.name}</h3>
                <div className="flex justify-between text-xs text-white/60">
                  <span>{formatFileSize(asset.size)}</span>
                  <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderPlus size={64} className="mx-auto mb-4 text-white/30" />
          <p className="text-white/60 text-lg">No {currentTab.label.toLowerCase()} uploaded yet</p>
          <p className="text-white/40 text-sm mt-2">Upload your first {currentTab.label.toLowerCase()} to get started</p>
        </div>
      )}
    </div>
  );
}
