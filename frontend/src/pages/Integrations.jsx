import React, { useState } from 'react'
import { Settings, CheckCircle, XCircle } from 'lucide-react'

const Integrations = () => {
  const [integrations, setIntegrations] = useState({
    etsy: true,
    shopify: false,
    woocommerce: true,
    ebay: false,
    jumia: false,
    jiji: false
  })

  const platforms = [
    { id: 'etsy', name: 'Etsy', icon: '🎨', description: 'Handmade marketplace' },
    { id: 'shopify', name: 'Shopify', icon: '🛒', description: 'E-commerce platform' },
    { id: 'woocommerce', name: 'WooCommerce', icon: '📦', description: 'WordPress plugin' },
    { id: 'ebay', name: 'eBay', icon: '🔨', description: 'Auction marketplace' },
    { id: 'jumia', name: 'Jumia', icon: '🌍', description: 'African marketplace' },
    { id: 'jiji', name: 'Jiji', icon: '📱', description: 'Classifieds platform' }
  ]

  const toggleIntegration = (id) => {
    setIntegrations(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Integrations</h1>
        <p className="text-lg text-gray-400">Connect and manage your e-commerce platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => (
          <div key={platform.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center text-xl">
                  {platform.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{platform.name}</h3>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    integrations[platform.id]
                      ? 'bg-green-900/20 text-green-400'
                      : 'bg-gray-900/20 text-gray-400'
                  }`}>
                    {integrations[platform.id] ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Connected
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3" />
                        Disconnected
                      </>
                    )}
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleIntegration(platform.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  integrations[platform.id]
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {integrations[platform.id] ? 'Disable' : 'Enable'}
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              {platform.description}
            </p>

            {integrations[platform.id] && (
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors">
                  <Settings className="w-4 h-4" />
                  Configure API Keys
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Integrations