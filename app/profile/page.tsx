'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, X } from 'lucide-react';
import Image from 'next/image';
import profile from '@/public/profile.png';
import mailbox from '@/public/mailbox.svg';

export default function ProfilePage() {
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState('property');
  const [activeTab, setActiveTab] = useState('propert-details');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'propert-details':
        return (
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Type
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Manager
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(7)].map((item, index) => (
                <tr key={index} className="border" onClick={() => handleRowClick(item)}>
                  <th className="py-3 px-4">
                    <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                  </th>
                  <td className="py-0 px-4 text-sm text-gray-900">Type {index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">Property {index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">Address {index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    <Image src="/property.jpg" width={50} height={50} alt="Property" />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">Manager {index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded">Approve</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'booking-details':
        return (
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-out
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((item, index) => (
                <tr key={index} className="border" onClick={() => handleRowClick(item)}>
                  <td className="py-3 px-4">
                    <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">BID00{index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">Customer {index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">2024-03-{index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">2024-03-{index + 3}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded">Confirmed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'payment-details':
        return (
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((item, index) => (
                <tr key={index} className="border" onClick={() => handleRowClick(item)}>
                  <td className="py-3 px-4">
                    <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600" />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">TXN{index + 1001}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">₹{(index + 1) * 5000}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">2024-03-{index + 1}</td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Completed</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
      <div className="absolute top-0 inset-0 bg-black bg-opacity-50 flex justify-end z-50">
        <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X />
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container relative mx-auto p-6 flex flex-col gap-6">
      {/* Profile Section */}
      <div>
        <button onClick={() => router.back()} className="text-black flex gap-2">
          <ArrowLeft />
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-col bg-white p-6 rounded-lg gap-8">
        <div className="flex items-center gap-4">
          <Image src={profile} width={80} height={80} alt="Profile Picture" className="rounded-sm" />
          <div>
            <h2 className="text-lg font-semibold">Jerome Bell</h2>
            <p className="text-gray-500">Property Manager</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="mt-2 flex items-center gap-2 text-[#101113]">
            <Phone size={20} className="text-gray-400" />
            <span>(270) 555-0117</span>
          </p>
          <p className="flex gap-2 items-center text-[#101113]">
            <Image src={mailbox} alt="mailbox" />
            jerome.bell@example.com
          </p>
          <p className="text-[#101113] flex items-center gap-2">
            <MapPin className="text-gray-400" />
            <span>3517 W. Gray St. Utica, Pennsylvania 57867</span>
          </p>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'propert-details'
                ? 'border-[#0082ed] text-[#0082ed]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('propert-details')}
          >
            Property Details
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payment-details'
                ? 'border-[#0082ed] text-[#0082ed]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('payment-details')}
          >
            Payment History
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'booking-details'
                ? 'border-[#0082ed] text-[#0082ed]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('booking-details')}
          >
            Booking Details
          </button>
        </nav>
      </div>

      {/* Table Section */}
      <div className="bg-white">
        {renderTable()}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="flex items-center">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              className="ml-2 border-gray-300 rounded-md text-sm"
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
            <span className="ml-4 text-sm text-gray-700">showing 1-{Math.min(10, 30)} of 10 rows</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700" disabled>
              Previous
            </button>
            <button className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700">Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Details">
          {JSON.stringify(selectedItem)}
        </Modal>
      )}
    </div>
  );
}
