import React from "react";
interface Property {
  _id: string;
  name: string;
  address: string;
  type: string;
  subType: string;
  size: string;
  propertyManagerId: string;
  status: "pending" | "verified";
  images: string[];
  createdAt: string;
  updatedAt: string;
  managerId?: string;
}

const Property = ({
  property,
  isLoading,
  error,
  setSelectedProperty,
  setIsModalOpen,
}: {
  property: Property;
}) => {
  console.log(property.data);

  const properties = property.data;
  const handleClick = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0082ed]"></div>
            <p className="mt-2 text-gray-500">Loading properties...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p className="mb-2">{error}</p>
            <button className="mt-2">Retry</button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No properties found</p>
          </div>
        ) : (
          <table className="min-w-full lg:min-w-[1200px] table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50">
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
                  Size
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {properties.map((property) => (
                <tr
                  key={property._id}
                  className="border-t border-gray-200 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleClick(property)}
                >
                  <td className="py-4 px-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{property.type}</div>
                      <div className="text-gray-500">{property.subType}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {property.name}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {property.address}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {property.size}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-4">Verify</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default Property;
