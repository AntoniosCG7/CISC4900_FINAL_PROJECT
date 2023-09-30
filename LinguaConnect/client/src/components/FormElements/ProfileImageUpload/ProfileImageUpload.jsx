import React, { useRef } from "react";
import "./ProfileImageUpload.css";

const ProfileImageUpload = () => {
  const imagePreviewRef = useRef(null);
  const imageUploadRef = useRef(null);

  const readURL = (input) => {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) {
        imagePreviewRef.current.style.backgroundImage = `url(${e.target.result})`;
        imagePreviewRef.current.style.display = "none";
        imagePreviewRef.current.style.display = "block";
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  const handleImageUploadChange = () => {
    readURL(imageUploadRef.current);
  };

  return (
    <div className="container">
      <div className="avatar-upload">
        <div className="avatar-edit">
          <input
            type="file"
            ref={imageUploadRef}
            accept=".png, .jpg, .jpeg"
            onChange={handleImageUploadChange}
          />
          <label
            htmlFor="imageUpload"
            onClick={() => imageUploadRef.current.click()}
          ></label>
        </div>
        <div className="avatar-preview">
          <div
            ref={imagePreviewRef}
            style={{
              backgroundImage:
                "url(../../../../public/assets/images/default.png)",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
