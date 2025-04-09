import { Mail, X } from "lucide-react";
import React, { useState } from "react";

const PropertyModal = ({ selectedProperty, setIsModalOpen }) => {
  console.log(selectedProperty);

  const {
    name,
    address,
    type,
    subType,
    images,
    propertyManager,
    location,
    units,
  } = selectedProperty;

  const [selectedImage, setSelectedImage] = useState(images[0]);
  return (
    <div className="absolute justify-end inset-0 bg-black min-h-screen  bg-opacity-50 h-[900px] flex items-start overflow-hidden ">
      <div className="h-auto bg-white flex flex-col justify-between  p-4 rounded-md shadow-md">
        <div className="flex">
          <div>
            {" "}
            <h2 className="text-lg font-semibold">User Details</h2>
          </div>
          <div>
            <button
              className="absolute top-6 right-4"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>{" "}
        </div>
        <div className="flex gap-2 ">
          {/* Main Image */}
          <div className=" flex-3 relative mt-4">
            <img
              src={selectedImage.replace(":id", "")}
              alt={name}
              className="w-72 h-72 object-cover rounded-lg"
            />
          </div>

          {/* Thumbnail Images */}
          <div className=" flex-1 flex flex-col gap-2 mt-4">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.replace(":id", "")}
                alt="thumbnail"
                className={`w-16 h-16 rounded-md cursor-pointer border-2 ${
                  selectedImage === img ? "border-blue-500" : "border-gray-300"
                }`}
                onClick={() => setSelectedImage(img)}
              />
            ))}
          </div>
        </div>
        {/* Property Info */}
        <div className="mt-4">
          <div className="flex flex-col gap-2">
            <div>
              <h3 className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                Property Name:
              </h3>
              <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                {name}
              </p>
            </div>
            <div>
              <h3 className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                Property Manager
              </h3>
              <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                {address}
              </p>
            </div>
            <div>
              <h3 className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                Property Type:
              </h3>
              <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                {type}
              </p>
            </div>
            <div>
              <h3 className="text-[color:var(--Neutral-Neutral500,#696E7E)] text-sm not-italic font-normal leading-[140%]">
                Location:
              </h3>
              <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                {address}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  Floors
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  10
                </p>
              </div>
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  Break rooms
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  20
                </p>
              </div>
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  Floors
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  3
                </p>
              </div>
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  Units
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  7
                </p>
              </div>
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  office rooms
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  12
                </p>
              </div>
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  Rest rooms
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  15
                </p>
              </div>
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  Meeting rooms
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  12
                </p>
              </div>
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  Gym
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  8
                </p>
              </div>
              <div className="flex gap-4 justify-between">
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  Lobbies
                </p>
                <p className="text-[color:var(--Neutral-Neutral500,#101113)] text-sm not-italic font-normal leading-[140%]">
                  2
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Additional Info */}
      </div>
    </div>
  );
};

export default PropertyModal;
