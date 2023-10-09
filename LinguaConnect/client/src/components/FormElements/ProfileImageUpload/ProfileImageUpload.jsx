import React, { useRef, useEffect } from "react";
import "./ProfileImageUpload.css";

const DEFAULT_IMAGE_URL = "../../../../public/assets/images/default.png";

// Component for uploading a profile image
const ProfileImageUpload = ({ onImageSelected, initialImageUrl }) => {
  const imagePreviewRef = useRef(null);
  const imageUploadRef = useRef(null);

  // Set the initial preview image if provided
  useEffect(() => {
    // Set the initial preview image if provided
    if (initialImageUrl && imagePreviewRef.current) {
      imagePreviewRef.current.style.backgroundImage = `url(${initialImageUrl})`;
    }
  }, [initialImageUrl]);

  // Read the image file and set the preview image
  const readURL = (input) => {
    if (input.files && input.files[0]) {
      const selectedFile = input.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        imagePreviewRef.current.style.backgroundImage = `url(${e.target.result})`;
        onImageSelected?.(selectedFile);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle the image upload change event
  const handleImageUploadChange = () => {
    readURL(imageUploadRef.current);
  };

  return (
    <div className="container">
      <div className="avatar-upload">
        <div className="avatar-edit">
          <input
            type="file"
            id="imageUpload"
            name="profilePicture"
            ref={imageUploadRef}
            accept=".png, .jpg, .jpeg"
            onChange={handleImageUploadChange}
          />
          <label htmlFor="imageUpload"></label>
        </div>
        <div className="avatar-preview">
          <div
            ref={imagePreviewRef}
            style={{ backgroundImage: `url(${DEFAULT_IMAGE_URL})` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
