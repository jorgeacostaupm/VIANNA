import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDropzone } from 'react-dropzone';
import { FileProcessorFactory } from './drag';
import { Button } from 'antd';
import store from '@/components/VAPUtils/features/store';
import { updateFromJSON } from '@/components/VAPUtils/features/data/dataSlice';
import { PlusOutlined } from '@ant-design/icons';
import { setFullMeta } from '@/components/VAPUtils/features/metadata/metaSlice';
import { generateAggregationBatch } from '@/components/VAPUtils/features/data/modifyReducers';

const handleFileParsed = (data) => {
  console.log('Parsed Data:', data);
  store.dispatch(setFullMeta(data));
  store.dispatch(generateAggregationBatch({ cols: data }));
};

const DragAndDropHierarchy = () => {
  const notApi = useSelector((state) => state.cantab.notApi);
  const [fileName, setFilename] = useState(null);
  const [data, setData] = useState(null);

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader();
        const fileType = file.name.split('.').pop().toLowerCase();

        reader.onabort = () => console.log('File reading was aborted');
        reader.onerror = () => console.log('File reading has failed');

        reader.onload = () => {
          const fileContent = reader.result;
          try {
            const processor = FileProcessorFactory.getProcessor(fileType);
            processor.process(fileContent, setData);
            setFilename(file.name);
          } catch (error) {
            console.error(error.message);
          }
        };

        // Read the file as binary string for Excel files, otherwise as text
        if (fileType === 'xls' || fileType === 'xlsx') {
          reader.readAsBinaryString(file);
        } else {
          reader.readAsText(file);
        }
      });
    },
    [FileProcessorFactory, notApi]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: '.json'
  });

  const dropzoneStyle = {
    height: '200px',
    width: '100%',
    borderStyle: 'dashed',
    borderWidth: '2px',
    borderColor: '#1677ff',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: isDragActive ? '#e6f7ff' : '#fafafa'
  };

  const iconStyle = {
    fontSize: '2rem',
    color: '#1677ff',
    fontWeight: 'bold'
  };

  const textStyle = {
    color: '#1677ff',
    fontSize: '1.125rem', // Equivalent to text-lg
    textAlign: 'center',
    padding: '0 1rem'
  };

  const subtitleStyle = {
    color: '#9CA3AF', // Equivalent to text-gray-400
    fontSize: '0.875rem', // Equivalent to text-sm
    textAlign: 'center',
    padding: '0 1rem'
  };

  return (
    <>
      <div {...getRootProps({ style: dropzoneStyle })}>
        <input {...getInputProps()} />
        {!isDragActive && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {!fileName && <PlusOutlined style={{ color: '#1677ff' }} />}
            <span style={textStyle}>{fileName ? fileName : 'Click or Drop the file.'}</span>
            {!fileName && <span style={subtitleStyle}>Only JSON files are accepted.</span>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
        <Button type="primary" onClick={() => handleFileParsed(data)}>
          Upload
        </Button>
      </div>
    </>
  );
};

export default DragAndDropHierarchy;
