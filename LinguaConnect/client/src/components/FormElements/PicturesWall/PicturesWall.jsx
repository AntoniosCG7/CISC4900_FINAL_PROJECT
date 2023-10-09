// Desc: Component to upload photos to the user's profile. Directly taken from Ant Design's documentation and was modified to satisfy the needs of this application.
import React, { useState, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload } from "antd";
import axios from "axios";

// Utility to convert an uploaded file to a Base64 encoded string
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const PicturesWall = ({ existingPhotos = [] }) => {
  // State for modal preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  // State for file list (photos)
  const [fileList, setFileList] = useState([]);

  // Initialize fileList with any existing photos passed as props
  useEffect(() => {
    const initialFileList = existingPhotos.map((url, index) => ({
      uid: -index,
      status: "done",
      url,
      name: url.substring(url.lastIndexOf("/") + 1),
    }));
    setFileList(initialFileList);
  }, [existingPhotos]);

  // Handler to close the preview modal
  const handleCancel = () => setPreviewOpen(false);

  // Handler to open the preview modal
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };

  // Handler to manage changes (addition/removal) in the file list
  const handleChange = ({ file, fileList: newFileList }) => {
    if (file.status === "removed") {
      axios
        .post(
          "http://localhost:3000/api/v1/users/deletePhoto",
          { filename: file.name },
          { withCredentials: true }
        )
        .then((response) => {
          if (response.data.status === "success") {
            console.log("Photo deleted successfully from backend");
          } else {
            console.error("Failed to delete photo from backend");
          }
        })
        .catch((error) => {
          console.error("Error deleting photo:", error);
        });
    }
    setFileList(newFileList);
  };

  // Custom upload button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  // Custom request handler to work with axios for photo uploads
  const customRequest = ({
    action,
    data,
    file,
    onSuccess,
    onError,
    headers,
  }) => {
    const formData = new FormData();
    formData.append("photos", file);
    axios
      .post(action, formData, {
        withCredentials: true,
        headers,
      })
      .then((response) => {
        onSuccess(response.data, file);
      })
      .catch(onError);
  };

  return (
    <>
      <Upload
        action="http://localhost:3000/api/v1/users/uploadPhotos"
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={customRequest}
      >
        {fileList.length >= 12 ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img
          alt="photo"
          style={{
            width: "100%",
          }}
          src={previewImage}
        />
      </Modal>
    </>
  );
};

export default PicturesWall;
