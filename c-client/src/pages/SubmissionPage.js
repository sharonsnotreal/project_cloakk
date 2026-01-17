import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import imageCompression from "browser-image-compression";
import { FiAlertTriangle, FiShield, FiFileText, FiX } from 'react-icons/fi';
import { useEffect } from "react";

// import Axios from "axios";
const openpgp = require("openpgp"); //CSE
// import
const PageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const MainCard = styled(motion.div)`
  display: flex;
  width: 100%;
  max-width: 1100px;
  background: ${({ theme }) => theme.white};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.borderColor};
  overflow: hidden;

  @media (max-width: 900px) {
    flex-direction: column;
    max-width: 95%;
  }
`;

const DisclaimerPanel = styled.div`
  flex: 1;
  background: #f9fafb;
  padding: 2rem;
  color: ${({ theme }) => theme.darkGrey};

  @media (max-width: 900px) {
    padding: 1.5rem;
  }

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const DisclaimerItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 3px;
    font-size: 1.2rem;
  }

  @media (max-width: 600px) {
    font-size: 0.85rem;
    gap: 0.7rem;

    svg {
      font-size: 1rem;
    }
  }
`;

const FormPanel = styled.div`
  flex: 1.2;
  padding: 2rem;
  display: flex;
  flex-direction: column;

  @media (max-width: 900px) {
    padding: 1.5rem;
  }

  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 0 0 2rem 0;
  text-align: center;

  @media (max-width: 600px) {
    font-size: 1.25rem;
    margin-bottom: 1.2rem;
  }
`;

const DragDropArea = styled.label`
  border: 2px dashed ${({ theme }) => theme.lightGrey};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${({ theme }) => theme.primary};
  }

  @media (max-width: 600px) {
    padding: 1.5rem;
    font-size: 0.9rem;
  }
`;

const MessageInput = styled.textarea`
  width: 100%;
  min-height: 150px;
  border: 1px solid ${({ theme }) => theme.lightGrey};
  border-radius: 8px;
  padding: 1rem;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
  }

  @media (max-width: 600px) {
    min-height: 120px;
    font-size: 0.9rem;
  }
`;

const SubmitButton = styled.button`
  background: ${({ theme }) => theme.black};
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    padding: 0.7rem;
    font-size: 0.95rem;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  text-align: center;
  font-size: 0.9rem;

  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
`;

const SubmissionPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isMobile =
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
      navigator.userAgent
    );

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  const allowedExtensions = ["pdf", "docx", "jpg", "jpeg", "png", "mp4"];

  const getExtension = (name) =>
    name.split(".").pop().toLowerCase();

  const compressImageIfNeeded = async (file) => {
    if (!file.type.startsWith("image/")) return file;

    return await imageCompression(file, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });
  };

  const addFiles = async (selectedFiles) => {
    const validated = [];

    for (const file of selectedFiles) {
      if (files.length + validated.length >= MAX_FILES) {
        setError(`Maximum of ${MAX_FILES} files allowed.`);
        break;
      }

      if (!allowedExtensions.includes(getExtension(file.name))) {
        setError(`File type not allowed: ${file.name}`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`File too large: ${file.name}`);
        continue;
      }

      const processedFile = await compressImageIfNeeded(file);
      validated.push(processedFile);
    }

    if (validated.length) {
      setFiles((prev) => [...prev, ...validated]);
      setError("");
    }
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    await addFiles(selectedFiles);
    e.target.value = null;
  };

  const handleDrop = async (e) => {
    if (isMobile) return;
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    await addFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    if (isMobile) return;
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!textMessage) {
      setError("A text message is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { privateKey, publicKey } = await openpgp.generateKey({
        type: "ecc",
        curve: "curve25519",
        userIDs: [{ name: "cloakk-user" }],
        passphrase: "super long and hard to guess secret",
      });

      const pubKey = await openpgp.readKey({ armoredKey: publicKey });
      const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: textMessage }),
        encryptionKeys: pubKey,
      });

      const formData = new FormData();
      formData.append("publicKey", publicKey);
      formData.append("privateKey", privateKey);
      formData.append("textMessage", encrypted);

      files.forEach((file) => formData.append("files", file));

      const apiUrl =
        process.env.REACT_APP_API_URL || "http://localhost:5000";

      const response = await axios.post(
        `${apiUrl}/api/submissions`,
        formData
      );

      navigate("/success", {
        state: { receipt: response.data.receiptCode },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Submission failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormPanel as="form" onSubmit={handleSubmit}>
      <Title>Submit Anonymously</Title>

      {/* MOBILE + DESKTOP SAFE FILE PICKER */}
      <label htmlFor="fileInput" style={{ width: "100%" }}>
        <DragDropArea
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          role="button"
          tabIndex={0}
        >
          {files.length === 0
            ? isMobile
              ? "Tap to upload (camera supported)"
              : "Drag & drop or click to upload"
            : `${files.length} file(s) selected`}
        </DragDropArea>
      </label>

      <input
        id="fileInput"
        type="file"
        multiple
        hidden
        accept="image/*,video/mp4,.pdf,.docx"
        capture={isMobile ? "environment" : undefined}
        onChange={handleFileChange}
      />

      <MessageInput
        placeholder="Write message..."
        value={textMessage}
        onChange={(e) => setTextMessage(e.target.value)}
      />

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <SubmitButton type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </SubmitButton>
    </FormPanel>
  );
};

export default SubmissionPage;