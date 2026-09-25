import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Beaker, Clock, IndianRupee } from 'lucide-react';

const LabTestsPage = () => {
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get('/lab-tests');
        setLabTests(response.data);
      } catch (error) {
        console.error('Error fetching lab tests:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  if (loading) return <div className="text-center py-20">Loading...</div>;

  const popularTests = labTests.filter(test => test.isPopular);
  const regularTests = labTests.filter(test => !test.isPopular);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Lab Tests Marketplace</h1>
      
      {popularTests.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Popular Health Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularTests.map(test => (
              <div key={test._id} className="border rounded-lg p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-medium">{test.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{test.category}</span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{test.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Clock size={16} className="mr-2" />
                  Report in {test.reportTime}
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Beaker size={16} className="mr-2" />
                  Sample: {test.sampleType}
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-2xl font-bold text-gray-900 flex items-center">
                    <IndianRupee size={20} />{test.price}
                  </div>
                  <Link to={`/lab-tests/${test._id}`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-semibold mb-4">All Tests & Packages</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {labTests.map(test => (
            <Link key={test._id} to={`/lab-tests/${test._id}`} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition block cursor-pointer">
              <h3 className="font-medium text-lg mb-2">{test.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold flex items-center"><IndianRupee size={16}/>{test.price}</span>
                <span className="text-blue-600">View Details &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LabTestsPage;
