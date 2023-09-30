import React, { useRef } from "react";
import "./ProfileImageUpload.css";

const ProfileImageUpload = (props) => {
  const imagePreviewRef = useRef(null);
  const imageUploadRef = useRef(null);

  const readURL = (input) => {
    if (input.files && input.files[0]) {
      const selectedFile = input.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        imagePreviewRef.current.style.backgroundImage = `url(${e.target.result})`;
        if (props.onImageSelected) {
          props.onImageSelected(selectedFile); // Send the file to parent
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleImageUploadChange = () => {
    readURL(imageUploadRef.current);
    if (props.onImageSelected && imageUploadRef.current.files[0]) {
      props.onImageSelected(imageUploadRef.current.files[0]);
    }
  };

  return (
    <div className="container">
      <div className="avatar-upload">
        <div className="avatar-edit">
          <input
            type="file"
            id="imageUpload"
            ref={imageUploadRef}
            accept=".png, .jpg, .jpeg"
            onChange={handleImageUploadChange}
          />
          <label htmlFor="imageUpload"></label>
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
