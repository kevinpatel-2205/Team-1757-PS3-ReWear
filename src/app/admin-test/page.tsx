'use client'

import { useState, useEffect } from 'react'

export default function AdminTestPage() {
  const [testData, setTestData] = useState<any>(null)
  const [itemsData, setItemsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestData()
  }, [])

  const fetchTestData = async () => {
    try {
      setLoading(true)
      
      // Test the test API
      console.log('🧪 Fetching test data...')
      const testResponse = await fetch('/api/test-items')
      if (testResponse.ok) {
        const testResult = await testResponse.json()
        setTestData(testResult)
        console.log('🧪 Test data:', testResult)
      }
      
      // Test the regular items API
      console.log('🧪 Fetching regular items API...')
      const itemsResponse = await fetch('/api/items?limit=100')
      if (itemsResponse.ok) {
        const itemsResult = await itemsResponse.json()
        setItemsData(itemsResult)
        console.log('🧪 Items data:', itemsResult)
      }
      
    } catch (error) {
      console.error('🧪 Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Loading test data...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test API Results */}
        <div className="bg-blue-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Test API Results</h2>
          {testData ? (
            <div className="space-y-2 text-sm">
              <p><strong>Total Items:</strong> {testData.total}</p>
              <p><strong>Active Items:</strong> {testData.active}</p>
              <p><strong>Pending Items:</strong> {testData.pending}</p>
              <p><strong>Approved Items:</strong> {testData.approved}</p>
              
              <div className="mt-4">
                <strong>Items List:</strong>
                <div className="max-h-40 overflow-y-auto mt-2">
                  {testData.items?.map((item: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-white rounded mb-1">
                      <div><strong>{item.title}</strong></div>
                      <div>Status: {item.status} | Active: {item.isActive ? 'Yes' : 'No'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>No test data available</p>
          )}
        </div>

        {/* Regular API Results */}
        <div className="bg-green-50 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Regular Items API Results</h2>
          {itemsData ? (
            <div className="space-y-2 text-sm">
              <p><strong>Items Returned:</strong> {itemsData.items?.length || 0}</p>
              <p><strong>Total in DB:</strong> {itemsData.pagination?.total || 0}</p>
              
              <div className="mt-4">
                <strong>Items List:</strong>
                <div className="max-h-40 overflow-y-auto mt-2">
                  {itemsData.items?.map((item: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-white rounded mb-1">
                      <div><strong>{item.title}</strong></div>
                      <div>Status: {item.status} | User: {item.user?.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p>No items data available</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <button 
          onClick={fetchTestData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Refresh Test Data
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p className="text-sm">Check the browser console for detailed logs.</p>
        <p className="text-sm">This page tests both the test API and regular items API.</p>
      </div>
    </div>
  )
}
